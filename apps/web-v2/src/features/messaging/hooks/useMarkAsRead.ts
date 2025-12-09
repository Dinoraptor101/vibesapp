import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markMessagesAsRead } from '../api/dmService';

/**
 * Hook to mark messages as read in a conversation
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: (_data: unknown, conversationId: string) => {
      // Invalidate conversation to refetch with updated read status
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
