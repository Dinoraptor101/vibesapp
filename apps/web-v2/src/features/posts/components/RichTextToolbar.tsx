/**
 * RichTextToolbar Component
 *
 * Basic HTML formatting toolbar for article mode.
 * Supports: Bold, Underline, Bullet List, Text Alignment
 */

import { AlignCenter, AlignLeft, AlignRight, Bold, List, Underline } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

interface RichTextToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  className?: string;
}

type TextAlign = 'left' | 'center' | 'right';

export function RichTextToolbar({ textareaRef, className }: RichTextToolbarProps) {
  const [alignState, setAlignState] = useState<TextAlign>('left');

  /**
   * Insert HTML tags around selected text
   */
  const wrapSelection = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    if (selectedText) {
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = `${before}${openTag}${selectedText}${closeTag}${after}`;

      // Update textarea value
      textarea.value = newText;

      // Dispatch input event to trigger React's onChange
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);

      // Restore focus and cursor position
      textarea.focus();
      const newCursorPos = start + openTag.length + selectedText.length + closeTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  /**
   * Convert lines to bullet list
   */
  const applyBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    if (selectedText) {
      const lines = selectedText.split('\n').filter((line) => line.trim());
      const listItems = lines.map((line) => `<li>${line.trim()}</li>`).join('\n');
      const bulletList = `<ul>\n${listItems}\n</ul>`;

      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = `${before}${bulletList}${after}`;

      textarea.value = newText;

      // Dispatch input event
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);

      // Restore focus
      textarea.focus();
      const newCursorPos = start + bulletList.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  /**
   * Apply text alignment to paragraph
   */
  const applyAlignment = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Cycle through alignments: left → center → right → left
    const nextAlign: Record<TextAlign, TextAlign> = {
      left: 'center',
      center: 'right',
      right: 'left',
    };
    const newAlign = nextAlign[alignState];
    setAlignState(newAlign);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    if (selectedText) {
      const alignedText =
        newAlign === 'left'
          ? selectedText // No wrapper for left (default)
          : `<p style="text-align: ${newAlign}">${selectedText}</p>`;

      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = `${before}${alignedText}${after}`;

      textarea.value = newText;

      // Dispatch input event
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);

      // Restore focus
      textarea.focus();
      const newCursorPos = start + alignedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  const buttonClass = cn(
    'p-2 rounded hover:bg-surface-hover transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  );

  const iconClass = 'w-4 h-4 text-text-primary';

  return (
    <div
      className={cn(
        'flex items-center gap-1 p-2 border-b border-border bg-surface',
        'dim:border-gray-600 dim:bg-gray-700',
        className
      )}
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      {/* Bold */}
      <button
        type="button"
        onClick={() => wrapSelection('<b>', '</b>')}
        className={buttonClass}
        aria-label="Bold"
        title="Bold (Ctrl+B)"
      >
        <Bold className={iconClass} />
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => wrapSelection('<u>', '</u>')}
        className={buttonClass}
        aria-label="Underline"
        title="Underline (Ctrl+U)"
      >
        <Underline className={iconClass} />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-border dim:bg-gray-600 mx-1" />

      {/* Bullet List */}
      <button
        type="button"
        onClick={applyBulletList}
        className={buttonClass}
        aria-label="Bullet list"
        title="Bullet list"
      >
        <List className={iconClass} />
      </button>

      {/* Text Alignment */}
      <button
        type="button"
        onClick={applyAlignment}
        className={buttonClass}
        aria-label={`Text alignment: ${alignState}`}
        title={`Text alignment: ${alignState} (click to cycle)`}
      >
        {alignState === 'left' && <AlignLeft className={iconClass} />}
        {alignState === 'center' && <AlignCenter className={iconClass} />}
        {alignState === 'right' && <AlignRight className={iconClass} />}
      </button>
    </div>
  );
}
