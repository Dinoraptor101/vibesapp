/**
 * ActivityPage Component
 *
 * Main activity feed page with categorized tabs:
 * - All: All activities
 * - Messages: DM requests and messages
 * - Social: Follows, new posts from following, nearby posts
 * - Me: Likes/dislikes, comments, replies on your posts
 */

import { Check } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui-next';
import { ActivityList } from '@/features/activity/components/ActivityList';
import {
  useActivities,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/features/activity/hooks/useActivities';

export function ActivityPage() {
  // Fetch all activities (no tabs, no category filter)
  const { data: activities = [], isLoading, error } = useActivities('all');

  // Mutations
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAsRead = (activityId: string) => {
    markAsRead.mutate(activityId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  // Split activities into unread and read groups
  const unreadActivities = activities.filter((a) => !a.isRead);
  const readActivities = activities.filter((a) => a.isRead);

  // Check if there are any unread activities
  const hasUnread = unreadActivities.length > 0;

  return (
    <AppLayout>
      <div className="bg-background">
        {/* Header */}
        {hasUnread && (
          <div className="sticky top-0 z-10 bg-background">
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div className="flex items-center justify-end">
                {/* Mark All as Read button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                  leftIcon={<Check className="h-4 w-4" />}
                >
                  Mark all read
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Activity List */}
        <div className="max-w-2xl mx-auto">
          {/* Unread activities */}
          {unreadActivities.length > 0 && (
            <ActivityList
              activities={unreadActivities}
              isLoading={false}
              error={null}
              onMarkAsRead={handleMarkAsRead}
              emptyMessage=""
            />
          )}

          {/* Read activities */}
          {readActivities.length > 0 && (
            <ActivityList
              activities={readActivities}
              isLoading={false}
              error={null}
              onMarkAsRead={handleMarkAsRead}
              emptyMessage=""
            />
          )}

          {/* Loading state */}
          {isLoading && activities.length === 0 && (
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

          {/* Empty state */}
          {!isLoading && !error && activities.length === 0 && (
            <ActivityList
              activities={[]}
              isLoading={false}
              error={null}
              onMarkAsRead={handleMarkAsRead}
              emptyMessage="No activities yet"
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
