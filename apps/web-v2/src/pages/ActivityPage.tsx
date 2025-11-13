/**
 * ActivityPage Component
 *
 * Main activity feed page with categorized tabs:
 * - All: All activities
 * - Messages: DM requests and messages
 * - Social: Follows, new posts from following, nearby posts
 * - Me: Likes/dislikes, comments, replies on your posts
 */

import { Bell, Check } from 'lucide-react';
import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Badge, Button } from '@/components/ui-next';
import { ActivityList } from '@/features/activity/components/ActivityList';
import {
  useActivities,
  useMarkAsRead,
  useMarkAllAsRead,
  useUnreadCounts,
} from '@/features/activity/hooks/useActivities';
import type { ActivityCategory } from '@/features/activity/types';

const TABS: Array<{ value: ActivityCategory; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'messages', label: 'Messages' },
  { value: 'social', label: 'Social' },
  { value: 'me', label: 'Me' },
];

export function ActivityPage() {
  const [activeTab, setActiveTab] = useState<ActivityCategory>('all');

  // Fetch activities for active tab
  const { data: activities = [], isLoading, error } = useActivities(activeTab);

  // Fetch unread counts for badge display
  const { data: counts } = useUnreadCounts();

  // Mutations
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAsRead = (activityId: string) => {
    markAsRead.mutate(activityId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  // Filter to show only unread count for current tab
  const getUnreadCount = (category: ActivityCategory): number => {
    if (!counts) return 0;
    return counts[category] || 0;
  };

  // Check if there are any unread activities in current tab
  const hasUnreadInCurrentTab = activities.some((a) => !a.isRead);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-foreground" />
                <h1 className="text-2xl font-bold text-foreground">Activity</h1>
              </div>

              {/* Mark All as Read button */}
              {hasUnreadInCurrentTab && (
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

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const unreadCount = getUnreadCount(tab.value);
                const isActive = activeTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-full
                      whitespace-nowrap transition-colors font-medium text-sm
                      ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }
                    `}
                  >
                    {tab.label}
                    {unreadCount > 0 && (
                      <Badge variant="error" size="sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="max-w-2xl mx-auto">
          <ActivityList
            activities={activities}
            isLoading={isLoading}
            error={error}
            onMarkAsRead={handleMarkAsRead}
            emptyMessage={
              activeTab === 'all'
                ? 'No activities yet'
                : activeTab === 'messages'
                  ? 'No message activities'
                  : activeTab === 'social'
                    ? 'No social activities'
                    : 'No activities on your posts'
            }
          />
        </div>
      </div>
    </AppLayout>
  );
}
