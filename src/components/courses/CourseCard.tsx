'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import { cn, formatDuration } from '@/lib/utils';
import type { CourseWithProgress } from '@/types';

interface CourseCardProps {
  course: CourseWithProgress;
}

export function CourseCard({ course }: CourseCardProps) {
  const isInProgress = course.isEnrolled && !course.isCompleted && course.progressPercent > 0;
  const isCompleted = course.isCompleted;
  const isNotStarted = course.isEnrolled && course.progressPercent === 0;
  const isNew = !course.isEnrolled;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl bg-white p-4 tablet:p-5 shadow-card border border-gray-50',
        isNotStarted && 'opacity-95'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col gap-1">
          {/* Status Badge */}
          <div className="flex items-center gap-1 mb-1">
            {isCompleted && (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                  Completado
                </span>
              </>
            )}
            {isInProgress && (
              <span className="text-xs font-semibold text-primary-aprender uppercase tracking-wider">
                En progreso
              </span>
            )}
            {isNotStarted && (
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Sin iniciar
              </span>
            )}
            {isNew && (
              <span className="text-xs font-semibold text-primary-aprender uppercase tracking-wider">
                {course.category}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-gray-900 text-base tablet:text-lg font-bold leading-tight">
            {course.title}
          </p>

          {/* Subtitle */}
          <p className="text-gray-500 text-sm font-normal leading-normal mt-1">
            {isInProgress && `${course.progressPercent}% completado`}
            {isCompleted && 'Curso finalizado'}
            {(isNotStarted || isNew) && `${course.totalChapters} lecciones • ${formatDuration(course.totalDuration)}`}
          </p>
        </div>

        {/* Thumbnail */}
        <div
          className={cn(
            'w-20 h-20 tablet:w-24 tablet:h-24 rounded-xl shrink-0 overflow-hidden bg-gray-100',
            isCompleted && 'grayscale-[0.2]'
          )}
        >
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-aprender/20 to-brand-pink/20" />
          )}
        </div>
      </div>

      {/* Progress Bar (only for in progress courses) */}
      {isInProgress && (
        <div className="mt-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-gray-500">Progreso personal</span>
            <span className="text-xs font-bold text-primary-aprender">{course.progressPercent}%</span>
          </div>
          <ProgressBar value={course.progressPercent} size="sm" />
        </div>
      )}

      {/* Action Button */}
      <Link
        href={`/aprender/${course.id}`}
        className={cn(
          'flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 text-sm font-semibold transition-all active:scale-[0.98]',
          isInProgress && 'bg-primary-aprender text-white',
          isCompleted && 'bg-background-light text-gray-900 border border-gray-100',
          isNotStarted && 'bg-gray-100 text-gray-900',
          isNew && 'bg-primary-aprender text-white'
        )}
      >
        {isInProgress && 'Continuar aprendizaje'}
        {isCompleted && 'Repasar material'}
        {isNotStarted && 'Empezar ahora'}
        {isNew && 'Ver curso'}
      </Link>
    </div>
  );
}
