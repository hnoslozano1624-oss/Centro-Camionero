/* Redes sociales de FAW Centro Camionero en el pie de página del showroom /faw/.
   Las páginas FAW tienen su propio pie (no usan site.js), así que los íconos se agregan aquí. */
(function () {
  var REDES = [
    { n: "Instagram", u: "https://www.instagram.com/fawcentrocamionero/", s: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1"/>' },
    { n: "Facebook", u: "https://www.facebook.com/Centrocamionerofaw", s: '<path d="M14 21v-7.6h2.7l.4-3.2H14V8.1c0-.9.3-1.6 1.7-1.6h1.6V3.6C17 3.5 15.9 3.4 14.7 3.4c-2.6 0-4.3 1.6-4.3 4.4v2.4H7.8v3.2h2.6V21"/>' },
    { n: "TikTok", u: "https://www.tiktok.com/@fawcentrocamionero", s: '<path d="M14 3v11.6a3.4 3.4 0 1 1-3.4-3.4"/><path d="M14 3c.4 2.6 2.2 4.3 5 4.6"/>' }
  ];
  function poner() {
    var wrap = document.querySelector("footer .wrap");
    if (!wrap || wrap.querySelector(".fw-redes")) return;
    var st = document.createElement("style");
    st.textContent = ".fw-redes{display:flex;gap:10px;align-items:center}" +
      ".fw-redes a{width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;color:#C2CAEA;transition:color .2s,border-color .2s,background .2s}" +
      ".fw-redes a:hover{color:#fff;border-color:#fff;background:rgba(255,255,255,.08)}" +
      ".fw-redes svg{width:17px;height:17px}";
    document.head.appendChild(st);
    var box = document.createElement("div");
    box.className = "fw-redes";
    box.innerHTML = REDES.map(function (r) {
      return '<a href="' + r.u + '" target="_blank" rel="noopener" aria-label="' + r.n + ' de FAW Centro Camionero"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">' + r.s + "</svg></a>";
    }).join("");
    var cp = wrap.querySelector(".cp");
    wrap.insertBefore(box, cp || null);
    // Enlace al aviso de privacidad (es la misma empresa responsable de los datos)
    if (cp && !cp.querySelector(".fw-priv")) cp.insertAdjacentHTML("beforeend", ' · <a class="fw-priv" href="/aviso-de-privacidad/" style="color:inherit;text-decoration:underline">Aviso de privacidad</a>');
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", poner); else poner();
})();
