import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'gradient',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variants = {
    default: 'bg-primary',
    gradient: 'gradient-progress',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">Progreso</span>
          <span className="text-xs font-medium text-primary">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-gray-200 overflow-hidden',
          sizes[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
