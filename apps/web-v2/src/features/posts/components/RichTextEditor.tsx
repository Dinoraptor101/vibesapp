/**
 * RichTextEditor Component
 *
 * ContentEditable-based rich text editor with browser-native formatting.
 * Uses execCommand for zero-overhead formatting with full mobile support.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/cn';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<Element>) => void;
}

export interface RichTextEditorRef {
  focus: () => void;
  blur: () => void;
  getHTML: () => string;
  setHTML: (html: string) => void;
  execCommand: (command: string, value?: string) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  function RichTextEditor(
    { value, onChange, placeholder, disabled, maxLength, className, onKeyDown },
    ref
  ) {
    const editorRef = useRef<HTMLDivElement>(null);
    const isUpdatingRef = useRef(false);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      blur: () => editorRef.current?.blur(),
      getHTML: () => editorRef.current?.innerHTML || '',
      setHTML: (html: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
        }
      },
      execCommand: (command: string, value?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
      },
    }));

    // Sync external value changes to contentEditable
    useEffect(() => {
      if (!editorRef.current || isUpdatingRef.current) return;

      const currentHTML = editorRef.current.innerHTML;
      const normalizedValue = value || '';

      if (currentHTML !== normalizedValue) {
        editorRef.current.innerHTML = normalizedValue;
      }
    }, [value]);

    const handleInput = () => {
      if (!editorRef.current) return;

      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;

      if (maxLength) {
        const plainText = editorRef.current.innerText || '';
        if (plainText.length > maxLength) {
          editorRef.current.innerHTML = html.slice(0, html.length - 1);
          isUpdatingRef.current = false;
          return;
        }
      }

      onChange(html);
      isUpdatingRef.current = false;
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
      // Handle Tab key for indentation
      if (e.key === 'Tab') {
        e.preventDefault();
        // Use indent/outdent commands based on Shift key
        if (e.shiftKey) {
          document.execCommand('outdent', false);
        } else {
          document.execCommand('indent', false);
        }
        return;
      }

      // Call parent's onKeyDown handler if provided
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const showPlaceholder = !value || value === '<br>' || value === '';

    return (
      <div className="relative">
        {showPlaceholder && placeholder && (
          <div
            className="absolute top-2 left-4 text-text-secondary pointer-events-none select-none"
            aria-hidden="true"
          >
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full px-4 py-2 rounded-lg text-sm transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'bg-surface text-text-primary',
            'border border-border focus:ring-brand focus:border-brand',
            'dim:bg-gray-700 dim:text-gray-100',
            'dim:border-gray-600 dim:focus:ring-brand/50 dim:focus:border-brand',
            'max-h-[50vh] overflow-y-auto',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-2',
            '[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-2',
            '[&>p]:my-1',
            '[&>b]:font-bold',
            '[&>strong]:font-bold',
            '[&>u]:underline',
            className
          )}
          tabIndex={0}
          aria-label="Rich text editor"
          aria-disabled={disabled}
          suppressContentEditableWarning
        />
      </div>
    );
  }
);
