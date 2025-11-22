/**
 * CollapsibleToolbar Component
 *
 * Mobile-only wrapper for RichTextToolbar with expand/collapse functionality.
 * Toolbar slides in from the direction of the Format button.
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { RichTextToolbar } from './RichTextToolbar';

interface CollapsibleToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  buttonPosition?: 'left' | 'right';
}

export function CollapsibleToolbar({
  textareaRef,
  buttonPosition = 'left',
}: CollapsibleToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="md:hidden">
      {/* Format Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium',
          'text-text-secondary hover:text-text-primary',
          'border border-border rounded-lg',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          buttonPosition === 'right' ? 'ml-auto' : 'mr-auto'
        )}
        aria-label={isExpanded ? 'Hide formatting toolbar' : 'Show formatting toolbar'}
        aria-expanded={isExpanded}
      >
        <span>Format</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Collapsible Toolbar */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isExpanded ? 'max-h-16 opacity-100 mt-2' : 'max-h-0 opacity-0'
        )}
        style={{
          transformOrigin: buttonPosition === 'left' ? 'left top' : 'right top',
        }}
      >
        <RichTextToolbar
          textareaRef={textareaRef}
          className="rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-200"
        />
      </div>
    </div>
  );
}
