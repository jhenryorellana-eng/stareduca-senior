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
    // Get chapter with materials
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .select(`
        id,
        course_id,
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
      `)
      .eq('id', id)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Capítulo no encontrado' },
        { status: 404 }
      );
    }

    // Get course info
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id, title, slug')
      .eq('id', chapter.course_id)
      .single();

    // Get all chapters for navigation
    const { data: allChapters } = await supabaseAdmin
      .from('chapters')
      .select('id, title, order_index')
      .eq('course_id', chapter.course_id)
      .order('order_index', { ascending: true });

    // Get chapter progress
    const { data: progress } = await supabaseAdmin
      .from('chapter_progress')
      .select('is_completed, watch_time_seconds')
      .eq('parent_id', auth.sub)
      .eq('chapter_id', id)
      .single();

    // Find prev/next chapters
    const currentIndex = allChapters?.findIndex((c) => c.id === id) ?? -1;
    const prevChapter = currentIndex > 0 ? allChapters?.[currentIndex - 1] : null;
    const nextChapter = currentIndex < (allChapters?.length ?? 0) - 1
      ? allChapters?.[currentIndex + 1]
      : null;

    // Sort materials
    const sortedMaterials = (chapter.materials || []).sort(
      (a, b) => a.order_index - b.order_index
    );

    return NextResponse.json({
      chapter: {
        id: chapter.id,
        courseId: chapter.course_id,
        title: chapter.title,
        description: chapter.description,
        videoUrl: chapter.video_url,
        durationMinutes: chapter.duration_minutes,
        orderIndex: chapter.order_index,
        isCompleted: progress?.is_completed || false,
        watchTimeSeconds: progress?.watch_time_seconds || 0,
        materials: sortedMaterials.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          url: m.url,
          description: m.description,
        })),
      },
      course: course ? {
        id: course.id,
        title: course.title,
        slug: course.slug,
      } : null,
      navigation: {
        currentIndex: currentIndex + 1,
        totalChapters: allChapters?.length || 0,
        prevChapterId: prevChapter?.id || null,
        nextChapterId: nextChapter?.id || null,
      },
    });
  } catch (error) {
    console.error('Chapter detail error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
