/* Carrocerías FAW con foto real: el mismo FAW sobre chasís y tres carrocerías (furgón, refrigerado y estacas).
   Al cambiar de carrocería, la actual se desarma de arriba hacia abajo, se dibuja el plano de la nueva
   y la nueva se construye por bloques de abajo hacia arriba. Luego un reflejo de luz recorre el camión.
   El camión no se gira ni se deforma: con una sola foto, cualquier giro estira el frente.
   Lo usa /faw/modelo/ (funciones carrocerias() y activarCarrocerias()).
   Para agregar una carrocería con foto: subir /assets/vitrina/cc3-<id>.webp (solo la carrocería, fondo transparente,
   misma toma y tamaño que cc3-base.webp) y agregar el id a FOTOS. */
(function () {
  var FOTOS = { furgon: 1, refrigerado: 1, estacas: 1 };
  var RUTA = "/assets/vitrina/cc3-";
  var W = 982, H = 846;
  var REDUCIDO = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Geometría sobre la imagen (en píxeles del lienzo 982 × 846)
  var LADO = [[615, 57], [912, 147.1], [912, 521.5], [615, 538.5]];
  var FRENTE_SUP = [[304.5, 109.4], [615, 57]];
  var TECHO_CABINA = 222;
  // Puntos donde el camión toca el piso: esquina del bómper, llantas delanteras, llanta trasera y fin del chasís
  var BOMPER = [78, 690], LLANTA_DEL = [543, 801], LLANTA_LEJOS = [240, 750], LLANTA_TRAS = [844.5, 679.5], COLA = [910.5, 645];

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

  // Piso y sombras de contacto, en las mismas coordenadas de la imagen, para que el camión quede apoyado
  function piso() {
    // huella del camión sobre el piso (el lado lejano queda tapado por el propio camión);
    // incluye el piso bajo el bómper, que está más abajo que el bómper porque este va elevado
    var huella = "M" + p(BOMPER) + "L390 843L" + p(LLANTA_DEL) + "L" + p(LLANTA_TRAS) + "L" + p(COLA) + "L900 560L200 640Z";
    return '<svg class="c360-sombra" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="c360Luz" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#8FB0FF" stop-opacity=".34"/><stop offset=".6" stop-color="#5B7CFF" stop-opacity=".12"/><stop offset="1" stop-color="#5B7CFF" stop-opacity="0"/></radialGradient>' +
        '<filter id="c360Difusa" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>' +
        '<filter id="c360Nitida" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="4.5"/></filter>' +
      '</defs>' +
      '<ellipse cx="500" cy="760" rx="560" ry="120" fill="url(#c360Luz)"/>' +
      '<path d="' + huella + '" fill="#000510" opacity=".72" filter="url(#c360Difusa)"/>' +
      '<path d="M' + p([BOMPER[0] + 8, BOMPER[1] + 18]) + 'L372 828" fill="none" stroke="#000510" stroke-width="30" stroke-linecap="round" opacity=".5" filter="url(#c360Difusa)"/>' +
      '<ellipse cx="' + LLANTA_DEL[0] + '" cy="' + (LLANTA_DEL[1] - 2) + '" rx="68" ry="12" fill="#000510" opacity=".9" filter="url(#c360Nitida)"/>' +
      '<ellipse cx="' + LLANTA_LEJOS[0] + '" cy="' + LLANTA_LEJOS[1] + '" rx="50" ry="9" fill="#000510" opacity=".7" filter="url(#c360Nitida)"/>' +
      '<ellipse cx="' + LLANTA_TRAS[0] + '" cy="' + LLANTA_TRAS[1] + '" rx="40" ry="8" fill="#000510" opacity=".85" filter="url(#c360Nitida)"/>' +
    "</svg>";
  }

  function soporta(lista) {
    return !!(lista && lista.length) && lista.every(function (c) { return FOTOS[c.id]; });
  }

  function html(lista) {
    return '<div class="c360" data-actual="">' +
      '<div class="c360-escena">' +
        piso() +
        // la carrocería va detrás del camión: la cabina la tapa, como en la realidad
        lista.map(function (c) {
          return '<img class="c360-cuerpo" data-b="' + c.id + '" src="' + RUTA + c.id + '.webp" alt="" width="' + W + '" height="' + H + '" decoding="async">';
        }).join("") +
        '<img class="c360-base" src="' + RUTA + 'base.webp" alt="Camión FAW WHR Lion" width="' + W + '" height="' + H + '" decoding="async">' +
        '<span class="c360-brillo" aria-hidden="true"></span>' +
        plano() + '<span class="c360-laser" aria-hidden="true"></span>' +
      "</div>" +
      '<span class="c360-tag" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/></svg>Foto real</span>' +
      "</div>";
  }

  // El reflejo de luz solo recorre la silueta del camión con la carrocería elegida
  function brillo(st, id) {
    var b = st.querySelector(".c360-brillo");
    if (!b) return;
    var m = "url(" + RUTA + "base.webp), url(" + RUTA + id + ".webp)";
    b.style.webkitMaskImage = m;
    b.style.maskImage = m;
  }

  // La nota bajo la sección hablaba del giro 360°; ya no aplica.
  function ajustarNota(sec) {
    var n = sec.querySelector(".bnote");
    if (n && n.textContent.indexOf("360") >= 0) n.textContent = n.textContent.replace(/;\s*la vista 360° es una simulación\./, ".");
  }

  // Muestra la carrocería "id" con el efecto de construcción
  function mostrar(sec, id) {
    var st = sec && sec.querySelector(".c360");
    if (!st || st.dataset.actual === id) return;
    ajustarNota(sec);
    var previo = st.dataset.actual;
    st.dataset.actual = id;
    var cuerpos = [].slice.call(st.querySelectorAll(".c360-cuerpo"));
    var nuevo = st.querySelector('.c360-cuerpo[data-b="' + id + '"]');
    clearTimeout(st._t1); clearTimeout(st._t2); clearTimeout(st._t3);
    brillo(st, id);

    if (REDUCIDO) {
      cuerpos.forEach(function (c) { c.className = "c360-cuerpo" + (c === nuevo ? " on" : ""); });
      return;
    }
    st.classList.remove("trazando", "armando", "listo");
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
      st.classList.add("listo");
    }, espera + 750 + 1250);
  }

  window.Carroceria360 = { soporta: soporta, html: html, mostrar: mostrar };
})();
