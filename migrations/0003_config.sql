-- Aplicada el 2026-10-01 en centro-camionero-db.
-- Guarda la configuración de acceso al panel /admin (hash de la contraseña con sal
-- y la llave que firma las sesiones). Los valores se cargan aparte, nunca en el repositorio.
CREATE TABLE IF NOT EXISTS config (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  actualizado TEXT DEFAULT (datetime('now'))
);
