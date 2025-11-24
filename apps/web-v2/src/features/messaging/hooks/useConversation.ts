import { useQuery } from '@tanstack/react-query';
import { getConversation } from '../api/dmService';

/**
 * Hook to fetch a specific conversation by ID
 * Backend automatically determines which user is the "other" user based on auth
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
    refetchInterval: 1000 * 30, // Refetch every 30 seconds (was 10s)
    refetchIntervalInBackground: false, // Stop polling when tab hidden
    retry: 1, // Only retry once on failure
    retryDelay: 5000, // Wait 5s before retry
  });
};
