-- Aplicada el 2026-09-30 en centro-camionero-db.
-- Permite ocultar un camión de la página web sin borrarlo.
ALTER TABLE vehiculos ADD COLUMN publicado INTEGER NOT NULL DEFAULT 1;
