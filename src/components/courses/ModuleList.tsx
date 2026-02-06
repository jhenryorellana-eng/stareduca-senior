'use client';

import { ModuleItem } from './ModuleItem';
import type { ModuleWithChapters } from '@/types';

interface ModuleListProps {
  modules: ModuleWithChapters[];
  courseId: string;
}

export function ModuleList({ modules, courseId }: ModuleListProps) {
  // Find the first non-completed unlocked module to auto-expand
  const firstActiveIndex = modules.findIndex(
    (m) => m.isUnlocked && !m.isCompleted
  );

  return (
    <div className="space-y-3">
      {modules.map((module, index) => (
        <ModuleItem
          key={module.id}
          module={module}
          courseId={courseId}
          moduleIndex={index}
          defaultExpanded={index === firstActiveIndex || (firstActiveIndex === -1 && index === 0)}
        />
      ))}
    </div>
  );
}
