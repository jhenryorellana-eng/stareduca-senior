import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: 'search' | 'none';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon = 'none', ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon === 'search' && (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-background-light rounded-xl border border-transparent px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200',
            'focus:border-primary/30 focus:ring-2 focus:ring-primary/10',
            icon === 'search' && 'pl-12',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
