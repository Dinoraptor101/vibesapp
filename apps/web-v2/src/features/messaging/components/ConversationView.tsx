/**
 * ConversationView Component
 * Full chat interface for a conversation
 */

import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Spinner } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { useConversation } from '../hooks/useConversation';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { useSendMessage } from '../hooks/useSendMessage';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

export function ConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsRead = useRef(false);

  const { data: conversation, isLoading } = useConversation(conversationId);
  const markAsReadMutation = useMarkAsRead();
  const sendMessageMutation = useSendMessage();

  const otherUser = conversation?.otherUser;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (conversation?.messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages.length]);

  // Mark messages as read when opening conversation (only once per conversation)
  useEffect(() => {
    if (conversationId && conversation && !hasMarkedAsRead.current) {
      markAsReadMutation.mutate(conversationId);
      hasMarkedAsRead.current = true;
    }
  }, [conversationId, conversation, markAsReadMutation]);

  // Reset hasMarkedAsRead when conversationId changes
  useEffect(() => {
    return () => {
      hasMarkedAsRead.current = false;
    };
  }, [conversationId]);

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

  if (!conversation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <p className="text-gray-600 dark:text-gray-400">Conversation not found</p>
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
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={() => otherUser?._id && navigate(`/profile/${otherUser._id}`)}
          className="flex flex-1 items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={otherUser?.profilePictureUrl}
            alt={otherUser?.username || 'User'}
            size="md"
          />

          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-white">
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
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!conversation?.messages || conversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {conversation.messages.map((message, index) => (
              <MessageBubble
                key={message._id || index}
                message={message}
                isCurrentUser={message.senderId === user?._id}
                otherUserAvatar={otherUser?.profilePictureUrl}
                otherUserName={otherUser?.username}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={sendMessageMutation.isPending}
        placeholder="Type a message..."
      />
    </div>
  );
}
