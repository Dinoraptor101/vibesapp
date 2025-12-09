/**
 * RichTextToolbar Component
 *
 * Toolbar for contentEditable-based RichTextEditor.
 * Uses browser-native execCommand for zero-overhead formatting.
 * Supports: Bold, Underline, Text Alignment, Indent/Outdent
 */

import { AlignCenter, AlignLeft, AlignRight, Bold, Indent, Outdent, Underline } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import type { RichTextEditorRef } from './RichTextEditor';

export interface RichTextToolbarProps {
  editorRef: React.RefObject<RichTextEditorRef | null>;
  className?: string;
}

type TextAlign = 'left' | 'center' | 'right';

export function RichTextToolbar({ editorRef, className }: RichTextToolbarProps) {
  const [alignState, setAlignState] = useState<TextAlign>('left');
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Update button states based on cursor position
  const updateFormatStates = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsUnderline(document.queryCommandState('underline'));

    // Detect alignment from browser state
    if (document.queryCommandState('justifyCenter')) {
      setAlignState('center');
    } else if (document.queryCommandState('justifyRight')) {
      setAlignState('right');
    } else {
      setAlignState('left');
    }
  };

  // Listen for selection changes in the editor
  useEffect(() => {
    const handleSelectionChange = () => {
      setIsBold(document.queryCommandState('bold'));
      setIsUnderline(document.queryCommandState('underline'));

      // Detect alignment from browser state
      if (document.queryCommandState('justifyCenter')) {
        setAlignState('center');
      } else if (document.queryCommandState('justifyRight')) {
        setAlignState('right');
      } else {
        setAlignState('left');
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.execCommand(command, value);
    // Update states after command execution
    setTimeout(updateFormatStates, 0);
  };

  const handleBold = () => execCommand('bold');
  const handleUnderline = () => execCommand('underline');
  const handleIndent = () => execCommand('indent');
  const handleOutdent = () => execCommand('outdent');

  const handleAlignment = () => {
    const nextAlign: Record<TextAlign, TextAlign> = {
      left: 'center',
      center: 'right',
      right: 'left',
    };
    const newAlign = nextAlign[alignState];

    const commandMap: Record<TextAlign, string> = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
    };

    execCommand(commandMap[newAlign]);
    // Update state immediately after command
    setAlignState(newAlign);
  };

  const getButtonClass = (isActive: boolean) =>
    cn(
      'p-2 rounded transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      isActive
        ? 'bg-brand/10 text-brand hover:bg-brand/20 dim:bg-brand/20 dim:hover:bg-brand/30'
        : 'hover:bg-surface-hover'
    );

  const getIconClass = (isActive: boolean) =>
    cn('w-4 h-4 transition-colors', isActive ? 'text-brand' : 'text-text-primary');

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
      <button
        type="button"
        onClick={handleBold}
        className={getButtonClass(isBold)}
        aria-label="Bold"
        aria-pressed={isBold}
        title="Bold (Ctrl+B)"
      >
        <Bold className={getIconClass(isBold)} />
      </button>

      <button
        type="button"
        onClick={handleUnderline}
        className={getButtonClass(isUnderline)}
        aria-label="Underline"
        aria-pressed={isUnderline}
        title="Underline (Ctrl+U)"
      >
        <Underline className={getIconClass(isUnderline)} />
      </button>

      <div className="w-px h-6 bg-border dim:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={handleAlignment}
        className={getButtonClass(alignState !== 'left')}
        aria-label={`Text alignment: ${alignState}`}
        aria-pressed={alignState !== 'left'}
        title={`Text alignment: ${alignState} (click to cycle)`}
      >
        {alignState === 'left' && <AlignLeft className={getIconClass(false)} />}
        {alignState === 'center' && <AlignCenter className={getIconClass(true)} />}
        {alignState === 'right' && <AlignRight className={getIconClass(true)} />}
      </button>

      <div className="w-px h-6 bg-border dim:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={handleIndent}
        className={getButtonClass(false)}
        aria-label="Increase indentation"
        title="Indent"
      >
        <Indent className={getIconClass(false)} />
      </button>

      <button
        type="button"
        onClick={handleOutdent}
        className={getButtonClass(false)}
        aria-label="Decrease indentation"
        title="Outdent"
      >
        <Outdent className={getIconClass(false)} />
      </button>
    </div>
  );
}
