/* Ícono de la pestaña (favicon): la llanta de Centro Camionero, girando.
   - Se dibuja la llanta en un lienzo y se cambia el ícono varias veces por segundo (funciona en Chrome, Edge y Firefox).
   - Si el navegador no lo permite o la persona pidió reducir el movimiento, queda la llanta quieta. */
(function () {
  if (window.__faviconLlanta) return;
  window.__faviconLlanta = true;
  var SRC = "/assets/favicon.svg", S = 64, VUELTA = 2400, CADA = 90;

  function nuevoIcono(href, tipo) {
    var l = document.createElement("link");
    l.rel = "icon"; l.type = tipo; l.href = href;
    var viejo = document.querySelector('link[rel~="icon"]');
    if (viejo) viejo.replaceWith(l); else document.head.appendChild(l);
    return l;
  }

  nuevoIcono(SRC, "image/svg+xml");
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var img = new Image();
  img.onload = function () {
    var cv = document.createElement("canvas"); cv.width = cv.height = S;
    var cx = cv.getContext("2d"); if (!cx) return;
    var reloj = setInterval(function () {
      try {
        var a = (Date.now() % VUELTA) / VUELTA * Math.PI * 2;
        cx.clearRect(0, 0, S, S); cx.save(); cx.translate(S / 2, S / 2); cx.rotate(a);
        cx.drawImage(img, -S / 2, -S / 2, S, S); cx.restore();
        nuevoIcono(cv.toDataURL("image/png"), "image/png");
      } catch (e) { clearInterval(reloj); /* si el navegador no deja leer el lienzo, se queda la llanta quieta */ }
    }, CADA);
  };
  img.src = SRC;
})();
