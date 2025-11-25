/**
 * useDMRequestStatus Hook
 * Checks if user can send DM request (checks for pending/declined status and cooldown)
 */

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DMRequestStatusResponse } from '../types';

export function useDMRequestStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ['dm-request-status', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const data = await api.get<DMRequestStatusResponse>(`/dm-requests/status/${userId}`);
      return data;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
