'use client';

import { FileText, Video, Image as ImageIcon, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Material } from '@/types';

interface MaterialItemProps {
  material: Material;
}

const typeIcons = {
  pdf: FileText,
  video: Video,
  image: ImageIcon,
  link: LinkIcon,
};

const typeLabels = {
  pdf: 'PDF',
  video: 'Video',
  image: 'Imagen',
  link: 'Enlace',
};

const typeColors = {
  pdf: 'bg-red-100 text-red-600',
  video: 'bg-blue-100 text-blue-600',
  image: 'bg-green-100 text-green-600',
  link: 'bg-purple-100 text-purple-600',
};

export function MaterialItem({ material }: MaterialItemProps) {
  const Icon = typeIcons[material.type] || LinkIcon;

  return (
    <a
      href={material.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all active:scale-[0.98]"
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          typeColors[material.type]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {material.title}
        </p>
        <p className="text-xs text-gray-500">
          {typeLabels[material.type]}
          {material.description && ` • ${material.description}`}
        </p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </a>
  );
}
