/* Menú en celular y tableta: formas de cerrarlo.
   Sirve para el menú de Centro Camionero (#siteMenu + #navToggle, de /js/site.js) y para el del showroom FAW (#nav + #menuBtn).
   - Botón "×" arriba a la derecha dentro del menú.
   - Tocar fuera del menú (la parte oscurecida de la página) lo cierra sin activar lo que haya debajo.
   - La tecla Escape lo cierra.
   - Mientras el menú está abierto, la página de fondo no se desplaza.
   Se enciende desde /js/dylia.js, que cargan todas las páginas públicas. */
(function () {
  if (window.__menuCerrar) return;
  window.__menuCerrar = true;

  var css = document.createElement("style");
  css.textContent =
    ".mc-x{display:none;position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:14px;width:44px;height:44px;border-radius:50%;" +
    "border:1.5px solid rgba(1,39,146,.25);background:#fff;color:#012792;align-items:center;justify-content:center;cursor:pointer;padding:0;z-index:2}" +
    ".mc-x:hover{background:#EEF1F8}.mc-x svg{width:20px;height:20px}" +
    "@media (max-width:1240px){#siteMenu .mc-x{display:flex}#siteMenu.open{box-shadow:0 0 0 100vmax rgba(1,11,61,.45)}}" +
    "@media (max-width:900px){.sign #nav .mc-x{display:flex}.sign #nav.open{box-shadow:0 0 0 100vmax rgba(8,18,65,.45)}}" +
    "html.mc-bloqueo,html.mc-bloqueo body{overflow:hidden}";
  document.head.appendChild(css);

  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function preparar(menu, boton) {
    if (!menu || !boton || menu.querySelector(".mc-x")) return;
    var x = document.createElement("button");
    x.type = "button"; x.className = "mc-x"; x.setAttribute("aria-label", "Cerrar menú"); x.innerHTML = X;
    menu.insertBefore(x, menu.firstChild);

    var abierto = function () { return menu.classList.contains("open"); };
    // Se cierra con el mismo botón de abrir, para que el menú y su estado (aria-expanded) queden sincronizados.
    var cerrar = function () { if (abierto()) boton.click(); };

    x.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); cerrar(); });

    // Toque fuera del menú: lo cierra y evita que se active el enlace o botón que haya debajo.
    document.addEventListener("click", function (e) {
      if (!abierto() || menu.contains(e.target) || boton.contains(e.target)) return;
      e.preventDefault(); e.stopPropagation(); cerrar();
    }, true);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && abierto()) { cerrar(); boton.focus(); }
    });

    // Bloquea el desplazamiento de fondo mientras el menú está abierto.
    new MutationObserver(function () {
      document.documentElement.classList.toggle("mc-bloqueo", abierto() && getComputedStyle(x).display !== "none");
    }).observe(menu, { attributes: true, attributeFilter: ["class"] });
  }

  function iniciar(intentos) {
    var cc = document.getElementById("siteMenu"), faw = document.querySelector(".sign #nav");
    preparar(cc, document.getElementById("navToggle"));
    preparar(faw, document.getElementById("menuBtn"));
    if (!cc && !faw && intentos > 0) setTimeout(function () { iniciar(intentos - 1); }, 300);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { iniciar(10); });
  else iniciar(10);
})();
