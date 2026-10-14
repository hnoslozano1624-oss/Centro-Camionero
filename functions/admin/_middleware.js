// Panel /admin como app instalable: agrega a la página el manifiesto (nombre e ícono de la C),
// el color de la barra y el registro del service worker, sin tocar admin/index.html.
const CABEZA =
  '<link rel="manifest" href="/admin/manifest.webmanifest">' +
  '<meta name="theme-color" content="#012792">' +
  '<link rel="icon" href="/admin/icono.svg" type="image/svg+xml">' +
  '<link rel="apple-touch-icon" href="/admin/icono.svg">' +
  '<script>if("serviceWorker" in navigator)addEventListener("load",function(){navigator.serviceWorker.register("/admin/sw.js",{scope:"/admin/"}).catch(function(){});});</script>';

export async function onRequest(context) {
  const res = await context.next();
  const tipo = res.headers.get("content-type") || "";
  if (!tipo.includes("text/html")) return res;
  return new HTMLRewriter()
    .on("head", { element(e) { e.append(CABEZA, { html: true }); } })
    .transform(res);
}
