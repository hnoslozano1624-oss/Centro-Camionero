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

## Configuración única en Cloudflare (obligatoria)

Workers & Pages → `centro-camionero` → **Settings** → **Bindings** (hacerlo en **Production** y en **Preview**):

1. **Add → D1 database** · Variable name: `DB` · Base: `centro-camionero-db`
2. **Add → KV namespace** · Variable name: `FOTOS` · Namespace: `centro-camionero-fotos`

Settings → **Variables and Secrets** → Add:

3. Tipo **Secret** · Nombre: `ADMIN_PASSWORD` · Valor: la contraseña del panel (mínimo 12 caracteres).

Después, volver a desplegar (Deployments → … → Retry deployment) para que tome los cambios.

## Pendientes

- Número de WhatsApp: editar `WHATSAPP` en `js/inventario.js` (formato `57XXXXXXXXXX`) para que "Cotizar" abra el chat con el camión ya mencionado.
- Fotos: cuando se active R2 en la cuenta de Cloudflare, se puede migrar el almacenamiento de KV a R2 (más capacidad gratuita: 10 GB vs 1 GB).
