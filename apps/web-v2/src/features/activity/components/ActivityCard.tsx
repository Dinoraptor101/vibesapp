/**
 * ActivityCard Component
 *
 * Displays a single activity/notification with appropriate icon, message, and actions
 */

import { Heart, MessageCircle, Reply, UserPlus, ImageIcon, MapPin, EyeOff } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui-next';
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
    case 'new_follower':
      return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'following_post':
      return <ImageIcon className="h-5 w-5 text-purple-500" />;
    case 'nearby_post':
      return <MapPin className="h-5 w-5 text-blue-500" />;
    case 'comment':
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case 'comment_reply':
      return <Reply className="h-5 w-5 text-blue-500" />;
    case 'reaction':
      return <Heart className="h-5 w-5 text-red-500" />;
    case 'post_hidden':
      return <EyeOff className="h-5 w-5 text-orange-500" />;
    // Legacy types
    case 'dm_request':
    case 'dm_message':
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case 'post_yang':
      return <Heart className="h-5 w-5 text-green-500" />;
    case 'post_yin':
      return <Heart className="h-5 w-5 text-red-500" />;
    default:
      return <Heart className="h-5 w-5 text-gray-500" />;
  }
}

/**
 * Get activity message based on type
 *
 * Note: Posts and comments share the same data model (comments are posts with commentOn field).
 * We differentiate by checking if there's a thumbnail (image) - photos have thumbnails, comments don't.
 */
function getActivityMessage(activity: Activity): string {
  const username = `@${activity.actor.username}`;
  // Determine if this is a photo (has thumbnail) or comment (no thumbnail)
  const isPhoto = !!activity.target?.thumbnail;

  switch (activity.type) {
    case 'new_follower':
      return `${username} followed you`;
    case 'following_post':
      return isPhoto ? `${username} posted a photo` : `${username} posted a comment`;
    case 'nearby_post':
      return isPhoto ? `${username} posted nearby` : `${username} commented nearby`;
    case 'comment':
      return `${username} commented on your post`;
    case 'comment_reply':
      return `${username} replied to your comment`;
    case 'reaction':
      // Check if it's a comment or post reaction
      if (activity.target?.type === 'comment') {
        return activity.groupCount && activity.groupCount > 1
          ? `${activity.groupCount} people liked your comment`
          : `${username} liked your comment`;
      }
      return activity.groupCount && activity.groupCount > 1
        ? `${activity.groupCount} people liked your post`
        : `${username} liked your post`;
    case 'post_hidden':
      return 'Your post was hidden by community reports';
    // Legacy types
    case 'dm_request':
      return `${username} sent you a message request`;
    case 'dm_message':
      return `${username} sent you a message`;
    case 'post_yang':
      return activity.groupCount && activity.groupCount > 1
        ? `${activity.groupCount} people liked your post`
        : `${username} liked your post`;
    case 'post_yin':
      return activity.groupCount && activity.groupCount > 1
        ? `${activity.groupCount} people disliked your post`
        : `${username} disliked your post`;
    default:
      return 'New activity';
  }
}

/**
 * Get navigation path based on activity type
 */
function getNavigationPath(activity: Activity): string | null {
  switch (activity.type) {
    case 'new_follower':
      return `/profile/${activity.actor.userId}`;
    case 'following_post':
    case 'nearby_post':
    case 'reaction':
    case 'comment':
    case 'post_hidden':
      return activity.target?.id ? `/post/${activity.target.id}` : null;
    case 'comment_reply':
      return activity.target?.id ? `/post/${activity.target.id}` : null;
    // Legacy types
    case 'dm_request':
      return '/messages';
    case 'dm_message':
      return activity.metadata?.conversationId
        ? `/messages/${activity.metadata.conversationId}`
        : '/messages';
    case 'post_yang':
    case 'post_yin':
      return activity.metadata?.postId ? `/post/${activity.metadata.postId}` : null;
    default:
      return null;
  }
}

function ActivityCardComponent({ activity, onMarkAsRead }: ActivityCardProps) {
  const navigate = useNavigate();
  const icon = getActivityIcon(activity.type);
  const message = getActivityMessage(activity);
  const navigationPath = getNavigationPath(activity);

  // Construct full CDN URL for thumbnail
  const CDN_URL = import.meta.env.VITE_CDN_URL;
  const thumbnailUrl = activity.target?.thumbnail
    ? activity.target.thumbnail.startsWith('http')
      ? activity.target.thumbnail
      : `${CDN_URL}/${activity.target.thumbnail}`
    : undefined;

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
        ${navigationPath ? 'cursor-pointer hover:bg-gray-100 dim:hover:bg-gray-800/50 dark:hover:bg-gray-800' : 'cursor-default'}
        disabled:cursor-default
      `}
    >
      {!activity.isRead ? (
        <div className="flex-shrink-0 mt-1.5">
          <div className="h-2 w-2 rounded-full bg-brand-500" />
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
        <p className="text-sm text-gray-900 dim:text-gray-100 dark:text-gray-100">{message}</p>

        {activity.target?.preview && (
          <p className="mt-1 text-sm text-gray-600 dim:text-gray-500 dark:text-gray-400 truncate">
            {activity.target.preview}
          </p>
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

      {thumbnailUrl && (
        <div className="flex-shrink-0">
          <img src={thumbnailUrl} alt="Post" className="h-12 w-12 rounded object-cover" />
        </div>
      )}
    </button>
  );
}

const ActivityCardMemoized = memo(ActivityCardComponent, (prev, next) => {
  return prev.activity._id === next.activity._id && prev.activity.isRead === next.activity.isRead;
});

export { ActivityCardMemoized as ActivityCard };
