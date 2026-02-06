import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    // Get course with modules, chapters, and materials
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
        modules(
          id,
          title,
          order_index,
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

    // Sort modules by order_index
    const sortedModules = (course.modules || []).sort(
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

    // Process modules with chapters and progress
    let totalChapters = 0;
    let totalDuration = 0;
    let completedChaptersCount = 0;
    let currentModuleIndex = 0;
    let currentChapterIndex = 0;
    let foundCurrent = false;

    // Calculate unlock state: module N is unlocked if all chapters in modules 0..N-1 are completed
    let allPreviousModulesCompleted = true;

    const modulesWithProgress = sortedModules.map((module, moduleIdx) => {
      const sortedChapters = (module.chapters || []).sort(
        (a, b) => a.order_index - b.order_index
      );

      const isUnlocked = allPreviousModulesCompleted;
      let moduleCompleted = true;

      const chaptersWithProgress = sortedChapters.map((chapter, chapterIdx) => {
        const progress = progressMap.get(chapter.id);
        const isCompleted = progress?.is_completed || false;
        const sortedMaterials = (chapter.materials || []).sort(
          (a, b) => a.order_index - b.order_index
        );

        totalChapters++;
        totalDuration += chapter.duration_minutes || 0;

        if (isCompleted) {
          completedChaptersCount++;
        } else {
          moduleCompleted = false;
          if (!foundCurrent && isUnlocked) {
            currentModuleIndex = moduleIdx;
            currentChapterIndex = chapterIdx;
            foundCurrent = true;
          }
        }

        return {
          id: chapter.id,
          moduleId: module.id,
          title: chapter.title,
          description: chapter.description,
          videoUrl: chapter.video_url,
          durationMinutes: chapter.duration_minutes,
          orderIndex: chapter.order_index,
          isCompleted,
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

      if (!moduleCompleted) {
        allPreviousModulesCompleted = false;
      }

      const completedInModule = chaptersWithProgress.filter((ch) => ch.isCompleted).length;

      return {
        id: module.id,
        courseId: id,
        title: module.title,
        orderIndex: module.order_index,
        isUnlocked,
        isCompleted: moduleCompleted && chaptersWithProgress.length > 0,
        completedChapters: completedInModule,
        totalChapters: chaptersWithProgress.length,
        chapters: chaptersWithProgress,
      };
    });

    // If all chapters are completed, point to the last one
    if (!foundCurrent && totalChapters > 0) {
      const lastModule = modulesWithProgress[modulesWithProgress.length - 1];
      currentModuleIndex = modulesWithProgress.length - 1;
      currentChapterIndex = lastModule ? lastModule.chapters.length - 1 : 0;
    }

    const response = NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnail_url,
        category: course.category,
        hasEvaluation: course.has_evaluation,
        totalChapters,
        totalModules: sortedModules.length,
        totalDuration,
        isEnrolled: !!enrollment,
        isCompleted: enrollment?.status === 'completed',
        progressPercent: totalChapters > 0
          ? Math.round((completedChaptersCount / totalChapters) * 100)
          : 0,
      },
      modules: modulesWithProgress,
      currentModuleIndex,
      currentChapterIndex,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
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
