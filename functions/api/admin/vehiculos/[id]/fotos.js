// Subida de fotos de un camión. La foto se guarda en KV (binding FOTOS) y su URL en D1.
import { json } from "../../../../../lib/auth.js";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FOTOS = 15;
const TIPOS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function onRequestPost({ request, env, params }) {
  if (!env.FOTOS) return json({ error: "El almacenamiento de fotos no está enlazado (binding FOTOS)." }, 503);
  const id = Number(params.id);
  const v = await env.DB.prepare("SELECT id FROM vehiculos WHERE id=?").bind(id).first();
  if (!v) return json({ error: "No se encontró el camión." }, 404);
  const { n } = await env.DB.prepare("SELECT COUNT(*) n, MAX(orden) mx FROM vehiculo_fotos WHERE vehiculo_id=?").bind(id).first();
  if (n >= MAX_FOTOS) return json({ error: `Cada camión admite máximo ${MAX_FOTOS} fotos.` }, 400);
  const form = await request.formData();
  const file = form.get("foto");
  if (!file || typeof file === "string") return json({ error: "No llegó ninguna foto." }, 400);
  const ext = TIPOS[file.type];
  if (!ext) return json({ error: "Formato no admitido. Use JPG, PNG o WEBP." }, 400);
  if (file.size > MAX_BYTES) return json({ error: "La foto pesa más de 5 MB." }, 400);
  const key = `v${id}-${crypto.randomUUID()}.${ext}`;
  await env.FOTOS.put(key, await file.arrayBuffer(), { metadata: { contentType: file.type } });
  const max = await env.DB.prepare("SELECT COALESCE(MAX(orden), -1) m FROM vehiculo_fotos WHERE vehiculo_id=?").bind(id).first("m");
  const url = `/api/fotos/${key}`;
  const r = await env.DB.prepare("INSERT INTO vehiculo_fotos (vehiculo_id, url, orden) VALUES (?,?,?)").bind(id, url, max + 1).run();
  return json({ ok: true, foto: { id: r.meta.last_row_id, url, orden: max + 1 } }, 201);
}
