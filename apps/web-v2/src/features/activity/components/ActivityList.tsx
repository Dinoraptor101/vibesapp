/**
 * ActivityList Component
 *
 * Displays a list of activities grouped by date (Today, Yesterday, This Week, Older)
 * with loading states and empty states
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

/**
 * Group activities by date
 */
function groupActivitiesByDate(activities: Activity[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);

  const groups = {
    today: [] as Activity[],
    yesterday: [] as Activity[],
    thisWeek: [] as Activity[],
    older: [] as Activity[],
  };

  for (const activity of activities) {
    const activityDate = new Date(activity.createdAt);

    if (activityDate >= today) {
      groups.today.push(activity);
    } else if (activityDate >= yesterday) {
      groups.yesterday.push(activity);
    } else if (activityDate >= thisWeekStart) {
      groups.thisWeek.push(activity);
    } else {
      groups.older.push(activity);
    }
  }

  return groups;
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
        <p className="text-red-500 dark:text-red-400 font-medium mb-2">Failed to load activities</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{error.message}</p>
      </div>
    );
  }

  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-gray-600 dark:text-gray-400 text-center">{emptyMessage}</p>
      </div>
    );
  }

  // Group activities by date
  const grouped = groupActivitiesByDate(activities);

  return (
    <div className="space-y-6">
      {/* Today */}
      {grouped.today.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-4 mb-2">
            Today
          </h3>
          <div className="space-y-1">
            {grouped.today.map((activity) => (
              <ActivityCard key={activity._id} activity={activity} onMarkAsRead={onMarkAsRead} />
            ))}
          </div>
        </div>
      )}

      {/* Yesterday */}
      {grouped.yesterday.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-4 mb-2">
            Yesterday
          </h3>
          <div className="space-y-1">
            {grouped.yesterday.map((activity) => (
              <ActivityCard key={activity._id} activity={activity} onMarkAsRead={onMarkAsRead} />
            ))}
          </div>
        </div>
      )}

      {/* This Week */}
      {grouped.thisWeek.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-4 mb-2">
            This Week
          </h3>
          <div className="space-y-1">
            {grouped.thisWeek.map((activity) => (
              <ActivityCard key={activity._id} activity={activity} onMarkAsRead={onMarkAsRead} />
            ))}
          </div>
        </div>
      )}

      {/* Older */}
      {grouped.older.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-4 mb-2">
            Older
          </h3>
          <div className="space-y-1">
            {grouped.older.map((activity) => (
              <ActivityCard key={activity._id} activity={activity} onMarkAsRead={onMarkAsRead} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
