// Reglas que se aplican a todas las páginas del sitio, en el servidor de Cloudflare:
//
// 1. Direcciones del sitio anterior (WordPress/WooCommerce con el tema demo "Yolo Motor").
//    - Las que tienen equivalente real en el sitio nuevo se redirigen con 301 (REDIRECCIONES).
//    - Las que no volverán responden 410 "eliminada" (LEGADO y PARAMETROS_LEGADO), con la página /404.html.
//    - Cualquier otra dirección inexistente responde 404 con /404.html (lo hace Cloudflare Pages al existir ese archivo).
//    No se redirige a la página de inicio lo que no tiene equivalente: Google lo trataría como un falso 404.
//
// 2. Etiqueta canónica: toda página que responda 200 y no la traiga recibe
//    <link rel="canonical" href="https://www.centrocamionero.com.co/ruta/"> (https, www, sin parámetros,
//    con la misma barra final que usa /sitemap.xml).
//
// 3. Vista previa al compartir un enlace (WhatsApp, Facebook, LinkedIn, X, etc.): etiquetas Open Graph.
//    - Centro Camionero: foto de los camiones frente a la sede (/assets/og-centro-camionero.jpg, 1200 × 630).
//    - Showroom FAW (/faw/...): banner FAW con la placa de Centro Camionero (/assets/faw-banner-placa.jpg).
//    Si una página ya trae su propia etiqueta (por ejemplo, la foto de cada camión usado en /usados/...), se respeta.
const BASE = "https://www.centrocamionero.com.co";
const IMG_CC = { url: BASE + "/assets/og-centro-camionero.jpg", w: "1200", h: "630", alt: "Camiones frente a la sede de Centro Camionero en Bogotá" };
const IMG_FAW = { url: BASE + "/assets/faw-banner-placa.jpg", w: "1600", h: "400", alt: "Camión FAW con la placa de Centro Camionero" };

// Sitio anterior → página equivalente del sitio nuevo (301). Se comparan sin barra final y en minúsculas.
const REDIRECCIONES = {
  "/contact-us": "/contacto/",
  "/about-us-2": "/nosotros/",
  "/shop": "/camiones/",
  "/faqs": "/financiacion/",
};

// Sitio anterior sin equivalente: 410 (eliminada para siempre).
const LEGADO = [
  /^\/blog(\/|$)/,
  /^\/home-[2-7](\/|$)/, /^\/home-lookbook/, /^\/home-parallax(\/|$)/, /^\/masonry-layout(\/|$)/,
  /^\/(category|tag|author|portfolio|producto|product|product-category|product-tag)(\/|$)/,
  /^\/20(1\d|2[0-5])\/\d{2}\//,                 // entradas con fecha, p. ej. /2016/02/17/... y /2025/03/02/hello-world/
  /(^|\/)feed\/?$/,                             // cualquier dirección terminada en /feed/
  /^\/wp-(json|content|admin|includes)(\/|$)/, /^\/wp-[a-z0-9_-]+\.php$/, /^\/xmlrpc\.php$/,
  /^\/imunify-bot-check/,
  /^\/(my-account|mi-cuenta|wishlist|lista-de-deseos|checkout|finalizar-compra|carrito|cart)(\/|$)/,
];
// Parámetros propios de WordPress/WooCommerce (p. ej. ?action=yith-woocompare-add-product): 410 en cualquier ruta.
const PARAMETROS_LEGADO = ["add-to-cart", "remove_item", "add_to_wishlist", "page_id", "p", "post_type", "product", "product_cat", "wc-ajax", "replytocom"];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Página de error del sitio con el estado indicado (404 o 410), sin indexar.
async function error(context, estado) {
  let html = "<!doctype html><title>Página no encontrada</title><p>Esta página no existe. <a href=\"/\">Ir a Centro Camionero</a></p>";
  try {
    const r = await context.env.ASSETS.fetch(new URL("/404.html", context.request.url));
    if (r.ok) html = await r.text();
  } catch (e) {}
  return new Response(context.request.method === "HEAD" ? null : html, {
    status: estado,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "public, max-age=3600" },
  });
}

function esLegado(url) {
  const ruta = url.pathname.toLowerCase();
  if (LEGADO.some((re) => re.test(ruta))) return true;
  const accion = url.searchParams.get("action") || "";
  if (/^yith|woocommerce/i.test(accion)) return true;
  return PARAMETROS_LEGADO.some((p) => url.searchParams.has(p));
}

// Los modelos FAW se sirven con una sola plantilla (/faw/modelos/* en _redirects): un modelo que no existe es 404.
async function modeloFawExiste(context, slug) {
  try {
    const r = await context.env.ASSETS.fetch(new URL("/faw/modelos.json", context.request.url));
    if (!r.ok) return true;
    return ((await r.json()).modelos || []).some((m) => m.slug === slug);
  } catch (e) { return true; }
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const metodo = context.request.method;
  const interno = /^\/(admin|api)(\/|$)/.test(url.pathname);

  if (!interno && (metodo === "GET" || metodo === "HEAD")) {
    const clave = url.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    if (REDIRECCIONES[clave]) return Response.redirect(new URL(REDIRECCIONES[clave], url.origin).href, 301);
    if (esLegado(url)) return error(context, 410);
    const fm = url.pathname.match(/^\/faw\/modelos\/([^/]+)\/?$/);
    if (fm && !(await modeloFawExiste(context, decodeURIComponent(fm[1])))) return error(context, 404);
  }

  const res = await context.next();
  const tipo = res.headers.get("content-type") || "";
  if (metodo !== "GET" || res.status !== 200 || !tipo.includes("text/html") || interno) return res;

  const faw = /^\/faw(\/|$)/.test(url.pathname);
  const img = faw ? IMG_FAW : IMG_CC;
  const canonica = BASE + url.pathname;
  const tiene = {};
  let titulo = "", descripcion = "";

  return new HTMLRewriter()
    .on("title", { text(t) { titulo += t.text; } })
    .on('meta[name="description"]', { element(e) { descripcion = e.getAttribute("content") || ""; } })
    .on("meta[property], meta[name]", {
      element(e) { const k = e.getAttribute("property") || e.getAttribute("name"); if (k) tiene[k] = true; },
    })
    .on('link[rel="canonical"]', { element() { tiene.canonical = true; } })
    .on("head", {
      element(e) {
        e.onEndTag((fin) => {
          const t = titulo.trim(), m = [];
          if (!tiene.canonical) m.push(`<link rel="canonical" href="${esc(canonica)}">`);
          const add = (k, v, attr) => { if (v && !tiene[k]) m.push(`<meta ${attr || "property"}="${k}" content="${esc(v)}">`); };
          add("og:type", "website");
          add("og:locale", "es_CO");
          add("og:site_name", faw ? "FAW Centro Camionero" : "Centro Camionero");
          add("og:title", t);
          add("og:description", descripcion);
          add("og:url", canonica);
          if (!tiene["og:image"]) {
            add("og:image", img.url);
            add("og:image:secure_url", img.url);
            add("og:image:type", "image/jpeg");
            add("og:image:width", img.w);
            add("og:image:height", img.h);
            add("og:image:alt", img.alt);
          }
          add("twitter:card", "summary_large_image", "name");
          if (m.length) fin.before(m.join(""), { html: true });
        });
      },
    })
    .transform(res);
}
