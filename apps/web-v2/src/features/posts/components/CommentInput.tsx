/**
 * CommentInput Component
 *
 * Text input for comments with explicit submit actions.
 * Submit via Enter key or Send button (modern UX pattern).
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/cn';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  replyTo?: {
    id: string;
    userName: string;
  };
  onCancelReply?: () => void;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export function CommentInput({
  onSubmit,
  placeholder = 'Add a comment...',
  replyTo,
  onCancelReply,
  disabled = false,
  maxLength = 500,
  className,
}: CommentInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { isOnline } = useNetworkStatus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when in reply mode
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  // Auto-resize textarea based on content
  // biome-ignore lint/correctness/useExhaustiveDependencies: value dependency is intentional for dynamic height
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
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
    }
  };

  const handleSubmit = () => {
    if (!isOnline) return; // Prevent submission when offline
    const trimmedValue = value.trim();
    if (!trimmedValue || disabled) return;

    onSubmit(trimmedValue);
    setValue(''); // Clear input after submit
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift = Submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Shift+Enter = New line (default behavior)
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleCancelReply = () => {
    setValue('');
    onCancelReply?.();
  };

  // Show character count only when approaching limit (within 50 chars)
  const showCharCount = value.length > maxLength - 50;
  const charsRemaining = maxLength - value.length;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Reply indicator */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center justify-between px-3 py-2 bg-surface-secondary rounded-lg"
          >
            <span className="text-sm text-text-secondary">
              Replying to <span className="text-brand font-medium">@{replyTo.userName}</span>
            </span>
            <motion.button
              type="button"
              onClick={handleCancelReply}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 hover:bg-surface-tertiary rounded transition-colors"
              aria-label="Cancel reply"
            >
              <X className="w-4 h-4 text-text-tertiary" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={!isOnline ? 'Connect to internet to comment...' : placeholder}
          disabled={disabled || !isOnline}
          rows={1}
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
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !isOnline || !value.trim()}
          whileHover={value.trim() ? { scale: 1.1 } : {}}
          whileTap={value.trim() ? { scale: 0.9 } : {}}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded-lg transition-all flex items-center justify-center -mt-0.5',
            'hover:bg-surface-tertiary',
            value.trim() ? 'text-brand' : 'text-text-tertiary cursor-not-allowed'
          )}
          aria-label="Send comment"
          title={!isOnline ? 'Connect to internet to comment' : undefined}
        >
          <Send className="w-5 h-5" />
        </motion.button>

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
