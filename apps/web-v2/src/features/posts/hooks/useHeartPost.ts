/**
 * useHeartPost Hook
 * 
 * Handles hearting/unhearting posts with offline support.
 * Uses optimistic UI updates and queues actions when offline.
 */

import { useOfflineMutation } from '@/lib/useOfflineMutation';
import { toggleLikePost } from '../api/postService';

interface HeartPostVariables {
  postId: string;
}

export function useHeartPost() {
  return useOfflineMutation<unknown, HeartPostVariables>({
    actionName: 'heartPost',
    
    mutationFn: async ({ postId }) => {
      return toggleLikePost(postId);
    },

    optimisticUpdate: () => {
      // Update will be handled by query invalidation
      // Optimistic updates for posts feed can be complex due to nested structure
      // So we'll rely on the backend response and query invalidation
    },

    queryKeysToInvalidate: [['post'], ['posts']],
  });
}
