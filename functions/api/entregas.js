// Entregas publicadas (fotos reales de clientes con su camión), de la más reciente a la más antigua.
// Se administran en /admin/entregas/.
export async function onRequestGet({ env }) {
  const h = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" };
  let entregas = [];
  try {
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT id, url, mini, texto FROM entregas WHERE publicado=1 ORDER BY orden DESC, id DESC LIMIT 300"
      ).all();
      entregas = results;
    }
  } catch { /* tabla aún no creada: lista vacía */ }
  return new Response(JSON.stringify({ entregas }), { headers: h });
}
