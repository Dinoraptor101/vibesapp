/**
 * Hook for ending (closing) a conversation
 * Sets conversation status to 'closed' - conversation becomes archived but visible
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeConversation } from '../api/dmService';

export function useEndConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => closeConversation(conversationId),
    onSuccess: () => {
      // Invalidate conversations list to show updated status
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });

      // Invalidate DM request status so profile pages show correct button state
      // (enables "Send DM Request" instead of navigating to closed conversation)
      queryClient.invalidateQueries({ queryKey: ['dm-request-status'] });
    },
    onError: (error) => {
      console.error('Failed to end conversation:', error);
    },
  });
}
