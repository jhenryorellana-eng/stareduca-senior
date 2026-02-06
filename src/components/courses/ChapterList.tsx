'use client';

import { ChapterItem } from './ChapterItem';
import type { ChapterWithProgress } from '@/types';

interface ChapterListProps {
  chapters: ChapterWithProgress[];
  courseId: string;
}

export function ChapterList({ chapters, courseId }: ChapterListProps) {
  // Find the first incomplete chapter (current)
  const currentIndex = chapters.findIndex((ch) => !ch.isCompleted);

  return (
    <div className="space-y-2">
      {chapters.map((chapter, index) => {
        // A chapter is locked if the previous chapter is not completed
        const isLocked = index > 0 && !chapters[index - 1].isCompleted && !chapter.isCompleted;
        const isCurrent = index === currentIndex;

        return (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            courseId={courseId}
            isCurrent={isCurrent}
            isLocked={isLocked}
            index={index}
          />
        );
      })}
    </div>
  );
}
