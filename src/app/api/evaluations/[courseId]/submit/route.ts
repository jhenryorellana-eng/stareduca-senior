import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { courseId } = await params;
  const { answers } = await request.json();

  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json(
      { error: 'Respuestas inválidas' },
      { status: 400 }
    );
  }

  try {
    // Get evaluation with questions (including correct answers)
    const { data: evaluation, error } = await supabaseAdmin
      .from('evaluations')
      .select(`
        id,
        passing_score,
        evaluation_questions(
          id,
          correct_answer,
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

    // Sort questions by order_index
    const questions = (evaluation.evaluation_questions || [])
      .sort((a, b) => a.order_index - b.order_index);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= evaluation.passing_score;

    // Save attempt
    const { error: attemptError } = await supabaseAdmin
      .from('evaluation_attempts')
      .insert({
        parent_id: auth.sub,
        evaluation_id: evaluation.id,
        score,
        passed,
        answers,
      });

    if (attemptError) {
      console.error('Error saving attempt:', attemptError);
      return NextResponse.json(
        { error: 'Error al guardar resultado' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      score,
      passed,
      correctCount,
      totalQuestions: questions.length,
      passingScore: evaluation.passing_score,
    });
  } catch (error) {
    console.error('Submit evaluation error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
