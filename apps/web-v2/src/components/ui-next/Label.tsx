import type React from 'react';
import { forwardRef } from 'react';

/**
 * Label Component
 *
 * Accessible form label with optional required indicator.
 * Use with Input, Textarea, or any form element.
 *
 * @example
 * // Basic usage
 * <Label htmlFor="email">Email Address</Label>
 *
 * @example
 * // Required field
 * <Label htmlFor="password" required>Password</Label>
 *
 * @example
 * // With description
 * <Label htmlFor="bio">
 *   Bio
 *   <span className="text-xs text-gray-500 ml-2">(Optional)</span>
 * </Label>
 */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Marks the label as required with a red asterisk
   * @default false
   */
  required?: boolean;
}

/**
 * Label Component
 *
 * Semantic label for form inputs with proper accessibility.
 * Automatically associates with form elements via htmlFor prop.
 *
 * **Accessibility Features:**
 * - Semantic HTML label element
 * - Required indicator for screen readers
 * - Proper association with form controls
 * - Dark mode support
 *
 * **Usage:**
 * Always use with form inputs to ensure proper accessibility.
 * The htmlFor prop should match the input's id.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, className = '', children, ...props }, ref) => {
    const baseClasses =
      'block text-sm font-medium text-light-text-primary dark:text-dark-text-primary';

    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: This is a standalone label component that will be associated with inputs by the consumer
      <label ref={ref} className={`${baseClasses} ${className}`} {...props}>
        {children}
        {required && <span className="text-error ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;
