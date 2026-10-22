/* Service worker mínimo para que el sitio se pueda instalar como app en el escritorio o el celular.
   No guarda nada en caché: cada vez que se abre la app se ve la versión más reciente del sitio. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function () { /* siempre va a la red */ });
