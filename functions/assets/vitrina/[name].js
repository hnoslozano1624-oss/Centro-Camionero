// Sirve las fotos de la vitrina FAW (/assets/vitrina/<modelo>.webp).
// Si la imagen .webp existe como archivo estático, se entrega tal cual.
// Si no, se arma a partir de su copia en texto base64, partida en trozos
// (<modelo>.1.b64, <modelo>.2.b64, ...): el conector de GitHub no permite subir binarios.
export async function onRequestGet({ request, params, env }) {
  const m = String(params.name || "").match(/^([a-z0-9-]+)\.webp$/);
  if (!m) return new Response("No encontrado", { status: 404 });

  const real = await env.ASSETS.fetch(request);
  if (real.ok && (real.headers.get("content-type") || "").startsWith("image/")) return real;

  let txt = "";
  for (let i = 1; i <= 40; i++) {
    const url = new URL(request.url);
    url.pathname = `/assets/vitrina/${m[1]}.${i}.b64`;
    url.search = "";
    const r = await env.ASSETS.fetch(new Request(url.toString()));
    if (!r.ok || (r.headers.get("content-type") || "").includes("text/html")) break;
    txt += await r.text();
  }
  txt = txt.replace(/\s+/g, "");
  if (!txt) return new Response("No encontrado", { status: 404 });

  const bin = Uint8Array.from(atob(txt), (c) => c.charCodeAt(0));
  return new Response(bin, {
    headers: { "content-type": "image/webp", "cache-control": "public, max-age=86400" },
  });
}
