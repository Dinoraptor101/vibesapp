/**
 * useAccountUpdates Hook
 * 
 * Handles auto-save for account settings with:
 * - Debounced batch updates (300ms)
 * - Silent success/error handling
 * - Optimistic UI updates
 */

import { useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';

interface AccountUpdate {
  avatar?: string;
  bio?: string;
  mbti?: string;
  zipCode?: string;
  location?: { lat: number; lon: number };
  polarity?: 'YIN' | 'YANG';
  proximityRange?: number;
}

export function useAccountUpdates() {
  const { user, refreshUser } = useAuth();
  const updateQueue = useRef<AccountUpdate>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Queue an account update with debounced batch sending
   */
  const queueUpdate = useCallback(
    (changes: AccountUpdate) => {
      // Add changes to queue
      updateQueue.current = {
        ...updateQueue.current,
        ...changes,
      };

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule batch update after 300ms
      timeoutRef.current = setTimeout(async () => {
        const updates = { ...updateQueue.current };
        updateQueue.current = {}; // Clear queue

        try {
          // Send batch update to API
          await api.patch(`/users/${user?._id}`, updates);
          
          // Refresh user data silently
          await refreshUser();
        } catch (error) {
          console.error('Failed to update account:', error);
          // Silent fail - UI already shows optimistic update
          // Could revert optimistic update here if needed
        }
      }, 300);
    },
    [user, refreshUser]
  );

  return { queueUpdate };
}
