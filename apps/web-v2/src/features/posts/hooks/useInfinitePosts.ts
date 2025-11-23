/**
 * Infinite Posts Hook
 *
 * React Query hook for fetching posts with infinite scroll pagination.
 * Handles loading states, error states, and automatic refetching.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts } from '../api/postService';
import type { Post, PostFilters, PostsResponse } from '../types';
import { useToggleLike } from './useToggleLike';

interface UseInfinitePostsOptions {
  filters?: PostFilters;
  limit?: number;
  enabled?: boolean;
}

interface UseInfinitePostsReturn {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  toggleLike: (postId: string) => void;
}

/**
 * Hook for fetching posts with infinite scroll
 */
export function useInfinitePosts({
  filters = {},
  limit = 20,
  enabled = true,
}: UseInfinitePostsOptions = {}): UseInfinitePostsReturn {
  // Create unique query key based on filters
  const queryKey = ['posts', 'infinite', filters];

  // Infinite query for posts
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<PostsResponse, Error>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchPosts(filters, pageParam as number, limit);
      return response;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes - posts rarely change
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });

  // Flatten all pages into single posts array
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Use polarity pattern for like toggling (optimistic update with silent error handling)
  const toggleLikeMutation = useToggleLike();

  return {
    posts,
    isLoading,
    isError,
    error: error as Error | null,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage: () => fetchNextPage(),
    refetch: () => refetch(),
    toggleLike: (postId: string) => toggleLikeMutation.mutate({ postId }),
  };
}
