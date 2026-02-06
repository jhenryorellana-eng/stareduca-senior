'use client';

import { useState } from 'react';
import { ChevronDown, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChapterList } from './ChapterList';
import type { ModuleWithChapters } from '@/types';

interface ModuleItemProps {
  module: ModuleWithChapters;
  courseId: string;
  moduleIndex: number;
  defaultExpanded?: boolean;
}

export function ModuleItem({
  module,
  courseId,
  moduleIndex,
  defaultExpanded = false,
}: ModuleItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isLocked = !module.isUnlocked;

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden transition-all',
        isLocked ? 'opacity-60' : '',
        module.isCompleted
          ? 'bg-green-50/50 border border-green-100'
          : module.isUnlocked
          ? 'bg-white border border-gray-100 shadow-sm'
          : 'bg-gray-50 border border-gray-100'
      )}
    >
      {/* Module Header */}
      <button
        className="w-full flex items-center gap-3 p-4"
        onClick={() => !isLocked && setIsExpanded(!isExpanded)}
        disabled={isLocked}
      >
        {/* Module Number / Status Icon */}
        <div
          className={cn(
            'size-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm',
            module.isCompleted
              ? 'bg-green-100 text-green-600'
              : module.isUnlocked
              ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/20'
              : 'bg-gray-200 text-gray-400'
          )}
        >
          {module.isCompleted ? (
            <Check className="w-5 h-5" />
          ) : isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            moduleIndex + 1
          )}
        </div>

        {/* Module Info */}
        <div className="flex-1 text-left">
          <h3
            className={cn(
              'text-[15px] font-bold',
              module.isCompleted
                ? 'text-green-700'
                : module.isUnlocked
                ? 'text-gray-900'
                : 'text-gray-400'
            )}
          >
            {module.title}
          </h3>
          <p
            className={cn(
              'text-xs mt-0.5',
              module.isCompleted ? 'text-green-600' : 'text-gray-400'
            )}
          >
            {module.isCompleted
              ? `${module.totalChapters} capítulos completados`
              : `${module.completedChapters}/${module.totalChapters} capítulos`}
          </p>
        </div>

        {/* Expand Icon */}
        {!isLocked && (
          <ChevronDown
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        )}
      </button>

      {/* Chapters */}
      {isExpanded && !isLocked && module.chapters.length > 0 && (
        <div className="px-4 pb-4">
          <ChapterList
            chapters={module.chapters}
            courseId={courseId}
          />
        </div>
      )}
    </div>
  );
}
