'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, BookOpen } from 'lucide-react';

export default function ResultadoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const score = parseInt(searchParams.get('score') || '0');
  const passed = searchParams.get('passed') === 'true';

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Close button */}
      <div className="px-6 pt-12 pb-4 flex justify-end">
        <Link
          href={`/aprender/${courseId}`}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
        >
          <XCircle className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
          passed ? 'bg-primary/10' : 'bg-orange-100'
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            passed ? 'gradient-primary shadow-lg shadow-primary/30' : 'bg-orange-500'
          }`}>
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {passed ? '¡Felicidades!' : '¡Buen intento!'}
        </h1>
        <p className="text-gray-500 mb-8">
          {passed ? 'Has completado el curso' : 'Sigue practicando'}
        </p>

        {/* Score Circle */}
        <div className="relative w-40 h-40 mb-8">
          <div className={`absolute inset-0 rounded-full p-1 ${
            passed
              ? 'bg-gradient-to-br from-brand-pink via-brand-pink/40 to-brand-pink/10'
              : 'bg-gradient-to-br from-orange-400 via-orange-300/40 to-orange-200/10'
          }`}>
            <div className="w-full h-full rounded-full bg-background-light flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                PUNTAJE
              </span>
              <span className={`text-5xl font-bold ${passed ? 'text-primary' : 'text-orange-500'}`}>
                {score}%
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className={`p-5 rounded-2xl mb-8 ${passed ? 'bg-primary/5 border border-primary/10' : 'bg-orange-50 border border-orange-100'}`}>
          <p className="text-gray-600 italic text-center leading-relaxed">
            {passed
              ? '"Tu dedicación y compromiso son el mejor ejemplo para tu familia. Este logro refleja tu transformación como padre/madre."'
              : '"Cada intento es una oportunidad de aprendizaje. Repasa el material y vuelve a intentarlo cuando te sientas listo/a."'}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-6 pb-12 space-y-4">
        <Link
          href="/aprender"
          className="w-full py-5 rounded-full gradient-primary text-white font-semibold text-lg flex items-center justify-center shadow-lg shadow-primary/30"
        >
          Volver a mis cursos
        </Link>
        {!passed && (
          <Link
            href={`/aprender/${courseId}`}
            className="w-full py-5 rounded-full bg-transparent text-primary font-semibold text-lg flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            Repasar material
          </Link>
        )}
      </div>

      {/* Background decoration */}
      <div className="fixed bottom-0 left-0 right-0 -z-10 h-96 overflow-hidden opacity-20">
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-brand-pink blur-3xl" />
      </div>
    </div>
  );
}
