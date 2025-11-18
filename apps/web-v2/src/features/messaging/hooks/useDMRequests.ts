/**
 * useDMRequests Hook
 * Fetches pending DM requests received by current user
 */

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DMRequest } from '../types';

export function useDMRequests() {
  return useQuery({
    queryKey: ['dm-requests'],
    queryFn: async () => {
      // Backend returns plain array of requests
      const requests = await api.get<DMRequest[]>('/api/dm-requests');
      // Transform to match component expectations
      return {
        requests,
        count: requests.length,
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
    refetchIntervalInBackground: false, // Stop polling when tab hidden
    retry: 1, // Only retry once on failure
    retryDelay: 5000, // Wait 5s before retry
  });
}
