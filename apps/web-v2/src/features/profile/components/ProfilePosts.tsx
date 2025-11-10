/**
 * ProfilePosts Component
 * Displays user's posts in a grid layout with infinite scroll
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button, Spinner } from '@/components/ui-next';
import { PostCard, PostSkeleton, type Post } from '@/features/posts';
import api from '@/lib/api';

interface ProfilePostsProps {
  userId: string;
}

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
  page: number;
  totalPages: number;
}

export function ProfilePosts({ userId }: ProfilePostsProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['profile-posts', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<PostsResponse>(`/posts/user/${userId}`, {
        page: pageParam,
        limit: 12,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Failed to load posts
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <span className="text-6xl">🕊️</span>
        <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Posts Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={observerTarget} className="flex justify-center py-4">
          {isFetchingNextPage && <Spinner size="md" />}
        </div>
      )}

      {/* End Message */}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          You've reached the end! 🎉
        </p>
      )}

      {/* Background Loading Indicator */}
      {isFetching && !isFetchingNextPage && !isLoading && (
        <div className="fixed bottom-20 right-4 md:bottom-4">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
}
