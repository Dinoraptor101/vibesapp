/**
 * SearchBar Component
 *
 * Reusable search input with debouncing and responsive behavior.
 * - Desktop: Always visible, minimal style
 * - Mobile: Can be used in collapsible mode
 */

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search posts...',
  autoFocus = false,
  className = '',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-12 pr-12 py-3 rounded-xl border border-surface-border bg-surface-elevated text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-hover transition-colors"
          aria-label="Clear search"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>
      )}
    </div>
  );
}
