// Calificaciones de Google de Centro Camionero, leídas en vivo con la API de Google Places (New).
// Requiere el secreto GOOGLE_PLACES_KEY en Cloudflare Pages (y opcionalmente GOOGLE_PLACE_ID).
// Sin llave responde { disponible:false } y la página muestra solo los botones para ver y dejar opiniones en Google.
// La respuesta se guarda 6 horas en caché para no consultar a Google en cada visita.
const BUSQUEDA = "Centro Camionero Camiones Usados, Calle 13 #62-34, Bogotá";

function json(obj, cache) {
  return new Response(JSON.stringify(obj), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache || "no-store" },
  });
}

export async function onRequestGet({ request, env, waitUntil }) {
  const key = env.GOOGLE_PLACES_KEY;
  if (!key) return json({ disponible: false });

  const cache = caches.default;
  const llave = new Request(new URL("/api/resenas?cache=1", request.url).href);
  const guardada = await cache.match(llave);
  if (guardada) return guardada;

  try {
    let id = env.GOOGLE_PLACE_ID;
    if (!id) {
      const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.id" },
        body: JSON.stringify({ textQuery: BUSQUEDA, languageCode: "es", regionCode: "CO" }),
      });
      const d = await r.json();
      id = d.places && d.places[0] && d.places[0].id;
      if (!id) throw new Error("No se encontró el lugar en Google");
    }
    const r = await fetch("https://places.googleapis.com/v1/places/" + encodeURIComponent(id) + "?languageCode=es&regionCode=CO", {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "id,rating,userRatingCount,reviews,googleMapsUri" },
    });
    if (!r.ok) throw new Error("Google Places respondió " + r.status);
    const p = await r.json();
    const out = {
      disponible: true,
      id: p.id || id,
      calificacion: p.rating || null,
      total: p.userRatingCount || 0,
      url: p.googleMapsUri || null,
      resenas: (p.reviews || []).map((x) => ({
        autor: (x.authorAttribution && x.authorAttribution.displayName) || "Usuario de Google",
        foto: (x.authorAttribution && x.authorAttribution.photoUri) || null,
        perfil: (x.authorAttribution && x.authorAttribution.uri) || null,
        estrellas: x.rating || 0,
        texto: (x.text && x.text.text) || (x.originalText && x.originalText.text) || "",
        cuando: x.relativePublishTimeDescription || "",
        enlace: x.googleMapsUri || null,
      })),
    };
    const res = json(out, "public, max-age=21600");
    waitUntil(cache.put(llave, res.clone()));
    return res;
  } catch (e) {
    console.error("resenas:", e && e.message);
    return json({ disponible: false, error: true });
  }
}
