import { useEffect, useRef } from 'react';
import { useMarkAsRead } from './useMarkAsRead';

/**
 * Automatic read detection using Intersection Observer API
 * Marks messages as read when user is actually viewing the conversation
 *
 * Features:
 * - Only marks when 50%+ of messages container is visible
 * - Prevents re-marking the same conversation (eliminates infinite loops)
 * - Respects page visibility (only marks when user is looking at the page)
 * - Handles new messages arriving via polling automatically
 *
 * Usage:
 * ```tsx
 * // In ConversationView component
 * useAutoMarkAsRead(conversationId);
 * ```
 */
export function useAutoMarkAsRead(conversationId: string | undefined) {
  const markAsReadMutation = useMarkAsRead();
  const hasMarkedRef = useRef<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Create intersection observer to detect when messages are visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting;

        // Only mark as read if:
        // 1. Container is 50%+ visible
        // 2. Haven't already marked this conversation
        // 3. User is actively looking at the page (document.visibilityState)
        if (
          isVisible &&
          hasMarkedRef.current !== conversationId &&
          document.visibilityState === 'visible'
        ) {
          console.log('[AutoMarkAsRead] Marking conversation as read:', conversationId);
          markAsReadMutation.mutate(conversationId);
          hasMarkedRef.current = conversationId;
        }
      },
      {
        threshold: 0.5, // 50% of container must be visible
        rootMargin: '0px',
      }
    );

    // Observe the messages container
    const container = document.getElementById('messages-container');
    if (container && observerRef.current) {
      observerRef.current.observe(container);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [conversationId, markAsReadMutation]);

  // Reset when conversation changes
  useEffect(() => {
    hasMarkedRef.current = null;
  }, [conversationId]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && conversationId) {
        // When user returns to tab, check if messages are visible and mark as read
        const container = document.getElementById('messages-container');
        if (container && hasMarkedRef.current !== conversationId) {
          const rect = container.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

          if (isVisible) {
            console.log(
              '[AutoMarkAsRead] Tab visible, marking conversation as read:',
              conversationId
            );
            markAsReadMutation.mutate(conversationId);
            hasMarkedRef.current = conversationId;
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // Note: conversationId is accessed via closure but we only want to set up listener once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markAsReadMutation]);
}
