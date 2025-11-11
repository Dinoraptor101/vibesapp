/**
 * useSendDMRequest Hook
 * Sends a DM request to another user with optional message
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { DMRequest, SendDMRequestPayload } from '../types';

interface SendDMRequestParams {
  userId: string;
  message?: string;
}

export function useSendDMRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, message }: SendDMRequestParams) => {
      const payload: SendDMRequestPayload = message ? { message } : {};
      const data = await api.post<DMRequest>(`/dm-requests/${userId}`, payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate DM request status for this user
      queryClient.invalidateQueries({ queryKey: ['dm-request-status', variables.userId] });

      // Show success toast
      toast.success('DM request sent!');
    },
    onError: (error) => {
      console.error('Failed to send DM request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send DM request');
    },
  });
}
