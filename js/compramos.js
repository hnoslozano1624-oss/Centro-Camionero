/* Franja en movimiento "Compramos tu camión" (prioridad comercial de Centro Camionero).
   Se enciende desde /js/dylia.js, así que aparece en todas las páginas públicas (también en el showroom FAW).
   - Inicio, computador: va sobre el piso del banner principal.
   - Inicio, celular, y demás páginas: va justo debajo del encabezado.
   Para cambiar los mensajes, edite solo la lista FRASES. */
(function () {
  if (window.__ctFranja) return;
  window.__ctFranja = true;
  if (/^\/admin/.test(location.pathname)) return;

  var PAGINA = "/compramos-tu-camion/";
  var FRASES = [
    "Compramos tu camión de contado",
    "En cualquier parte del país",
    "Pago de contado",
    "Cuéntanos qué camión tienes y te hacemos una oferta",
    "Sin publicar ni atender curiosos"
  ];
  var CAMION = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 30V16h20v14H4Z"/><path d="M24 22h9l7 7v5h-3"/><circle cx="14" cy="32" r="4"/><circle cx="34" cy="32" r="4"/></svg>';

  var css = document.createElement("style");
  css.textContent =
    ".ct-franja{--ct-h:clamp(40px,3.6vw,56px);display:flex;align-items:stretch;background:#FA010D;color:#fff;text-decoration:none;font-family:'IBM Plex Sans',Arial,sans-serif;overflow:hidden;position:relative;z-index:5;box-shadow:0 10px 26px -12px rgba(0,0,0,.55)}" +
    ".ct-franja:hover{background:#E0000B}" +
    ".ct-mask{flex:1;min-width:0;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 40px,#000 calc(100% - 40px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 40px,#000 calc(100% - 40px),transparent 100%)}" +
    ".ct-track{display:flex;width:max-content;animation:ctMover 36s linear infinite}" +
    ".ct-franja:hover .ct-track,.ct-franja:focus-visible .ct-track{animation-play-state:paused}" +
    ".ct-set{display:flex;list-style:none;margin:0;padding:0}" +
    ".ct-set li{display:flex;align-items:center;gap:14px;height:var(--ct-h);padding:0 26px;white-space:nowrap;font-weight:700;font-size:clamp(14px,1.3vw,19px);letter-spacing:.01em}" +
    ".ct-set li svg{width:1.6em;height:1.6em;flex:none;animation:ctRodar 1.2s ease-in-out infinite alternate}" +
    ".ct-cta{flex:none;display:flex;align-items:center;gap:8px;padding:0 clamp(14px,1.6vw,24px);background:#012792;font-weight:700;font-size:clamp(13px,1.1vw,16px);white-space:nowrap}" +
    ".ct-cta b{display:inline-block;animation:ctFlecha 1s ease-in-out infinite alternate}" +
    "@keyframes ctMover{to{transform:translateX(-50%)}}" +
    "@keyframes ctRodar{from{transform:translateX(-2px)}to{transform:translateX(2px)}}" +
    "@keyframes ctFlecha{from{transform:translateX(0)}to{transform:translateX(4px)}}" +
    /* inicio en computador: sobre el piso libre del banner (parte inferior de la foto) */
    ".hero>.ct-franja{position:absolute;left:0;right:0;bottom:6%}" +
    "@media (max-width:700px){.hero>.ct-franja{position:relative;bottom:auto}.ct-cta span{display:none}}" +
    "@media (prefers-reduced-motion:reduce){.ct-track,.ct-set li svg,.ct-cta b{animation:none}.ct-mask{overflow-x:auto}}";
  document.head.appendChild(css);

  function set(oculto) {
    return '<ul class="ct-set"' + (oculto ? ' aria-hidden="true"' : "") + ">" +
      FRASES.map(function (f) { return "<li>" + CAMION + "<span>" + f + "</span></li>"; }).join("") + "</ul>";
  }

  var enPagina = location.pathname.indexOf(PAGINA) === 0;
  var a = document.createElement("a");
  a.className = "ct-franja";
  a.href = enPagina ? "#formulario" : PAGINA;
  a.setAttribute("aria-label", "Compramos tu camión de contado, en cualquier parte del país. " + (enPagina ? "Ir al formulario" : "Ver cómo vender tu camión"));
  a.innerHTML = '<div class="ct-mask"><div class="ct-track">' + set(false) + set(true) + "</div></div>" +
    '<span class="ct-cta"><span>' + (enPagina ? "Envía los datos" : "Vende tu camión") + "</span><b>→</b></span>";

  function poner() {
    var hero = document.querySelector("body[data-page='inicio'] .hero");
    if (hero) { hero.appendChild(a); return; }
    var header = document.querySelector("body > header, header#siteHeader, header");
    if (header && header.parentNode) { header.parentNode.insertBefore(a, header.nextSibling); return; }
    var main = document.querySelector("main");
    if (main) main.insertBefore(a, main.firstChild); else document.body.insertBefore(a, document.body.firstChild);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", poner); else poner();
})();
