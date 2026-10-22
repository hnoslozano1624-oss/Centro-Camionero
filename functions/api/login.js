import { accesoConfigurado, crearCookie, json, passwordCorrecta } from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!(await accesoConfigurado(env))) return json({ error: "El panel aún no tiene contraseña configurada." }, 503);
  let body = {};
  try { body = await request.json(); } catch {}
  // Pequeña pausa para frenar intentos repetidos de adivinar la contraseña
  await new Promise((r) => setTimeout(r, 400));
  if (!(await passwordCorrecta(env, String(body.password || "")))) {
    return json({ error: "Contraseña incorrecta." }, 401);
  }
  return json({ ok: true }, 200, { "Set-Cookie": await crearCookie(env) });
}
