/**
 * useDeclineDMRequest Hook
 * Declines a DM request and triggers 2-day cooldown
 * Uses polarity pattern: optimistic update with silent error handling
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface DeclineDMRequestResponse {
  success: boolean;
}

export function useDeclineDMRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const data = await api.post<DeclineDMRequestResponse>(
        `/api/dm-requests/${requestId}/decline`
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate DM requests list
      queryClient.invalidateQueries({ queryKey: ['dm-requests'] });
    },
    onError: (error) => {
      // Polarity pattern: silent error handling, console log only
      console.error('Failed to decline DM request:', error);
    },
  });
}
