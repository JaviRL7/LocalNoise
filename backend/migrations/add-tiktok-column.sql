-- Migración para añadir columna tiktokUrl
ALTER TABLE "Bands" ADD COLUMN IF NOT EXISTS "tiktokUrl" VARCHAR(255);
