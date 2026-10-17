import { json } from "../../../../lib/auth.js";

// Eliminar una foto
export async function onRequestDelete({ env, params }) {
  const f = await env.DB.prepare("SELECT id, url FROM vehiculo_fotos WHERE id=?").bind(Number(params.id)).first();
  if (!f) return json({ error: "Foto no encontrada." }, 404);
  await env.DB.prepare("DELETE FROM vehiculo_fotos WHERE id=?").bind(f.id).run();
  if (env.FOTOS) await env.FOTOS.delete(f.url.split("/").pop());
  return json({ ok: true });
}

// Marcar como foto principal (orden 0) y correr las demás
export async function onRequestPatch({ env, params }) {
  const f = await env.DB.prepare("SELECT id, vehiculo_id FROM vehiculo_fotos WHERE id=?").bind(Number(params.id)).first();
  if (!f) return json({ error: "Foto no encontrada." }, 404);
  const { results } = await env.DB.prepare("SELECT id FROM vehiculo_fotos WHERE vehiculo_id=? ORDER BY orden, id").bind(f.vehiculo_id).all();
  const orden = [f.id, ...results.map((r) => r.id).filter((x) => x !== f.id)];
  await env.DB.batch(orden.map((fid, i) => env.DB.prepare("UPDATE vehiculo_fotos SET orden=? WHERE id=?").bind(i, fid)));
  return json({ ok: true });
}
