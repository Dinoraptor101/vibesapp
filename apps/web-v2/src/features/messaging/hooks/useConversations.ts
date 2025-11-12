import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { getConversations } from '../api/dmService';

/**
 * Hook to fetch all conversations for current user
 */
export const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?._id],
    queryFn: () => getConversations(user?._id || ''),
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time updates
  });
};
