/**
 * ProfilePosts Component
 * Displays user's posts in a grid layout with infinite scroll
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui-next';
import { PostsGrid, PostSkeleton, type Post } from '@/features/posts';
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
  const [showLoading, setShowLoading] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['profile-posts', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<PostsResponse>('/api/posts', {
        userId,
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

  // ZEN: Wait 1 second before showing loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoading(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading]);

  // ZEN: Log errors to console only, never show to user
  useEffect(() => {
    if (isError && error) {
      console.error('Profile posts fetch error:', error);
    }
  }, [isError, error]);

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

  // ZEN: Show loading only after 1 second
  if (isLoading && showLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  // ZEN: If no posts, show nothing (Transparency)
  if (!data || posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Posts Grid - Shared component for consistent layout */}
      <PostsGrid posts={posts} />

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={observerTarget} className="flex justify-center py-4">
          {isFetchingNextPage && <Spinner size="md" />}
        </div>
      )}

      {/* End Message */}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-sm text-gray-500 dim:text-gray-400 dark:text-gray-400">
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
