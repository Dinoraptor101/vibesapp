import { type VariantProps, cva } from 'class-variance-authority';
import { type ImgHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Avatar Component
 *
 * Displays user profile pictures with fallback to initials.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Avatar src="/avatar.jpg" alt="John Doe" />
 *
 * // With size
 * <Avatar src="/avatar.jpg" alt="Jane Smith" size="lg" />
 *
 * // With online indicator
 * <Avatar src="/avatar.jpg" alt="User" online />
 *
 * // Initials fallback
 * <Avatar name="John Doe" />
 *
 * // With ring/border
 * <Avatar src="/avatar.jpg" alt="User" ring />
 * ```
 */

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-secondary text-text-primary font-medium select-none',
  {
    variants: {
      size: {
        xs: 'w-8 h-8 text-xs',
        sm: 'w-10 h-10 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-20 h-20 text-xl',
      },
      ring: {
        true: 'ring-2 ring-brand-primary ring-offset-2 ring-offset-surface-primary',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      ring: false,
    },
  }
);

const onlineIndicatorVariants = cva(
  'absolute bottom-0 right-0 rounded-full bg-vibe-positive border-2 border-surface-primary',
  {
    variants: {
      size: {
        xs: 'w-2 h-2',
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
        xl: 'w-5 h-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size' | 'loading' | 'src'>,
    VariantProps<typeof avatarVariants> {
  /**
   * Image source URL
   */
  src?: string | null;
  /**
   * Alt text for the image
   */
  alt?: string;
  /**
   * User's name for generating initials fallback
   */
  name?: string;
  /**
   * Show online status indicator (green dot)
   * @default false
   */
  online?: boolean;
  /**
   * Show ring/border around avatar
   * @default false
   */
  ring?: boolean;
  /**
   * Loading state - shows skeleton
   * @default false
   */
  loading?: boolean;
}

/**
 * Generate initials from a name
 * @param name - Full name to generate initials from
 * @returns Two-letter initials (e.g., "John Doe" → "JD")
 */
function getInitials(name: string): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a consistent color based on a string (for initials background)
 * @param str - String to generate color from
 * @returns Tailwind background color class
 */
function getColorFromString(str: string): string {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-green-500',
    'bg-orange-500',
  ];

  const hash = str.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, online, ring, size, loading, className, ...props }, ref) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const showInitials = !src || imageError;
    const initials = name ? getInitials(name) : alt ? getInitials(alt) : '?';
    const initialsColor =
      name || alt ? getColorFromString(name || alt || '') : 'bg-surface-secondary';

    // Loading skeleton
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            avatarVariants({ size, ring }),
            'animate-pulse bg-surface-secondary',
            className
          )}
          role="img"
          aria-label="Loading avatar"
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({ size, ring }),
          showInitials && initialsColor,
          showInitials && 'text-white',
          className
        )}
        role="img"
        aria-label={alt || name || 'User avatar'}
      >
        {!showInitials ? (
          <>
            <img
              {...props}
              src={src || undefined}
              alt={alt || name || 'User avatar'}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-200',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
            />
            {/* Show skeleton while image loads */}
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-surface-secondary" />
            )}
          </>
        ) : (
          <span>{initials}</span>
        )}

        {online && <span className={onlineIndicatorVariants({ size })} aria-hidden="true" />}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
