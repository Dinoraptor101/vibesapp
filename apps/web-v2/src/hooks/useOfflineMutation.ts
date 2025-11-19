import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { offlineQueue } from '@/lib/offline/queue';
import { useNetworkStatus } from './useNetworkStatus';

interface OfflineMutationOptions<TData, TError, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  mutationKey?: string[];
  action: string;
  optimisticUpdate?: (variables: TVariables) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

export function useOfflineMutation<TData = unknown, TError = Error, TVariables = void>({
  mutationFn,
  mutationKey,
  action,
  optimisticUpdate,
  onSuccess,
  onError,
  onSettled,
}: OfflineMutationOptions<TData, TError, TVariables>): UseMutationResult<
  TData,
  TError,
  TVariables
> {
  const { isOnline } = useNetworkStatus();

  return useMutation<TData, TError, TVariables>({
    mutationKey,
    mutationFn: async (variables) => {
      if (isOnline) {
        return mutationFn(variables);
      }
      // Queue for offline sync
      await offlineQueue.add(action, variables);
      // Return a mock response for optimistic updates
      return null as TData;
    },
    onMutate: (variables) => {
      // Always apply optimistic update
      optimisticUpdate?.(variables);
    },
    onSuccess: (data, variables) => {
      if (isOnline) {
        onSuccess?.(data, variables);
      }
      // For offline, success will happen during sync
    },
    onError: (error, variables) => {
      // Only call onError for real network errors, not offline queueing
      if (isOnline) {
        onError?.(error, variables);
      }
    },
    onSettled: (data, error, variables) => {
      onSettled?.(data, error, variables);
    },
  });
}
