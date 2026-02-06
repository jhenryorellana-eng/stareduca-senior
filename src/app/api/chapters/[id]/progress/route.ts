import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const body = await request.json();
  const { watchTimeSeconds, markCompleted } = body;

  try {
    // Get chapter to find course
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .select('id, course_id')
      .eq('id', id)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Capítulo no encontrado' },
        { status: 404 }
      );
    }

    // Ensure user is enrolled
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('parent_id', auth.sub)
      .eq('course_id', chapter.course_id)
      .single();

    if (!enrollment) {
      // Auto-enroll if not enrolled
      await supabaseAdmin
        .from('enrollments')
        .insert({
          parent_id: auth.sub,
          course_id: chapter.course_id,
          progress_percent: 0,
          status: 'active',
        });
    }

    // Update or create chapter progress
    const progressData: Record<string, unknown> = {
      parent_id: auth.sub,
      chapter_id: id,
    };

    if (watchTimeSeconds !== undefined) {
      progressData.watch_time_seconds = watchTimeSeconds;
    }

    if (markCompleted) {
      progressData.is_completed = true;
      progressData.completed_at = new Date().toISOString();
    }

    const { error: progressError } = await supabaseAdmin
      .from('chapter_progress')
      .upsert(progressData, {
        onConflict: 'parent_id,chapter_id',
      });

    if (progressError) {
      console.error('Error updating progress:', progressError);
      return NextResponse.json(
        { error: 'Error al actualizar progreso' },
        { status: 500 }
      );
    }

    // Note: The course progress is automatically recalculated by the database trigger

    return NextResponse.json({
      message: markCompleted ? 'Capítulo completado' : 'Progreso guardado',
    });
  } catch (error) {
    console.error('Chapter progress error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
