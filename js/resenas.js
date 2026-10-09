/* Opiniones de Google en el inicio.
   - Siempre muestra las reseñas reales que el equipo copió de Google (lista RESENAS, textos sin editar).
   - Si se configura la llave de Google Places (/api/resenas), se reemplazan por los datos en vivo: nota, total y reseñas.
   Para agregar o cambiar una reseña fija, edite solo la lista RESENAS. */
(function () {
  var caja = document.getElementById("resGoogle");
  if (!caja) return;
  var MAPS = caja.getAttribute("data-maps");
  var RESENAS = [
    { autor: "Eimy Chauta", estrellas: 5, enlace: "https://www.google.com/maps/contrib/105493191292569260380/reviews?hl=es-419",
      texto: "Quiero recomendar ampliamente al centro camionero por la excelente experiencia en la entrega del furgón. Desde el primer momento me brindaron seguridad, confianza y una atención muy profesional. Todo el proceso fue llevado por el señor Yoanni quien fue muy claro, organizado y con un acompañamiento constante, lo que me hizo sentir tranquila y satisfecha con el servicio." },
    { autor: "Andres Samboni", estrellas: 5, enlace: "https://www.google.com/maps/contrib/109682187079699365057/reviews?hl=es-419",
      texto: "Excelente Servicio, buen asesoramiento, personas serias, brindan mucha confianza, puntualidad en la entrega, carro en óptimas condiciones,muy buena experiencia haberlos conocido. Gracias" },
    { autor: "Octavio Niebles", estrellas: 5, enlace: "https://www.google.com/maps/contrib/109936128760202381588/reviews?hl=es-419",
      texto: "Recibo de manera formal mi camión, después de quedar adjudicado en autofinanciera. En él centro camionero de la ciudad de bogota, con una atención excelente!.." },
    { autor: "JHON ALEXANDER JIMENEZ RODRIGUEZ", estrellas: 5, enlace: "https://www.google.com/maps/contrib/116033865960643488781/reviews?hl=es-419",
      texto: "Agradecido con Centro Camionero y en especial con la asesora Clemencia, por permitirnos cumplir un sueño mas, excelente atención, Dios los bendiga este año en su labor, muchos éxitos" },
    { autor: "jesus chitiva", estrellas: 5, enlace: "https://www.google.com/maps/contrib/116710620042519969323/reviews?hl=es-419",
      texto: "Gracias Jhoana por ayudarnos tanto por cumplir este sueño te agradezco muchísimo eres una gran asesora mil bendiciones 🙂" },
    { autor: "Aldemar Montejo García", estrellas: 5, enlace: "https://www.google.com/maps/contrib/110954921609305987253/reviews?hl=es-419",
      texto: "Un buen servicio,buena atención excelentes personas al servicio de los compradores que llegan a cumplir sus sueños..muy agradecidos Dios los bendiga..." },
    { autor: "Carolinna Yate", estrellas: 5, enlace: "https://www.google.com/maps/contrib/115140900569761285339/reviews?hl=es-419",
      texto: "Gracias a la famila Compra Venta por hacer realidad un sueño.\nGracias a Johana 💕" }
  ];

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function estrellas(n) {
    var r = Math.round(Number(n)), s = "";
    for (var i = 1; i <= 5; i++) s += i <= r ? "★" : "☆";
    return '<span class="estrellas" aria-label="' + String(n).replace(".", ",") + ' de 5 estrellas">' + s + "</span>";
  }
  function iniciales(n) { return String(n).trim().split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join(""); }
  var G = '<svg class="res-glogo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>';

  function tarjeta(x, i) {
    return '<article class="res-card"><div class="res-autor">' +
      (x.foto ? '<img src="' + esc(x.foto) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<span class="res-ini c' + (i % 4) + '">' + esc(iniciales(x.autor)) + "</span>") +
      "<div><b>" + esc(x.autor) + "</b><small>" + (x.cuando ? esc(x.cuando) : "Reseña en Google") + "</small></div>" + G + "</div>" +
      estrellas(x.estrellas) + '<p class="res-texto">' + esc(x.texto) + "</p>" +
      '<a class="res-g" href="' + esc(x.enlace || MAPS) + '" target="_blank" rel="noopener">Ver en Google →</a></article>';
  }

  function pintar(lista, resumen, ver, calificar) {
    caja.innerHTML = (resumen || "") +
      '<div class="res-grid" tabindex="0" aria-label="Reseñas de clientes en Google">' + lista.map(tarjeta).join("") + "</div>" +
      '<div class="res-acciones"><a class="btn-sitio azul" href="' + esc(ver) + '" target="_blank" rel="noopener">Ver todas las opiniones en Google →</a>' +
      '<a class="btn-sitio borde" href="' + esc(calificar) + '" target="_blank" rel="noopener">Califícanos en Google</a></div>';
    mover(caja.querySelector(".res-grid"));
  }

  // Desplazamiento automático suave de las fichas; se detiene al pasar el mouse o tocar
  function mover(grid) {
    if (!grid || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var quieto = false;
    ["mouseenter", "touchstart", "focusin"].forEach(function (ev) { grid.addEventListener(ev, function () { quieto = true; }, { passive: true }); });
    grid.addEventListener("mouseleave", function () { quieto = false; });
    setInterval(function () {
      if (quieto || grid.scrollWidth <= grid.clientWidth) return;
      var card = grid.querySelector(".res-card"), paso = card ? card.offsetWidth + 16 : 300;
      if (grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 8) grid.scrollTo({ left: 0, behavior: "smooth" });
      else grid.scrollBy({ left: paso, behavior: "smooth" });
    }, 4500);
  }

  var resumenFijo = '<div class="res-resumen">' + G.replace('class="res-glogo"', 'class="res-glogo grande"') +
    '<div>' + estrellas(5) + '<p class="res-total">Clientes que ya cumplieron su sueño con Centro Camionero</p></div></div>';
  pintar(RESENAS, resumenFijo, MAPS, MAPS);

  // Datos en vivo de Google (si la llave está configurada)
  fetch("/api/resenas").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.disponible || !d.calificacion) return;
    var ver = d.url || MAPS;
    var calificar = d.id ? "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(d.id) : ver;
    var resumen = '<div class="res-resumen"><span class="res-num">' + esc(Number(d.calificacion).toFixed(1).replace(".", ",")) + "</span>" +
      "<div>" + estrellas(d.calificacion) + '<p class="res-total">' + esc(Number(d.total).toLocaleString("es-CO")) + " opiniones en Google</p></div></div>";
    var vivas = (d.resenas || []).filter(function (x) { return x.texto; });
    pintar(vivas.length ? vivas : RESENAS, resumen, ver, calificar);
  }).catch(function () {});
})();
