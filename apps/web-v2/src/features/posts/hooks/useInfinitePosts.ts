/**
 * Infinite Posts Hook
 *
 * React Query hook for fetching posts with infinite scroll pagination.
 * Handles loading states, error states, and automatic refetching.
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPosts, reactToPost } from '../api/postService';
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
  likePost: (postId: string) => void;
  dislikePost: (postId: string) => void;
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

  // Mutation for liking a post
  const likeMutation = useMutation({
    mutationFn: (postId: string) => reactToPost(postId, 'like'),
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: { pages: PostsResponse[] } | undefined) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post: Post) => {
              if (post._id !== postId) return post;

              // Remove dislike if exists, add like
              const reactions = post.reactions.filter((r) => r.type !== 'dislike');
              const hasLike = reactions.some((r) => r.type === 'like');

              if (hasLike) {
                // Remove like
                return {
                  ...post,
                  reactions: reactions.filter((r) => r.type !== 'like'),
                  proximal_likes: Math.max(0, post.proximal_likes - 1),
                };
              }

              // Add like
              return {
                ...post,
                reactions: [
                  ...reactions,
                  {
                    userId: 'current-user', // Will be replaced with actual user ID
                    type: 'like' as const,
                    location: { lat: 0, lon: 0 },
                  },
                ],
                proximal_likes: post.proximal_likes + 1,
              };
            }),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, _postId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      console.error('Error liking post:', err);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Mutation for disliking a post
  const dislikeMutation = useMutation({
    mutationFn: (postId: string) => reactToPost(postId, 'dislike'),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: { pages: PostsResponse[] } | undefined) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post: Post) => {
              if (post._id !== postId) return post;

              // Remove like if exists, add dislike
              const reactions = post.reactions.filter((r) => r.type !== 'like');
              const hasDislike = reactions.some((r) => r.type === 'dislike');

              if (hasDislike) {
                // Remove dislike
                return {
                  ...post,
                  reactions: reactions.filter((r) => r.type !== 'dislike'),
                  proximal_dislikes: Math.max(0, post.proximal_dislikes - 1),
                };
              }

              // Add dislike
              return {
                ...post,
                reactions: [
                  ...reactions,
                  {
                    userId: 'current-user',
                    type: 'dislike' as const,
                    location: { lat: 0, lon: 0 },
                  },
                ],
                proximal_dislikes: post.proximal_dislikes + 1,
              };
            }),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, _postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      console.error('Error disliking post:', err);
    },
    onSettled: () => {
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
    likePost: (postId: string) => likeMutation.mutate(postId),
    dislikePost: (postId: string) => dislikeMutation.mutate(postId),
  };
}
