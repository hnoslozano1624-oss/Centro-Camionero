/* Service worker mínimo del panel: permite instalarlo como app en el escritorio o el celular.
   No guarda nada en caché: el panel siempre muestra los datos actuales. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function () { /* siempre va a la red */ });
