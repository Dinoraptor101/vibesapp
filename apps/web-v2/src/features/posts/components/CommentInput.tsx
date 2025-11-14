/**
 * CommentInput Component
 *
 * Text input for comments with explicit submit actions.
 * Submit via Enter key or Send button (modern UX pattern).
 */

import { X, Send } from 'lucide-react';
import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  replyTo?: {
    id: string;
    username: string;
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
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
    }
  };

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue || disabled) return;

    onSubmit(trimmedValue);
    setValue(''); // Clear input after submit

    // Reset reply mode
    if (replyTo && onCancelReply) {
      onCancelReply();
    }
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
      {replyTo && (
        <div className="flex items-center justify-between px-3 py-2 bg-surface-secondary rounded-lg">
          <span className="text-sm text-text-secondary">
            Replying to <span className="text-brand font-medium">@{replyTo.username}</span>
          </span>
          <button
            type="button"
            onClick={handleCancelReply}
            className="p-1 hover:bg-surface-tertiary rounded transition-colors"
            aria-label="Cancel reply"
          >
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full px-4 py-3 pr-12 rounded-lg resize-none',
            'bg-surface text-text-primary placeholder:text-text-tertiary',
            'border-2 transition-colors',
            'focus:outline-none focus:border-brand focus:bg-surface-elevated',
            isFocused ? 'border-brand' : 'border-border hover:border-brand/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ minHeight: '44px', maxHeight: '200px' }}
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className={cn(
            'absolute bottom-2 right-2 p-2 rounded-lg transition-all',
            'hover:bg-surface-tertiary',
            value.trim() ? 'text-brand hover:scale-110' : 'text-text-tertiary cursor-not-allowed'
          )}
          aria-label="Send comment"
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

      {/* Hint text */}
      {isFocused && !replyTo && (
        <p className="text-xs text-text-tertiary px-1">
          Press Enter to send • Shift+Enter for new line
        </p>
      )}
    </div>
  );
}
