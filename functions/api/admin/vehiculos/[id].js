import { json } from "../../../../lib/auth.js";
import { validar } from "../../../../lib/vehiculos.js";

export async function onRequestPut({ request, env, params }) {
  const id = Number(params.id);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Datos inválidos." }, 400); }
  const { errores, datos: d } = validar(body);
  if (errores.length) return json({ error: errores.join(" ") }, 400);
  const r = await env.DB.prepare(
    `UPDATE vehiculos SET tipo=?, marca=?, linea=?, modelo_anio=?, placa=?, kilometraje=?, precio=?, estado=?, origen=?, descripcion=?, ficha_tecnica=?, publicado=? WHERE id=?`
  ).bind(d.tipo, d.marca, d.linea, d.modelo_anio, d.placa, d.kilometraje, d.precio, d.estado, d.origen, d.descripcion, d.ficha_tecnica, d.publicado, id).run();
  if (!r.meta.changes) return json({ error: "No se encontró el camión." }, 404);
  return json({ ok: true });
}

// Cambios rápidos desde la lista: estado y publicado
export async function onRequestPatch({ request, env, params }) {
  const id = Number(params.id);
  const body = await request.json().catch(() => ({}));
  const sets = [], args = [];
  if (["disponible", "reservado", "vendido"].includes(body.estado)) { sets.push("estado=?"); args.push(body.estado); }
  if (typeof body.publicado === "boolean") { sets.push("publicado=?"); args.push(body.publicado ? 1 : 0); }
  if (!sets.length) return json({ error: "Nada que actualizar." }, 400);
  const r = await env.DB.prepare(`UPDATE vehiculos SET ${sets.join(",")} WHERE id=?`).bind(...args, id).run();
  if (!r.meta.changes) return json({ error: "No se encontró el camión." }, 404);
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  const id = Number(params.id);
  const { results } = await env.DB.prepare("SELECT url FROM vehiculo_fotos WHERE vehiculo_id=?").bind(id).all();
  try {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM vehiculo_fotos WHERE vehiculo_id=?").bind(id),
      env.DB.prepare("DELETE FROM vehiculos WHERE id=?").bind(id),
    ]);
  } catch (e) {
    return json({ error: "Este camión tiene registros asociados (cotizaciones, documentos o ventas). Márquelo como vendido o despublíquelo en lugar de eliminarlo." }, 409);
  }
  if (env.FOTOS) await Promise.all(results.map((f) => env.FOTOS.delete(decodeURIComponent(f.url.split("/").pop()))));
  return json({ ok: true });
}
