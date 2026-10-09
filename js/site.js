/* Encabezado, menú y pie compartidos de las páginas de Centro Camionero.
   Para agregar o quitar una página del menú, edite solo la lista MENU. */
(function () {
  var CFG = {
    dir: "Calle 13 #62-34, Bogotá",
    mapa: "https://maps.app.goo.gl/kEuP6FUTMVdnTjbs6",
    horario: ["Lunes a viernes: 8:00 a. m. a 5:00 p. m.", "Sábados: 8:00 a. m. a 2:00 p. m."],
    menu: [
      { k: "inicio", t: "Camiones usados", h: "/#camiones", btn: "rojo" },
      { k: "faw", t: "Camiones nuevos", h: "/faw/", btn: "azul" },
      { k: "compramos", t: "Compramos tu camión", h: "/compramos-tu-camion/", destacado: true },
      { k: "financiacion", t: "Financiación", h: "/financiacion/" },
      { k: "retomas", t: "Retomas", h: "/retomas/" },
      { k: "nosotros", t: "Nosotros", h: "/nosotros/" },
      { k: "contacto", t: "Contacto", h: "/contacto/" }
    ]
  };
  // Estilos del pie de página (franja del formulario de crédito y columnas de enlaces)
  var pc = document.createElement("link");
  pc.rel = "stylesheet"; pc.href = "/css/pie.css";
  document.head.appendChild(pc);

  var body = document.body;
  var page = body.getAttribute("data-page") || "";

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  // botones=true: en el menú principal, "Camiones usados" (rojo) y "Camiones nuevos" (azul) van como botones
  function links(cls, botones) {
    return CFG.menu.map(function (m) {
      var c = cls || (botones && m.btn ? "menu-btn menu-btn-" + m.btn : (botones && m.destacado ? "menu-destacado" : ""));
      return '<a href="' + m.h + '"' + (m.k === page ? ' aria-current="page"' : "") + (c ? ' class="' + c + '"' : "") + ">" + esc(m.t) + "</a>";
    }).join("");
  }

  var header = document.getElementById("siteHeader");
  if (header) {
    header.innerHTML =
      '<div class="container bar">' +
      '<a class="brand" href="/"><img class="brand-logo-img" src="/assets/logo.svg" alt="Centro Camionero"></a>' +
      '<nav class="menu" id="siteMenu" aria-label="Principal">' + links("", true) + "</nav>" +
      '<div class="bar-right">' +
      '<button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false">' +
      '<svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M0 1H18M0 7H18M0 13H18" stroke="currentColor" stroke-width="2"/></svg></button></div></div>';
  }

  var footer = document.getElementById("siteFooter");
  if (footer) {
    footer.innerHTML =
      // Franja: formulario de crédito
      '<div class="pie-credito"><div class="container pie-credito-in">' +
      '<div><b>Encuentra aquí tu formulario de crédito</b><span>Mira los documentos que necesitas según tu perfil y pide tu formulario para financiar tu camión.</span></div>' +
      '<div class="pie-acc"><a class="pie-btn rojo" href="/financiacion/#documentos">Formulario de crédito →</a>' +
      '<a class="pie-btn borde" href="#dylia" data-dylia="Hola, quiero el formulario de solicitud de crédito para financiar un camión.">Pedirlo por chat</a></div>' +
      "</div></div>" +
      // Columnas
      '<div class="container pie-grid">' +
      '<div class="pie-marca"><a class="brand" href="/"><img class="brand-logo-img footer-logo-img" src="/assets/logo.svg" alt="Centro Camionero"></a>' +
      '<p class="pie-dir"><b>' + esc(CFG.dir) + '</b><a href="' + CFG.mapa + '" target="_blank" rel="noopener">Ver en el mapa →</a></p>' +
      '<p class="pie-horario">' + CFG.horario.map(function (h) { return "<span>" + esc(h) + "</span>"; }).join("") + "</p>" +
      '<div class="foot-social">' +
      '<a class="social-ico" href="#" id="igLink" aria-label="Instagram" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1"/></svg></a>' +
      '<a class="social-ico" href="#" id="fbLink" aria-label="Facebook" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 21v-7.6h2.7l.4-3.2H14V8.1c0-.9.3-1.6 1.7-1.6h1.6V3.6C17 3.5 15.9 3.4 14.7 3.4c-2.6 0-4.3 1.6-4.3 4.4v2.4H7.8v3.2h2.6V21"/></svg></a>' +
      "</div></div>" +
      '<nav class="pie-col" aria-label="Secciones"><h4>Secciones</h4>' + links() + "</nav>" +
      '<div class="pie-col"><h4>Atajos</h4>' +
      '<a href="/compramos-tu-camion/">Vende tu camión de contado</a>' +
      '<a href="/retomas/">Retoma tu usado como parte de pago</a>' +
      '<a href="/financiacion/#simulador">Simulador de cuotas</a>' +
      '<a href="/financiacion/#documentos">Formulario de crédito</a>' +
      '<a href="#dylia" data-dylia="Hola, quiero hablar con un asesor de Centro Camionero.">Habla con DYLIA</a>' +
      "</div></div>" +
      '<div class="container pie-copy"><span class="copy">© 2026 Centro Camionero · Bogotá, Colombia</span></div>';
  }

  // Asistente virtual DYLIA: todos los llamados a la acción del sitio la abren (ver /js/dylia.js)
  var d = document.createElement("script");
  d.src = "/js/dylia.js"; d.defer = true;
  document.head.appendChild(d);

  // Ícono de la pestaña: la llanta de Centro Camionero, girando (ver /js/favicon.js)
  var fv = document.createElement("script");
  fv.src = "/js/favicon.js"; fv.defer = true;
  document.head.appendChild(fv);

  // Luces de los camiones del banner principal (solo en la página de inicio)
  if (page === "inicio" && document.querySelector(".hero-banner-link")) {
    var hl = document.createElement("script");
    hl.src = "/js/hero-luces.js"; hl.defer = true;
    document.head.appendChild(hl);
  }

  // Comportamiento: sombra al desplazar, menú móvil y aparición suave de bloques
  try {
    var onScroll = function () { if (header) header.classList.toggle("scrolled", window.scrollY > 10); };
    document.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    var toggle = document.getElementById("navToggle"), menu = document.getElementById("siteMenu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
      });
    }

    var els = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: .15 });
      els.forEach(function (el) { io.observe(el); });
    } else { els.forEach(function (el) { el.classList.add("in"); }); }
  } catch (err) { console.error(err); }
})();
