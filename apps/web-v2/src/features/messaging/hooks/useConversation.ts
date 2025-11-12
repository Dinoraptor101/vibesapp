import { useQuery } from '@tanstack/react-query';
import { getConversation } from '../api/dmService';

/**
 * Hook to fetch a specific conversation by ID
 */
export const useConversation = (conversationId: string | undefined) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => {
      if (!conversationId) throw new Error('Conversation ID is required');
      return getConversation(conversationId);
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 10, // Refetch every 10 seconds for real-time messages
  });
};
