/**
 * useDeclineDMRequest Hook
 * Declines a DM request and triggers 2-day cooldown
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

interface DeclineDMRequestResponse {
  success: boolean;
}

export function useDeclineDMRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const data = await api.post<DeclineDMRequestResponse>(`/dm-requests/${requestId}/decline`);
      return data;
    },
    onSuccess: () => {
      // Invalidate DM requests list
      queryClient.invalidateQueries({ queryKey: ['dm-requests'] });

      // Show success toast
      toast.success('DM request declined');
    },
    onError: (error) => {
      console.error('Failed to decline DM request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to decline DM request');
    },
  });
}
