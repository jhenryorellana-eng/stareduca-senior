import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    // Get course with chapters and materials
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select(`
        id,
        title,
        slug,
        description,
        thumbnail_url,
        category,
        is_published,
        has_evaluation,
        chapters(
          id,
          title,
          description,
          video_url,
          duration_minutes,
          order_index,
          materials(
            id,
            title,
            type,
            url,
            description,
            order_index
          )
        )
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Sort chapters by order_index
    const sortedChapters = (course.chapters || []).sort(
      (a, b) => a.order_index - b.order_index
    );

    // Get user enrollment
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, progress_percent, status')
      .eq('parent_id', auth.sub)
      .eq('course_id', id)
      .single();

    // Get chapter progress
    const { data: chapterProgress } = await supabaseAdmin
      .from('chapter_progress')
      .select('chapter_id, is_completed, completed_at, watch_time_seconds')
      .eq('parent_id', auth.sub);

    const progressMap = new Map(
      chapterProgress?.map((p) => [p.chapter_id, p]) || []
    );

    // Process chapters with progress
    const chaptersWithProgress = sortedChapters.map((chapter, index) => {
      const progress = progressMap.get(chapter.id);
      const sortedMaterials = (chapter.materials || []).sort(
        (a, b) => a.order_index - b.order_index
      );

      return {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        videoUrl: chapter.video_url,
        durationMinutes: chapter.duration_minutes,
        orderIndex: chapter.order_index,
        isCompleted: progress?.is_completed || false,
        completedAt: progress?.completed_at || null,
        watchTimeSeconds: progress?.watch_time_seconds || 0,
        materials: sortedMaterials.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          url: m.url,
          description: m.description,
          orderIndex: m.order_index,
        })),
      };
    });

    // Find current chapter (first incomplete after last completed)
    let currentChapterIndex = 0;
    for (let i = 0; i < chaptersWithProgress.length; i++) {
      if (!chaptersWithProgress[i].isCompleted) {
        currentChapterIndex = i;
        break;
      }
      if (i === chaptersWithProgress.length - 1) {
        currentChapterIndex = i;
      }
    }

    // Calculate total duration
    const totalDuration = sortedChapters.reduce(
      (sum, ch) => sum + (ch.duration_minutes || 0),
      0
    );

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnail_url,
        category: course.category,
        hasEvaluation: course.has_evaluation,
        totalChapters: sortedChapters.length,
        totalDuration,
        isEnrolled: !!enrollment,
        isCompleted: enrollment?.status === 'completed',
        progressPercent: enrollment?.progress_percent || 0,
      },
      chapters: chaptersWithProgress,
      currentChapterIndex,
    });
  } catch (error) {
    console.error('Course detail error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Enroll in course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    // Check if already enrolled
    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('parent_id', auth.sub)
      .eq('course_id', id)
      .single();

    if (existingEnrollment) {
      return NextResponse.json({ message: 'Ya estás inscrito en este curso' });
    }

    // Create enrollment
    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        parent_id: auth.sub,
        course_id: id,
        progress_percent: 0,
        status: 'active',
      });

    if (enrollError) {
      console.error('Error enrolling:', enrollError);
      return NextResponse.json(
        { error: 'Error al inscribirse' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Inscripción exitosa' });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
