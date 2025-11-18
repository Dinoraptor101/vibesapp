/**
 * ActivityCard Component
 *
 * Displays a single activity/notification with appropriate icon, message, and actions
 */

import { Bell, MessageCircle, ThumbsDown, ThumbsUp, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge } from '@/components/ui-next';
import { formatRelativeTime } from '@/lib/utils';
import type { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  onMarkAsRead?: (activityId: string) => void;
}

/**
 * Get icon based on activity type
 */
function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'dm_request':
    case 'dm_message':
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case 'new_follower':
      return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'following_post':
    case 'nearby_post':
      return <Bell className="h-5 w-5 text-purple-500" />;
    case 'post_yang':
      return <ThumbsUp className="h-5 w-5 text-green-500" />;
    case 'post_yin':
      return <ThumbsDown className="h-5 w-5 text-red-500" />;
    case 'comment':
    case 'comment_reply':
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case 'post_hidden':
      return <Bell className="h-5 w-5 text-orange-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
}

/**
 * Get activity message based on type
 */
function getActivityMessage(activity: Activity): string {
  const username = activity.actor.username;

  switch (activity.type) {
    case 'dm_request':
      return `${username} sent you a message request`;
    case 'dm_message':
      return `${username} sent you a message`;
    case 'new_follower':
      return `${username} started following you`;
    case 'following_post':
      return `${username} posted something new`;
    case 'nearby_post':
      return `${username} posted nearby${activity.metadata?.location ? ` in ${activity.metadata.location}` : ''}`;
    case 'post_yang':
      return activity.groupCount && activity.groupCount > 1
        ? `${activity.groupCount} people liked your post`
        : `${username} liked your post`;
    case 'post_yin':
      return activity.groupCount && activity.groupCount > 1
        ? `${activity.groupCount} people disliked your post`
        : `${username} disliked your post`;
    case 'comment':
      return `${username} commented on your post`;
    case 'comment_reply':
      return `${username} replied to your comment`;
    case 'post_hidden':
      return 'Your post was auto-hidden due to community feedback';
    default:
      return 'New activity';
  }
}

/**
 * Get navigation path based on activity type
 */
function getNavigationPath(activity: Activity): string | null {
  switch (activity.type) {
    case 'dm_request':
      return '/messages';
    case 'dm_message':
      return activity.metadata?.conversationId
        ? `/messages/${activity.metadata.conversationId}`
        : '/messages';
    case 'new_follower':
      return `/profile/${activity.actor.userId}`;
    case 'following_post':
    case 'nearby_post':
    case 'post_yang':
    case 'post_yin':
    case 'comment':
    case 'post_hidden':
      return activity.metadata?.postId ? `/posts/${activity.metadata.postId}` : null;
    case 'comment_reply':
      return activity.metadata?.postId
        ? `/posts/${activity.metadata.postId}#comment-${activity.metadata.commentId}`
        : null;
    default:
      return null;
  }
}

export function ActivityCard({ activity, onMarkAsRead }: ActivityCardProps) {
  const navigate = useNavigate();
  const icon = getActivityIcon(activity.type);
  const message = getActivityMessage(activity);
  const navigationPath = getNavigationPath(activity);

  const handleClick = () => {
    if (!activity.isRead && onMarkAsRead) {
      onMarkAsRead(activity._id);
    }

    if (navigationPath) {
      navigate(navigationPath);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={!navigationPath}
      className={`
        w-full text-left flex items-start gap-3 p-4 rounded-lg transition-colors
        ${navigationPath ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : 'cursor-default'}
        disabled:cursor-default
      `}
    >
      {!activity.isRead ? (
        <div className="flex-shrink-0 mt-1.5">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
        </div>
      ) : (
        <div className="flex-shrink-0 w-2" />
      )}

      <div className="flex-shrink-0 mt-1">{icon}</div>

      {activity.actor.userId && activity.type !== 'post_hidden' && (
        <Avatar
          src={activity.actor.avatar}
          alt={activity.actor.username}
          size="md"
          className="flex-shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dim:text-gray-100 dark:text-gray-100 font-medium">
          {message}
        </p>

        {activity.actor.mbti && activity.type !== 'post_hidden' && (
          <div className="mt-1">
            <Badge variant="default" size="sm">
              {activity.actor.mbti}
            </Badge>
          </div>
        )}

        {activity.metadata?.messagePreview && (
          <p className="mt-1 text-sm text-gray-600 dim:text-gray-500 dark:text-gray-400 truncate">
            {activity.metadata.messagePreview}
          </p>
        )}

        <p className="mt-1 text-xs text-gray-400 dim:text-gray-600 dark:text-gray-600">
          {formatRelativeTime(activity.createdAt)}
        </p>
      </div>

      {activity.target?.thumbnail && (
        <div className="flex-shrink-0">
          <img
            src={activity.target.thumbnail}
            alt="Post"
            className="h-12 w-12 rounded object-cover"
          />
        </div>
      )}
    </button>
  );
}
