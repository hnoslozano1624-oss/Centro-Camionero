-- Aplicada el 2026-10-13 en centro-camionero-db.
-- Miniatura liviana (640 px) de cada foto de entrega, para que el carrusel cargue rápido.
-- La genera el panel /admin/entregas/ al subir la foto (o sola, para las fotos que aún no la tienen).
ALTER TABLE entregas ADD COLUMN mini TEXT NOT NULL DEFAULT '';
