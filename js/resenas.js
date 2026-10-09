/* Calificaciones de Google en el inicio. Lee /api/resenas (Google Places en vivo).
   Si la conexión con Google aún no está configurada, se quedan los botones para ver y dejar opiniones en Google. */
(function () {
  var caja = document.getElementById("resGoogle");
  if (!caja) return;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function estrellas(n) {
    var r = Math.round(Number(n)), s = "";
    for (var i = 1; i <= 5; i++) s += i <= r ? "★" : "☆";
    return '<span class="estrellas" aria-label="' + String(n).replace(".", ",") + ' de 5 estrellas">' + s + "</span>";
  }
  fetch("/api/resenas").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.disponible || !d.calificacion) return;
    var ver = d.url || caja.getAttribute("data-maps");
    var calificar = d.id ? "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(d.id) : ver;
    var html = '<div class="res-resumen"><span class="res-num">' + esc(String(d.calificacion.toFixed ? d.calificacion.toFixed(1) : d.calificacion).replace(".", ",")) + "</span>" +
      "<div>" + estrellas(d.calificacion) + '<p class="res-total">' + esc(Number(d.total).toLocaleString("es-CO")) + " opiniones en Google</p></div></div>";
    if (d.resenas && d.resenas.length) {
      html += '<div class="res-grid">' + d.resenas.filter(function (x) { return x.texto; }).map(function (x) {
        return '<article class="res-card"><div class="res-autor">' +
          (x.foto ? '<img src="' + esc(x.foto) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<span class="res-ini">' + esc(x.autor.charAt(0)) + "</span>") +
          "<div><b>" + esc(x.autor) + "</b><small>" + esc(x.cuando) + "</small></div></div>" + estrellas(x.estrellas) +
          '<p class="res-texto">' + esc(x.texto) + "</p>" +
          '<a class="res-g" href="' + esc(x.enlace || ver) + '" target="_blank" rel="noopener">Reseña de Google →</a></article>';
      }).join("") + "</div>";
    }
    html += '<div class="res-acciones"><a class="btn-sitio azul" href="' + esc(ver) + '" target="_blank" rel="noopener">Ver todas las opiniones en Google →</a>' +
      '<a class="btn-sitio borde" href="' + esc(calificar) + '" target="_blank" rel="noopener">Califícanos en Google</a></div>';
    caja.innerHTML = html;
  }).catch(function () {});
})();
