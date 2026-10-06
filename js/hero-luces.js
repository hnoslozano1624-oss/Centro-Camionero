/* Luces de los camiones del banner principal de Centro Camionero.
   Posiciones medidas sobre la imagen original (1916 x 821 px): h = luces delanteras, f = exploradoras,
   a = estacionarias (intermitentes). Solo el Hino (tercer camión) enciende las estacionarias. */
(function () {
  var link = document.querySelector(".hero-banner-link");
  if (!link || link.querySelector(".hl")) return;
  var W = 1916, H = 821;

  var CAMIONES = [
    { n: 1, h: [[864, 554], [997, 556]], f: [[861, 579], [997, 580]] },
    { n: 2, h: [[1094, 557], [1230, 558]], f: [[1091, 582], [1229, 584]] },
    { n: 3, h: [[1347.5, 556], [1510, 557.5]], f: [[1345, 585], [1507.5, 586]], a: [[1339, 532], [1519, 532]] },
    { n: 4, h: [[1667.5, 557.5], [1834, 557.5]], f: [[1666, 586], [1836, 585]] }
  ];

  function luz(cls, p) {
    return '<i class="' + cls + '" style="left:' + (p[0] / W * 100).toFixed(3) + "%;top:" + (p[1] / H * 100).toFixed(3) + '%"></i>';
  }

  var html = "";
  CAMIONES.forEach(function (c) {
    c.h.forEach(function (p) { html += luz("hl-h hl-h" + c.n, p); });
    c.f.forEach(function (p) { html += luz("hl-f hl-f" + c.n, p); });
    (c.a || []).forEach(function (p) { html += luz("hl-a", p); });
    // reflejo sobre el piso, centrado entre las dos luces del camión
    html += luz("hl-s hl-h" + c.n, [(c.h[0][0] + c.h[1][0]) / 2, 638]);
  });

  var capa = document.createElement("span");
  capa.className = "hl"; capa.setAttribute("aria-hidden", "true"); capa.innerHTML = html;

  var css = document.createElement("link");
  css.rel = "stylesheet"; css.href = "/css/hero-luces.css";
  css.onload = function () { link.appendChild(capa); };
  css.onerror = function () { /* sin estilos no se muestra nada */ };
  document.head.appendChild(css);
})();
