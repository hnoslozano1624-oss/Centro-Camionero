// /sitemap.xml — mapa del sitio para Google (Search Console).
// Se genera en cada consulta: páginas fijas + cada camión usado (base de datos D1) + cada modelo FAW (faw/modelos.json),
// así los camiones nuevos que se cargan en el panel aparecen solos, sin volver a enviar el mapa.
import { BASE_SITIO, limpiarBase, leerUsados, urlUsado } from "../lib/inventario.js";

const PAGINAS = [
  ["/", "daily", "1.0"],
  ["/camiones/", "daily", "0.9"],
  ["/compramos-tu-camion/", "weekly", "0.9"],
  ["/faw/", "weekly", "0.9"],
  ["/financiacion/", "monthly", "0.8"],
  ["/retomas/", "monthly", "0.8"],
  ["/faw/por-que-faw/", "monthly", "0.7"],
  ["/faw/respaldo/", "monthly", "0.7"],
  ["/entregas/", "weekly", "0.6"],
  ["/nosotros/", "monthly", "0.5"],
  ["/contacto/", "monthly", "0.6"],
  ["/aviso-de-privacidad/", "yearly", "0.2"],
  ["/politica-de-datos/", "yearly", "0.2"],
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fila = (loc, freq, prio) =>
  "  <url><loc>" + esc(loc) + "</loc><changefreq>" + freq + "</changefreq><priority>" + prio + "</priority></url>";

export async function onRequestGet({ request, env }) {
  const base = limpiarBase(env.SITE_URL || BASE_SITIO);
  const urls = PAGINAS.map(([p, f, pr]) => fila(base + p, f, pr));

  // Modelos FAW (cada uno tiene su página /faw/modelos/<modelo>)
  try {
    const r = await env.ASSETS.fetch(new URL("/faw/modelos.json", request.url));
    if (r.ok) ((await r.json()).modelos || []).forEach((m) => { if (m.slug) urls.push(fila(base + "/faw/modelos/" + m.slug, "monthly", "0.8")); });
  } catch (e) {}

  // Camiones usados publicados (cada uno tiene su página /usados/<marca-linea-año-id>)
  try {
    if (env.DB) (await leerUsados(env.DB)).forEach((v) => urls.push(fila(urlUsado(v, base), "weekly", "0.8")));
  } catch (e) {}

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join("\n") + "\n</urlset>\n";
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
