/**
 * Global SSE Component
 *
 * Single source of truth for all SSE event subscriptions.
 * Placed inside AuthProvider to initialize when user is authenticated.
 *
 * Responsibilities:
 * - Initialize SSE connection when user logs in
 * - Subscribe to all event types
 * - Update React Query cache on events
 * - Disconnect on logout
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import type { Activity } from '@/features/activity/types';
import type { Conversation, DMRequest, Message } from '@/features/messaging/api/dmService';
import { sseManager } from '@/lib/sse';

// Event type definitions
interface ActivityUpdateEvent {
  activity: Activity;
}

interface NewMessageEvent {
  conversationId: string;
  message: Message;
  senderId: string;
}

interface ReadStatusEvent {
  conversationId: string;
  userId: string;
  messageIds: string[];
}

interface DMRequestUpdateEvent {
  request: DMRequest;
  action: 'created' | 'accepted' | 'declined';
}

interface GlobalSSEProps {
  userId: string;
}

/**
 * Categorize activity for cache organization
 */
function categorizeActivity(activity: Activity): 'messages' | 'social' | 'me' {
  if (activity.type === 'dm_request' || activity.type === 'dm_message') {
    return 'messages';
  }
  if (
    activity.type === 'new_follower' ||
    activity.type === 'following_post' ||
    activity.type === 'nearby_post'
  ) {
    return 'social';
  }
  return 'me';
}

export function GlobalSSE({ userId }: GlobalSSEProps) {
  const queryClient = useQueryClient();
  const processedMessageIds = useRef(new Set<string>());

  useEffect(() => {
    console.log('[GlobalSSE] Initializing for user:', userId);

    // Connect to SSE
    sseManager.connect();

    // ========================================
    // Activity Events
    // ========================================
    const handleActivityUpdate = (data: unknown) => {
      const { activity } = data as ActivityUpdateEvent;
      console.log('[GlobalSSE] Activity update:', activity.type);

      const category = categorizeActivity(activity);

      // Update 'all' activities cache
      queryClient.setQueryData(['activities', userId, 'all'], (oldData: Activity[] | undefined) => {
        if (!oldData) return [activity];
        if (oldData.some((a) => a._id === activity._id)) return oldData;
        return [activity, ...oldData];
      });

      // Update category-specific cache
      queryClient.setQueryData(
        ['activities', userId, category],
        (oldData: Activity[] | undefined) => {
          if (!oldData) return [activity];
          if (oldData.some((a) => a._id === activity._id)) return oldData;
          return [activity, ...oldData];
        }
      );

      // Invalidate counts to refetch (computed client-side)
      queryClient.invalidateQueries({ queryKey: ['activity-counts', userId] });
      queryClient.invalidateQueries({ queryKey: ['has-unread', userId] });
    };

    // ========================================
    // Messaging Events
    // ========================================
    const handleNewMessage = (data: unknown) => {
      const { conversationId, message } = data as NewMessageEvent;

      // Deduplicate
      if (message._id && processedMessageIds.current.has(message._id)) {
        console.log('[GlobalSSE] Duplicate message ignored:', message._id);
        return;
      }
      if (message._id) {
        processedMessageIds.current.add(message._id);
        if (processedMessageIds.current.size > 100) {
          const ids = Array.from(processedMessageIds.current);
          processedMessageIds.current = new Set(ids.slice(-100));
        }
      }

      console.log('[GlobalSSE] New message in:', conversationId);

      // Update conversation detail cache
      queryClient.setQueryData(
        ['conversation', conversationId],
        (oldData: Conversation | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            messages: [...oldData.messages, message],
            lastMessage: message,
            updatedAt: new Date(),
          };
        }
      );

      // Update conversations list cache
      queryClient.setQueryData(['conversations', userId], (oldData: Conversation[] | undefined) => {
        if (!oldData) return oldData;

        const index = oldData.findIndex((c) => c._id === conversationId);
        if (index === -1) {
          queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
          return oldData;
        }

        const updated = {
          ...oldData[index],
          lastMessage: message,
          updatedAt: new Date(),
          unreadCount:
            message.senderId !== userId
              ? (oldData[index].unreadCount || 0) + 1
              : oldData[index].unreadCount || 0,
        };

        const newList = [...oldData];
        newList.splice(index, 1);
        newList.unshift(updated);
        return newList;
      });
    };

    const handleReadStatus = (data: unknown) => {
      const { conversationId, userId: readByUserId, messageIds } = data as ReadStatusEvent;
      console.log('[GlobalSSE] Read status:', conversationId, messageIds.length);

      // Update conversation messages
      queryClient.setQueryData(
        ['conversation', conversationId],
        (oldData: Conversation | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            messages: oldData.messages.map((msg) =>
              messageIds.includes(msg._id || '')
                ? { ...msg, readBy: [...(msg.readBy || []), readByUserId] }
                : msg
            ),
          };
        }
      );

      // Reset unread count if current user read
      if (readByUserId === userId) {
        queryClient.setQueryData(
          ['conversations', userId],
          (oldData: Conversation[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map((conv) =>
              conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
            );
          }
        );
      }
    };

    // ========================================
    // DM Request Events
    // ========================================
    const handleDMRequestUpdate = (data: unknown) => {
      const { request, action } = data as DMRequestUpdateEvent;
      console.log('[GlobalSSE] DM request:', action, request._id);

      queryClient.setQueryData(['dm-requests'], (oldData: DMRequest[] | undefined) => {
        if (!oldData) {
          return action === 'created' ? [request] : [];
        }

        if (action === 'created') {
          if (oldData.some((r) => r._id === request._id)) return oldData;
          return [request, ...oldData];
        }

        if (action === 'accepted' || action === 'declined') {
          return oldData.filter((r) => r._id !== request._id);
        }

        return oldData;
      });

      // Refresh conversations if accepted
      if (action === 'accepted') {
        queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
      }

      // Invalidate status caches
      queryClient.invalidateQueries({ queryKey: ['dm-request-status'] });
    };

    // ========================================
    // Subscribe to all events
    // ========================================
    sseManager.addEventListener('activity-update', handleActivityUpdate);
    sseManager.addEventListener('new-message', handleNewMessage);
    sseManager.addEventListener('read-status', handleReadStatus);
    sseManager.addEventListener('dm-request-update', handleDMRequestUpdate);

    console.log('[GlobalSSE] All event listeners attached');

    // Cleanup on unmount (logout)
    return () => {
      console.log('[GlobalSSE] Cleaning up');
      sseManager.removeEventListener('activity-update', handleActivityUpdate);
      sseManager.removeEventListener('new-message', handleNewMessage);
      sseManager.removeEventListener('read-status', handleReadStatus);
      sseManager.removeEventListener('dm-request-update', handleDMRequestUpdate);
      sseManager.disconnect();
    };
  }, [userId, queryClient]);

  // This component doesn't render anything
  return null;
}
