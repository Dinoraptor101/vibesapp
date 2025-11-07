import { cn } from '@/lib/cn';
import type React from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';

/**
 * Textarea Component
 *
 * A flexible textarea with auto-resize, character counter, and validation states.
 * Supports error/success feedback and optional character limits.
 *
 * @example
 * // Basic usage
 * <Textarea placeholder="Write something..." />
 *
 * @example
 * // With character counter
 * <Textarea label="Bio" maxLength={200} showCharCount />
 *
 * @example
 * // With auto-resize
 * <Textarea label="Message" autoResize />
 *
 * @example
 * // With error state
 * <Textarea label="Description" error="Description is required" />
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label text displayed above the textarea
   */
  label?: string;

  /**
   * Error message displayed below the textarea in red
   * If boolean true, shows error styling without message
   */
  error?: string | boolean;

  /**
   * Success message displayed below the textarea in green
   */
  success?: string;

  /**
   * Helper text displayed below the textarea in muted color
   */
  helperText?: string;

  /**
   * Show character counter when approaching maxLength
   * Counter appears at 90% of maxLength by default
   * @default false
   */
  showCharCount?: boolean;

  /**
   * Threshold (0-1) at which to show character counter
   * @default 0.9 (90% of maxLength)
   */
  charCountThreshold?: number;

  /**
   * Automatically resize height based on content
   * @default false
   */
  autoResize?: boolean;

  /**
   * Marks the textarea as required with a red asterisk
   * @default false
   */
  required?: boolean;

  /**
   * Additional wrapper class name
   */
  wrapperClassName?: string;
}

/**
 * Textarea Component
 *
 * Multi-line text input with advanced features:
 * - Auto-resize based on content
 * - Character counter (shows near limit)
 * - Error/Success states
 * - Helper text support
 * - Required field indicator
 * - Full dark mode support
 *
 * **Accessibility Features:**
 * - Proper label association
 * - ARIA attributes for validation
 * - Character count announcements
 * - Required field indicators
 *
 * **Character Counter:**
 * - Only shows when approaching limit (90% by default)
 * - Turns red when over limit
 * - Configurable threshold
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      showCharCount = false,
      charCountThreshold = 0.9,
      autoResize = false,
      required = false,
      wrapperClassName = '',
      className = '',
      id,
      disabled,
      maxLength,
      value,
      onChange,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const [internalId] = useState(
      () => id || `textarea-${Math.random().toString(36).substring(2, 9)}`
    );
    const [charCount, setCharCount] = useState(0);
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Update character count
    useEffect(() => {
      if (value !== undefined) {
        setCharCount(String(value).length);
      }
    }, [value]);

    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, autoResize]);

    // Handle change with auto-resize
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);

      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }

      onChange?.(e);
    };

    // Base styles
    const base =
      'w-full px-4 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none';

    // Background and text colors
    const colorClasses =
      'bg-light-bg-base dark:bg-dark-bg-base text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-secondary dark:placeholder:text-dark-text-secondary';

    // Border states
    const borderClasses = error
      ? 'border-2 border-error focus:ring-error/50'
      : success
        ? 'border-2 border-success focus:ring-success/50'
        : 'border border-light-border dark:border-dark-border focus:ring-brand focus:border-brand';

    // Disabled state
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    // Auto-resize class
    const resizeClass = autoResize ? '' : 'resize-y';

    // Combine all classes
    const textareaClasses = cn(
      base,
      colorClasses,
      borderClasses,
      disabledClasses,
      resizeClass,
      className
    );

    // Determine feedback message and styling
    const feedbackMessage = (typeof error === 'string' && error) || success || helperText;
    const feedbackColor = error
      ? 'text-error'
      : success
        ? 'text-success'
        : 'text-light-text-secondary dark:text-dark-text-secondary';

    // Character counter visibility and styling
    const showCounter = showCharCount && maxLength && charCount >= maxLength * charCountThreshold;
    const isOverLimit = maxLength && charCount > maxLength;
    const counterColor = isOverLimit
      ? 'text-error font-medium'
      : 'text-light-text-secondary dark:text-dark-text-secondary';

    return (
      <div className={wrapperClassName}>
        {/* Label */}
        {label && (
          <label
            htmlFor={internalId}
            className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1.5"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={internalId}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          rows={rows}
          className={textareaClasses}
          aria-invalid={!!error}
          aria-describedby={feedbackMessage || showCounter ? `${internalId}-feedback` : undefined}
          {...props}
        />

        {/* Feedback and Character Counter */}
        <div className="flex items-center justify-between mt-1.5 gap-2">
          {/* Feedback Message */}
          {feedbackMessage && (
            <p
              id={`${internalId}-feedback`}
              className={`text-xs ${feedbackColor}`}
              role={error ? 'alert' : 'status'}
            >
              {feedbackMessage}
            </p>
          )}

          {/* Character Counter */}
          {showCounter && (
            <p
              className={`text-xs text-right ${counterColor} transition-colors ml-auto`}
              aria-live="polite"
              aria-atomic="true"
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
