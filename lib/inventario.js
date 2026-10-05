// Inventario público para DYLIA (/inventario.json) y fichas individuales (/usados/<camion>).
// Una sola fuente de verdad: usados = base de datos D1 (la misma que lee la web y edita el panel /admin);
// FAW nuevos = faw/modelos.json (la misma que usan las páginas /faw/). Nada se escribe a mano.
import { fotosPorVehiculo, parseFicha } from "./vehiculos.js";

export const BASE_SITIO = "https://www.centrocamionero.com.co";
export const TIPOS = ["usado", "nuevo FAW"];
export const ESTADOS = ["disponible", "reservado"];
export const CATEGORIAS = ["liviano", "mediano"];
export const CAMPOS = ["id", "tipo", "marca", "modelo", "anio", "kilometraje", "motor", "carroceria", "precio", "estado", "url", "foto", "categoria"];
const OBLIGATORIOS = ["id", "tipo", "marca", "modelo", "estado", "url"];
// Nombres de campo que jamás deben salir en el archivo público
const PROHIBIDOS = /placa|chasis|vin|propietari|due[nñ]o|costo|margen|nota|comisi|compra|origen|permuta|cedula|nit/i;

export function limpiarBase(b) {
  return String(b || BASE_SITIO).replace(/\/+$/, "");
}
export function slug(texto) {
  return String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
export const idUsado = (v) => "CC-U-" + String(v.id).padStart(4, "0");
export const slugUsado = (v) => slug([v.marca, v.linea, v.modelo_anio].filter(Boolean).join(" ")) + "-" + v.id;
export const urlUsado = (v, base) => `${limpiarBase(base)}/usados/${slugUsado(v)}`;
const absoluta = (ruta, base) => {
  if (!ruta) return null;
  try { return new URL(ruta, limpiarBase(base) + "/").href; } catch { return null; }
};
const entero = (n) => (n == null || n === "" ? null : Number.isFinite(Number(n)) ? Math.round(Number(n)) : null);

// Camiones usados publicados (no vendidos) desde D1
export async function leerUsados(db) {
  const { results } = await db.prepare(
    `SELECT id, tipo, marca, linea, modelo_anio, kilometraje, precio, estado, descripcion, ficha_tecnica
     FROM vehiculos WHERE publicado = 1 AND tipo = 'usado' AND estado IN ('disponible','reservado')
     ORDER BY CASE estado WHEN 'disponible' THEN 0 ELSE 1 END, fecha_registro DESC, id DESC`
  ).all();
  const fotos = await fotosPorVehiculo(db, results.map((v) => v.id));
  return results.map(({ ficha_tecnica, ...v }) => ({ ...v, ficha: parseFicha(ficha_tecnica), fotos: (fotos[v.id] || []).map((f) => f.url) }));
}

export function aInventarioUsado(v, base) {
  const precio = entero(v.precio);
  return {
    id: idUsado(v),
    tipo: "usado",
    marca: v.marca,
    modelo: v.linea,
    anio: entero(v.modelo_anio),
    kilometraje: entero(v.kilometraje),
    motor: v.ficha?.motor || null,
    carroceria: v.ficha?.carroceria || null,
    precio: precio && precio > 0 ? precio : null,
    estado: v.estado,
    url: urlUsado(v, base),
    foto: absoluta(v.fotos?.[0], base),
  };
}

// "WHR LION 2.6" -> "WHR Lion 2.6" (la primera palabra, la familia, queda en mayúsculas)
const titulo = (nombre) => String(nombre || "").trim().split(/\s+/).map((w, i) => (i === 0 || !/^[A-Za-zÁÉÍÓÚÑ]+$/.test(w) ? w : w[0].toUpperCase() + w.slice(1).toLowerCase())).join(" ");

// La categoría es la misma que muestra el sitio (campo "segmento" de cada modelo)
export function categoriaFaw(m) {
  return /mediana/i.test(m.segmento || "") ? "mediano" : /liviana/i.test(m.segmento || "") ? "liviano" : null;
}

export function aInventarioFaw(m, base) {
  return {
    id: "FAW-" + String(m.slug).toUpperCase(),
    tipo: "nuevo FAW",
    marca: "FAW",
    modelo: titulo(m.nombre),
    anio: null,
    kilometraje: null,
    motor: m.motorDestacado ? String(m.motorDestacado).replace(/^Motor\s+/i, "") : null,
    carroceria: null, // el chasís se vende sin carrocería; la fabrican terceros
    precio: null, // los FAW nuevos nunca llevan precio en este archivo
    estado: "disponible",
    url: `${limpiarBase(base)}/faw/modelos/${m.slug}`,
    foto: absoluta(m.img, base),
    categoria: categoriaFaw(m),
  };
}

// Devuelve la lista de problemas; vacía = válido
export function validarInventario(lista) {
  const e = [];
  if (!Array.isArray(lista)) return ["El inventario no es un arreglo."];
  if (!lista.length) return ["El inventario está vacío."];
  const vistos = new Set();
  const https = (u) => { try { return new URL(u).protocol === "https:"; } catch { return false; } };
  lista.forEach((u, i) => {
    const r = `Entrada ${i + 1}${u && u.id ? " (" + u.id + ")" : ""}`;
    if (!u || typeof u !== "object" || Array.isArray(u)) { e.push(`${r}: no es un objeto.`); return; }
    for (const k of Object.keys(u)) {
      if (PROHIBIDOS.test(k)) e.push(`${r}: campo prohibido "${k}".`);
      else if (!CAMPOS.includes(k)) e.push(`${r}: campo no permitido "${k}".`);
    }
    for (const k of OBLIGATORIOS) if (typeof u[k] !== "string" || !u[k].trim()) e.push(`${r}: falta ${k}.`);
    if (typeof u.id === "string" && u.id) { if (vistos.has(u.id)) e.push(`${r}: id repetido.`); vistos.add(u.id); }
    if (u.tipo && !TIPOS.includes(u.tipo)) e.push(`${r}: tipo inválido "${u.tipo}".`);
    if (u.estado && !ESTADOS.includes(u.estado)) e.push(`${r}: estado inválido "${u.estado}".`);
    if (u.precio !== null && u.precio !== undefined && !(Number.isInteger(u.precio) && u.precio >= 0)) e.push(`${r}: precio debe ser un entero o null.`);
    if (u.tipo === "nuevo FAW" && u.precio != null) e.push(`${r}: un FAW nuevo no puede traer precio.`);
    if (u.tipo === "nuevo FAW" && !CATEGORIAS.includes(u.categoria)) e.push(`${r}: categoria debe ser liviano o mediano.`);
    if (u.tipo === "usado" && "categoria" in u) e.push(`${r}: categoria solo aplica a FAW nuevos.`);
    for (const k of ["anio", "kilometraje"]) if (u[k] != null && !(Number.isInteger(u[k]) && u[k] >= 0)) e.push(`${r}: ${k} debe ser entero o null.`);
    for (const k of ["motor", "carroceria"]) if (u[k] != null && (typeof u[k] !== "string" || !u[k].trim() || /^(n\/?a|na|-+|\.+)$/i.test(u[k].trim()))) e.push(`${r}: ${k} debe ser texto real o null.`);
    if (u.url != null && !https(u.url)) e.push(`${r}: url debe ser https absoluta.`);
    if (u.foto != null && !https(u.foto)) e.push(`${r}: foto debe ser https absoluta o null.`);
  });
  return e;
}

export async function construirInventario({ db, faw, base }) {
  const usados = (await leerUsados(db)).map((v) => aInventarioUsado(v, base));
  const nuevos = (faw || []).map((m) => aInventarioFaw(m, base));
  return usados.concat(nuevos);
}
