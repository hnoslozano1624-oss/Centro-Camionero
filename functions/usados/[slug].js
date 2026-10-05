// Ficha individual de un camión usado: /usados/<marca-linea-anio-id>
// Se genera en el servidor desde la misma base de datos que la web, con título, descripción y vista previa
// propios para compartir por WhatsApp y para buscadores. Un camión vendido u oculto ya no existe aquí (404).
import { BASE_SITIO, leerUsados, limpiarBase, slugUsado, urlUsado } from "../../lib/inventario.js";

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const miles = (n) => String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const ESTILO = `
.fc{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:clamp(20px,3.4vw,48px);align-items:start}
.fc .gal{background:#000;border-radius:16px;overflow:hidden;min-width:0}
.fc .big{aspect-ratio:4/3;display:grid;place-items:center;background:linear-gradient(155deg,var(--navy),var(--navy-deep))}
.fc .big img{width:100%;height:100%;object-fit:contain}.fc .big svg{width:55%}
.fc .mins{display:flex;gap:6px;padding:8px;overflow-x:auto;background:#050B1F}
.fc .mins button{flex:none;width:76px;aspect-ratio:4/3;padding:0;border:2px solid transparent;background:none;cursor:pointer;opacity:.7;border-radius:4px;overflow:hidden}
.fc .mins button[aria-current=true]{border-color:var(--red);opacity:1}.fc .mins img{width:100%;height:100%;object-fit:cover;display:block}
.fc .info{display:flex;flex-direction:column;gap:16px;min-width:0}
.fc .pr{font-family:'Big Shoulders Display',sans-serif;font-size:clamp(34px,4.4vw,48px);color:var(--navy);line-height:1}
.fc .pr.muted{font-size:clamp(24px,3vw,30px);color:var(--fg-muted)}
.fc .tabla{display:grid;gap:0;border-top:1px solid var(--border)}
.fc .tabla div{display:flex;justify-content:space-between;gap:16px;padding:11px 2px;border-bottom:1px solid var(--border);font-size:15px}
.fc .tabla span{color:var(--fg-muted)}.fc .tabla b{text-align:right}
.fc .acciones{display:flex;gap:12px;flex-wrap:wrap}
.fc .nota{font-size:12.5px;color:var(--fg-muted)}
.fc .desc{color:var(--fg-muted);white-space:pre-line}
.pill{display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;background:var(--red);color:#fff;padding:4px 10px;border-radius:99px;vertical-align:middle;margin-left:8px}
.migas{font-size:13px;color:#C7D1F2;margin-bottom:6px}.migas a{color:#fff}
@media (max-width:860px){.fc{grid-template-columns:minmax(0,1fr)}}`;

const SVG = '<svg viewBox="0 0 200 120" fill="none" aria-hidden="true"><path d="M10 95H160V55H120L100 35H55L40 55H30V95" stroke="#fff" stroke-width="3"/><circle cx="60" cy="98" r="13" stroke="#FA010D" stroke-width="3"/><circle cx="140" cy="98" r="13" stroke="#FA010D" stroke-width="3"/></svg>';

