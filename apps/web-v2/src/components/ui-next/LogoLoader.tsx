/**
 * LogoLoader Component
 *
 * Full-screen loading indicator with VibesApp logo, clockwise rotation,
 * fade in/out animation, and theme-aware gradient background.
 *
 * Used for initial app loading and authentication checks.
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <LogoLoader />;
 * }
 * ```
 */

import { cn } from '@/lib/cn';
import { Logo } from './Logo';

export interface LogoLoaderProps {
  /**
   * Custom className for the container
   */
  className?: string;
  /**
   * Accessible label for screen readers
   * @default "Loading"
   */
  label?: string;
}

export function LogoLoader({ className, label = 'Loading' }: LogoLoaderProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center',
        'bg-gradient-to-br from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)]',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Logo
        size="xl"
        className="text-text-primary animate-logo-spin"
        aria-label="VibesApp logo loading"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default LogoLoader;
