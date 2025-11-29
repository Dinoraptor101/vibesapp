/**
 * MessageInput Component
 * Text input for sending messages with Enter to send
 * Updated to match CommentInput UX with centered send button
 */

import { Send } from 'lucide-react';
import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/cn';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 1000,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { isOnline } = useNetworkStatus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  // biome-ignore lint/correctness/useExhaustiveDependencies: message dependency is intentional for dynamic height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to recalculate
      textarea.style.height = '44px'; // Start from minHeight

      // Calculate new height capped at max
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(scrollHeight, 200);

      // Only enable scrolling if content exceeds max height
      if (scrollHeight > 200) {
        textarea.style.overflowY = 'auto';
        textarea.style.height = '200px';
      } else {
        textarea.style.overflowY = 'hidden';
        textarea.style.height = `${newHeight}px`;
      }
    }
  }, [message]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setMessage(newValue);
    }
  };

  const handleSend = () => {
    if (!isOnline) return; // Prevent sending when offline
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSend(trimmedMessage);
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift = Send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter = New line (default behavior)
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Show character count only when approaching limit (within 50 chars)
  const showCharCount = message.length > maxLength - 50;
  const charsRemaining = maxLength - message.length;

  return (
    <div className="border-t border-gray-200 dim:border-gray-600 dark:border-gray-700 bg-white dim:bg-gray-800 dark:bg-gray-900 p-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={!isOnline ? 'Connect to internet to send messages...' : placeholder}
          disabled={disabled || !isOnline}
          rows={1}
          data-testid="message-input"
          className={cn(
            'w-full px-4 py-3 pr-12 rounded-lg resize-none',
            'bg-surface text-text-primary placeholder:text-text-tertiary',
            'border-2 transition-colors',
            'focus:outline-none focus:border-brand focus:bg-surface-elevated',
            isFocused ? 'border-brand' : 'border-border hover:border-brand/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ minHeight: '44px' }}
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !isOnline || !message.trim()}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded-lg transition-all flex items-center justify-center -mt-0.5',
            'hover:bg-surface-tertiary',
            message.trim() ? 'text-brand hover:scale-110' : 'text-text-tertiary cursor-not-allowed'
          )}
          aria-label="Send message"
          title={!isOnline ? 'Connect to internet to send messages' : undefined}
          data-testid="send-message-button"
        >
          <Send className="w-5 h-5" />
        </button>

        {/* Character count (only show when approaching limit) */}
        {showCharCount && (
          <div
            className={cn(
              'absolute bottom-2 left-3 text-xs',
              charsRemaining < 20 ? 'text-error' : 'text-text-tertiary'
            )}
          >
            {charsRemaining}
          </div>
        )}
      </div>
    </div>
  );
}
