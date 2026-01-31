import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    // Get all published courses with chapters count
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
        chapters(id, duration_minutes)
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

    // Process courses with progress
    const coursesWithProgress = courses?.map((course) => {
      const chapters = course.chapters || [];
      const totalChapters = chapters.length;
      const totalDuration = chapters.reduce(
        (sum: number, ch: { duration_minutes: number }) => sum + (ch.duration_minutes || 0),
        0
      );
      const enrollment = enrollmentMap.get(course.id);

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnail_url,
        category: course.category,
        hasEvaluation: course.has_evaluation,
        totalChapters,
        totalDuration,
        isEnrolled: !!enrollment,
        isCompleted: enrollment?.status === 'completed',
        progressPercent: enrollment?.progress_percent || 0,
      };
    }) || [];

    // Calculate stats
    const activeCourses = enrollments?.filter((e) => e.status === 'active').length || 0;
    const completedCourses = enrollments?.filter((e) => e.status === 'completed').length || 0;
    const chaptersViewed = chapterProgress?.length || 0;

    return NextResponse.json({
      courses: coursesWithProgress,
      stats: {
        activeCourses,
        completedCourses,
        chaptersViewed,
      },
    });
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
