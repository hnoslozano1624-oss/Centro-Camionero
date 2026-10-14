// Entregas (panel): listar y subir fotos. La sesión la valida /api/admin/_middleware.js.
import { json } from "../../../../lib/auth.js";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_MINI = 1024 * 1024;
const TIPOS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT id, url, mini, texto, publicado, orden, creado FROM entregas ORDER BY orden DESC, id DESC").all();
  return json({ entregas: results, fotos: !!env.FOTOS });
}

export async function onRequestPost({ request, env }) {
  if (!env.FOTOS) return json({ error: "El almacenamiento de fotos no está enlazado (binding FOTOS)." }, 503);
  const form = await request.formData();
  const file = form.get("foto");
  if (!file || typeof file === "string") return json({ error: "No llegó ninguna foto." }, 400);
  const ext = TIPOS[file.type];
  if (!ext) return json({ error: "Formato no admitido. Use JPG, PNG o WEBP." }, 400);
  if (file.size > MAX_BYTES) return json({ error: "La foto pesa más de 5 MB." }, 400);
  const texto = String(form.get("texto") || "").trim().slice(0, 140);
  const key = `e-${crypto.randomUUID()}.${ext}`;
  await env.FOTOS.put(key, await file.arrayBuffer(), { metadata: { contentType: file.type } });
  // Miniatura opcional (la genera el panel): la usa el carrusel para cargar rápido
  let mini = "";
  const m = form.get("mini");
  if (m && typeof m !== "string" && TIPOS[m.type] && m.size <= MAX_MINI) {
    const mk = `e-${crypto.randomUUID()}-mini.${TIPOS[m.type]}`;
    await env.FOTOS.put(mk, await m.arrayBuffer(), { metadata: { contentType: m.type } });
    mini = `/api/fotos/${mk}`;
  }
  const max = await env.DB.prepare("SELECT COALESCE(MAX(orden), 0) m FROM entregas").first("m");
  const url = `/api/fotos/${key}`;
  const r = await env.DB.prepare("INSERT INTO entregas (url, mini, texto, publicado, orden) VALUES (?,?,?,1,?)").bind(url, mini, texto, max + 1).run();
  return json({ ok: true, entrega: { id: r.meta.last_row_id, url, mini, texto, publicado: 1, orden: max + 1 } }, 201);
}
