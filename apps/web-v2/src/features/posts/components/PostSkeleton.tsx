/**
 * PostSkeleton Component
 *
 * Loading placeholder for PostCard with skeleton animation.
 */

import { motion } from 'framer-motion';
import { Card } from '@/components/ui-next';
import { Skeleton } from '@/components/ui-next';

export function PostSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.8,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    >
      <Card>
        {/* Author Info Skeleton */}
        <div className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" className="w-12 h-12" />
            <div className="flex-1">
              <Skeleton variant="text" className="w-32 h-4 mb-2" />
              <Skeleton variant="text" className="w-24 h-3" />
            </div>
          </div>
          <Skeleton variant="text" className="w-20 h-3 mt-2" />
        </div>

        {/* Image Skeleton */}
        <div className="mt-4">
          <Skeleton variant="rectangle" className="w-full aspect-square" />
        </div>

        {/* Actions Skeleton */}
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <Skeleton variant="rectangle" className="w-12 h-6 rounded-full" />
            <Skeleton variant="rectangle" className="w-12 h-6 rounded-full" />
            <Skeleton variant="rectangle" className="w-8 h-6 rounded-full" />
            <div className="ml-auto">
              <Skeleton variant="rectangle" className="w-16 h-6 rounded-full" />
            </div>
          </div>

          {/* Caption Skeleton */}
          <Skeleton variant="text" className="w-full h-4 mb-2" />
          <Skeleton variant="text" className="w-3/4 h-4" />
        </div>
      </Card>
    </motion.div>
  );
}
