/**
 * MessageBubble Component
 * Individual message display in chat
 *
 * ZEN Animation: Slide & Fade (250ms)
 * - Your messages: slide from right
 * - Their messages: slide from left
 * - Respects prefers-reduced-motion
 */

import { Avatar } from '@/components/ui-next';
import { formatRelativeTime } from '@/lib/utils';
import type { Message } from '../api/dmService';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  otherUserAvatar?: string;
  otherUserName?: string;
  shouldAnimate?: boolean;
}

export function MessageBubble({
  message,
  isCurrentUser,
  otherUserAvatar,
  otherUserName,
  shouldAnimate = true,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${shouldAnimate ? 'animate-slide-fade-in' : ''}`}
      style={
        {
          '--slide-from': isCurrentUser ? '15px' : '-15px',
        } as React.CSSProperties
      }
      data-testid={`message-${message._id}`}
    >
      {/* Avatar (only for other user) */}
      {!isCurrentUser && <Avatar src={otherUserAvatar} alt={otherUserName || 'User'} size="sm" />}

      {/* Message Content */}
      <div
        className={`flex min-w-0 max-w-[70%] flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-2xl px-4 py-2 ${
            isCurrentUser
              ? 'bg-brand-primary text-white'
              : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
          }`}
          data-testid="message-content"
        >
          <p className="text-sm [overflow-wrap:anywhere]">{message.body}</p>
        </div>

        {/* Timestamp */}
        <span
          className="text-xs text-gray-500 dim:text-gray-450 dark:text-gray-400"
          data-testid="message-timestamp"
        >
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
