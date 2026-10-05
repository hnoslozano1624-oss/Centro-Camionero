// API pública: camiones publicados que la página web muestra.
import { json } from "../../lib/auth.js";
import { fotosPorVehiculo, parseFicha } from "../../lib/vehiculos.js";

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: "Base de datos no enlazada" }, 503);
  const tipo = new URL(request.url).searchParams.get("tipo");
  let sql = `SELECT id, tipo, marca, linea, modelo_anio, kilometraje, precio, estado, descripcion, ficha_tecnica
             FROM vehiculos WHERE publicado = 1 AND estado != 'vendido'`;
  const args = [];
  if (tipo === "usado" || tipo === "nuevo") { sql += " AND tipo = ?"; args.push(tipo); }
  sql += " ORDER BY CASE estado WHEN 'disponible' THEN 0 ELSE 1 END, fecha_registro DESC, id DESC";
  const { results } = await env.DB.prepare(sql).bind(...args).all();
  const fotos = await fotosPorVehiculo(env.DB, results.map((v) => v.id));
  const data = results.map(({ ficha_tecnica, ...v }) => ({ ...v, ficha: parseFicha(ficha_tecnica), fotos: (fotos[v.id] || []).map((f) => f.url) }));
  return json({ vehiculos: data }, 200, { "Cache-Control": "no-store" });
}
