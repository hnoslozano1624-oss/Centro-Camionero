// /inventario.json — inventario vigente para el asistente DYLIA.
// Se genera en cada descarga desde la misma fuente que usa el sitio (base de datos D1 + faw/modelos.json),
// así nunca se contradice con las páginas. Si algo no valida responde con error 503 (no con un archivo vacío),
// para que el proceso que lo descarga conserve el último catálogo bueno.
import { BASE_SITIO, construirInventario, validarInventario } from "../lib/inventario.js";

const CABECERAS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex",
};
const fallo = (codigo, error, detalles) =>
  new Response(JSON.stringify({ error, detalles: detalles || [] }), { status: codigo, headers: { ...CABECERAS, "Cache-Control": "no-store" } });

export async function onRequest({ request, env }) {
  if (request.method !== "GET" && request.method !== "HEAD") return fallo(405, "Método no permitido");
  if (!env.DB) return fallo(503, "Base de datos no enlazada");

  let faw;
  try {
    const r = await env.ASSETS.fetch(new URL("/faw/modelos.json", request.url));
    if (!r.ok) throw new Error("HTTP " + r.status);
    faw = (await r.json()).modelos;
    if (!Array.isArray(faw) || !faw.length) throw new Error("sin modelos");
  } catch (e) {
    return fallo(503, "No se pudo leer el catálogo FAW", [String(e.message || e)]);
  }

  let lista;
  try {
    lista = await construirInventario({ db: env.DB, faw, base: env.SITE_URL || BASE_SITIO });
  } catch (e) {
    return fallo(503, "No se pudo leer el inventario", [String(e.message || e)]);
  }

  const errores = validarInventario(lista);
  if (errores.length) return fallo(503, "El inventario no pasó la validación", errores.slice(0, 50));

  return new Response(request.method === "HEAD" ? null : JSON.stringify(lista, null, 2), {
    status: 200,
    headers: { ...CABECERAS, "Cache-Control": "public, max-age=300" },
  });
}
