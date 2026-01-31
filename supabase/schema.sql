-- =====================================================
-- STAREDUCA SENIOR - SUPABASE SCHEMA
-- Mini app PWA para padres (Padres 3.0)
-- Ejecutar en: Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PARENTS TABLE
-- Sincronizados desde Padres 3.0 via Hub Central
-- =====================================================
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    code VARCHAR(20) NOT NULL,
    family_id VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    last_activity_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parents_external_id ON parents(external_id);
CREATE INDEX IF NOT EXISTS idx_parents_family_id ON parents(family_id);
CREATE INDEX IF NOT EXISTS idx_parents_code ON parents(code);

-- =====================================================
-- COURSES AND CONTENT
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category VARCHAR(50) NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    has_evaluation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);

CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chapters_course ON chapters(course_id);

-- Materiales: videos adicionales, imagenes, audios, PDFs, links web
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'image', 'audio', 'pdf', 'link')),
    url TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_chapter ON materials(chapter_id);

-- =====================================================
-- EVALUATIONS (Examenes por curso)
-- =====================================================
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluation_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    order_index INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_eval_questions ON evaluation_questions(evaluation_id);

-- =====================================================
-- PARENT PROGRESS
-- =====================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(parent_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_parent ON enrollments(parent_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

CREATE TABLE IF NOT EXISTS chapter_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    watch_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_chapter_progress_parent ON chapter_progress(parent_id);

CREATE TABLE IF NOT EXISTS evaluation_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_attempts_parent ON evaluation_attempts(parent_id);

-- =====================================================
-- COMMUNITY
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    post_type VARCHAR(20) DEFAULT 'experience' CHECK (post_type IN ('experience', 'question', 'advice')),
    reaction_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);

CREATE TABLE IF NOT EXISTS reactions (
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (parent_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_parent ON notifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(parent_id, is_read)
    WHERE is_read = FALSE;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS parents_updated_at ON parents;
CREATE TRIGGER parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Update post reaction count
CREATE OR REPLACE FUNCTION update_post_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET reaction_count = reaction_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET reaction_count = reaction_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reactions_count_trigger ON reactions;
CREATE TRIGGER reactions_count_trigger
    AFTER INSERT OR DELETE ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_post_reaction_count();

-- Update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = comment_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comments_count_trigger ON comments;
CREATE TRIGGER comments_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_count();

-- Recalculate course progress when chapter is completed
CREATE OR REPLACE FUNCTION recalculate_course_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_course_id UUID;
    v_total_chapters INTEGER;
    v_completed_chapters INTEGER;
    v_progress INTEGER;
BEGIN
    -- Get course_id from chapter
    SELECT course_id INTO v_course_id
    FROM chapters WHERE id = NEW.chapter_id;

    -- Count total and completed chapters
    SELECT COUNT(*) INTO v_total_chapters
    FROM chapters WHERE course_id = v_course_id;

    SELECT COUNT(*) INTO v_completed_chapters
    FROM chapter_progress cp
    JOIN chapters c ON cp.chapter_id = c.id
    WHERE c.course_id = v_course_id
    AND cp.parent_id = NEW.parent_id
    AND cp.is_completed = TRUE;

    -- Calculate progress
    IF v_total_chapters > 0 THEN
        v_progress := ROUND((v_completed_chapters::DECIMAL / v_total_chapters) * 100);
    ELSE
        v_progress := 0;
    END IF;

    -- Update enrollment
    UPDATE enrollments
    SET progress_percent = v_progress,
        status = CASE WHEN v_progress >= 100 THEN 'completed' ELSE 'active' END,
        completed_at = CASE WHEN v_progress >= 100 THEN NOW() ELSE NULL END
    WHERE parent_id = NEW.parent_id AND course_id = v_course_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chapter_progress_trigger ON chapter_progress;
CREATE TRIGGER chapter_progress_trigger
    AFTER INSERT OR UPDATE ON chapter_progress
    FOR EACH ROW
    WHEN (NEW.is_completed = TRUE)
    EXECUTE FUNCTION recalculate_course_progress();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service role (bypass RLS)
-- Note: The service role key used in server.ts bypasses RLS automatically

-- =====================================================
-- SEED DATA - SAMPLE COURSES
-- =====================================================
INSERT INTO courses (title, slug, description, category, is_published, has_evaluation, thumbnail_url) VALUES
('Comunicación con Adolescentes', 'comunicacion-adolescentes',
 'Aprende técnicas efectivas para comunicarte con tu hijo adolescente sin conflictos. Este curso te guiará a través de estrategias probadas para mejorar la comunicación familiar.',
 'comunicacion', TRUE, TRUE, 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400'),
('Establecer Límites con Amor', 'limites-con-amor',
 'Cómo poner límites firmes manteniendo una relación amorosa y respetuosa. Aprende a ser consistente sin perder la conexión emocional con tu hijo.',
 'limites', TRUE, TRUE, 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400'),
('Inteligencia Emocional en Casa', 'inteligencia-emocional-casa',
 'Desarrolla la inteligencia emocional de toda la familia. Herramientas prácticas para gestionar emociones y crear un ambiente emocionalmente saludable.',
 'emociones', TRUE, FALSE, 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400'),
('Entendiendo la Adolescencia', 'entendiendo-adolescencia',
 'Comprende los cambios físicos, emocionales y sociales de esta etapa. Un viaje de descubrimiento para acompañar mejor a tu hijo adolescente.',
 'adolescencia', TRUE, TRUE, 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400'),
('Maternidad Consciente', 'maternidad-consciente',
 'Practica una maternidad presente y consciente para fortalecer el vínculo. Técnicas de mindfulness y presencia para madres de adolescentes.',
 'maternidad', TRUE, FALSE, 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=400')
ON CONFLICT (slug) DO NOTHING;

-- Insert chapters for first course
DO $$
DECLARE
    v_course_id UUID;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE slug = 'comunicacion-adolescentes';

    IF v_course_id IS NOT NULL THEN
        INSERT INTO chapters (course_id, title, description, video_url, duration_minutes, order_index) VALUES
        (v_course_id, 'Introducción al cambio', 'Comprende por qué la comunicación cambia durante la adolescencia y qué esperar de este proceso.', NULL, 12, 1),
        (v_course_id, 'El cerebro adolescente', 'Descubre cómo funciona el cerebro adolescente y por qué actúan de ciertas maneras.', NULL, 18, 2),
        (v_course_id, 'Comunicación sin conflictos', 'Técnicas para dialogar sin que las conversaciones escalen a discusiones.', NULL, 15, 3),
        (v_course_id, 'Límites con amor y firmeza', 'Cómo establecer límites claros manteniendo el respeto mutuo.', NULL, 22, 4),
        (v_course_id, 'Escucha activa', 'Aprende a escuchar verdaderamente lo que tu hijo intenta comunicar.', NULL, 16, 5),
        (v_course_id, 'El arte de preguntar', 'Preguntas poderosas que abren conversaciones significativas.', NULL, 14, 6),
        (v_course_id, 'Manejo del conflicto', 'Estrategias para resolver desacuerdos de manera constructiva.', NULL, 20, 7),
        (v_course_id, 'Conectar en la era digital', 'Cómo mantener la comunicación cuando las pantallas dominan.', NULL, 18, 8)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert chapters for second course
DO $$
DECLARE
    v_course_id UUID;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE slug = 'limites-con-amor';

    IF v_course_id IS NOT NULL THEN
        INSERT INTO chapters (course_id, title, description, video_url, duration_minutes, order_index) VALUES
        (v_course_id, '¿Por qué necesitamos límites?', 'La importancia de los límites para el desarrollo saludable del adolescente.', NULL, 15, 1),
        (v_course_id, 'Tipos de límites', 'Conoce los diferentes tipos de límites y cuándo aplicar cada uno.', NULL, 18, 2),
        (v_course_id, 'Comunicar límites efectivamente', 'Cómo expresar los límites de manera clara y respetuosa.', NULL, 20, 3),
        (v_course_id, 'Consecuencias vs castigos', 'La diferencia entre consecuencias naturales y castigos punitivos.', NULL, 22, 4),
        (v_course_id, 'Consistencia y flexibilidad', 'Encuentra el balance entre ser firme y adaptarte a situaciones.', NULL, 16, 5),
        (v_course_id, 'Límites en la era digital', 'Estrategias para establecer límites con tecnología y redes sociales.', NULL, 25, 6)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert sample materials for first chapter
DO $$
DECLARE
    v_chapter_id UUID;
BEGIN
    SELECT c.id INTO v_chapter_id
    FROM chapters c
    JOIN courses co ON c.course_id = co.id
    WHERE co.slug = 'comunicacion-adolescentes' AND c.order_index = 1;

    IF v_chapter_id IS NOT NULL THEN
        INSERT INTO materials (chapter_id, title, type, url, description, order_index) VALUES
        (v_chapter_id, 'Guía de reflexión', 'pdf', 'https://example.com/guia-reflexion.pdf', 'Preguntas para reflexionar después del video', 1),
        (v_chapter_id, 'Video complementario', 'video', 'https://www.youtube.com/watch?v=example', 'Testimonio de una familia', 2),
        (v_chapter_id, 'Artículo científico', 'link', 'https://example.com/articulo', 'Investigación sobre desarrollo adolescente', 3)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert evaluation for first course
DO $$
DECLARE
    v_course_id UUID;
    v_eval_id UUID;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE slug = 'comunicacion-adolescentes';

    IF v_course_id IS NOT NULL THEN
        INSERT INTO evaluations (course_id, title, description, passing_score)
        VALUES (v_course_id, 'Evaluación Final', 'Demuestra lo aprendido sobre comunicación con adolescentes', 70)
        ON CONFLICT (course_id) DO NOTHING
        RETURNING id INTO v_eval_id;

        IF v_eval_id IS NOT NULL THEN
            INSERT INTO evaluation_questions (evaluation_id, question, options, correct_answer, order_index) VALUES
            (v_eval_id, '¿Cuál es la principal característica del cerebro adolescente?', '["Está completamente desarrollado", "Está en proceso de desarrollo, especialmente la corteza prefrontal", "Funciona igual que el cerebro adulto", "No procesa emociones"]', 1, 1),
            (v_eval_id, '¿Qué es la escucha activa?', '["Escuchar mientras haces otras cosas", "Prestar atención completa y mostrar que comprendes", "Dar consejos inmediatamente", "Interrumpir para dar tu opinión"]', 1, 2),
            (v_eval_id, '¿Cuál es la mejor manera de establecer límites?', '["Gritar para que entiendan", "Ser claro, firme y respetuoso", "No poner ningún límite", "Cambiar los límites constantemente"]', 1, 3),
            (v_eval_id, '¿Por qué es importante validar las emociones de tu hijo?', '["No es importante", "Les hace sentir comprendidos y fortalece el vínculo", "Les hace más débiles", "Les enseña a no mostrar emociones"]', 1, 4),
            (v_eval_id, '¿Qué debes evitar durante una conversación difícil?', '["Escuchar activamente", "Mantener la calma", "Juzgar y criticar constantemente", "Mostrar empatía"]', 2, 5)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES (uncomment to test)
-- =====================================================
-- SELECT * FROM courses;
-- SELECT c.title, ch.title, ch.order_index FROM chapters ch JOIN courses c ON ch.course_id = c.id ORDER BY c.title, ch.order_index;
-- SELECT * FROM evaluations;
-- SELECT * FROM evaluation_questions;
