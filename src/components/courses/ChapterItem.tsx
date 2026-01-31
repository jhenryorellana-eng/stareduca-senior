'use client';

import Link from 'next/link';
import { Check, Play, Lock } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import type { ChapterWithProgress } from '@/types';

interface ChapterItemProps {
  chapter: ChapterWithProgress;
  courseId: string;
  isCurrent: boolean;
  isLocked: boolean;
  index: number;
}

export function ChapterItem({
  chapter,
  courseId,
  isCurrent,
  isLocked,
  index,
}: ChapterItemProps) {
  const isCompleted = chapter.isCompleted;

  const content = (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl transition-colors',
        isCurrent && !isCompleted && 'bg-primary/5 border border-primary/10',
        !isCurrent && !isCompleted && !isLocked && 'hover:bg-white',
        isLocked && 'opacity-60'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'size-10 rounded-full flex items-center justify-center flex-shrink-0',
          isCompleted && 'bg-green-100',
          isCurrent && !isCompleted && 'bg-gradient-to-br from-primary to-primary-light shadow-lg shadow-primary/20',
          !isCurrent && !isCompleted && 'border-2 border-gray-300'
        )}
      >
        {isCompleted && <Check className="w-5 h-5 text-green-600" />}
        {isCurrent && !isCompleted && <Play className="w-5 h-5 text-white fill-white" />}
        {!isCurrent && !isCompleted && !isLocked && (
          <div className="size-2 rounded-full bg-gray-300" />
        )}
        {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3
          className={cn(
            'text-sm',
            isCompleted && 'font-semibold',
            isCurrent && !isCompleted && 'font-bold text-primary',
            !isCurrent && !isCompleted && 'font-medium'
          )}
        >
          {index + 1}. {chapter.title}
        </h3>
        <p
          className={cn(
            'text-xs',
            isCurrent && !isCompleted ? 'text-primary/70 font-medium' : 'text-gray-400'
          )}
        >
          {isCurrent && !isCompleted && chapter.watchTimeSeconds > 0
            ? `En curso • ${formatDuration(Math.floor(chapter.watchTimeSeconds / 60))} / ${formatDuration(chapter.durationMinutes)}`
            : `${formatDuration(chapter.durationMinutes)}`}
        </p>
      </div>
    </div>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link href={`/aprender/${courseId}/capitulo/${chapter.id}`}>
      {content}
    </Link>
  );
}
