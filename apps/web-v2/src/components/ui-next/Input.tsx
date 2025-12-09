import { Eye, EyeOff } from 'lucide-react';
import type React from 'react';
import { forwardRef, useState } from 'react';

/**
 * Input Component
 *
 * A flexible form input with validation states, password toggle, and full accessibility.
 * Supports error/success states, disabled state, and optional helper text.
 *
 * @example
 * // Basic usage
 * <Input placeholder="Enter your username" />
 *
 * @example
 * // With label and error
 * <Input label="Email" error="Invalid email address" />
 *
 * @example
 * // Success state
 * <Input label="Username" success="Username is available!" />
 *
 * @example
 * // Password with toggle
 * <Input type="password" label="Password" showPasswordToggle />
 *
 * @example
 * // With helper text
 * <Input label="Bio" helperText="Tell us about yourself" />
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text displayed above the input
   */
  label?: string;

  /**
   * Error message displayed below the input in red
   * If boolean true, shows error styling without message
   */
  error?: string | boolean;

  /**
   * Success message displayed below the input in green
   */
  success?: string;

  /**
   * Helper text displayed below the input in muted color
   */
  helperText?: string;

  /**
   * Shows password visibility toggle for password inputs
   * @default false
   */
  showPasswordToggle?: boolean;

  /**
   * Marks the input as required with a red asterisk
   * @default false
   */
  required?: boolean;

  /**
   * Additional wrapper class name
   */
  wrapperClassName?: string;
}

/**
 * Input Component
 *
 * Accessible form input with comprehensive validation states and features:
 * - Error/Success states with visual feedback
 * - Password visibility toggle
 * - Helper text support
 * - Required field indicator
 * - Full dark mode support
 * - Focus ring indicators
 *
 * **Accessibility Features:**
 * - Proper label association with htmlFor/id
 * - ARIA attributes for validation states
 * - Required field indicators
 * - Error/success announcements for screen readers
 *
 * **Visual States:**
 * - Default: Standard border
 * - Focus: Brand color ring
 * - Error: Red border and text
 * - Success: Green border and text
 * - Disabled: Reduced opacity, no interaction
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      showPasswordToggle = false,
      required = false,
      wrapperClassName = '',
      className = '',
      type = 'text',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalId] = useState(
      () => id || `input-${Math.random().toString(36).substring(2, 9)}`
    );

    // Determine input type (toggle for password)
    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Base styles
    const base =
      'w-full px-4 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0';

    // Background and text colors
    const colorClasses = 'bg-surface text-text-primary placeholder:text-text-secondary';

    // Border states
    const borderClasses = error
      ? 'border-2 border-error focus:ring-error/50'
      : success
        ? 'border-2 border-success focus:ring-success/50'
        : 'border border-border focus:ring-brand focus:border-brand';

    // Disabled state
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    // Combine all classes
    const inputClasses = `${base} ${colorClasses} ${borderClasses} ${disabledClasses} ${className}`;

    // Determine feedback message and styling
    const feedbackMessage = (typeof error === 'string' && error) || success || helperText;
    const feedbackColor = error ? 'text-error' : success ? 'text-success' : 'text-text-secondary';

    return (
      <div className={wrapperClassName}>
        {/* Label */}
        {label && (
          <label
            htmlFor={internalId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        {/* Input with optional password toggle */}
        <div className="relative">
          <input
            ref={ref}
            id={internalId}
            type={inputType}
            disabled={disabled}
            required={required}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={feedbackMessage ? `${internalId}-feedback` : undefined}
            {...props}
          />

          {/* Password Toggle Button */}
          {type === 'password' && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <p
            id={`${internalId}-feedback`}
            className={`text-xs mt-1.5 ${feedbackColor}`}
            role={error ? 'alert' : 'status'}
          >
            {feedbackMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
