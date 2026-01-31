import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  borderColor?: string;
}

export function Avatar({
  src,
  alt = 'Avatar',
  firstName = '',
  lastName = '',
  size = 'md',
  className,
  borderColor,
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const imageSizes = {
    sm: 32,
    md: 44,
    lg: 64,
    xl: 96,
  };

  const initials = getInitials(firstName, lastName);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/20 to-brand-pink/20 flex-shrink-0',
        sizes[size],
        borderColor && `ring-2 ${borderColor}`,
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="font-bold text-primary">
          {initials || '?'}
        </span>
      )}
    </div>
  );
}
