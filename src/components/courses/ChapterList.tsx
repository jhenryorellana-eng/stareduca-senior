'use client';

import { ChapterItem } from './ChapterItem';
import type { ChapterWithProgress } from '@/types';

interface ChapterListProps {
  chapters: ChapterWithProgress[];
  courseId: string;
  currentChapterIndex: number;
}

export function ChapterList({ chapters, courseId, currentChapterIndex }: ChapterListProps) {
  return (
    <div className="space-y-2">
      {chapters.map((chapter, index) => {
        // A chapter is locked if any previous chapter is not completed
        const isLocked = index > 0 && !chapters[index - 1].isCompleted && index !== currentChapterIndex;
        const isCurrent = index === currentChapterIndex;

        return (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            courseId={courseId}
            isCurrent={isCurrent}
            isLocked={isLocked && !chapter.isCompleted}
            index={index}
          />
        );
      })}
    </div>
  );
}
