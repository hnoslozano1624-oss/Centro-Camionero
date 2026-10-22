import { json } from "../../../../lib/auth.js";
import { fotosPorVehiculo, parseFicha, validar } from "../../../../lib/vehiculos.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, tipo, marca, linea, modelo_anio, placa, kilometraje, precio, estado, origen, descripcion, ficha_tecnica, publicado, fecha_registro
     FROM vehiculos ORDER BY fecha_registro DESC, id DESC`
  ).all();
  const fotos = await fotosPorVehiculo(env.DB, results.map((v) => v.id));
  return json({ vehiculos: results.map(({ ficha_tecnica, ...v }) => ({ ...v, ficha: parseFicha(ficha_tecnica), fotos: fotos[v.id] || [] })) });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Datos inválidos." }, 400); }
  const { errores, datos: d } = validar(body);
  if (errores.length) return json({ error: errores.join(" ") }, 400);
  const r = await env.DB.prepare(
    `INSERT INTO vehiculos (tipo, marca, linea, modelo_anio, placa, kilometraje, precio, estado, origen, descripcion, ficha_tecnica, publicado)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(d.tipo, d.marca, d.linea, d.modelo_anio, d.placa, d.kilometraje, d.precio, d.estado, d.origen, d.descripcion, d.ficha_tecnica, d.publicado).run();
  return json({ ok: true, id: r.meta.last_row_id }, 201);
}
