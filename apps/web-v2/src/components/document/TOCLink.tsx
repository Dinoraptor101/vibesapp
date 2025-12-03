/**
 * TOCLink Component
 * Clickable table of contents link with smooth scrolling
 */

import { handleTOCClick } from '@/utils/documentScroll';

interface TOCLinkProps {
  /** The ID of the section to scroll to */
  sectionId: string;
  /** The display text for the link */
  children: React.ReactNode;
  /** Offset from top in pixels (default: 80px) */
  offset?: number;
  /** Duration of scroll animation in milliseconds (default: 1000ms) */
  duration?: number;
  /** Custom className for additional styling */
  className?: string;
}

/**
 * Clickable link for table of contents that smoothly scrolls to a section
 * Handles offset for fixed navigation bars and updates URL hash
 */
export function TOCLink({
  sectionId,
  children,
  offset = 80,
  duration = 1000,
  className = 'text-gray-700 dim:text-gray-300 dark:text-gray-300 hover:text-brand-600 dim:hover:text-brand-500 dark:hover:text-brand-400 hover:underline cursor-pointer',
}: TOCLinkProps) {
  return (
    <a
      href={`#${sectionId}`}
      onClick={(e) => handleTOCClick(e, sectionId, offset, duration)}
      className={className}
    >
      {children}
    </a>
  );
}
