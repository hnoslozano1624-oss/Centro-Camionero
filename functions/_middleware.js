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
// 3. Ícono del sitio (el que Google muestra junto al resultado de búsqueda): toda página que no traiga su propio
//    ícono recibe /favicon.ico, /icono-192.png y /apple-touch-icon.png (la "C" de Centro Camionero; el de iPhone es la llanta). Son archivos en la raíz del sitio.
//    Las páginas FAW conservan su emblema.
//
// 4. Vista previa al compartir un enlace (WhatsApp, Facebook, LinkedIn, X, etc.): etiquetas Open Graph.
//    - Centro Camionero: foto de los camiones frente a la sede (/assets/og-centro-camionero.jpg, 1200 × 630).
//    - Showroom FAW (/faw/...): banner FAW con la placa de Centro Camionero (/assets/faw-banner-placa.jpg).
//    Si una página ya trae su propia etiqueta (por ejemplo, la foto de cada camión usado en /usados/...), se respeta.
//
// 5. SEO: título y descripción de cada página según /lib/seo.js (también para cada modelo FAW), datos de la empresa
//    para Google en el inicio (negocio local), preguntas frecuentes de cada página en formato FAQPage y noindex
//    para la plantilla vacía /faw/modelo/.
import { SEO, seoModeloFaw, NEGOCIO } from "../lib/seo.js";

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
// Devuelve el modelo, false si no existe, o null si no se pudo leer el catálogo (en ese caso no se bloquea la página).
async function modeloFaw(context, slug) {
  try {
    const r = await context.env.ASSETS.fetch(new URL("/faw/modelos.json", context.request.url));
    if (!r.ok) return null;
    return ((await r.json()).modelos || []).find((m) => m.slug === slug) || false;
  } catch (e) { return null; }
}
const jsonLd = (obj) => '<script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, "\\u003c") + "</script>";
const textoPlano = (s) => String(s).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const metodo = context.request.method;
  const interno = /^\/(admin|api)(\/|$)/.test(url.pathname);

  if (!interno && (metodo === "GET" || metodo === "HEAD")) {
    const clave = url.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    if (REDIRECCIONES[clave]) return Response.redirect(new URL(REDIRECCIONES[clave], url.origin).href, 301);
    if (esLegado(url)) return error(context, 410);
    const fm = url.pathname.match(/^\/faw\/modelos\/([^/]+)\/?$/);
    if (fm) {
      context.data.modeloFaw = await modeloFaw(context, decodeURIComponent(fm[1]));
      if (context.data.modeloFaw === false) return error(context, 404);
    }
  }

  const res = await context.next();
  const tipo = res.headers.get("content-type") || "";
  if (metodo !== "GET" || res.status !== 200 || !tipo.includes("text/html") || interno) return res;

  const faw = /^\/faw(\/|$)/.test(url.pathname);
  const img = faw ? IMG_FAW : IMG_CC;
  const canonica = BASE + url.pathname;
  const seo = context.data.modeloFaw ? seoModeloFaw(context.data.modeloFaw) : SEO[url.pathname];
  const plantillaVacia = url.pathname === "/faw/modelo/";
  const tiene = {};
  const faqs = [];
  let titulo = "", descripcion = "";

  return new HTMLRewriter()
    .on("title", {
      element(e) { if (seo) { e.setInnerContent(seo.t); titulo = seo.t; } },
      text(t) { if (!seo) titulo += t.text; },
    })
    .on('meta[name="description"]', {
      element(e) { if (seo) e.setAttribute("content", seo.d); descripcion = seo ? seo.d : e.getAttribute("content") || ""; },
    })
    .on('meta[property="og:title"]', { element(e) { if (seo) e.setAttribute("content", seo.t); } })
    .on('meta[property="og:description"]', { element(e) { if (seo) e.setAttribute("content", seo.d); } })
    .on("meta[property], meta[name]", {
      element(e) { const k = e.getAttribute("property") || e.getAttribute("name"); if (k) tiene[k] = true; },
    })
    .on('script[type="application/ld+json"]', { text(t) { if (/FAQPage/.test(t.text)) tiene.faq = true; } })
    // Preguntas frecuentes visibles (<details><summary>pregunta</summary><p>respuesta</p></details>) → FAQPage para Google
    .on(".faq details", { element() { faqs.push({ q: "", a: "" }); } })
    .on(".faq details summary", { text(t) { if (faqs.length) faqs[faqs.length - 1].q += t.text; } })
    .on(".faq details > p", { text(t) { if (faqs.length) faqs[faqs.length - 1].a += t.text; } })
    .on("body", {
      element(e) {
        e.onEndTag((fin) => {
          const lista = faqs.map((f) => ({ q: textoPlano(f.q), a: textoPlano(f.a) })).filter((f) => f.q && f.a);
          if (lista.length && !tiene.faq) {
            fin.before(jsonLd({
              "@context": "https://schema.org", "@type": "FAQPage",
              mainEntity: lista.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            }), { html: true });
          }
        });
      },
    })
    .on('link[rel="canonical"]', { element() { tiene.canonical = true; } })
    .on('link[rel~="icon"]', { element() { tiene.icono = true; } })
    .on("head", {
      element(e) {
        e.onEndTag((fin) => {
          const t = titulo.trim(), m = [];
          if (!tiene.canonical) m.push(`<link rel="canonical" href="${esc(canonica)}">`);
          if (plantillaVacia) m.push('<meta name="robots" content="noindex">');
          if (url.pathname === "/") m.push(jsonLd(NEGOCIO));
          if (!tiene.icono) m.push('<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" type="image/png" sizes="192x192" href="/icono-192.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">');
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
