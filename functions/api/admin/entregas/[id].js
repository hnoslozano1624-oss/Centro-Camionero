// Entregas (panel): editar texto, mostrar/ocultar, poner de primera, o eliminar.
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

export async function onRequestDelete({ env, params }) {
  const e = await env.DB.prepare("SELECT id, url FROM entregas WHERE id=?").bind(Number(params.id)).first();
  if (!e) return json({ error: "Entrega no encontrada." }, 404);
  await env.DB.prepare("DELETE FROM entregas WHERE id=?").bind(e.id).run();
  if (env.FOTOS) await env.FOTOS.delete(e.url.split("/").pop());
  return json({ ok: true });
}
