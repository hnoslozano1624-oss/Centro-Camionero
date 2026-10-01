import { crearCookie, igualSeguro, json } from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return json({ error: "El panel aún no tiene contraseña configurada en Cloudflare (variable ADMIN_PASSWORD)." }, 503);
  let body = {};
  try { body = await request.json(); } catch {}
  // Pequeña pausa para frenar intentos repetidos de adivinar la contraseña
  await new Promise((r) => setTimeout(r, 400));
  if (!(await igualSeguro(body.password || "", env.ADMIN_PASSWORD, env.ADMIN_PASSWORD))) {
    return json({ error: "Contraseña incorrecta." }, 401);
  }
  return json({ ok: true }, 200, { "Set-Cookie": await crearCookie(env) });
}
