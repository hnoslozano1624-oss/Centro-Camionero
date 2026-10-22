// Vista previa al compartir un enlace (WhatsApp, Facebook, LinkedIn, X, etc.).
// WhatsApp y las redes leen las etiquetas Open Graph del HTML sin ejecutar JavaScript, así que aquí se agregan
// en el servidor a todas las páginas públicas que no las traigan:
//   - Centro Camionero: foto de los camiones frente a la sede (/assets/og-centro-camionero.jpg, 1200 × 630).
//   - Showroom FAW (/faw/...): banner FAW con la placa de Centro Camionero (/assets/faw-banner-placa.jpg).
// Si una página ya trae su propia etiqueta (por ejemplo, la foto de cada camión usado en /usados/...), se respeta.
// Para cambiar la imagen general basta con subir otra con el mismo nombre en /assets/.
const BASE = "https://www.centrocamionero.com.co";
const IMG_CC = { url: BASE + "/assets/og-centro-camionero.jpg", w: "1200", h: "630", alt: "Camiones frente a la sede de Centro Camionero en Bogotá" };
const IMG_FAW = { url: BASE + "/assets/faw-banner-placa.jpg", w: "1600", h: "400", alt: "Camión FAW con la placa de Centro Camionero" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function onRequest(context) {
  const res = await context.next();
  const url = new URL(context.request.url);
  const tipo = res.headers.get("content-type") || "";
  if (context.request.method !== "GET" || !tipo.includes("text/html") || /^\/(admin|api)(\/|$)/.test(url.pathname)) return res;

  const faw = /^\/faw(\/|$)/.test(url.pathname);
  const img = faw ? IMG_FAW : IMG_CC;
  const tiene = {};
  let titulo = "", descripcion = "";

  return new HTMLRewriter()
    .on("title", { text(t) { titulo += t.text; } })
    .on('meta[name="description"]', { element(e) { descripcion = e.getAttribute("content") || ""; } })
    .on("meta[property], meta[name]", {
      element(e) { const k = e.getAttribute("property") || e.getAttribute("name"); if (k) tiene[k] = true; },
    })
    .on("head", {
      element(e) {
        e.onEndTag((fin) => {
          const t = titulo.trim(), m = [];
          const add = (k, v, attr) => { if (v && !tiene[k]) m.push(`<meta ${attr || "property"}="${k}" content="${esc(v)}">`); };
          add("og:type", "website");
          add("og:locale", "es_CO");
          add("og:site_name", faw ? "FAW Centro Camionero" : "Centro Camionero");
          add("og:title", t);
          add("og:description", descripcion);
          add("og:url", BASE + url.pathname);
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
