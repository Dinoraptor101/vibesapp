/**
 * BackToTOC Button Component
 * Floating button that appears after scrolling past the table of contents
 * Smoothly scrolls back to the TOC when clicked
 */

import { List } from 'lucide-react';
import { smoothScrollTo } from '@/utils/documentScroll';

interface BackToTOCButtonProps {
  /** Whether to show the button */
  show: boolean;
  /** CSS selector for the TOC element (default: '[data-toc]') */
  tocSelector?: string;
  /** Offset from top in pixels (default: 80px) */
  offset?: number;
  /** Duration of scroll animation in milliseconds (default: 1000ms) */
  duration?: number;
  /** Custom className for additional styling */
  className?: string;
}

export function BackToTOCButton({
  show,
  tocSelector = '[data-toc]',
  offset = 80,
  duration = 1000,
  className = '',
}: BackToTOCButtonProps) {
  if (!show) return null;

  const handleClick = () => {
    const tocElement = document.querySelector(tocSelector);
    if (tocElement) {
      const elementPosition = tocElement.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;
      smoothScrollTo(offsetPosition, duration);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`fixed bottom-6 right-6 h-12 w-12 rounded-full bg-brand-purple text-white shadow-lg hover:bg-brand-purple-hover active:scale-95 transition-all duration-200 flex items-center justify-center z-50 ${className}`}
      aria-label="Back to Table of Contents"
    >
      <List className="h-5 w-5" />
    </button>
  );
}
