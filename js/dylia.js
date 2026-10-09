/* DYLIA, la asistente virtual de Centro Camionero.
   - Carga el widget una sola vez en cada página.
   - Todos los botones que antes abrían WhatsApp (enlaces wa.me, data-wa o data-dylia) abren a DYLIA
     con el tema que el cliente eligió. DYLIA es siempre el primer contacto; el asesor entra solo
     cuando DYLIA lo deriva con la autorización del cliente. */
(function () {
  if (window.__dylia) return;
  var BASE = "https://whatsapp-ai-saas.hnoslozano1624.workers.dev";
  var PK = "e6c36a4ead1841f4a1c006a2dd929499"; // llave pública del widget
  window.__dylia = true;

  // Se ocultan los botones flotantes de WhatsApp: el botón de DYLIA ocupa su lugar
  var st = document.createElement("style");
  st.textContent = ".whatsapp-float,.wa-float{display:none!important}";
  document.head.appendChild(st);

  // Esta es la única pieza que cargan todas las páginas públicas (también el showroom FAW),
  // así que aquí se enciende la franja de aliados financieros; ella sabe en qué páginas mostrarse.
  var fr = document.createElement("script");
  fr.src = "/js/aliados.js"; fr.defer = true;
  document.head.appendChild(fr);

  // Franja "Compramos tu camión" (prioridad comercial): también se enciende aquí para que salga en todas las páginas
  var ct = document.createElement("script");
  ct.src = "/js/compramos.js"; ct.defer = true;
  document.head.appendChild(ct);

  // También aquí se enciende el ícono de la pestaña (la llanta de Centro Camionero): así lo tienen
  // todas las páginas, incluidas las del showroom FAW, que no usan site.js.
  var fv = document.createElement("script");
  fv.src = "/js/favicon.js"; fv.defer = true;
  document.head.appendChild(fv);

  if (!document.getElementById("ia-sdk-root")) {
    var root = document.createElement("div");
    root.id = "ia-sdk-root";
    document.body.appendChild(root);
  }
  var s = document.createElement("script");
  s.src = BASE + "/widget.js";
  s.async = true;
  s.onload = function () {
    try { window.iaSdk.init({ data: { pk: PK }, config: { style: { zIndex: 999999 } } }); }
    catch (e) { console.error("DYLIA:", e); }
  };
  document.head.appendChild(s);

  function aviso() {
    var t = document.getElementById("dyliaAviso");
    if (!t) {
      t = document.createElement("div");
      t.id = "dyliaAviso"; t.setAttribute("role", "status");
      t.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:999998;max-width:min(92vw,420px);background:#010B3D;color:#fff;font:500 14px/1.4 'IBM Plex Sans',Arial,sans-serif;padding:14px 18px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.3)";
      t.textContent = "DYLIA no está disponible en este momento. Inténtalo de nuevo en unos minutos o visítanos en la Calle 13 #62-34, Bogotá.";
      document.body.appendChild(t);
    }
    t.hidden = false;
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { t.hidden = true; }, 7000);
  }

  // Abre el chat de DYLIA y, si hay texto, lo envía como primer mensaje del cliente
  function abrir(texto) {
    document.querySelectorAll("dialog[open]").forEach(function (d) { try { d.close(); } catch (e) {} });
    var n = 0;
    (function intento() {
      var fab = document.querySelector(".ia-widget-fab"), panel = document.querySelector(".ia-widget-panel");
      if (!fab || !panel) { if (++n < 40) return setTimeout(intento, 150); return aviso(); }
      var yaAbierto = panel.classList.contains("open");
      if (!yaAbierto) fab.click();
      if (texto) {
        setTimeout(function () {
          var i = document.getElementById("ia-widget-input"), b = document.getElementById("ia-widget-send");
          if (i && b) { i.value = texto; b.click(); }
        }, yaAbierto ? 0 : 400);
      }
    })();
  }
  window.abrirDylia = abrir;

  // Fichas estáticas del inicio: "camión usado" solo si la ficha trae kilometraje mayor a 0.
  function mensajeFicha(card) {
    var h3 = card.querySelector("h3"), nombre = h3 ? h3.textContent.trim() : "", modelo = "", km = 0;
    [].forEach.call(card.querySelectorAll(".specs span"), function (sp) {
      var t = sp.textContent.replace(/\s+/g, " ").trim(), b = sp.querySelector("b"), v = b ? b.textContent.trim() : "";
      if (/^Modelo/i.test(t)) modelo = v;
      if (/^Kilometraje/i.test(t)) km = parseInt(v.replace(/\D/g, ""), 10) || 0;
    });
    return "Hola, me interesa el camión" + (km > 0 ? " usado " : " ") + nombre + (modelo ? " " + modelo : "") + (km > 0 ? " (" + km.toLocaleString("es-CO") + " km)" : "") + " publicado en la página web.";
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var h = a.getAttribute("href") || "", txt = null, hit = false;
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(h)) {
      hit = true;
      try { txt = new URL(h).searchParams.get("text"); } catch (err) {}
    } else if (a.hasAttribute("data-dylia") || h === "#dylia") {
      hit = true; txt = a.getAttribute("data-dylia") || null;
    } else if (a.hasAttribute("data-wa")) {
      hit = true; txt = a.getAttribute("data-wa");
    } else if (h === "#financiamiento" && a.closest(".card-camion")) {
      hit = true; txt = mensajeFicha(a.closest(".card-camion"));
    }
    if (!hit) return;
    e.preventDefault(); e.stopPropagation();
    abrir(txt);
  }, true);
})();
