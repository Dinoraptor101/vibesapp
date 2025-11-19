/**
 * useOfflineMutation Hook
 * 
 * Wraps React Query mutations with offline support.
 * Automatically queues mutations when offline and syncs when online.
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { offlineQueue } from './offlineQueue';

interface UseOfflineMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  optimisticUpdate?: (variables: TVariables, queryClient: ReturnType<typeof useQueryClient>) => void;
  queryKeysToInvalidate?: string[][];
  actionName: string; // Unique name for the action type
}

export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  options: UseOfflineMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      if (navigator.onLine) {
        // Online: Execute immediately
        return options.mutationFn(variables);
      } else {
        // Offline: Queue for later sync
        await offlineQueue.add(options.actionName, variables);
        // Throw a special error that we'll handle silently
        throw new Error('offline_queued');
      }
    },

    onMutate: (variables) => {
      // Apply optimistic update regardless of online status
      if (options.optimisticUpdate) {
        options.optimisticUpdate(variables, queryClient);
      }
    },

    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options.queryKeysToInvalidate) {
        options.queryKeysToInvalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      
      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
    },

    onError: (error, variables) => {
      if (error.message === 'offline_queued') {
        // Silent: Action was queued successfully
        return;
      }

      // Real error: Revert optimistic update
      if (options.queryKeysToInvalidate) {
        options.queryKeysToInvalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      if (options.onError) {
        options.onError(error, variables);
      }
    },
  } as UseMutationOptions<TData, Error, TVariables>);
}
