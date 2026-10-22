/* Aviso de cookies de Centro Camionero y FAW Centro Camionero.
   - Se enciende desde /js/dylia.js, así que aparece en todas las páginas públicas (también el showroom FAW).
   - La primera vez que la persona entra, se muestra abajo un aviso con dos opciones:
     "Aceptar todas" o "Solo necesarias". La decisión se guarda 180 días (cookie cc_cookies + localStorage).
   - Las necesarias (funcionamiento del sitio y del chat con DYLIA) siempre están activas.
   - Las de medición y publicidad (por ejemplo Google Analytics o el píxel de Meta, si se instalan más adelante)
     solo deben cargarse si la persona las aceptó. Para eso, el código que se agregue debe preguntar así:
       if (window.ccCookies && ccCookies.permitido("analitica")) { ...cargar la herramienta... }
     o escuchar el evento:  document.addEventListener("cc-cookies", function (e) { if (e.detail.analitica) { ... } });
   - En el pie de página se agrega el enlace "Preferencias de cookies" para cambiar la decisión. */
(function () {
  if (window.ccCookies || /^\/admin/.test(location.pathname)) return;

  var CLAVE = "cc_cookies", VERSION = 1, DIAS = 180;

  function leer() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(CLAVE) || "null"); } catch (e) {}
    if (!v) {
      var m = document.cookie.match(/(?:^|;\s*)cc_cookies=([^;]+)/);
      if (m) v = { v: VERSION, analitica: m[1] === "todas" };
    }
    return v && v.v === VERSION ? v : null;
  }

  function guardar(analitica) {
    var v = { v: VERSION, analitica: !!analitica, fecha: new Date().toISOString() };
    try { localStorage.setItem(CLAVE, JSON.stringify(v)); } catch (e) {}
    try {
      document.cookie = "cc_cookies=" + (analitica ? "todas" : "necesarias") + ";path=/;max-age=" + DIAS * 86400 + ";SameSite=Lax" + (location.protocol === "https:" ? ";Secure" : "");
    } catch (e) {}
    estado = v;
    try { document.dispatchEvent(new CustomEvent("cc-cookies", { detail: v })); } catch (e) {}
    return v;
  }

  var estado = leer();
  window.ccCookies = {
    estado: function () { return estado; },
    permitido: function (tipo) { return tipo === "necesarias" || !!(estado && estado[tipo]); },
    cambiar: function () { mostrar(); }
  };

  var css = document.createElement("style");
  css.textContent =
    ".cc-ck{position:fixed;left:50%;bottom:16px;transform:translate(-50%,24px);opacity:0;z-index:2147483000;width:min(980px,calc(100% - 24px));box-sizing:border-box;" +
    "display:flex;align-items:center;gap:18px 28px;flex-wrap:wrap;background:#fff;color:#04102B;border:1px solid rgba(1,39,146,.18);border-top:4px solid #FA010D;border-radius:16px;" +
    "padding:18px 22px;box-shadow:0 24px 60px -20px rgba(1,11,61,.55);font-family:'IBM Plex Sans',Ubuntu,'Segoe UI',Arial,sans-serif;transition:transform .35s ease,opacity .35s ease}" +
    ".cc-ck.on{transform:translate(-50%,0);opacity:1}" +
    ".cc-ck-tx{flex:1 1 420px;min-width:0}" +
    ".cc-ck-tx b{display:block;font-size:17px;font-weight:700;margin-bottom:4px}" +
    ".cc-ck-tx p{margin:0;font-size:14.5px;line-height:1.5;color:#4A5578}" +
    ".cc-ck-tx a{color:#012792;font-weight:600}" +
    ".cc-ck-acc{display:flex;gap:10px;flex-wrap:wrap}" +
    ".cc-ck-acc button{font:inherit;font-weight:700;font-size:15px;padding:12px 22px;border-radius:999px;cursor:pointer;border:1.5px solid #012792;transition:background .2s ease,transform .15s ease}" +
    ".cc-ck-acc button:hover{transform:translateY(-1px)}" +
    ".cc-ck-si{background:#FA010D;border-color:#FA010D!important;color:#fff}.cc-ck-si:hover{background:#C8000A}" +
    ".cc-ck-no{background:#fff;color:#012792}.cc-ck-no:hover{background:#EEF1F8}" +
    "@media (max-width:560px){.cc-ck{bottom:10px;padding:16px}.cc-ck-acc{width:100%}.cc-ck-acc button{flex:1 1 100%}}" +
    "@media (prefers-reduced-motion:reduce){.cc-ck{transition:none}}" +
    ".cc-ck-pref{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}";
  document.head.appendChild(css);

  var caja = null;
  function mostrar() {
    if (caja) { caja.classList.add("on"); return; }
    caja = document.createElement("div");
    caja.className = "cc-ck";
    caja.setAttribute("role", "region");
    caja.setAttribute("aria-label", "Aviso de cookies");
    caja.innerHTML =
      '<div class="cc-ck-tx"><b>Usamos cookies</b>' +
      "<p>Usamos cookies y tecnologías similares necesarias para que el sitio y el chat con DYLIA funcionen. Con tu autorización, también las usamos para medir las visitas y mejorar nuestros anuncios. " +
      'Puedes aceptarlas todas o usar solo las necesarias. Más información en nuestro <a href="/aviso-de-privacidad/#cookies">aviso de privacidad</a>.</p></div>' +
      '<div class="cc-ck-acc"><button type="button" class="cc-ck-no">Solo necesarias</button><button type="button" class="cc-ck-si">Aceptar todas</button></div>';
    caja.querySelector(".cc-ck-si").addEventListener("click", function () { guardar(true); ocultar(); });
    caja.querySelector(".cc-ck-no").addEventListener("click", function () { guardar(false); ocultar(); });
    document.body.appendChild(caja);
    requestAnimationFrame(function () { requestAnimationFrame(function () { caja.classList.add("on"); }); });
  }
  function ocultar() {
    if (!caja) return;
    caja.classList.remove("on");
    var c = caja; caja = null;
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 400);
  }

  // Enlace "Preferencias de cookies" en el pie de página (Centro Camionero: .pie-copy; showroom FAW: .cp)
  function enlacePie(intentos) {
    var pie = document.querySelector(".pie-copy .copy, footer .cp");
    if (!pie) { if (intentos > 0) setTimeout(function () { enlacePie(intentos - 1); }, 400); return; }
    if (pie.querySelector(".cc-ck-pref")) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "cc-ck-pref"; b.textContent = "Preferencias de cookies";
    b.addEventListener("click", mostrar);
    pie.appendChild(document.createTextNode(" · "));
    pie.appendChild(b);
  }

  function iniciar() {
    if (!estado) mostrar();
    enlacePie(10);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
