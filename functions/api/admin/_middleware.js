// Protege todo /api/admin/*: exige sesión válida.
import { json, sesionValida } from "../../../lib/auth.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (!(await sesionValida(request, env))) return json({ error: "Su sesión expiró. Ingrese de nuevo." }, 401);
  if (!env.DB) return json({ error: "La base de datos no está enlazada al proyecto (binding DB)." }, 503);
  // Defensa adicional contra peticiones de otros sitios en métodos que modifican datos
  if (request.method !== "GET") {
    const origin = request.headers.get("Origin");
    if (origin && origin !== new URL(request.url).origin) return json({ error: "Origen no permitido." }, 403);
  }
  return context.next();
}
