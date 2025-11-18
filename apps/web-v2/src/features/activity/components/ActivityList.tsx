/**
 * ActivityList Component
 *
 * Displays a flat list of activities sorted by newest first
 * No date grouping - just unread/read sections
 */

import { Spinner } from '@/components/ui-next';
import type { Activity } from '../types';
import { ActivityCard } from './ActivityCard';

interface ActivityListProps {
  activities: Activity[];
  isLoading?: boolean;
  error?: Error | null;
  onMarkAsRead?: (activityId: string) => void;
  emptyMessage?: string;
}

export function ActivityList({
  activities,
  isLoading,
  error,
  onMarkAsRead,
  emptyMessage = 'No activities yet',
}: ActivityListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-red-500 dim:text-red-450 dark:text-red-400 font-medium mb-2">
          Failed to load activities
        </p>
        <p className="text-sm text-gray-600 dim:text-gray-500 dark:text-gray-400">
          {error.message}
        </p>
      </div>
    );
  }

  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-gray-600 dim:text-gray-500 dark:text-gray-400 text-center">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Flat list sorted by newest first (already sorted by backend)
  return (
    <div className="space-y-1">
      {activities.map((activity) => (
        <ActivityCard key={activity._id} activity={activity} onMarkAsRead={onMarkAsRead} />
      ))}
    </div>
  );
}
