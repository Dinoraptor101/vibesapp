/**
 * useDMRequests Hook
 * Fetches pending DM requests received by current user
 */

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DMRequestsResponse } from '../types';

export function useDMRequests() {
  return useQuery({
    queryKey: ['dm-requests'],
    queryFn: async () => {
      const data = await api.get<DMRequestsResponse>('/dm-requests');
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
}
