# Inventario para DYLIA (`/inventario.json`)

El sitio publica el inventario vigente en **https://www.centrocamionero.com.co/inventario.json** (en la vista previa: `https://preview-sitio-web.centro-camionero.pages.dev/inventario.json`). DYLIA lo descarga cada 10 minutos y reemplaza su catálogo.

## Cómo se actualiza (sin tocar código)

| Quiero... | Hago esto |
|---|---|
| Agregar un camión usado | Panel `/admin` → «Nuevo camión» → tipo *Usado*, datos, ficha técnica y fotos → guardar. |
| Editarlo (precio, km, fotos…) | Panel `/admin` → abrir el camión → cambiar → guardar. |
| Reservarlo | Panel `/admin` → estado **Reservado**. Sigue en el sitio y en el JSON con `"estado": "reservado"`. |
| Marcarlo como vendido | Panel `/admin` → estado **Vendido**. Desaparece del sitio y del JSON. |
| Ocultarlo sin venderlo | Panel `/admin` → desmarcar **En la web**. |
| Camiones nuevos FAW | Salen de `faw/modelos.json` (los mismos modelos que muestra `/faw/`). Para cambiarlos se edita ese archivo en GitHub. |

Los cambios del panel aparecen en el JSON en **menos de 5 minutos** (caché máxima). No hay que desplegar nada.

## Una sola fuente de verdad

- `/inventario.json` se genera en cada descarga con `lib/inventario.js`, leyendo la misma base de datos (D1) que `/api/vehiculos` y el panel, y el mismo `faw/modelos.json` que usan las páginas FAW.
- Cada usado tiene ficha propia `/usados/<marca-linea-anio-id>` (la URL que aparece en el JSON).
- El `id` es estable: `CC-U-0001` para usados (a partir del número interno del camión) y `FAW-<modelo>` para FAW nuevos.

## Reglas que se validan en cada descarga

JSON válido, ids no repetidos, ningún campo de placa/chasis/VIN/costos/notas, `estado` solo `disponible` o `reservado`, `precio` entero o `null`, FAW nuevos siempre con `precio: null`, `url`/`foto` https absolutas, y presencia de `id`, `tipo`, `marca`, `modelo`, `estado` y `url`.

Si algo falla, la ruta responde **HTTP 503** con el detalle del error (nunca un archivo vacío), para que DYLIA conserve el último catálogo bueno.

## Qué NO sale nunca en el archivo

Placa, origen (compra directa/permuta), descripción libre del panel, costos y notas internas: esos campos ni siquiera se leen.

## Pendientes en Cloudflare (no se pueden hacer desde el código)

1. **WAF / Bot Fight Mode:** al publicar el dominio, crear una regla que permita (Skip) la ruta `/inventario.json`, para que la descarga automática no sea bloqueada.
2. **Dirección base:** los enlaces usan `https://www.centrocamionero.com.co`. Para cambiarla (p. ej. en pruebas) se define la variable `SITE_URL` en Cloudflare Pages.

## Pruebas

`node tests/inventario.test.mjs` (formato, reglas de validación, fichas, regla de 0 km).
