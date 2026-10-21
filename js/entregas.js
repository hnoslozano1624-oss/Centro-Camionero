/* Entregas reales: fotos de clientes recibiendo su camión (se administran en /admin/entregas/).
   Pinta un carrusel en movimiento en cada contenedor con el atributo data-entregas.
   - data-max="12": cuántas fotos mostrar (sin el atributo, todas).
   - data-vacio="ocultar": si aún no hay fotos, oculta la sección completa.
   Al tocar una foto se abre en grande, con flechas para recorrer las demás. */
(function () {
  var cajas = document.querySelectorAll("[data-entregas]");
  if (!cajas.length) return;
  var FRASES = [
    "Un sueño hecho realidad",
    "Nuevas rutas, nuevas metas",
    "Lo celebramos en familia",
    "Trabajo propio, futuro propio",
    "Del esfuerzo a las llaves",
    "Un camión que mueve a una familia",
    "Arranca una nueva historia",
    "Prosperidad en marcha"
  ];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var titulo = function (x, i) { return x.texto || FRASES[i % FRASES.length]; };

  // Visor en grande (uno para toda la página)
  var visor, lista = [], pos = 0;
  function armarVisor() {
    visor = document.createElement("dialog");
    visor.className = "ent-visor";
    visor.setAttribute("aria-label", "Foto de entrega");
    visor.innerHTML = '<button class="ent-x" type="button" aria-label="Cerrar">×</button>' +
      '<button class="ent-nav ant" type="button" aria-label="Foto anterior">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="ent-nav sig" type="button" aria-label="Foto siguiente">›</button>';
    document.body.appendChild(visor);
    visor.querySelector(".ent-x").addEventListener("click", function () { visor.close(); });
    visor.querySelector(".ant").addEventListener("click", function () { ver(pos - 1); });
    visor.querySelector(".sig").addEventListener("click", function () { ver(pos + 1); });
    visor.addEventListener("click", function (e) { if (e.target === visor) visor.close(); });
    visor.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") ver(pos - 1); if (e.key === "ArrowRight") ver(pos + 1); });
  }
  function ver(i) {
    pos = (i + lista.length) % lista.length;
    var x = lista[pos];
    var img = visor.querySelector("img");
    img.src = x.url;
    img.alt = "Cliente de Centro Camionero recibiendo su camión. " + titulo(x, pos);
    visor.querySelector("figcaption").innerHTML = "<b>" + esc(titulo(x, pos)) + "</b><span>Entregado en Centro Camionero</span>";
  }
  function abrir(i) {
    if (!visor) armarVisor();
    ver(i);
    if (visor.showModal) visor.showModal(); else visor.setAttribute("open", "");
  }

  // La tarjeta usa la miniatura liviana (si existe); el visor en grande usa la foto completa.
  // Las primeras fotos cargan de inmediato; las demás, a medida que se acercan. Aparecen con un fundido suave.
  function tarjeta(x, i) {
    return '<button type="button" class="ent-card" data-i="' + i + '" aria-label="Ver en grande: ' + esc(titulo(x, i)) + '">' +
      '<img src="' + esc(x.mini || x.url) + '" alt="Cliente de Centro Camionero recibiendo su camión" loading="' + (i < 8 ? "eager" : "lazy") + '" decoding="async" onload="this.classList.add(\'ok\')">' +
      '<span class="ent-pie"><b>' + esc(titulo(x, i)) + "</b><small>Entregado en Centro Camionero</small></span></button>";
  }

  function pintar(caja, datos) {
    var max = parseInt(caja.getAttribute("data-max"), 10);
    var vista = max > 0 ? datos.slice(0, max) : datos;
    if (!vista.length) {
      if (caja.getAttribute("data-vacio") === "ocultar") {
        var sec = caja.closest("section"); if (sec) sec.hidden = true;
      } else {
        caja.innerHTML = '<p class="ent-vacio">Muy pronto verás aquí las fotos de nuestras entregas más recientes.</p>';
      }
      return;
    }
    var fichas = vista.map(tarjeta).join("");
    caja.innerHTML = '<div class="ent-carrusel" aria-label="Fotos de entregas a clientes"><div class="ent-pista" style="--ent-dur:' + Math.max(40, vista.length * 5) + 's">' +
      '<div class="ent-set">' + fichas + '</div><div class="ent-set" aria-hidden="true">' + fichas + "</div></div></div>";
    caja.querySelectorAll('.ent-set[aria-hidden="true"] .ent-card').forEach(function (b) { b.setAttribute("tabindex", "-1"); });
    caja.addEventListener("click", function (e) {
      var b = e.target.closest(".ent-card"); if (!b) return;
      lista = vista; abrir(Number(b.getAttribute("data-i")));
    });
    var cont = document.querySelectorAll("[data-entregas-total]");
    cont.forEach(function (el) { el.textContent = datos.length; });
  }

  fetch("/api/entregas").then(function (r) { return r.ok ? r.json() : { entregas: [] }; })
    .catch(function () { return { entregas: [] }; })
    .then(function (d) { var datos = (d && d.entregas) || []; cajas.forEach(function (c) { pintar(c, datos); }); });
})();