function documento({ titulo, descripcion, canonica, imagen, noindex, cuerpo, jsonld }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
${noindex ? '<meta name="robots" content="noindex">' : ""}<link rel="canonical" href="${esc(canonica)}">
<meta property="og:type" content="website"><meta property="og:locale" content="es_CO"><meta property="og:site_name" content="Centro Camionero">
<meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(descripcion)}"><meta property="og:url" content="${esc(canonica)}">
${imagen ? `<meta property="og:image" content="${esc(imagen)}">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/css/paginas.css">
<style>${ESTILO}</style>
${jsonld ? `<script type="application/ld+json">${jsonld.replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body class="inner" data-page="inicio">
<header id="siteHeader"><noscript><div class="container bar"><a class="brand" href="/"><img class="brand-logo-img" src="/assets/logo.png" alt="Centro Camionero"></a><nav class="menu"><a href="/#camiones">Camiones disponibles</a><a href="/financiacion/">Financiación</a><a href="/retomas/">Retomas</a><a href="/faw/">Camiones nuevos</a><a href="/nosotros/">Nosotros</a><a href="/contacto/">Contacto</a></nav></div></noscript></header>
${cuerpo}
<footer id="siteFooter"></footer>
<script src="/js/site.js"></script>
</body>
</html>`;
}

function noEncontrado(base) {
  const cuerpo = `<main id="top"><section class="page-hero"><div class="container"><p class="eyebrow">Camión usado</p><h1>Este camión ya no está disponible.</h1><p class="lede">Puede que se haya vendido o que el enlace esté incompleto. Mira los camiones usados que tenemos hoy o habla con DYLIA y te ayuda a encontrar uno similar.</p><div class="hero-actions"><a class="btn btn-light" href="/#camiones">Ver camiones disponibles →</a><a class="btn btn-outline-light" href="#dylia" data-dylia="Hola, quiero ver los camiones usados disponibles de Centro Camionero.">Habla con DYLIA →</a></div></div></section></main>`;
  return new Response(documento({ titulo: "Camión no disponible · Centro Camionero", descripcion: "Este camión ya no está disponible en Centro Camionero.", canonica: base + "/", noindex: true, cuerpo }), {
    status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet({ params, env, request }) {
  const base = limpiarBase(env.SITE_URL || BASE_SITIO);
  const id = Number((String(params.slug).match(/(\d+)$/) || [])[1]);
  if (!env.DB) return new Response("Base de datos no enlazada", { status: 503 });
  if (!Number.isInteger(id) || id < 1) return noEncontrado(base);

  const v = (await leerUsados(env.DB)).find((x) => x.id === id);
  if (!v) return noEncontrado(base);

  // Dirección canónica: /usados/<marca-linea-anio-id>
  const canonicoSlug = slugUsado(v);
  if (params.slug !== canonicoSlug) return Response.redirect(new URL("/usados/" + canonicoSlug, request.url).href, 301);

  const nombre = `${v.marca} ${v.linea}`;
  const km = Number(v.kilometraje) > 0 ? Number(v.kilometraje) : 0;
  const ficha = v.ficha || {};
  const filas = [
    ["Marca", v.marca], ["Línea", v.linea], v.modelo_anio ? ["Modelo (año)", v.modelo_anio] : null,
    v.kilometraje != null ? ["Kilometraje", miles(v.kilometraje) + " km"] : null,
    ficha.motor ? ["Motor", ficha.motor] : null, ficha.carroceria ? ["Carrocería", ficha.carroceria] : null,
    ficha.capacidad ? ["Capacidad", ficha.capacidad] : null, ficha.transmision ? ["Transmisión", ficha.transmision] : null,
    ficha.combustible ? ["Combustible", ficha.combustible] : null, ficha.configuracion ? ["Configuración", ficha.configuracion] : null,
    ["Estado", v.estado === "reservado" ? "Reservado" : "Disponible"],
  ].filter(Boolean);
  const precio = Number(v.precio) > 0 ? "$ " + miles(v.precio) : null;
  const titulo = `${nombre}${v.modelo_anio ? " " + v.modelo_anio : ""} usado${km ? ", " + miles(km) + " km" : ""} · Centro Camionero, Bogotá`;
  const descripcion = `Camión usado ${nombre}${v.modelo_anio ? " " + v.modelo_anio : ""}${km ? " con " + miles(km) + " km" : ""}${ficha.carroceria ? ", " + ficha.carroceria.toLowerCase() : ""}. ${precio ? "Precio " + precio + ". " : ""}Habla con DYLIA, nuestra asistente virtual, en Centro Camionero, Bogotá.`;
  // "usado" en el mensaje solo si el camión trae kilometraje real (> 0)
  const mensaje = `Hola, me interesa el camión${km ? " usado " : " "}${nombre}${v.modelo_anio ? " " + v.modelo_anio : ""}${km ? " (" + miles(km) + " km)" : ""} publicado en la página web.`;
  const foto0 = v.fotos[0] ? new URL(v.fotos[0], base + "/").href : null;
  const url = urlUsado(v, base);

  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product", name: `${nombre}${v.modelo_anio ? " " + v.modelo_anio : ""} (usado)`,
    brand: { "@type": "Brand", name: v.marca }, itemCondition: "https://schema.org/UsedCondition", url,
    ...(foto0 ? { image: v.fotos.map((f) => new URL(f, base + "/").href) } : {}),
    ...(precio && v.estado === "disponible" ? { offers: { "@type": "Offer", price: Math.round(Number(v.precio)), priceCurrency: "COP", availability: "https://schema.org/InStock", url } } : {}),
    seller: { "@type": "AutoDealer", name: "Centro Camionero", address: { "@type": "PostalAddress", streetAddress: "Calle 13 #62-34", addressLocality: "Bogotá", addressCountry: "CO" } },
  });

  const galeria = `<div class="gal"><div class="big" id="fcBig">${foto0 ? `<img src="${esc(v.fotos[0])}" alt="${esc(nombre + (v.modelo_anio ? " " + v.modelo_anio : ""))}">` : SVG}</div>` +
    (v.fotos.length > 1 ? `<div class="mins">${v.fotos.map((f, i) => `<button type="button" data-src="${esc(f)}" aria-current="${i === 0}" aria-label="Foto ${i + 1}"><img src="${esc(f)}" alt="" loading="lazy"></button>`).join("")}</div>` : "") + "</div>";

  const cuerpo = `<main id="top">
  <section class="page-hero"><div class="container">
    <p class="migas"><a href="/#camiones">Camiones disponibles</a> / Usado</p>
    <p class="eyebrow">Camión usado${v.estado === "reservado" ? '<span class="pill">Reservado</span>' : ""}</p>
    <h1>${esc(nombre)}${v.modelo_anio ? " " + esc(v.modelo_anio) : ""}</h1>
  </div></section>
  <section class="sec"><div class="container"><div class="fc">
    ${galeria}
    <div class="info">
      <p class="pr${precio ? "" : " muted"}">${precio ? esc(precio) : "Precio a consultar"}</p>
      <div class="tabla">${filas.map(([k, val]) => `<div><span>${esc(k)}</span><b>${esc(val)}</b></div>`).join("")}</div>
      ${v.descripcion ? `<p class="desc">${esc(v.descripcion)}</p>` : ""}
      <div class="acciones">
        <a class="btn btn-primary" href="#dylia" data-dylia="${esc(mensaje)}">Habla con DYLIA →</a>
        <a class="btn btn-ghost on-light" href="/financiacion/">Financia este camión</a>
      </div>
      <p class="nota">Precio y disponibilidad sujetos a confirmación por un asesor. Financiación sujeta a estudio y aprobación de la entidad financiera. Las imágenes son de referencia.</p>
    </div>
  </div></div></section>
</main>
<script>document.querySelectorAll(".fc .mins button").forEach(function(b){b.addEventListener("click",function(){var i=document.querySelector("#fcBig img");if(i)i.src=b.dataset.src;document.querySelectorAll(".fc .mins button").forEach(function(x){x.setAttribute("aria-current",x===b)})})})</script>`;

  return new Response(documento({ titulo, descripcion, canonica: url, imagen: foto0, cuerpo, jsonld }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=120" },
  });
}
