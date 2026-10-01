// Utilidades compartidas para leer y validar vehículos.
export const CAMPOS_FICHA = ["motor", "carroceria", "capacidad", "transmision", "combustible", "configuracion"];

export function parseFicha(txt) {
  try { const o = JSON.parse(txt || "{}"); return o && typeof o === "object" ? o : {}; } catch { return {}; }
}

// Agrupa fotos por vehiculo_id
export async function fotosPorVehiculo(db, ids) {
  const mapa = {};
  if (!ids.length) return mapa;
  const marcas = ids.map(() => "?").join(",");
  const { results } = await db
    .prepare(`SELECT id, vehiculo_id, url, orden FROM vehiculo_fotos WHERE vehiculo_id IN (${marcas}) ORDER BY orden, id`)
    .bind(...ids)
    .all();
  for (const f of results) (mapa[f.vehiculo_id] ||= []).push({ id: f.id, url: f.url, orden: f.orden });
  return mapa;
}

const txt = (v, max = 120) => (v == null ? null : String(v).trim().slice(0, max) || null);
const ent = (v) => {
  if (v === "" || v == null) return null;
  const n = Math.round(Number(String(v).replace(/[^\d.-]/g, "")));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// Valida y normaliza lo que llega del formulario del panel
export function validar(body) {
  const errores = [];
  const tipo = body.tipo === "nuevo" ? "nuevo" : body.tipo === "usado" ? "usado" : null;
  if (!tipo) errores.push("Seleccione si el camión es usado o nuevo.");
  const marca = txt(body.marca, 60);
  if (!marca) errores.push("Escriba la marca.");
  const linea = txt(body.linea, 80);
  if (!linea) errores.push("Escriba la línea o referencia.");
  const modelo_anio = ent(body.modelo_anio);
  const anioMax = new Date().getFullYear() + 1;
  if (modelo_anio != null && (modelo_anio < 1970 || modelo_anio > anioMax)) errores.push(`El modelo debe estar entre 1970 y ${anioMax}.`);
  const estado = ["disponible", "reservado", "vendido"].includes(body.estado) ? body.estado : "disponible";
  const origen = body.origen === "permuta" ? "permuta" : "compra_directa";
  const ficha = {};
  for (const k of CAMPOS_FICHA) { const v = txt(body.ficha?.[k], 80); if (v) ficha[k] = v; }
  return {
    errores,
    datos: {
      tipo, marca, linea, modelo_anio, estado, origen,
      placa: txt(body.placa, 10)?.toUpperCase() ?? null,
      kilometraje: ent(body.kilometraje),
      precio: ent(body.precio),
      descripcion: txt(body.descripcion, 1500),
      ficha_tecnica: JSON.stringify(ficha),
      publicado: body.publicado === false || body.publicado === 0 ? 0 : 1,
    },
  };
}
