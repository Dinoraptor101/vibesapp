/**
 * FilterBar Component
 *
 * Filter controls for the posts feed including nearby toggle,
 * following filter, and sort options.
 */

import { MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui-next';
import { cn } from '@/lib/cn';
import type { SortOption } from '../hooks/usePostFilters';

interface FilterBarProps {
  nearbyEnabled: boolean;
  followingEnabled: boolean;
  sortOption: SortOption;
  onNearbyToggle: (enabled: boolean) => void;
  onFollowingToggle: (enabled: boolean) => void;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

export function FilterBar({
  nearbyEnabled,
  followingEnabled,
  sortOption,
  onNearbyToggle,
  onFollowingToggle,
  onSortChange,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 border-b border-border bg-surface overflow-x-auto',
        className
      )}
    >
      {/* Nearby Filter */}
      <Button
        variant={nearbyEnabled ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onNearbyToggle(!nearbyEnabled)}
        className={cn('shrink-0', nearbyEnabled && 'bg-brand-purple hover:bg-brand-purple/90')}
      >
        <MapPin className="w-4 h-4 mr-1.5" />
        Nearby
      </Button>

      {/* Following Filter */}
      <Button
        variant={followingEnabled ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onFollowingToggle(!followingEnabled)}
        className={cn('shrink-0', followingEnabled && 'bg-brand-purple hover:bg-brand-purple/90')}
      >
        <Users className="w-4 h-4 mr-1.5" />
        Following
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-border shrink-0" />

      {/* Sort Options */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange('recent')}
          className={cn(sortOption === 'recent' && 'bg-surface-alt')}
        >
          Recent
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange('popular')}
          className={cn(sortOption === 'popular' && 'bg-surface-alt')}
        >
          Popular
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange('nearby')}
          className={cn(sortOption === 'nearby' && 'bg-surface-alt')}
        >
          Nearby
        </Button>
      </div>
    </div>
  );
}
