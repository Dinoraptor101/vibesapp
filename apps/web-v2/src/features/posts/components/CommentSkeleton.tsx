/**
 * CommentSkeleton Component
 *
 * Loading placeholder for comments.
 */

import { cn } from '@/lib/cn';

interface CommentSkeletonProps {
  className?: string;
}

export function CommentSkeleton({ className }: CommentSkeletonProps) {
  return (
    <div className={cn('flex gap-3 py-3', className)}>
      {/* Avatar skeleton */}
      <div className="w-10 h-10 rounded-full bg-surface-secondary animate-pulse mt-1" />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-surface-secondary rounded animate-pulse" />
          <div className="h-3 w-16 bg-surface-secondary rounded animate-pulse" />
        </div>

        {/* Text skeleton - 2 lines */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-surface-secondary rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-surface-secondary rounded animate-pulse" />
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-12 bg-surface-secondary rounded animate-pulse" />
          <div className="h-4 w-12 bg-surface-secondary rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
