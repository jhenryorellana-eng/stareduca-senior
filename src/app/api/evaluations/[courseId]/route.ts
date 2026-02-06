import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { courseId } = await params;

  try {
    // Get evaluation with questions
    const { data: evaluation, error } = await supabaseAdmin
      .from('evaluations')
      .select(`
        id,
        course_id,
        title,
        description,
        passing_score,
        evaluation_questions(
          id,
          question,
          options,
          order_index
        )
      `)
      .eq('course_id', courseId)
      .single();

    if (error || !evaluation) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    // Get previous attempts
    const { data: attempts } = await supabaseAdmin
      .from('evaluation_attempts')
      .select('id, score, passed, attempted_at')
      .eq('parent_id', auth.sub)
      .eq('evaluation_id', evaluation.id)
      .order('attempted_at', { ascending: false });

    // Sort questions by order_index and remove correct answers
    const questions = (evaluation.evaluation_questions || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        orderIndex: q.order_index,
      }));

    const response = NextResponse.json({
      evaluation: {
        id: evaluation.id,
        courseId: evaluation.course_id,
        title: evaluation.title,
        description: evaluation.description,
        passingScore: evaluation.passing_score,
      },
      questions,
      attempts: attempts?.map((a) => ({
        id: a.id,
        score: a.score,
        passed: a.passed,
        attemptedAt: a.attempted_at,
      })) || [],
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
