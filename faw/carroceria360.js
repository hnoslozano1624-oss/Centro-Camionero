/* Carrocerías FAW con foto real: el mismo FAW sobre chasís y tres carrocerías (furgón, refrigerado y estacas).
   Al cambiar de carrocería, la actual se desarma de arriba hacia abajo, se dibuja el plano de la nueva
   y la nueva se construye por bloques de abajo hacia arriba. Luego el camión gira solo, en vista 3D.
   Lo usa /faw/modelo/ (funciones carrocerias() y activarCarrocerias()).
   Para agregar una carrocería con foto: subir /assets/vitrina/cc-<id>.webp (solo la carrocería, fondo transparente,
   misma toma y tamaño que cc-plataforma.webp) y agregar el id a FOTOS. */
(function () {
  var FOTOS = { furgon: 1, refrigerado: 1, estacas: 1 };
  var RUTA = "/assets/vitrina/cc-";
  var W = 720, H = 661;
  var REDUCIDO = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Geometría de la caja sobre la foto (en píxeles de la imagen 720 × 661)
  var LADO = [[437.8, 4.4], [717.1, 140.3], [711.2, 373.5], [456.9, 465.6]];
  var FRENTE_SUP = [[135.2, 29.2], [437.8, 4.4]];
  var TECHO_CABINA = 188;

  function mezcla(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function p(pt) { return pt[0].toFixed(1) + " " + pt[1].toFixed(1); }

  // Plano (líneas de construcción) de la carrocería
  function plano() {
    var d = "";
    var tl = LADO[0], tr = LADO[1], br = LADO[2], bl = LADO[3];
    d += "M" + p(tl) + "L" + p(tr) + "L" + p(br) + "L" + p(bl) + "Z";
    for (var i = 1; i < 6; i++) { var t = i / 6; d += "M" + p(mezcla(tl, bl, t)) + "L" + p(mezcla(tr, br, t)); }
    for (var j = 1; j < 5; j++) { var u = j / 5; d += "M" + p(mezcla(tl, tr, u)) + "L" + p(mezcla(bl, br, u)); }
    var fl = FRENTE_SUP[0], fr = FRENTE_SUP[1];
    var flB = [fl[0] + 2, TECHO_CABINA], frB = mezcla(fr, bl, (TECHO_CABINA - fr[1]) / (bl[1] - fr[1]));
    d += "M" + p(fl) + "L" + p(fr) + "M" + p(fl) + "L" + p(flB) + "L" + p(frB);
    for (var k = 1; k < 4; k++) { var v = k / 4; d += "M" + p(mezcla(fl, flB, v)) + "L" + p(mezcla(fr, frB, v)); }
    return '<svg class="c360-plano" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  function soporta(lista) {
    return !!(lista && lista.length) && lista.every(function (c) { return FOTOS[c.id]; });
  }

  function html(lista) {
    return '<div class="c360" data-actual="">' +
      '<div class="c360-escena"><div class="c360-giro">' +
        '<img class="c360-base" src="' + RUTA + 'plataforma.webp" alt="Camión FAW sobre chasís" width="' + W + '" height="' + H + '" decoding="async">' +
        lista.map(function (c) {
          return '<img class="c360-cuerpo" data-b="' + c.id + '" src="' + RUTA + c.id + '.webp" alt="" width="' + W + '" height="' + H + '" decoding="async">';
        }).join("") +
        plano() + '<span class="c360-laser" aria-hidden="true"></span>' +
      "</div></div>" +
      '<div class="c360-piso" aria-hidden="true"></div>' +
      '<span class="c360-tag" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 4 0 0 0 18 0"/><path d="M21 12a9 4 0 0 0-14-3.3"/><path d="M7 6l0 3h3"/></svg>Vista 360°</span>' +
      "</div>";
  }

  // Giro automático: el ángulo oscila suavemente; al cambiar de carrocería vuelve al frente y se detiene.
  var amp = 0, objetivo = 0, t0 = 0, raf = 0, giros = [];
  function cuadro(ts) {
    if (!t0) t0 = ts;
    amp += (objetivo - amp) * 0.06;
    var ang = amp * Math.sin((ts - t0) / 1000 * (2 * Math.PI / 9));
    giros.forEach(function (g) {
      g.style.transform = "rotateY(" + ang.toFixed(2) + "deg)";
      var piso = g.parentNode.parentNode.querySelector(".c360-piso");
      if (piso) piso.style.transform = "translateX(-50%) scaleX(" + (1 - Math.abs(ang) / 160).toFixed(3) + ")";
    });
    raf = requestAnimationFrame(cuadro);
  }
  function arrancarGiro(si) {
    objetivo = si && !REDUCIDO ? 24 : 0;
    if (!raf && !REDUCIDO) raf = requestAnimationFrame(cuadro);
  }

  // Muestra la carrocería "id" con el efecto de construcción
  function mostrar(sec, id) {
    var st = sec && sec.querySelector(".c360");
    if (!st || st.dataset.actual === id) return;
    var giro = st.querySelector(".c360-giro");
    if (giros.indexOf(giro) < 0) giros.push(giro);
    var previo = st.dataset.actual;
    st.dataset.actual = id;
    var cuerpos = [].slice.call(st.querySelectorAll(".c360-cuerpo"));
    var nuevo = st.querySelector('.c360-cuerpo[data-b="' + id + '"]');
    clearTimeout(st._t1); clearTimeout(st._t2); clearTimeout(st._t3);

    if (REDUCIDO) {
      cuerpos.forEach(function (c) { c.className = "c360-cuerpo" + (c === nuevo ? " on" : ""); });
      return;
    }
    arrancarGiro(false);
    st.classList.remove("trazando", "armando");
    cuerpos.forEach(function (c) {
      if (c === nuevo) { c.className = "c360-cuerpo"; return; }
      c.className = "c360-cuerpo" + (c.dataset.b === previo ? " sale" : "");
    });
    var espera = previo ? 650 : 150;
    st._t1 = setTimeout(function () { void st.offsetWidth; st.classList.add("trazando"); }, espera);
    st._t2 = setTimeout(function () { nuevo.className = "c360-cuerpo arma"; st.classList.add("armando"); }, espera + 750);
    st._t3 = setTimeout(function () {
      nuevo.className = "c360-cuerpo on";
      st.classList.remove("trazando", "armando");
      arrancarGiro(true);
    }, espera + 750 + 1250);
  }

  window.Carroceria360 = { soporta: soporta, html: html, mostrar: mostrar };
})();
