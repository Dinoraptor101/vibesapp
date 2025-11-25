/**
 * useAcceptDMRequest Hook
 * Accepts a DM request and creates a conversation
 * Uses polarity pattern: optimistic update with silent error handling
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface AcceptDMRequestResponse {
  success: boolean;
  conversationId: string;
}

export function useAcceptDMRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const data = await api.post<AcceptDMRequestResponse>(`/dm-requests/${requestId}/accept`);
      return data;
    },
    onSuccess: () => {
      // Invalidate DM requests list
      queryClient.invalidateQueries({ queryKey: ['dm-requests'] });

      // Invalidate conversations list (for Phase 4.4)
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      // Polarity pattern: silent error handling, console log only
      console.error('Failed to accept DM request:', error);
    },
  });
}
