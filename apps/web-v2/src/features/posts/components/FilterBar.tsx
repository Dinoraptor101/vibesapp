/**
 * FilterBar Component
 *
 * Mutually exclusive tabs for Nearby and Following feeds.
 * Both tabs show posts sorted chronologically (newest first).
 *
 * Phase 4.9 (Nov 17, 2025): Simplified to two mutually exclusive tabs
 */

import { MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/cn';

export type FeedTab = 'nearby' | 'following';

interface FilterBarProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  className?: string;
}

export function FilterBar({ activeTab, onTabChange, className }: FilterBarProps) {
  return (
    <div
      role="tablist"
      className={cn('flex items-center border-b border-border bg-surface', className)}
    >
      {/* Nearby Tab */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'nearby'}
        onClick={() => onTabChange('nearby')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-3 px-4',
          'font-medium text-sm transition-all duration-200',
          'border-b-2',
          activeTab === 'nearby'
            ? 'text-brand-purple border-brand-purple'
            : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-hover'
        )}
      >
        <MapPin className="w-4 h-4" />
        Nearby
      </button>

      {/* Following Tab */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'following'}
        onClick={() => onTabChange('following')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-3 px-4',
          'font-medium text-sm transition-all duration-200',
          'border-b-2',
          activeTab === 'following'
            ? 'text-brand-purple border-brand-purple'
            : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-hover'
        )}
      >
        <Users className="w-4 h-4" />
        Following
      </button>
    </div>
  );
}
