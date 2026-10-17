-- Aplicada el 2026-10-13 en centro-camionero-db.
-- Entregas: fotos reales de clientes recibiendo su camión. Se administran en /admin/entregas/
-- y se muestran en el inicio y en /entregas/. La foto se guarda en KV (FOTOS); aquí va su URL.
CREATE TABLE IF NOT EXISTS entregas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  texto TEXT NOT NULL DEFAULT '',
  publicado INTEGER NOT NULL DEFAULT 1,
  orden INTEGER NOT NULL DEFAULT 0,
  creado TEXT NOT NULL DEFAULT (datetime('now'))
);
