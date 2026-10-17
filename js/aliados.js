/* Franja rotatoria de aliados financieros de Centro Camionero.
   Se muestra en la página principal, en Financiación y en el showroom FAW.
   Para agregar o quitar un aliado, edite solo la lista ALIADOS y suba su logo a /assets/aliados/. */
(function () {
  if (window.__aliadosFranja) return;
  window.__aliadosFranja = true;

  var ALIADOS = [
    ["Alta Originadora", "alta-originadora"],
    ["Crediprosperar", "crediprosperar"],
    ["Coltefinanciera", "coltefinanciera"],
    ["Financiera Juriscoop", "financiera-juriscoop"],
    ["DeltaCredit", "deltacredit"],
    ["Finesa Vehículos", "finesa"],
    ["Clave 2000", "clave-2000"],
    ["Crecer Capital", "crecer-capital"],
    ["UNI2 Microcrédito", "uni2"],
    ["Rtaxi", "rtaxi"],
    ["Banco de Bogotá", "banco-de-bogota"],
    ["Finanzauto", "finanzauto"],
    ["BBVA", "bbva"]
  ];

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function set(oculto) {
    return '<ul class="al-set"' + (oculto ? ' aria-hidden="true"' : "") + ">" + ALIADOS.map(function (a) {
      return '<li class="al-item"><img src="/assets/aliados/' + a[1] + '.png" alt="' + (oculto ? "" : esc(a[0])) + '" data-n="' + esc(a[0]) + '" decoding="async"></li>';
    }).join("") + "</ul>";
  }

  function franja() {
    var d = document.createElement("div");
    d.className = "al-marquee";
    d.setAttribute("role", "region");
    d.setAttribute("aria-label", "Aliados financieros de Centro Camionero");
    d.innerHTML = '<div class="al-track">' + set(false) + set(true) + "</div>";
    // Si un logo todavía no está subido, se muestra el nombre de la entidad
    d.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        var s = document.createElement("span"); s.textContent = img.getAttribute("data-n"); img.replaceWith(s);
      });
    });
    return d;
  }

  function montar() {
    var p = location.pathname.replace(/index\.html$/, "");
    if (p.length > 1 && p.slice(-1) !== "/") p += "/";

    if (p === "/financiacion/") {
      // La sección ya existe: la franja reemplaza la cuadrícula de logos
      var grid = document.querySelector("#aliados .aliados");
      if (grid) grid.replaceWith(franja());
      return;
    }

    var sec = document.createElement("section"), destino;
    if (p === "/") {
      sec.className = "sec al-sec"; sec.id = "aliados"; sec.setAttribute("aria-labelledby", "alTitulo");
      sec.innerHTML = '<div class="container"><div class="section-head"><div><p class="eyebrow">Respaldo financiero</p><h2 id="alTitulo" style="margin-top:12px">Nuestros aliados financieros.</h2></div>' +
        '<p class="lede">Presentamos tu solicitud a la entidad que mejor se ajuste a tu perfil.</p></div></div>';
      destino = document.getElementById("financiamiento");
      sec.firstChild.appendChild(franja());
    } else if (p === "/faw/") {
      sec.className = "sec al-sec"; sec.id = "aliados"; sec.setAttribute("aria-labelledby", "alTitulo");
      sec.innerHTML = '<div class="wrap"><div class="sec-head"><h2 id="alTitulo">Aliados financieros</h2>' +
        '<p>Te acompañamos en el trámite de tu crédito con entidades que financian camiones.</p><span class="rule" aria-hidden="true"></span></div></div>';
      destino = document.getElementById("asesoria");
      sec.firstChild.appendChild(franja());
    } else return;

    if (destino && destino.parentNode) destino.parentNode.insertBefore(sec, destino);
  }

  var css = document.createElement("link");
  css.rel = "stylesheet"; css.href = "/css/aliados.css";
  var hecho = false;
  function ir() { if (hecho) return; hecho = true; if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar); else montar(); }
  css.onload = ir; css.onerror = ir; setTimeout(ir, 1500);
  document.head.appendChild(css);
})();
