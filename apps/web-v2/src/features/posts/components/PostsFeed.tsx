/**
 * PostsFeed Component
 *
 * Main feed container with infinite scroll, filtering, and real-time updates.
 * Displays a scrollable list of posts with loading states and error handling.
 */

import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui-next';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { usePostFilters } from '../hooks/usePostFilters';
import { FilterBar } from './FilterBar';
import { PostCard } from './PostCard';
import { PostSkeleton } from './PostSkeleton';

interface PostsFeedProps {
  className?: string;
}

export function PostsFeed({ className }: PostsFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filter state
  const { filters, setNearby, setFollowing, setSort, isFiltering } = usePostFilters();

  // Posts data with infinite scroll
  const {
    posts,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    likePost,
    dislikePost,
  } = useInfinitePosts({ filters: filters });

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle comment navigation
  const handleComment = (postId: string) => {
    // TODO: Navigate to post detail page or open comment modal
    console.log('Comment on post:', postId);
  };

  // Error state
  if (isError) {
    return (
      <div className={className}>
        <FilterBar
          nearbyEnabled={!!filters.nearby}
          followingEnabled={!!filters.following}
          sortOption={filters.sort}
          onNearbyToggle={setNearby}
          onFollowingToggle={setFollowing}
          onSortChange={setSort}
        />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Failed to load posts</h2>
          <p className="text-text-secondary text-center mb-4">
            {error?.message || 'Something went wrong. Please try again.'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Loading state (initial load)
  if (isLoading) {
    return (
      <div className={className}>
        <FilterBar
          nearbyEnabled={!!filters.nearby}
          followingEnabled={!!filters.following}
          sortOption={filters.sort}
          onNearbyToggle={setNearby}
          onFollowingToggle={setFollowing}
          onSortChange={setSort}
        />
        <div className="space-y-4 p-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className={className}>
        <FilterBar
          nearbyEnabled={!!filters.nearby}
          followingEnabled={!!filters.following}
          sortOption={filters.sort}
          onNearbyToggle={setNearby}
          onFollowingToggle={setFollowing}
          onSortChange={setSort}
        />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-6xl mb-4">🕊️</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">No posts yet</h2>
          <p className="text-text-secondary text-center">
            {isFiltering
              ? 'Try adjusting your filters to see more posts.'
              : 'Be the first to share something!'}
          </p>
        </div>
      </div>
    );
  }

  // Posts list
  return (
    <div className={className}>
      <FilterBar
        nearbyEnabled={!!filters.nearby}
        followingEnabled={!!filters.following}
        sortOption={filters.sort}
        onNearbyToggle={setNearby}
        onFollowingToggle={setFollowing}
        onSortChange={setSort}
      />

      {/* Posts */}
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onLike={likePost}
            onDislike={dislikePost}
            onComment={handleComment}
          />
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-center text-text-tertiary text-sm">You've reached the end! 🎉</p>
        )}
      </div>
    </div>
  );
}
