// Títulos y descripciones para buscadores (Google, Bing) y para la vista previa al compartir.
// Este es el único lugar donde se editan: /functions/_middleware.js los aplica en el servidor a cada página,
// por encima de lo que diga el HTML. Reglas: título de máximo 60 caracteres y descripción de máximo 155,
// con las palabras que la gente busca (camiones usados, camiones nuevos, vender mi camión, cambiar mi camión,
// retoma, financiación) y la ciudad.
export const SEO = {
  "/": {
    t: "Centro Camionero · Camiones usados y nuevos FAW en Bogotá",
    d: "Compra y venta de camiones usados en Bogotá y camiones nuevos FAW. Compramos tu camión con pago en menos de 24 horas. Financiación y traspaso.",
  },
  "/camiones/": {
    t: "Camiones usados en venta en Bogotá · Centro Camionero",
    d: "Camiones usados en venta en Bogotá: Chevrolet, JAC, Hino, Foton, JMC y más, con fotos, ficha técnica, precio y financiación. Mira el inventario de hoy.",
  },
  "/compramos-tu-camion/": {
    t: "Compramos tu camión usado · Pago en menos de 24 horas",
    d: "Vende tu camión usado a Centro Camionero: pago de contado en menos de 24 horas, aunque tenga prenda bancaria y esté en cualquier ciudad del país.",
  },
  "/retomas/": {
    t: "Retoma: cambia tu camión usado · Centro Camionero",
    d: "¿Quieres cambiar tu camión? Recibimos tu usado como parte de pago de otro usado o de un FAW nuevo, y nos encargamos de documentos y traspaso.",
  },
  "/financiacion/": {
    t: "Financiación de camiones usados y nuevos · Centro Camionero",
    d: "Crédito para camiones usados y nuevos FAW con 13 aliados financieros. Requisitos según tu perfil, formulario de crédito y simulador de cuotas.",
  },
  "/faw/": {
    t: "Camiones nuevos FAW en Bogotá · FAW Centro Camionero",
    d: "Camiones nuevos FAW 0 km en Bogotá: líneas Tiger y Lion de carga liviana y mediana, ficha técnica, financiación y retoma de tu camión usado.",
  },
  "/faw/por-que-faw/": {
    t: "Por qué elegir camiones FAW · FAW Centro Camionero",
    d: "Quién es FAW Trucks, diferencias entre las líneas Tiger y Lion, tecnología y seguridad, y respuestas a las dudas antes de comprar un camión FAW.",
  },
  "/faw/respaldo/": {
    t: "Garantía y talleres FAW en Colombia · FAW Centro Camionero",
    d: "Garantía FAW de 3 años sin límite de kilometraje, mantenimiento cada 10.000 km, repuestos originales y red de talleres FAW en Colombia.",
  },
  "/entregas/": {
    t: "Entregas de camiones a nuestros clientes · Centro Camionero",
    d: "Fotos reales de transportadores y familias recibiendo su camión usado o nuevo FAW en Centro Camionero, Bogotá. La próxima entrega puede ser la tuya.",
  },
  "/nosotros/": {
    t: "Concesionario de camiones en Bogotá · Centro Camionero",
    d: "Concesionario Centro Camionero S.A.S.: venta de camiones usados y nuevos FAW en Bogotá, con asesoría, procesos transparentes y acompañamiento.",
  },
  "/contacto/": {
    t: "Contacto y ubicación · Centro Camionero, Bogotá",
    d: "Visítanos en la Calle 13 #62-34, Bogotá: lunes a viernes de 8:00 a. m. a 5:00 p. m. y sábados de 8:00 a. m. a 1:00 p. m. Escríbenos con DYLIA.",
  },
};

// Cada modelo FAW (/faw/modelos/<modelo>): el mismo título y descripción que pone la página con JavaScript,
// pero entregados desde el servidor para los buscadores que no ejecutan JavaScript.
export function seoModeloFaw(m) {
  const d = m.datos || {};
  const miles = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return {
    t: "FAW " + m.nombre + " · " + m.segmento + " | FAW Centro Camionero",
    d: "FAW " + m.nombre + ": " + String(m.segmento || "").toLowerCase() + ", " + d.hp + " HP, " + d.nm + " Nm, carga útil " + miles(d.carga) +
      " kg. Ficha técnica completa y cotización con DYLIA en FAW Centro Camionero, Bogotá.",
  };
}

// Datos de la empresa para Google (negocio local): se agregan en la página de inicio.
// Sin teléfono a propósito: el primer contacto siempre es DYLIA.
export const NEGOCIO = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AutoDealer",
      "@id": "https://www.centrocamionero.com.co/#negocio",
      name: "Centro Camionero",
      legalName: "Concesionario Centro Camionero S.A.S.",
      url: "https://www.centrocamionero.com.co/",
      logo: "https://www.centrocamionero.com.co/icono-192.png",
      image: "https://www.centrocamionero.com.co/assets/og-centro-camionero.jpg",
      description: "Concesionario de camiones en Bogotá: compra y venta de camiones usados, camiones nuevos FAW, retoma de tu camión usado como parte de pago y financiación.",
      email: "servicioalcliente@centrocamionero.com.co",
      address: { "@type": "PostalAddress", streetAddress: "Calle 13 #62-34", addressLocality: "Bogotá", addressRegion: "Bogotá D.C.", addressCountry: "CO" },
      geo: { "@type": "GeoCoordinates", latitude: 4.6338517, longitude: -74.1134304 },
      hasMap: "https://maps.app.goo.gl/kEuP6FUTMVdnTjbs6",
      areaServed: { "@type": "Country", name: "Colombia" },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "13:00" },
      ],
      brand: [{ "@type": "Brand", name: "FAW Trucks" }],
      knowsAbout: ["Camiones usados", "Camiones nuevos FAW", "Compra de camiones usados", "Retoma de camiones", "Financiación de camiones"],
      sameAs: [
        "https://www.facebook.com/centrocamioneroA",
        "https://www.instagram.com/centrocamionero_bogota/",
        "https://www.tiktok.com/@centrocamionero",
        "https://www.facebook.com/Centrocamionerofaw",
        "https://www.instagram.com/fawcentrocamionero/",
        "https://www.tiktok.com/@fawcentrocamionero",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.centrocamionero.com.co/#sitio",
      url: "https://www.centrocamionero.com.co/",
      name: "Centro Camionero",
      inLanguage: "es-CO",
      publisher: { "@id": "https://www.centrocamionero.com.co/#negocio" },
    },
  ],
};
