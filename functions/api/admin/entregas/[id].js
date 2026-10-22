// Entregas (panel): editar texto, mostrar/ocultar, poner de primera, cambiar la miniatura, o eliminar.
import { json } from "../../../../lib/auth.js";

export async function onRequestPatch({ request, env, params }) {
  const id = Number(params.id);
  const e = await env.DB.prepare("SELECT id FROM entregas WHERE id=?").bind(id).first();
  if (!e) return json({ error: "Entrega no encontrada." }, 404);
  const b = await request.json().catch(() => ({}));
  if (typeof b.texto === "string") await env.DB.prepare("UPDATE entregas SET texto=? WHERE id=?").bind(b.texto.trim().slice(0, 140), id).run();
  if (b.publicado !== undefined) await env.DB.prepare("UPDATE entregas SET publicado=? WHERE id=?").bind(b.publicado ? 1 : 0, id).run();
  if (b.destacar) {
    const max = await env.DB.prepare("SELECT COALESCE(MAX(orden), 0) m FROM entregas").first("m");
    await env.DB.prepare("UPDATE entregas SET orden=? WHERE id=?").bind(max + 1, id).run();
  }
  return json({ ok: true });
}

// Guardar la miniatura (640 px) de una foto que aún no la tiene
export async function onRequestPut({ request, env, params }) {
  if (!env.FOTOS) return json({ error: "El almacenamiento de fotos no está enlazado (binding FOTOS)." }, 503);
  const e = await env.DB.prepare("SELECT id, mini FROM entregas WHERE id=?").bind(Number(params.id)).first();
  if (!e) return json({ error: "Entrega no encontrada." }, 404);
  const form = await request.formData();
  const m = form.get("mini");
  if (!m || typeof m === "string") return json({ error: "No llegó la miniatura." }, 400);
  if (!/^image\/(jpeg|webp)$/.test(m.type) || m.size > 1024 * 1024) return json({ error: "Miniatura no válida." }, 400);
  const key = `e-${crypto.randomUUID()}-mini.${m.type === "image/webp" ? "webp" : "jpg"}`;
  await env.FOTOS.put(key, await m.arrayBuffer(), { metadata: { contentType: m.type } });
  const mini = `/api/fotos/${key}`;
  await env.DB.prepare("UPDATE entregas SET mini=? WHERE id=?").bind(mini, e.id).run();
  if (e.mini) await env.FOTOS.delete(e.mini.split("/").pop());
  return json({ ok: true, mini });
}

export async function onRequestDelete({ env, params }) {
  const e = await env.DB.prepare("SELECT id, url, mini FROM entregas WHERE id=?").bind(Number(params.id)).first();
  if (!e) return json({ error: "Entrega no encontrada." }, 404);
  await env.DB.prepare("DELETE FROM entregas WHERE id=?").bind(e.id).run();
  if (env.FOTOS) {
    await env.FOTOS.delete(e.url.split("/").pop());
    if (e.mini) await env.FOTOS.delete(e.mini.split("/").pop());
  }
  return json({ ok: true });
}
