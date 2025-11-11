/**
 * useAcceptDMRequest Hook
 * Accepts a DM request and creates a conversation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

      // Show success toast
      toast.success('DM request accepted!');
    },
    onError: (error) => {
      console.error('Failed to accept DM request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept DM request');
    },
  });
}
