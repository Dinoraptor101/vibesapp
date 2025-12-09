/**
 * ConversationView Component
 * Full chat interface for a conversation
 *
 * Phase 4.6 Update:
 * - Uses unified polling (useMessagingPolling)
 * - Automatic visibility-based read detection (useAutoMarkAsRead)
 * - SSE updates handled globally by GlobalSSE
 */

import { ArrowLeft, Ban, MessageSquareDashed } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Spinner } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { useAutoMarkAsRead } from '../hooks/useAutoMarkAsRead';
import { useEndConversation } from '../hooks/useEndConversation';
import { useMessagingPolling } from '../hooks/useMessagingPolling';
import { useSendMessage } from '../hooks/useSendMessage';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

export function ConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  // Unified polling - automatically manages queries based on URL
  // SSE updates are handled globally by GlobalSSE component in AuthContext
  const { activeConversation, isLoading } = useMessagingPolling();

  // Automatic read detection - marks as read when user is viewing
  useAutoMarkAsRead(conversationId);

  const sendMessageMutation = useSendMessage();
  const endConversationMutation = useEndConversation();

  // Hold-to-confirm state for ending conversation
  const [endProgress, setEndProgress] = useState(0);
  const endTimerRef = useRef<number | null>(null);
  const endIntervalRef = useRef<number | null>(null);

  const otherUser = activeConversation?.otherUser;
  const isConversationClosed = activeConversation?.status === 'closed';

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeConversation?.messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      // Update previous count after render
      previousMessageCountRef.current = activeConversation.messages.length;
    }
  }, [activeConversation?.messages.length]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
      if (endIntervalRef.current) clearInterval(endIntervalRef.current);
    };
  }, []);

  // Hold-to-confirm handlers for ending conversation
  const handleEndMouseDown = () => {
    if (endConversationMutation.isPending || !conversationId) return;

    setEndProgress(0);
    const startTime = Date.now();
    const holdDuration = 2000; // 2 seconds

    endIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / holdDuration) * 100, 100);
      setEndProgress(progress);
    }, 50);

    endTimerRef.current = window.setTimeout(() => {
      if (endIntervalRef.current) clearInterval(endIntervalRef.current);
      setEndProgress(100);
      endConversationMutation.mutate(conversationId);
    }, holdDuration);
  };

  const handleEndMouseUp = () => {
    if (endTimerRef.current) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
    if (endIntervalRef.current) {
      clearInterval(endIntervalRef.current);
      endIntervalRef.current = null;
    }
    setEndProgress(0);
  };

  const handleSendMessage = (body: string) => {
    if (!conversationId) return;

    sendMessageMutation.mutate({
      conversationId,
      body,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!activeConversation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-white dim:bg-gray-800 dark:bg-gray-900">
        <p className="text-gray-600 dim:text-gray-400 dark:text-gray-400">Conversation not found</p>
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="text-sm text-brand-primary hover:underline"
        >
          Back to messages
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative h-dvh bg-white dim:bg-gray-800 dark:bg-gray-900 overscroll-y-contain"
      data-testid="conversation-view"
    >
      {/* Header - Fixed at top with glass blur */}
      <div
        className="fixed top-0 left-0 right-0 z-10 flex items-center gap-3 border-b border-border glass px-4 py-3"
        data-testid="conversation-header"
      >
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="text-gray-600 hover:text-gray-900 dim:text-gray-500 dim:hover:text-gray-100 dark:text-gray-400 dark:hover:text-white"
          data-testid="conversation-back-button"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={() => otherUser?.userId && navigate(`/profile/${otherUser.userId}`)}
          className="flex flex-1 items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={otherUser?.profilePictureUrl}
            alt={otherUser?.username || 'User'}
            size="md"
            data-testid="conversation-avatar"
          />

          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h2
                className="font-semibold text-gray-900 dim:text-gray-100 dark:text-white"
                data-testid="conversation-username"
              >
                {otherUser?.username || 'Unknown'}
              </h2>
              {otherUser?.mbtiPersonality && (
                <Badge variant="brand" size="sm">
                  {otherUser.mbtiPersonality}
                </Badge>
              )}
            </div>
          </div>
        </button>

        {/* End Conversation Button - Only show for active conversations */}
        {!isConversationClosed && (
          <button
            type="button"
            onMouseDown={handleEndMouseDown}
            onMouseUp={handleEndMouseUp}
            onMouseLeave={handleEndMouseUp}
            onTouchStart={handleEndMouseDown}
            onTouchEnd={handleEndMouseUp}
            className={`relative flex h-10 items-center rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
              endProgress > 0 ? 'w-32 pl-3 pr-2 justify-end' : 'w-10 justify-center'
            }`}
            disabled={endConversationMutation.isPending}
            aria-label="Hold to end conversation"
            data-testid="end-conversation-button"
          >
            {/* Text and Icon */}
            <div className="flex items-center gap-2 relative z-10">
              {endProgress > 0 && (
                <span className="text-sm font-medium text-white whitespace-nowrap animate-in fade-in duration-150">
                  End Convo?
                </span>
              )}
              <Ban className="h-6 w-6 text-white flex-shrink-0" />
            </div>
            {/* Circular progress indicator - positioned to stay with icon */}
            {endProgress > 0 && (
              <div className="absolute right-0 top-0 w-10 h-10">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${endProgress} 100`}
                    className="text-red-900 opacity-60"
                  />
                </svg>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Messages - IMPORTANT: id="messages-container" for Intersection Observer */}
      {/* pt-16 accounts for fixed header (~60px), pb-20 accounts for fixed footer (~76px) */}
      <div
        id="messages-container"
        className="h-full space-y-4 overflow-y-auto overscroll-contain px-4 pt-16 pb-20"
      >
        {!activeConversation?.messages || activeConversation.messages.length === 0 ? (
          <div className="flex h-[calc(100dvh-200px)] items-center justify-center text-center">
            <MessageSquareDashed className="w-12 h-12 text-gray-300 dim:text-gray-600 dark:text-gray-600" />
          </div>
        ) : (
          <>
            {activeConversation.messages.map((message, index) => {
              // Only animate new messages (those added since last render)
              const shouldAnimate = index >= previousMessageCountRef.current;
              return (
                <MessageBubble
                  key={message._id || `temp-${index}`}
                  message={message}
                  isCurrentUser={message.senderId === user?._id}
                  otherUserAvatar={otherUser?.profilePictureUrl}
                  otherUserName={otherUser?.username}
                  shouldAnimate={shouldAnimate}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Archived Banner or Message Input - Fixed at bottom with glass blur */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        {isConversationClosed ? (
          <div className="border-t border-border bg-yellow-50/95 dim:bg-yellow-900/80 dark:bg-yellow-900/70 backdrop-blur-md">
            <div className="p-4">
              <div className="flex items-start gap-2 text-sm text-yellow-800 dim:text-yellow-200 dark:text-yellow-200">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-medium">This conversation has ended</p>
                  <p className="text-xs mt-1 text-yellow-700 dim:text-yellow-300 dark:text-yellow-300">
                    You can view the message history, but cannot send new messages. To reconnect,
                    send a new DM request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <MessageInput
            onSend={handleSendMessage}
            disabled={sendMessageMutation.isPending}
            placeholder="Type a message..."
          />
        )}
      </div>
    </div>
  );
}
