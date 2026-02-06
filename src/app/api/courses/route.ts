import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    // Get all published courses with modules and chapters count
    const { data: courses, error: coursesError } = await supabaseAdmin
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
          chapters(id, duration_minutes)
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: 'Error al obtener cursos' },
        { status: 500 }
      );
    }

    // Get user enrollments
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('course_id, progress_percent, status')
      .eq('parent_id', auth.sub);

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
    }

    // Get chapter progress for enrolled courses
    const { data: chapterProgress, error: progressError } = await supabaseAdmin
      .from('chapter_progress')
      .select('chapter_id, is_completed')
      .eq('parent_id', auth.sub)
      .eq('is_completed', true);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
    }

    // Create enrollment map
    const enrollmentMap = new Map(
      enrollments?.map((e) => [e.course_id, e]) || []
    );

    // Create set of completed chapter IDs for progress calculation
    const completedChapterIds = new Set(
      chapterProgress?.map((p) => p.chapter_id) || []
    );

    // Process courses with progress
    const coursesWithProgress = courses?.map((course) => {
      const modules = course.modules || [];
      // Flatten chapters from all modules
      const allChapters = modules.flatMap((m: any) => m.chapters || []);
      const totalChapters = allChapters.length;
      const totalModules = modules.length;
      const totalDuration = allChapters.reduce(
        (sum: number, ch: { duration_minutes: number }) => sum + (ch.duration_minutes || 0),
        0
      );
      const enrollment = enrollmentMap.get(course.id);

      // Calculate progress dynamically based on completed chapters
      const completedInCourse = allChapters.filter(
        (ch: { id: string }) => completedChapterIds.has(ch.id)
      ).length;
      const calculatedProgress = totalChapters > 0
        ? Math.round((completedInCourse / totalChapters) * 100)
        : 0;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnail_url,
        category: course.category,
        hasEvaluation: course.has_evaluation,
        totalChapters,
        totalModules,
        totalDuration,
        isEnrolled: !!enrollment,
        isCompleted: enrollment?.status === 'completed',
        progressPercent: enrollment ? calculatedProgress : 0,
      };
    }) || [];

    // Calculate stats
    const activeCourses = enrollments?.filter((e) => e.status === 'active').length || 0;
    const completedCourses = enrollments?.filter((e) => e.status === 'completed').length || 0;
    const chaptersViewed = chapterProgress?.length || 0;

    const response = NextResponse.json({
      courses: coursesWithProgress,
      stats: {
        activeCourses,
        completedCourses,
        chaptersViewed,
      },
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
