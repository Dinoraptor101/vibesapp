import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * Badge Component
 *
 * Display small labels, status indicators, counts, and MBTI types.
 *
 * @example
 * ```tsx
 * // Basic badge
 * <Badge>New</Badge>
 *
 * // With variant
 * <Badge variant="success">Active</Badge>
 *
 * // With size
 * <Badge size="lg" variant="brand">INFP</Badge>
 *
 * // Dot variant
 * <Badge variant="success" dot />
 *
 * // Number badge
 * <Badge variant="error" count={42} />
 * ```
 */

const badgeVariants = cva('inline-flex items-center justify-center font-medium transition-colors', {
  variants: {
    variant: {
      default: 'bg-surface-secondary text-text-primary border border-border',
      success: 'bg-vibe-positive/10 text-vibe-positive border border-vibe-positive/20',
      warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
      error: 'bg-vibe-negative/10 text-vibe-negative border border-vibe-negative/20',
      brand: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
    },
    size: {
      sm: 'text-xs px-2 py-0.5 rounded-full',
      md: 'text-sm px-2.5 py-1 rounded-full',
      lg: 'text-base px-3 py-1.5 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
});

const dotVariants = cva('rounded-full', {
  variants: {
    variant: {
      default: 'bg-text-secondary',
      success: 'bg-vibe-positive',
      warning: 'bg-yellow-500',
      error: 'bg-vibe-negative',
      brand: 'bg-brand-primary',
    },
    size: {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Badge content (text, number, etc.)
   */
  children?: React.ReactNode;
  /**
   * Show as a dot indicator instead of full badge
   * @default false
   */
  dot?: boolean;
  /**
   * Show as a number badge with automatic 99+ handling
   */
  count?: number;
  /**
   * Maximum number to display before showing "99+"
   * @default 99
   */
  maxCount?: number;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, children, dot, count, maxCount = 99, ...props }, ref) => {
    // Dot variant - just a colored circle
    if (dot) {
      return (
        <span
          ref={ref}
          className={cn(dotVariants({ variant, size }), className)}
          role="status"
          aria-label={variant === 'success' ? 'Active' : variant === 'error' ? 'Error' : 'Status'}
          {...props}
        />
      );
    }

    // Number badge with count
    if (count !== undefined) {
      const displayCount = maxCount && count > maxCount ? `${maxCount}+` : count;
      return (
        <>
          <span
            ref={ref}
            className={cn(
              badgeVariants({ variant, size }),
              'min-w-[1.25rem] h-5 px-1.5',
              size === 'md' && 'min-w-[1.5rem] h-6 px-2',
              size === 'lg' && 'min-w-[1.75rem] h-7 px-2.5',
              'flex items-center justify-center tabular-nums',
              className
            )}
            {...props}
          >
            {displayCount}
          </span>
          <span className="sr-only">{`${count} ${children || 'notifications'}`}</span>
        </>
      );
    }

    // Standard badge with children
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
