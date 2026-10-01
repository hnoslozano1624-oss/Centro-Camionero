/* Inventario en vivo: reemplaza las fichas de ejemplo con los camiones cargados desde el panel /admin.
   Si la API no responde o aún no hay camiones, la página conserva las fichas de ejemplo. */
(function () {
  var WHATSAPP = ""; // Número pendiente (formato 57XXXXXXXXXX). Mientras esté vacío, "Cotizar" lleva al simulador.
  var fmt = function (n) { return Number(n).toLocaleString("es-CO"); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var SVG = '<svg viewBox="0 0 200 120" fill="none"><path d="M10 95H160V55H120L100 35H55L40 55H30V95" stroke="#fff" stroke-width="3"/><circle cx="60" cy="98" r="13" stroke="var(--red)" stroke-width="3"/><circle cx="140" cy="98" r="13" stroke="var(--red)" stroke-width="3"/></svg>';
  var CACHE = {};

  var css = document.createElement("style");
  css.textContent =
    ".card-camion{cursor:pointer;transition:transform .15s ease}.card-camion:hover{transform:translateY(-3px)}" +
    ".card-camion .price{flex-wrap:wrap;gap:6px 10px}.card-camion .price b{white-space:nowrap}" +
    ".card-camion .thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}" +
    ".card-camion .estado-pill{position:absolute;top:10px;right:10px;background:var(--red);color:#fff;font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;padding:4px 8px;border-radius:99px}" +
    ".card-camion .nfotos{position:absolute;bottom:10px;right:10px;background:rgba(4,16,43,.65);color:#fff;font-family:'IBM Plex Mono',monospace;font-size:10px;padding:3px 7px;border-radius:99px}" +
    "dialog.cc-det{border:0;padding:0;width:min(920px,calc(100% - 24px));max-height:calc(100% - 24px);border-radius:4px;background:var(--bg-elevated);color:var(--fg);box-shadow:var(--shadow)}" +
    "dialog.cc-det::backdrop{background:rgba(1,11,61,.7)}" +
    ".cc-det .wrap{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}" +
    ".cc-det .gal{background:#000;display:grid;grid-template-rows:auto auto;min-width:0}" +
    ".cc-det .big{aspect-ratio:4/3;display:grid;place-items:center;background:linear-gradient(155deg,var(--navy),var(--navy-deep))}" +
    ".cc-det .big img{width:100%;height:100%;object-fit:contain}.cc-det .big svg{width:60%}" +
    ".cc-det .mins{display:flex;gap:6px;padding:6px;overflow-x:auto}" +
    ".cc-det .mins button{flex:none;width:70px;aspect-ratio:4/3;padding:0;border:2px solid transparent;background:none;cursor:pointer;opacity:.7}" +
    ".cc-det .mins button[aria-current=true]{border-color:var(--red);opacity:1}.cc-det .mins img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".cc-det .txt{padding:24px;display:flex;flex-direction:column;gap:14px;min-width:0;overflow:auto}" +
    ".cc-det h3{font-size:30px}.cc-det .pr{font-family:'Big Shoulders Display',sans-serif;font-size:32px;color:var(--navy)}" +
    ".cc-det .desc{color:var(--fg-muted);font-size:14.5px;white-space:pre-line}" +
    ".cc-det .cerrar{position:absolute;top:8px;right:10px;z-index:2;border:0;background:rgba(4,16,43,.7);color:#fff;width:36px;height:36px;border-radius:50%;font-size:22px;line-height:1;cursor:pointer}" +
    "@media (max-width:760px){.cc-det .wrap{grid-template-columns:1fr}dialog.cc-det{width:100%;max-width:100%;max-height:100%;height:100%;margin:0;border-radius:0}}";
  document.head.appendChild(css);

  function specs(v) {
    var f = v.ficha || {}, out = [];
    if (v.modelo_anio) out.push(["Modelo", v.modelo_anio]);
    if (v.tipo === "usado" && v.kilometraje != null) out.push(["Kilometraje", fmt(v.kilometraje) + " km"]);
    if (v.tipo === "nuevo") out.push(["Kilometraje", "0 km"]);
    [["motor", "Motor"], ["carroceria", "Carrocería"], ["capacidad", "Capacidad"], ["transmision", "Transmisión"], ["combustible", "Combustible"], ["configuracion", "Configuración"]]
      .forEach(function (k) { if (f[k[0]]) out.push([k[1], f[k[0]]]); });
    return out;
  }
  function precio(v) { return v.precio ? "$ " + fmt(v.precio) : "Precio a consultar"; }
  function linkCotizar(v) {
    if (!WHATSAPP) return "#financiamiento";
    var msg = "Hola, me interesa el " + v.marca + " " + v.linea + (v.modelo_anio ? " " + v.modelo_anio : "") + " publicado en la página web.";
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
  }

  function tarjeta(v) {
    var sp = specs(v).slice(0, 4).map(function (s) { return "<span>" + esc(s[0]) + " <b>" + esc(s[1]) + "</b></span>"; }).join("");
    return '<article class="card-camion" data-id="' + v.id + '" tabindex="0" role="button" aria-label="Ver detalle de ' + esc(v.marca + " " + v.linea) + '">' +
      '<div class="thumb">' + (v.fotos[0] ? '<img src="' + esc(v.fotos[0]) + '" alt="' + esc(v.marca + " " + v.linea) + '" loading="lazy">' : SVG) +
      (v.estado === "reservado" ? '<span class="estado-pill">Reservado</span>' : "") +
      (v.fotos.length > 1 ? '<span class="nfotos">' + v.fotos.length + " fotos</span>" : "") + "</div>" +
      '<div class="body"><h3>' + esc(v.marca + " " + v.linea) + "</h3>" +
      (sp ? '<div class="specs">' + sp + "</div>" : "") +
      '<div class="price"><b class="mono">' + precio(v) + '</b><a href="' + linkCotizar(v) + '" data-cotizar>Cotizar →</a></div></div></article>';
  }

  var dlg;
  function detalle(v) {
    if (!dlg) {
      dlg = document.createElement("dialog"); dlg.className = "cc-det"; document.body.appendChild(dlg);
      dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest(".cerrar")) dlg.close(); });
    }
    var fotos = v.fotos;
    dlg.innerHTML = '<button class="cerrar" aria-label="Cerrar">×</button><div class="wrap"><div class="gal"><div class="big">' +
      (fotos[0] ? '<img src="' + esc(fotos[0]) + '" alt="">' : SVG) + "</div>" +
      (fotos.length > 1 ? '<div class="mins">' + fotos.map(function (f, i) { return '<button data-i="' + i + '" aria-current="' + (i === 0) + '"><img src="' + esc(f) + '" alt="Foto ' + (i + 1) + '" loading="lazy"></button>'; }).join("") + "</div>" : "") +
      '</div><div class="txt"><p class="eyebrow">' + (v.tipo === "nuevo" ? "Camión nuevo" : "Camión usado") + (v.estado === "reservado" ? " · Reservado" : "") + "</p>" +
      "<h3>" + esc(v.marca + " " + v.linea) + '</h3><span class="pr">' + precio(v) + "</span>" +
      '<div class="specs">' + specs(v).map(function (s) { return "<span>" + esc(s[0]) + " <b>" + esc(s[1]) + "</b></span>"; }).join("") + "</div>" +
      (v.descripcion ? '<p class="desc">' + esc(v.descripcion) + "</p>" : "") +
      '<a class="btn btn-primary" href="' + linkCotizar(v) + '" style="margin-top:auto;justify-content:center"' + (WHATSAPP ? ' target="_blank" rel="noopener"' : "") + ">Cotizar este camión →</a></div></div>";
    dlg.querySelectorAll(".mins button").forEach(function (b) {
      b.addEventListener("click", function () {
        dlg.querySelector(".big img").src = fotos[+b.dataset.i];
        dlg.querySelectorAll(".mins button").forEach(function (x) { x.setAttribute("aria-current", x === b); });
      });
    });
    dlg.querySelector(".btn").addEventListener("click", function () { if (!WHATSAPP) dlg.close(); });
    dlg.showModal();
  }

  function activar(grid) {
    grid.addEventListener("click", function (e) {
      if (e.target.closest("[data-cotizar]")) return;
      var c = e.target.closest(".card-camion[data-id]"); if (c) detalle(CACHE[c.dataset.id]);
    });
    grid.addEventListener("keydown", function (e) {
      var c = e.target.closest(".card-camion[data-id]");
      if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); detalle(CACHE[c.dataset.id]); }
    });
  }

  fetch("/api/vehiculos").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
    var lista = d.vehiculos || [];
    lista.forEach(function (v) { CACHE[v.id] = v; });
    var usados = lista.filter(function (v) { return v.tipo === "usado"; });
    var nuevos = lista.filter(function (v) { return v.tipo === "nuevo"; });

    var grid = document.querySelector("#camiones .grid-camiones");
    if (grid && usados.length) { grid.innerHTML = usados.map(tarjeta).join(""); grid.classList.add("in"); activar(grid); }

    var faw = document.getElementById("faw");
    if (faw && nuevos.length) {
      var sec = document.createElement("section");
      sec.id = "nuevos";
      sec.style.paddingBlock = "clamp(40px,6vw,72px) 18px";
      sec.innerHTML = '<div class="container"><div class="section-head"><div><h2>Camiones nuevos.</h2></div><p class="lede">0 km, con respaldo de nuestra alianza FAW.</p></div><div class="grid-camiones">' + nuevos.map(tarjeta).join("") + "</div></div>";
      faw.insertAdjacentElement("afterend", sec);
      activar(sec.querySelector(".grid-camiones"));
      var fawLink = document.getElementById("fawLink");
      if (fawLink) fawLink.addEventListener("click", function () { sec.scrollIntoView({ behavior: "smooth" }); });
    }
  }).catch(function () { /* sin API: se quedan las fichas de ejemplo */ });
})();
