-- =====================================================
-- MIGRATION: Add 'audio' type to materials table
-- Ejecutar en: Supabase SQL Editor (proyecto stareduca-senior)
-- =====================================================
-- Este script actualiza el constraint de la tabla materials
-- para permitir el tipo 'audio' además de los existentes.
-- =====================================================

-- Eliminar el constraint actual
ALTER TABLE materials DROP CONSTRAINT IF EXISTS materials_type_check;

-- Agregar el nuevo constraint con 'audio' incluido
ALTER TABLE materials ADD CONSTRAINT materials_type_check
CHECK (type IN ('video', 'image', 'audio', 'pdf', 'link'));

-- Verificar el cambio
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'materials'::regclass AND contype = 'c';
