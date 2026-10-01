// Sesión del panel: cookie firmada con HMAC-SHA256 usando ADMIN_PASSWORD como llave.
// Si se cambia la contraseña en Cloudflare, todas las sesiones abiertas se invalidan.
const COOKIE = "cc_admin";
const DURACION_SEG = 60 * 60 * 12; // 12 horas
const enc = new TextEncoder();

async function llave(secreto) {
  return crypto.subtle.importKey("raw", enc.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}
function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function firmar(secreto, texto) {
  return hex(await crypto.subtle.sign("HMAC", await llave(secreto), enc.encode(texto)));
}
// Comparación en tiempo constante (vía HMAC de ambos lados)
export async function igualSeguro(a, b, secreto = "cc") {
  const [x, y] = await Promise.all([firmar(secreto, String(a)), firmar(secreto, String(b))]);
  let r = 0;
  for (let i = 0; i < x.length; i++) r |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return r === 0;
}

export async function crearCookie(env) {
  const exp = Math.floor(Date.now() / 1000) + DURACION_SEG;
  const sig = await firmar(env.ADMIN_PASSWORD, String(exp));
  return `${COOKIE}=${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DURACION_SEG}`;
}
export function borrarCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function sesionValida(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=(\\d+)\\.([a-f0-9]{64})`));
  if (!m) return false;
  const exp = Number(m[1]);
  if (exp < Date.now() / 1000) return false;
  return igualSeguro(m[2], await firmar(env.ADMIN_PASSWORD, String(exp)));
}

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}
