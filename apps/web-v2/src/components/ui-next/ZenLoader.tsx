/**
 * ZenLoader - Delayed Loading Indicator
 *
 * Philosophy: Don't distract users with loading spinners for fast operations.
 * Only show loading UI if the operation takes longer than expected.
 *
 * Default delay: 1000ms (1 second)
 * - Fast operations (<1s): User sees nothing, content just appears
 * - Slow operations (>1s): Gentle loading indicator fades in
 *
 * Usage:
 * ```tsx
 * <ZenLoader isLoading={isLoading} delay={1000}>
 *   <YourContent />
 * </ZenLoader>
 * ```
 */

import { Loader2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

interface ZenLoaderProps {
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Content to show when loaded */
  children: ReactNode;
  /** Delay in ms before showing loader (default: 1000ms) */
  delay?: number;
  /** Custom loading message (optional) */
  message?: string;
  /** Size of loader: sm, md, lg (default: md) */
  size?: 'sm' | 'md' | 'lg';
  /** Show minimal loader (just spinner, no message) */
  minimal?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function ZenLoader({
  isLoading,
  children,
  delay = 1000,
  message,
  size = 'md',
  minimal = false,
}: ZenLoaderProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Immediately hide loader when loading completes
      setShowLoader(false);
      return;
    }

    // Only show loader if loading takes longer than delay
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  // Fast path: If not loading, show content immediately
  if (!isLoading) {
    return <>{children}</>;
  }

  // Slow path: If loading hasn't exceeded delay yet, show nothing (ZEN)
  if (!showLoader) {
    return null;
  }

  // Very slow path: Show gentle loading indicator
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-brand-purple`} />
      {!minimal && message && <p className="mt-4 text-sm text-text-secondary">{message}</p>}
    </div>
  );
}

/**
 * ZenSuspense - Wrapper for React.lazy components with ZEN loading
 *
 * Usage:
 * ```tsx
 * const AdminPanel = lazy(() => import('./AdminPanel'));
 *
 * <ZenSuspense>
 *   <AdminPanel />
 * </ZenSuspense>
 * ```
 */
interface ZenSuspenseProps {
  children: ReactNode;
  delay?: number;
  message?: string;
}

export function ZenSuspense({ children, delay = 1000, message }: ZenSuspenseProps) {
  return (
    <ZenLoader isLoading={false} delay={delay} message={message}>
      {children}
    </ZenLoader>
  );
}
