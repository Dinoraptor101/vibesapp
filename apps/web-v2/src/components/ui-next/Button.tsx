import { Loader2 } from 'lucide-react';
import type React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type Size = 'sm' | 'md' | 'lg';

/**
 * Button Component
 *
 * A flexible, accessible button component with multiple variants, sizes, and states.
 * Supports loading states, icons, and full dark mode compatibility.
 *
 * @example
 * // Basic usage
 * <Button>Click me</Button>
 *
 * @example
 * // With variant and size
 * <Button variant="secondary" size="lg">Large Button</Button>
 *
 * @example
 * // With loading state
 * <Button loading={isSubmitting}>Submit</Button>
 *
 * @example
 * // With icons
 * <Button leftIcon={<Save />} rightIcon={<ChevronRight />}>
 *   Save and Continue
 * </Button>
 *
 * @example
 * // Disabled state
 * <Button disabled>Disabled</Button>
 *
 * @example
 * // Destructive action
 * <Button variant="destructive">Delete Account</Button>
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: Variant;

  /**
   * Size of the button
   * @default 'md'
   */
  size?: Size;

  /**
   * Shows loading spinner and disables the button
   * @default false
   */
  loading?: boolean;

  /**
   * Icon to display on the left side of the button text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display on the right side of the button text
   */
  rightIcon?: React.ReactNode;

  /**
   * If true, renders as full width block element
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Button Component
 *
 * Primary interactive element for user actions. Provides consistent styling,
 * accessible markup, and various states to handle different use cases.
 *
 * **Accessibility Features:**
 * - Proper ARIA attributes for disabled and loading states
 * - Keyboard navigation support
 * - Focus visible indicators
 * - Screen reader friendly loading messages
 *
 * **Visual States:**
 * - Default: Standard appearance
 * - Hover: Enhanced on mouse over
 * - Active: Pressed down visual feedback
 * - Disabled: Reduced opacity, no interaction
 * - Loading: Spinner with disabled interaction
 *
 * **Variants:**
 * - `primary`: Main call-to-action buttons (brand color)
 * - `secondary`: Secondary actions (elevated background)
 * - `ghost`: Minimal style for tertiary actions
 * - `destructive`: Dangerous actions like delete
 * - `outline`: Bordered buttons for secondary emphasis
 *
 * **Sizes:**
 * - `sm`: Compact buttons for tight spaces (32px height)
 * - `md`: Default size for most use cases (40px height)
 * - `lg`: Prominent buttons for primary actions (48px height)
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  // Base styles - common to all buttons
  const base =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  // Variant styles - different visual appearances
  const variants: Record<Variant, string> = {
    primary:
      'bg-brand text-white hover:bg-brand-600 focus-visible:ring-brand dark:bg-brand dark:hover:bg-brand-600',
    secondary:
      'bg-light-bg-elevated dark:bg-dark-bg-elevated border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-light-border/50 dark:hover:bg-dark-border/50 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600',
    ghost:
      'bg-transparent text-light-text-primary dark:text-dark-text-primary hover:bg-light-border/30 dark:hover:bg-dark-border/30 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600',
    destructive:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    outline:
      'border-2 border-brand text-brand bg-transparent hover:bg-brand/10 focus-visible:ring-brand dark:border-brand dark:text-brand dark:hover:bg-brand/10',
  };

  // Size styles - different dimensions
  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  // Icon sizes matching button sizes
  const iconSizes: Record<Size, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  // Full width styling
  const widthClass = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `${base} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

  // Button is disabled when explicitly disabled or loading
  const isDisabled = disabled || loading;

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...props}
    >
      {/* Left Icon or Loading Spinner */}
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} aria-label="Loading" />
      ) : leftIcon ? (
        <span className={`${iconSizes[size]} flex items-center justify-center`} aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}

      {/* Button Text */}
      {children}

      {/* Right Icon (hidden during loading) */}
      {!loading && rightIcon && (
        <span className={`${iconSizes[size]} flex items-center justify-center`} aria-hidden="true">
          {rightIcon}
        </span>
      )}

      {/* Screen reader only loading text */}
      {loading && <span className="sr-only">Loading...</span>}
    </button>
  );
};

export default Button;
