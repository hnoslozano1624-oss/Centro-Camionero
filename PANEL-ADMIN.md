# Panel de inventario (/admin)

Permite al equipo de Centro Camionero cargar camiones (datos, ficha técnica y fotos) y publicarlos en la página web sin tocar código.

- **Panel:** `https://www.centrocamionero.com.co/admin/` (protegido con contraseña)
- **Web pública:** las tarjetas de "Nuestros camiones usados" se llenan solas con los camiones publicados. Los camiones **nuevos** aparecen en una sección propia debajo del banner FAW.
- Un camión aparece en la web si está marcado **"En la web"** y su estado **no** es "Vendido". "Reservado" se muestra con una etiqueta.
- Mientras no haya camiones cargados (o si la API no responde), la web conserva las fichas de ejemplo.

## Cómo funciona

| Pieza | Dónde |
|---|---|
| Panel (HTML) | `admin/index.html` |
| API (Cloudflare Pages Functions) | `functions/api/...` |
| Lógica compartida | `lib/` |
| Script que pinta los camiones en la web | `js/inventario.js` |
| Base de datos | D1 `centro-camionero-db` (tablas `vehiculos` y `vehiculo_fotos`) |
| Fotos | KV `centro-camionero-fotos` (las fotos se reducen a 1600 px en el navegador antes de subir) |

## Configuración en Cloudflare

Ya no requiere pasos manuales en el panel de Cloudflare:

- `wrangler.toml` enlaza la base D1 (`DB`) y el almacenamiento de fotos KV (`FOTOS`) para producción y vista previa. Al existir este archivo, esos enlaces se administran desde aquí y no desde el panel.
- La contraseña del panel se guarda como hash (SHA-256 con sal) en la tabla `config` de D1, junto con la llave que firma las sesiones (migración `migrations/0003_config.sql`). Nunca se guarda en el repositorio.
- Para cambiar la contraseña: pedirlo a Claude (actualiza el hash en D1) o, si se prefiere, crear el secreto `ADMIN_PASSWORD` en Cloudflare, que tiene prioridad sobre el de D1.
- Producción y vista previa comparten la misma base de datos: lo que se cargue en la vista previa también aparece en la web real.

## Pendientes

- Número de WhatsApp: editar `WHATSAPP` en `js/inventario.js` (formato `57XXXXXXXXXX`) para que "Cotizar" abra el chat con el camión ya mencionado.
- Fotos: cuando se active R2 en la cuenta de Cloudflare, se puede migrar el almacenamiento de KV a R2 (más capacidad gratuita: 10 GB vs 1 GB).
