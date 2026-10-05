/* Encabezado, menú y pie compartidos de las páginas de Centro Camionero.
   Para agregar o quitar una página del menú, edite solo la lista MENU. */
(function () {
  var CFG = {
    wa: { usados: "573157207016", faw: "573245792435" },
    dir: "Calle 13 #62-34, Bogotá",
    mapa: "https://maps.app.goo.gl/kEuP6FUTMVdnTjbs6",
    horario: ["Lunes a viernes: 8:00 a. m. a 5:00 p. m.", "Sábados: 8:00 a. m. a 2:00 p. m."],
    menu: [
      { k: "inicio", t: "Camiones disponibles", h: "/#camiones" },
      { k: "financiacion", t: "Financiación", h: "/financiacion/" },
      { k: "retomas", t: "Retomas", h: "/retomas/" },
      { k: "faw", t: "Camiones nuevos", h: "/faw/" },
      { k: "nosotros", t: "Nosotros", h: "/nosotros/" },
      { k: "contacto", t: "Contacto", h: "/contacto/" }
    ]
  };
  var body = document.body;
  var page = body.getAttribute("data-page") || "";
  var wa = body.getAttribute("data-wa") || CFG.wa.usados;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function links(cls) {
    return CFG.menu.map(function (m) {
      return '<a href="' + m.h + '"' + (m.k === page ? ' aria-current="page"' : "") + (cls ? ' class="' + cls + '"' : "") + ">" + esc(m.t) + "</a>";
    }).join("");
  }

  var header = document.getElementById("siteHeader");
  if (header) {
    header.innerHTML =
      '<div class="container bar">' +
      '<a class="brand" href="/"><img class="brand-logo-img" src="/assets/logo.png" alt="Centro Camionero"></a>' +
      '<nav class="menu" id="siteMenu" aria-label="Principal">' + links() + "</nav>" +
      '<div class="bar-right"><a class="nav-cta" href="/financiacion/">Financia tu camión</a>' +
      '<button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false">' +
      '<svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M0 1H18M0 7H18M0 13H18" stroke="currentColor" stroke-width="2"/></svg></button></div></div>';
  }

  var footer = document.getElementById("siteFooter");
  if (footer) {
    footer.innerHTML =
      '<div class="container foot-inner">' +
      '<a class="brand" href="/"><img class="brand-logo-img footer-logo-img" src="/assets/logo.png" alt="Centro Camionero"></a>' +
      '<div class="foot-links">' + links() + "</div>" +
      '<div class="foot-info"><b>' + esc(CFG.dir) + '</b><a href="' + CFG.mapa + '" target="_blank" rel="noopener">Ver en el mapa</a>' +
      CFG.horario.map(function (h) { return "<span>" + esc(h) + "</span>"; }).join("") + "</div>" +
      '<div class="foot-social">' +
      '<a class="social-ico" href="#" id="igLink" aria-label="Instagram" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1"/></svg></a>' +
      '<a class="social-ico" href="#" id="fbLink" aria-label="Facebook" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 21v-7.6h2.7l.4-3.2H14V8.1c0-.9.3-1.6 1.7-1.6h1.6V3.6C17 3.5 15.9 3.4 14.7 3.4c-2.6 0-4.3 1.6-4.3 4.4v2.4H7.8v3.2h2.6V21"/></svg></a>' +
      "</div>" +
      '<span class="copy">© 2026 Centro Camionero · Bogotá, Colombia</span></div>';
  }

  // Botón flotante de WhatsApp (número según la página: asesor de Centro Camionero o asesor FAW)
  if (!document.getElementById("whatsappFloat")) {
    var f = document.createElement("a");
    f.className = "whatsapp-float"; f.id = "whatsappFloat"; f.target = "_blank"; f.rel = "noopener";
    f.href = "https://wa.me/" + wa + "?text=" + encodeURIComponent("Hola, quiero información de Centro Camionero.");
    f.setAttribute("aria-label", "Escríbenos por WhatsApp"); f.title = "Escríbenos por WhatsApp";
    f.innerHTML = '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#25D366"/><path d="M16 7c-5 0-9 4-9 9 0 1.7.5 3.3 1.3 4.6L7 25l4.6-1.3c1.3.7 2.8 1.1 4.4 1.1 5 0 9-4 9-9s-4-8.8-9-8.8Z" stroke="#fff" stroke-width="1.6"/><path d="M12.3 12.6c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.8.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.1.6.2.4.9 1.4 1.9 2.2 1.3 1 2.3 1.4 2.7 1.5.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.7-.1.3.1 1.8.9 2.1 1 .3.1.5.2.6.3.1.2.1 1-.3 1.9-.4.9-2 1.7-2.8 1.8-.7.1-1.6.2-4.3-.9-3.6-1.5-5.9-5.1-6.1-5.3-.2-.3-1.4-1.9-1.4-3.6 0-1.7.9-2.6 1.2-2.9Z" fill="#fff"/></svg>';
    body.appendChild(f);
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
