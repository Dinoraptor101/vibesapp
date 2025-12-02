/**
 * ActivityPage Component
 *
 * Main activity feed page with categorized tabs:
 * - All: All activities
 * - Messages: DM requests and messages
 * - Social: Follows, new posts from following, nearby posts
 * - Me: Likes/dislikes, comments, replies on your posts
 */

import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui-next';
import { ActivityList } from '@/features/activity/components/ActivityList';
import {
  useActivities,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/features/activity/hooks/useActivities';

/**
 * Page content without layout wrapper (for persistent pages)
 */
export function ActivityPageContent() {
  // Toggle state for showing read activities
  const [showRecent, setShowRecent] = useState(false);

  // Fetch activities - unread by default, or recent (last 48h) when toggled
  const { data: activities = [], isLoading, error } = useActivities('all', showRecent);

  // Mutations
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAsRead = (activityId: string) => {
    markAsRead.mutate(activityId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  // When showing unread only, all activities are unread
  // When showing recent, split into unread and read
  const unreadActivities = activities.filter((a) => !a.isRead);
  const readActivities = showRecent ? activities.filter((a) => a.isRead) : [];

  // Check if there are any unread activities
  const hasUnread = unreadActivities.length > 0;

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="py-4">
          <div className="flex items-center justify-between">
            {/* Show Recent Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecent(!showRecent)}
              rightIcon={
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showRecent ? 'rotate-180' : ''}`}
                />
              }
            >
              {showRecent ? 'Hide Recent' : 'Show Recent'}
            </Button>

            {/* Mark All as Read button */}
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                leftIcon={<Check className="h-4 w-4" />}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div>
        {/* Loading state */}
        {isLoading && (
          <ActivityList
            activities={[]}
            isLoading={true}
            error={null}
            onMarkAsRead={handleMarkAsRead}
            emptyMessage=""
          />
        )}

        {/* Error state */}
        {error && (
          <ActivityList
            activities={[]}
            isLoading={false}
            error={error as Error}
            onMarkAsRead={handleMarkAsRead}
            emptyMessage=""
          />
        )}

        {/* Empty state - All caught up! */}
        {!isLoading && !error && activities.length === 0 && !showRecent && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-lg font-medium text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-1">
              You're all caught up!
            </p>
            <p className="text-sm text-gray-600 dim:text-gray-500 dark:text-gray-400">
              No new notifications
            </p>
          </div>
        )}

        {/* Empty state - No recent activities when showing recent */}
        {!isLoading && !error && activities.length === 0 && showRecent && (
          <ActivityList
            activities={[]}
            isLoading={false}
            error={null}
            onMarkAsRead={handleMarkAsRead}
            emptyMessage="No recent activities"
          />
        )}

        {/* Unread activities section */}
        {!isLoading && !error && unreadActivities.length > 0 && (
          <div>
            {showRecent && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dim:text-gray-600 dark:text-gray-500 uppercase tracking-wide">
                Unread
              </div>
            )}
            <ActivityList
              activities={unreadActivities}
              isLoading={false}
              error={null}
              onMarkAsRead={handleMarkAsRead}
              emptyMessage=""
            />
          </div>
        )}

        {/* Read activities section (only when showRecent is true) */}
        {!isLoading && !error && showRecent && readActivities.length > 0 && (
          <div className="mt-6">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dim:text-gray-600 dark:text-gray-500 uppercase tracking-wide">
              Recent (Last 48h)
            </div>
            <div className="opacity-60">
              <ActivityList
                activities={readActivities}
                isLoading={false}
                error={null}
                onMarkAsRead={handleMarkAsRead}
                emptyMessage=""
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Full page with layout wrapper (for standalone routing)
 */
export function ActivityPage() {
  return (
    <AppLayout>
      <ActivityPageContent />
    </AppLayout>
  );
}
