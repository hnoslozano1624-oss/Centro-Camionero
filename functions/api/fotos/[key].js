// Sirve las fotos guardadas en KV (binding FOTOS). Cada foto tiene una llave única, así que se puede cachear sin límite.
export async function onRequestGet({ params, env }) {
  if (!env.FOTOS) return new Response("Almacenamiento de fotos no enlazado", { status: 503 });
  const { value, metadata } = await env.FOTOS.getWithMetadata(params.key, { type: "stream", cacheTtl: 86400 });
  if (!value) return new Response("Foto no encontrada", { status: 404 });
  return new Response(value, {
    headers: {
      "Content-Type": metadata?.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
