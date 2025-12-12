import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * PageLoader Component
 *
 * Centralized page loading indicator with VibesApp logo.
 * Follows ZEN principle: only appears after 1 second to avoid flashing on fast loads.
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <PageLoader />;
 * }
 * ```
 */

export interface PageLoaderProps {
  /**
   * Custom className for the container
   */
  className?: string;
  /**
   * Size of the logo
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Accessible label for screen readers
   * @default "Loading"
   */
  label?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export function PageLoader({ className, size = 'md', label = 'Loading' }: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(false);

  // ZEN Principle: Wait 1 second before showing loader
  // Prevents flash on fast loads (<1s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything during the 1-second delay
  if (!showLoader) {
    return null;
  }

  return (
    <div
      className={cn('flex items-center justify-center min-h-[50vh]', className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <motion.img
        src="/logo.svg"
        alt="VibesApp logo"
        className={cn(sizeClasses[size])}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default PageLoader;
