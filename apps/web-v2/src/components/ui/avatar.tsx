/**
 * Avatar Component
 * Displays user avatar with fallback to initials
 */

import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  online?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
};

export function Avatar({
  src,
  alt = 'User avatar',
  size = 'md',
  fallback,
  online,
  className,
}: AvatarProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'rounded-full object-cover',
            sizeClass,
            'ring-2 ring-gray-200 dark:ring-gray-700'
          )}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
            sizeClass,
            'ring-2 ring-gray-200 dark:ring-gray-700'
          )}
        >
          {fallback ? (
            <span className="font-medium">{fallback}</span>
          ) : (
            <User className="w-1/2 h-1/2" />
          )}
        </div>
      )}

      {online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800',
            size === 'xs' && 'w-2 h-2',
            size === 'sm' && 'w-2.5 h-2.5',
            size === 'md' && 'w-3 h-3',
            size === 'lg' && 'w-4 h-4',
            size === 'xl' && 'w-4 h-4'
          )}
        />
      )}
    </div>
  );
}
