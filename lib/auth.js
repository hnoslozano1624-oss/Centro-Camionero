// Sesión del panel /admin.
// La contraseña se guarda como hash (SHA-256 con sal) en la tabla `config` de D1,
// junto con la llave que firma las cookies de sesión. Si existe la variable ADMIN_PASSWORD
// en Cloudflare, tiene prioridad sobre la de D1.
const COOKIE = "cc_admin";
const DURACION_SEG = 60 * 60 * 12; // 12 horas
const enc = new TextEncoder();

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function sha256(texto) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(texto)));
}
async function firmar(secreto, texto) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(texto)));
}
// Comparación en tiempo constante (vía HMAC de ambos lados)
export async function igualSeguro(a, b, secreto = "cc") {
  const [x, y] = await Promise.all([firmar(secreto, String(a)), firmar(secreto, String(b))]);
  let r = 0;
  for (let i = 0; i < x.length; i++) r |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return r === 0;
}

// Lee la configuración de acceso (variable de entorno o tabla config de D1)
async function acceso(env) {
  if (env.ADMIN_PASSWORD) return { modo: "env", llave: env.ADMIN_PASSWORD };
  if (!env.DB) return null;
  try {
    const { results } = await env.DB.prepare(
      "SELECT clave, valor FROM config WHERE clave IN ('admin_hash','admin_salt','session_secret')"
    ).all();
    const c = Object.fromEntries(results.map((r) => [r.clave, r.valor]));
    if (!c.admin_hash || !c.admin_salt || !c.session_secret) return null;
    return { modo: "db", hash: c.admin_hash, sal: c.admin_salt, llave: c.session_secret };
  } catch {
    return null;
  }
}

export async function accesoConfigurado(env) {
  return !!(await acceso(env));
}

export async function passwordCorrecta(env, password) {
  const a = await acceso(env);
  if (!a) return false;
  if (a.modo === "env") return igualSeguro(password, env.ADMIN_PASSWORD, a.llave);
  return igualSeguro(await sha256(a.sal + password), a.hash, a.llave);
}

export async function crearCookie(env) {
  const a = await acceso(env);
  const exp = Math.floor(Date.now() / 1000) + DURACION_SEG;
  const sig = await firmar(a.llave, String(exp));
  return `${COOKIE}=${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DURACION_SEG}`;
}
export function borrarCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function sesionValida(request, env) {
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=(\\d+)\\.([a-f0-9]{64})`));
  if (!m) return false;
  const exp = Number(m[1]);
  if (exp < Date.now() / 1000) return false;
  const a = await acceso(env);
  if (!a) return false;
  return igualSeguro(m[2], await firmar(a.llave, String(exp)), a.llave);
}

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}
