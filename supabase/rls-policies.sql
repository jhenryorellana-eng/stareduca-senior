-- =====================================================
-- STAREDUCA SENIOR - RLS POLICIES (IDEMPOTENTE)
-- Ejecutar en: Supabase SQL Editor
-- =====================================================
-- Este script usa DROP POLICY IF EXISTS para evitar
-- errores con políticas existentes. Se puede ejecutar
-- múltiples veces sin problemas.
-- =====================================================

-- =====================================================
-- PASO 1: POLÍTICAS PARA STORAGE (con DROP previo)
-- =====================================================
DROP POLICY IF EXISTS "Acceso público de lectura" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida de archivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizar archivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminar archivos" ON storage.objects;

CREATE POLICY "Acceso público de lectura"
ON storage.objects FOR SELECT
USING (bucket_id = 'stareduca-senior');

CREATE POLICY "Permitir subida de archivos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'stareduca-senior');

CREATE POLICY "Permitir actualizar archivos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'stareduca-senior');

CREATE POLICY "Permitir eliminar archivos"
ON storage.objects FOR DELETE
USING (bucket_id = 'stareduca-senior');

-- =====================================================
-- PASO 2: POLÍTICAS RLS PARA TABLA: courses
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de cursos" ON public.courses;
DROP POLICY IF EXISTS "Permitir insertar cursos" ON public.courses;
DROP POLICY IF EXISTS "Permitir actualizar cursos" ON public.courses;
DROP POLICY IF EXISTS "Permitir eliminar cursos" ON public.courses;

CREATE POLICY "Permitir lectura de cursos"
ON public.courses FOR SELECT USING (true);

CREATE POLICY "Permitir insertar cursos"
ON public.courses FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar cursos"
ON public.courses FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar cursos"
ON public.courses FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS RLS PARA TABLA: chapters
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Permitir insertar capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Permitir actualizar capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Permitir eliminar capítulos" ON public.chapters;

CREATE POLICY "Permitir lectura de capítulos"
ON public.chapters FOR SELECT USING (true);

CREATE POLICY "Permitir insertar capítulos"
ON public.chapters FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar capítulos"
ON public.chapters FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar capítulos"
ON public.chapters FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS RLS PARA TABLA: materials
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de materiales" ON public.materials;
DROP POLICY IF EXISTS "Permitir insertar materiales" ON public.materials;
DROP POLICY IF EXISTS "Permitir actualizar materiales" ON public.materials;
DROP POLICY IF EXISTS "Permitir eliminar materiales" ON public.materials;

CREATE POLICY "Permitir lectura de materiales"
ON public.materials FOR SELECT USING (true);

CREATE POLICY "Permitir insertar materiales"
ON public.materials FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar materiales"
ON public.materials FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar materiales"
ON public.materials FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS RLS PARA TABLA: evaluations
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de evaluaciones" ON public.evaluations;
DROP POLICY IF EXISTS "Permitir insertar evaluaciones" ON public.evaluations;
DROP POLICY IF EXISTS "Permitir actualizar evaluaciones" ON public.evaluations;
DROP POLICY IF EXISTS "Permitir eliminar evaluaciones" ON public.evaluations;

CREATE POLICY "Permitir lectura de evaluaciones"
ON public.evaluations FOR SELECT USING (true);

CREATE POLICY "Permitir insertar evaluaciones"
ON public.evaluations FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar evaluaciones"
ON public.evaluations FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar evaluaciones"
ON public.evaluations FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS RLS PARA TABLA: evaluation_questions
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de preguntas" ON public.evaluation_questions;
DROP POLICY IF EXISTS "Permitir insertar preguntas" ON public.evaluation_questions;
DROP POLICY IF EXISTS "Permitir actualizar preguntas" ON public.evaluation_questions;
DROP POLICY IF EXISTS "Permitir eliminar preguntas" ON public.evaluation_questions;

CREATE POLICY "Permitir lectura de preguntas"
ON public.evaluation_questions FOR SELECT USING (true);

CREATE POLICY "Permitir insertar preguntas"
ON public.evaluation_questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar preguntas"
ON public.evaluation_questions FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar preguntas"
ON public.evaluation_questions FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS RLS PARA TABLA: parents
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de parents" ON public.parents;
DROP POLICY IF EXISTS "Permitir insertar parents" ON public.parents;
DROP POLICY IF EXISTS "Permitir actualizar parents" ON public.parents;

CREATE POLICY "Permitir lectura de parents"
ON public.parents FOR SELECT USING (true);

CREATE POLICY "Permitir insertar parents"
ON public.parents FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar parents"
ON public.parents FOR UPDATE USING (true);

-- =====================================================
-- POLÍTICAS RLS PARA TABLA: posts (Comunidad)
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de posts" ON public.posts;
DROP POLICY IF EXISTS "Permitir insertar posts" ON public.posts;
DROP POLICY IF EXISTS "Permitir eliminar posts" ON public.posts;

CREATE POLICY "Permitir lectura de posts"
ON public.posts FOR SELECT USING (true);

CREATE POLICY "Permitir insertar posts"
ON public.posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir eliminar posts"
ON public.posts FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS RLS PARA TABLA: reactions
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de reactions" ON public.reactions;
DROP POLICY IF EXISTS "Permitir insertar reactions" ON public.reactions;
DROP POLICY IF EXISTS "Permitir eliminar reactions" ON public.reactions;

CREATE POLICY "Permitir lectura de reactions"
ON public.reactions FOR SELECT USING (true);

CREATE POLICY "Permitir insertar reactions"
ON public.reactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir eliminar reactions"
ON public.reactions FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS RLS PARA TABLA: comments
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de comments" ON public.comments;
DROP POLICY IF EXISTS "Permitir insertar comments" ON public.comments;

CREATE POLICY "Permitir lectura de comments"
ON public.comments FOR SELECT USING (true);

CREATE POLICY "Permitir insertar comments"
ON public.comments FOR INSERT WITH CHECK (true);

-- =====================================================
-- POLÍTICAS RLS PARA TABLA: notifications
-- =====================================================
DROP POLICY IF EXISTS "Permitir lectura de notifications" ON public.notifications;
DROP POLICY IF EXISTS "Permitir insertar notifications" ON public.notifications;
DROP POLICY IF EXISTS "Permitir actualizar notifications" ON public.notifications;

CREATE POLICY "Permitir lectura de notifications"
ON public.notifications FOR SELECT USING (true);

CREATE POLICY "Permitir insertar notifications"
ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar notifications"
ON public.notifications FOR UPDATE USING (true);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Después de ejecutar, verifica en:
-- Supabase Dashboard -> Authentication -> Policies
-- Cada tabla debe tener sus políticas listadas.
-- =====================================================
