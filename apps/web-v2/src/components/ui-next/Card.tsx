import type React from 'react';
import { forwardRef } from 'react';

/**
 * Card Component
 *
 * A flexible container component with composable sub-components for building
 * various card layouts. Supports hover effects, clickable variants, and full dark mode.
 *
 * @example
 * // Basic card
 * <Card>
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content goes here</p>
 *   </CardContent>
 * </Card>
 *
 * @example
 * // Clickable card with hover effect
 * <Card hoverable onClick={() => console.log('clicked')}>
 *   <CardContent>Click me!</CardContent>
 * </Card>
 *
 * @example
 * // Full card with all sections
 * <Card>
 *   <CardHeader>
 *     <h3>Post Title</h3>
 *     <p className="text-sm text-gray-500">2 hours ago</p>
 *   </CardHeader>
 *   <CardContent>
 *     <img src="/image.jpg" alt="Post" />
 *     <p>Post description</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Like</Button>
 *     <Button>Share</Button>
 *   </CardFooter>
 * </Card>
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card content (typically CardHeader, CardContent, CardFooter)
   */
  children?: React.ReactNode;

  /**
   * Enable hover lift effect and shadow enhancement
   * @default false
   */
  hoverable?: boolean;

  /**
   * Remove default padding (useful for image cards)
   * @default false
   */
  noPadding?: boolean;
}

/**
 * Card Container
 *
 * Main card component that provides the container styling and behavior.
 * Use with CardHeader, CardContent, and CardFooter sub-components for
 * consistent card layouts.
 *
 * **Features:**
 * - Composable sub-components
 * - Optional hover effects
 * - Clickable variant (cursor pointer when onClick provided)
 * - Flexible padding options
 * - Full dark mode support
 *
 * **Accessibility:**
 * - Semantic article element
 * - Keyboard navigation support
 * - Focus visible states
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hoverable = false, noPadding = false, onClick, ...props }, ref) => {
    // Base styles
    const base =
      'bg-surface-elevated rounded-lg border border-border overflow-hidden transition-all';

    // Hover effect styles
    const hoverStyles = hoverable
      ? 'shadow-sm hover:shadow-md hover:-translate-y-0.5'
      : 'shadow-sm';

    // Clickable styles
    const clickableStyles = onClick ? 'cursor-pointer' : '';

    // Padding styles
    const paddingStyles = noPadding ? '' : 'p-6';

    // Focus styles for keyboard navigation
    const focusStyles = onClick
      ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
      : '';

    // Combine all classes
    const cardClasses = `${base} ${hoverStyles} ${clickableStyles} ${paddingStyles} ${focusStyles} ${className}`;

    // Use div or article based on whether it's clickable
    const Component = onClick ? 'div' : 'article';

    return (
      <Component
        ref={ref}
        className={cardClasses}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader Component
 *
 * Header section of a card, typically containing title and metadata.
 * Includes bottom border for visual separation.
 *
 * @example
 * <CardHeader>
 *   <h3 className="text-lg font-semibold">Card Title</h3>
 *   <p className="text-sm text-gray-500">Subtitle or metadata</p>
 * </CardHeader>
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    const headerClasses = `px-6 py-4 border-b border-border ${className}`;

    return (
      <div ref={ref} className={headerClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * CardContent Component
 *
 * Main content area of the card.
 * Provides consistent padding and spacing.
 *
 * @example
 * <CardContent>
 *   <p>Main card content goes here</p>
 * </CardContent>
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;

  /**
   * Remove default padding
   * @default false
   */
  noPadding?: boolean;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '', noPadding = false, ...props }, ref) => {
    const paddingClass = noPadding ? '' : 'p-6';
    const contentClasses = `${paddingClass} ${className}`;

    return (
      <div ref={ref} className={contentClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * CardFooter Component
 *
 * Footer section of the card, typically for actions or additional metadata.
 * Includes top border for visual separation.
 *
 * @example
 * <CardFooter>
 *   <Button variant="ghost">Cancel</Button>
 *   <Button>Save</Button>
 * </CardFooter>
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    const footerClasses = `px-6 py-4 border-t border-border flex items-center gap-2 ${className}`;

    return (
      <div ref={ref} className={footerClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
