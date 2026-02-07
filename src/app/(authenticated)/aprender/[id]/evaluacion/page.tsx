'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  options: string[];
  orderIndex: number;
}

interface Evaluation {
  id: string;
  courseId: string;
  title: string;
  description: string;
  passingScore: number;
}

export default function EvaluacionPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const courseId = params.id as string;

  useEffect(() => {
    async function fetchEvaluation() {
      if (!token || !courseId) return;

      try {
        const response = await fetch(`/api/evaluations/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setEvaluation(data.evaluation);
          setQuestions(data.questions);
          setAnswers(new Array(data.questions.length).fill(null));
        } else {
          router.push(`/aprender/${courseId}`);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvaluation();
  }, [token, courseId, router]);

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!token || !courseId || answers.includes(null)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/evaluations/${courseId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/aprender/${courseId}/evaluacion/resultado?score=${result.score}&passed=${result.passed}`);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered = !answers.includes(null);
  const question = questions[currentQuestion];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!evaluation || !question) return null;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="flex items-center p-4 pt-8 justify-between">
        <Link href={`/aprender/${courseId}`} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-sm font-medium text-gray-500">
          {currentQuestion + 1} / {questions.length}
        </span>
        <div className="w-6" />
      </header>

      {/* Progress */}
      <div className="px-6 tablet:px-8 mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="px-6 tablet:px-8">
        <h2 className="text-xl tablet:text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion, index)}
              className={cn(
                'w-full p-4 rounded-xl text-left font-medium transition-all',
                answers[currentQuestion] === index
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-primary/30'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-sm',
                  answers[currentQuestion] === index ? 'bg-white/20' : 'bg-gray-100'
                )}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 tablet:px-8 bg-gradient-to-t from-background-light via-background-light to-transparent">
        <div className="flex gap-4">
          {currentQuestion > 0 && (
            <button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="flex-1 py-4 rounded-xl bg-white border border-gray-200 font-semibold text-gray-700"
            >
              Anterior
            </button>
          )}
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={answers[currentQuestion] === null}
              className={cn(
                'flex-1 py-4 rounded-xl font-semibold transition-all',
                answers[currentQuestion] !== null
                  ? 'gradient-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-gray-200 text-gray-400'
              )}
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className={cn(
                'flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all',
                allAnswered && !isSubmitting
                  ? 'gradient-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-gray-200 text-gray-400'
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Finalizar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
