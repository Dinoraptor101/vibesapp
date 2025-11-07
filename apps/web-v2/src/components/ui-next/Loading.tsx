import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

/**
 * Spinner Component
 *
 * Circular loading spinner for button states, page loading, and inline loading states.
 *
 * @example
 * ```tsx
 * // Basic spinner
 * <Spinner />
 *
 * // With size
 * <Spinner size="lg" />
 *
 * // With variant color
 * <Spinner variant="primary" size="md" />
 * ```
 */

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    },
    variant: {
      default: 'text-text-secondary',
      primary: 'text-brand-primary',
      success: 'text-vibe-positive',
      error: 'text-vibe-negative',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Accessible label for screen readers
   * @default "Loading"
   */
  label?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label = 'Loading', ...props }, ref) => {
    return (
      <>
        <div ref={ref} {...props}>
          <Loader2
            className={cn(spinnerVariants({ size, variant }), className)}
            aria-label={label}
          />
        </div>
        <span className="sr-only">{label}</span>
      </>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * Skeleton Component
 *
 * Placeholder loading state for content that's being loaded.
 *
 * @example
 * ```tsx
 * // Basic skeleton (rectangle)
 * <Skeleton className="h-4 w-full" />
 *
 * // Circle variant for avatars
 * <Skeleton variant="circle" className="w-12 h-12" />
 *
 * // Text lines
 * <Skeleton variant="text" className="w-full" />
 * <Skeleton variant="text" className="w-3/4" />
 * ```
 */

const skeletonVariants = cva('bg-surface-secondary animate-pulse', {
  variants: {
    variant: {
      default: 'rounded',
      text: 'rounded h-4',
      circle: 'rounded-full',
      rectangle: 'rounded-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /**
   * Width of the skeleton (can use Tailwind classes or custom CSS)
   */
  width?: string;
  /**
   * Height of the skeleton (can use Tailwind classes or custom CSS)
   */
  height?: string;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, width, height, style, ...props }, ref) => {
    const inlineStyle = {
      ...style,
      ...(width && { width }),
      ...(height && { height }),
    };

    return (
      <>
        <div
          ref={ref}
          className={cn(skeletonVariants({ variant }), className)}
          style={inlineStyle}
          role="status"
          aria-live="polite"
          aria-busy="true"
          {...props}
        />
        <span className="sr-only">Loading content</span>
      </>
    );
  }
);

Skeleton.displayName = 'Skeleton';

export default Spinner;
