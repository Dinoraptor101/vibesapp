/**
 * Messaging SSE Hook
 *
 * Listens to real-time messaging events via SSE:
 * - new-message: New message in conversation
 * - read-status: Message read status update
 *
 * Updates React Query cache to keep UI in sync
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useSSE } from '@/hooks/useSSE';
import type { Conversation, Message } from '../api/dmService';

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

/**
 * Hook to listen for real-time messaging events
 * Automatically updates React Query cache when events arrive
 */
export function useMessagingSSE(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { isConnected, addEventListener, removeEventListener } = useSSE({
    enabled: !!userId,
  });

  // Track message IDs we've already processed to prevent duplicates
  const processedMessageIds = useRef(new Set<string>());

  useEffect(() => {
    if (!userId || !isConnected) return;

    /**
     * Handle new-message event
     * Updates both conversation details and conversations list
     */
    const handleNewMessage = (event: MessageEvent) => {
      try {
        const data: NewMessageEvent = JSON.parse(event.data);
        const { conversationId, message } = data;

        // Prevent duplicate message processing
        if (message._id && processedMessageIds.current.has(message._id)) {
          console.log('[useMessagingSSE] Duplicate message ignored:', message._id);
          return;
        }

        if (message._id) {
          processedMessageIds.current.add(message._id);
          // Clean up old IDs (keep last 100)
          if (processedMessageIds.current.size > 100) {
            const ids = Array.from(processedMessageIds.current);
            processedMessageIds.current = new Set(ids.slice(-100));
          }
        }

        console.log('[useMessagingSSE] New message received:', conversationId);

        // Update conversation cache (add message to messages array)
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

        // Update conversations list cache (update lastMessage and move to top)
        queryClient.setQueryData(
          ['conversations', userId],
          (oldData: Conversation[] | undefined) => {
            if (!oldData) return oldData;

            const conversationIndex = oldData.findIndex((c) => c._id === conversationId);
            if (conversationIndex === -1) {
              // New conversation, refetch
              queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
              return oldData;
            }

            // Update conversation and move to top
            const updatedConversation = {
              ...oldData[conversationIndex],
              lastMessage: message,
              updatedAt: new Date(),
              // Increment unread count if message is from other user
              unreadCount:
                message.senderId !== userId
                  ? (oldData[conversationIndex].unreadCount || 0) + 1
                  : oldData[conversationIndex].unreadCount || 0,
            };

            const newConversations = [...oldData];
            newConversations.splice(conversationIndex, 1);
            newConversations.unshift(updatedConversation);

            return newConversations;
          }
        );
      } catch (error) {
        console.error('[useMessagingSSE] Error handling new-message:', error);
      }
    };

    /**
     * Handle read-status event
     * Updates message read status in conversation
     */
    const handleReadStatus = (event: MessageEvent) => {
      try {
        const data: ReadStatusEvent = JSON.parse(event.data);
        const { conversationId, userId: readByUserId, messageIds } = data;

        console.log('[useMessagingSSE] Read status update:', conversationId, messageIds.length);

        // Update conversation cache (mark messages as read)
        queryClient.setQueryData(
          ['conversation', conversationId],
          (oldData: Conversation | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              messages: oldData.messages.map((msg) =>
                messageIds.includes(msg._id || '')
                  ? {
                      ...msg,
                      readBy: [...(msg.readBy || []), readByUserId],
                    }
                  : msg
              ),
            };
          }
        );

        // Update conversations list cache (reset unread count if current user read)
        if (readByUserId === userId) {
          queryClient.setQueryData(
            ['conversations', userId],
            (oldData: Conversation[] | undefined) => {
              if (!oldData) return oldData;

              return oldData.map((conv) =>
                conv._id === conversationId
                  ? {
                      ...conv,
                      unreadCount: 0,
                    }
                  : conv
              );
            }
          );
        }
      } catch (error) {
        console.error('[useMessagingSSE] Error handling read-status:', error);
      }
    };

    // Register event handlers
    addEventListener('new-message', handleNewMessage);
    addEventListener('read-status', handleReadStatus);

    // Cleanup
    return () => {
      removeEventListener('new-message', handleNewMessage);
      removeEventListener('read-status', handleReadStatus);
    };
  }, [userId, isConnected, addEventListener, removeEventListener, queryClient]);

  return {
    isConnected,
  };
}
