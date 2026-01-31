'use client';

import { MaterialItem } from './MaterialItem';
import type { Material } from '@/types';

interface MaterialsListProps {
  materials: Material[];
}

export function MaterialsList({ materials }: MaterialsListProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-gray-900">Material adicional</h3>
      <div className="space-y-2">
        {materials.map((material) => (
          <MaterialItem key={material.id} material={material} />
        ))}
      </div>
    </div>
  );
}
