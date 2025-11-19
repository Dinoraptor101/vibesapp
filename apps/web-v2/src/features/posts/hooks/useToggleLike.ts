/**
 * useToggleLike Hook - Offline Enabled
 *
 * Mutation for toggling like on posts with offline support.
 * Queues action when offline and applies optimistic updates.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useOfflineMutation } from '@/hooks/useOfflineMutation';
import { toggleLikePost } from '../api/postService';
import type { Post } from '../types';

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    action: 'toggle_like',
    mutationFn: ({ postId }: { postId: string }) => toggleLikePost(postId),
    optimisticUpdate: ({ postId }) => {
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
                const currentUserId = queryClient.getQueryData<{ id: string }>(['currentUser'])?.id;
                const userReaction = post.reactions.find((r) => r.userId === currentUserId);

                // Toggle like: add reaction if none, remove if exists
                if (userReaction?.type === 'like') {
                  // Unlike: remove reaction
                  return {
                    ...post,
                    reactions: post.reactions.filter((r) => r.userId !== currentUserId),
                    proximal_likes: Math.max(0, post.proximal_likes - 1),
                  };
                }
                // Like: add reaction
                return {
                  ...post,
                  reactions: [
                    ...post.reactions.filter((r) => r.userId !== currentUserId),
                    {
                      userId: currentUserId || '',
                      type: 'like' as const,
                      location: { lat: 0, lon: 0 }, // Will be filled by backend
                    },
                  ],
                  proximal_likes: post.proximal_likes + 1,
                };
              }),
            })),
          };
        }
      );

      // Also update single post query if it exists
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old;

        const currentUserId = queryClient.getQueryData<{ id: string }>(['currentUser'])?.id;
        const userReaction = old.reactions.find((r) => r.userId === currentUserId);

        if (userReaction?.type === 'like') {
          return {
            ...old,
            reactions: old.reactions.filter((r) => r.userId !== currentUserId),
            proximal_likes: Math.max(0, old.proximal_likes - 1),
          };
        }
        return {
          ...old,
          reactions: [
            ...old.reactions.filter((r) => r.userId !== currentUserId),
            {
              userId: currentUserId || '',
              type: 'like' as const,
              location: { lat: 0, lon: 0 },
            },
          ],
          proximal_likes: old.proximal_likes + 1,
        };
      });
    },
    onError: (error, { postId }) => {
      // Revert optimistic update on error
      console.error('Failed to toggle like:', error);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}
