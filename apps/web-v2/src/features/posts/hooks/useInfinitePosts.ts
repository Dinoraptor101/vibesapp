/**
 * Infinite Posts Hook
 *
 * React Query hook for fetching posts with infinite scroll pagination.
 * Handles loading states, error states, and automatic refetching.
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPosts, toggleLikePost } from '../api/postService';
import type { Post, PostFilters, PostsResponse } from '../types';

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
  const queryClient = useQueryClient();

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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });

  // Flatten all pages into single posts array
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Mutation for toggling like on a post
  // Backend handles the like/unlike logic - no need to check state here
  // NOTE: Using legacy mutation - consider migrating to useToggleLike hook for offline support
  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => toggleLikePost(postId),
    onError: (err) => {
      console.error('Error toggling like:', err);
    },
    onSettled: () => {
      // Refetch to get updated state from backend
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    posts,
    isLoading,
    isError,
    error: error as Error | null,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage: () => fetchNextPage(),
    refetch: () => refetch(),
    toggleLike: (postId: string) => toggleLikeMutation.mutate(postId),
  };
}
