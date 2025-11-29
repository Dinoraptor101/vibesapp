/**
 * useToggleLike Hook
 *
 * Mutation for toggling like on posts with optimistic updates.
 * Prevents duplicate mutations by tracking pending state.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { getCookie } from '@/lib/api';
import { toggleLikePost } from '../api/postService';
import type { Post } from '../types';

export function useToggleLike() {
  const queryClient = useQueryClient();
  const pendingMutations = useRef<Set<string>>(new Set());

  return useMutation({
    mutationFn: ({ postId }: { postId: string }) => {
      // Prevent duplicate mutations for the same post
      if (pendingMutations.current.has(postId)) {
        return Promise.reject(new Error('Mutation already in progress'));
      }
      pendingMutations.current.add(postId);
      return toggleLikePost(postId);
    },
    onMutate: ({ postId }) => {
      // Get current user ID from cookie (not from query cache)
      const currentUserId = getCookie('userId');
      if (!currentUserId) {
        console.error('Cannot toggle like: User not authenticated');
        return;
      }

      // Update all posts queries with optimistic like toggle
      queryClient.setQueriesData<{ pages: Array<{ posts: Post[] }> }>(
        { queryKey: ['posts', 'infinite'] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => {
                if (post._id !== postId) return post;

                // Find current user's reaction
                const userReaction = post.reactions.find((r) => r.userId === currentUserId);

                // Toggle like: add reaction if none, remove if exists
                if (userReaction?.type === 'like') {
                  // Unlike: remove reaction
                  return {
                    ...post,
                    reactions: post.reactions.filter((r) => r.userId !== currentUserId),
                    proximal_likes: Math.max(0, post.proximal_likes - 1),
                    likeCount: Math.max(0, (post.likeCount ?? 0) - 1),
                  };
                }
                // Like: add reaction
                return {
                  ...post,
                  reactions: [
                    ...post.reactions.filter((r) => r.userId !== currentUserId),
                    {
                      userId: currentUserId,
                      type: 'like' as const,
                      location: { lat: 0, lon: 0 }, // Will be filled by backend
                    },
                  ],
                  proximal_likes: post.proximal_likes + 1,
                  likeCount: (post.likeCount ?? 0) + 1,
                };
              }),
            })),
          };
        }
      );

      // Also update single post query if it exists
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old;

        const userReaction = old.reactions.find((r) => r.userId === currentUserId);

        if (userReaction?.type === 'like') {
          return {
            ...old,
            reactions: old.reactions.filter((r) => r.userId !== currentUserId),
            proximal_likes: Math.max(0, old.proximal_likes - 1),
            likeCount: Math.max(0, (old.likeCount ?? 0) - 1),
          };
        }
        return {
          ...old,
          reactions: [
            ...old.reactions.filter((r) => r.userId !== currentUserId),
            {
              userId: currentUserId,
              type: 'like' as const,
              location: { lat: 0, lon: 0 },
            },
          ],
          proximal_likes: old.proximal_likes + 1,
          likeCount: (old.likeCount ?? 0) + 1,
        };
      });
    },
    onError: (error, { postId }) => {
      // Clear pending state
      pendingMutations.current.delete(postId);

      // Revert optimistic update on error
      console.error('Failed to toggle like:', error);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onSuccess: (_data, { postId }) => {
      // Clear pending state on success
      pendingMutations.current.delete(postId);

      // Invalidate queries to get fresh data with updated likeCount from backend
      // This ensures UI reflects the actual API response (no optimistic updates for counts)
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onSettled: (_data, _error, { postId }) => {
      // Ensure pending state is always cleared
      pendingMutations.current.delete(postId);
    },
  });
}
