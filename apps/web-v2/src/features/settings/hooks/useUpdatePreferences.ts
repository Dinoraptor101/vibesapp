/**
 * useUpdatePreferences Hook
 *
 * Mutation hook for updating notification preferences
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import api from '@/lib/api';
import type { NotificationPreferences } from './useNotificationPreferences';

export function useUpdatePreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      if (!user?.userId) {
        throw new Error('User not authenticated');
      }

      await api.patch(`/api/users/${user.userId}/notification-preferences`, preferences);
    },
    onSuccess: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ['notification-preferences', user?.userId],
      });

      console.log('Notification preferences updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update notification preferences:', error);
    },
  });
}
