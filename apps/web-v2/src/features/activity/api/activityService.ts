/**
 * Activity API Service
 *
 * Handles all API calls for the Activity Feed system (Phase 4.5)
 */

import apiClient from '@/lib/api';
import type { Activity, BackendActivity } from '../types';

/**
 * Transform backend activity to frontend Activity interface
 */
function transformActivity(backendActivity: BackendActivity): Activity {
  const type = backendActivity.type as Activity['type'];

  // Build actor object - handle both new unified structure and legacy formats
  const actor = {
    userId:
      backendActivity.actor?.userId || backendActivity.userId || backendActivity.authorUserId || '',
    username:
      backendActivity.actor?.username ||
      backendActivity.username ||
      backendActivity.authorUsername ||
      'unknown',
    avatar: backendActivity.actor?.avatar || undefined,
  };

  // Build target object if applicable
  let target: Activity['target'] | undefined;
  if (backendActivity.target) {
    // New unified structure
    target = {
      type: backendActivity.target.type as 'post' | 'comment' | 'user',
      id: backendActivity.target.id,
      preview: backendActivity.target.preview,
      thumbnail: backendActivity.target.thumbnail,
    };
  } else if (backendActivity.post) {
    // Legacy structure fallback
    target = {
      type: 'post',
      id: backendActivity.post,
    };
  }

  // Build metadata for legacy support
  const metadata: Activity['metadata'] = {};
  if (backendActivity.post) metadata.postId = backendActivity.post;
  if (backendActivity.replyPost) metadata.commentId = backendActivity.replyPost;
  if (backendActivity.messageId) metadata.messagePreview = 'New message';
  if (backendActivity.groupChatId) metadata.conversationId = backendActivity.groupChatId;

  return {
    _id: backendActivity._id,
    recipientId: backendActivity.recipientId || backendActivity.originalPosterId || '',
    type,
    isRead: backendActivity.isRead,
    readAt: backendActivity.readAt ? new Date(backendActivity.readAt) : undefined,
    createdAt: new Date(backendActivity.createdAt),
    actor,
    target,
    metadata,
  };
}

/**
 * Get all activities for the current user
 */
export async function getActivities(userId: string): Promise<Activity[]> {
  if (!userId || userId === 'undefined') {
    console.warn('getActivities called with invalid userId:', userId);
    return [];
  }
  const response = await apiClient.get<BackendActivity[]>(`/activities/${userId}`);
  return response.map(transformActivity);
}

/**
 * Get unread activity counts by category
 */
export async function getUnreadCounts(userId: string) {
  if (!userId || userId === 'undefined') {
    console.warn('getUnreadCounts called with invalid userId:', userId);
    return { all: 0, messages: 0, social: 0, me: 0 };
  }

  // For now, fetch all activities and count client-side
  const activities = await getActivities(userId);
  const unreadActivities = activities.filter((a) => !a.isRead);

  // Categorize based on activity type
  const categorizeActivity = (activity: Activity) => {
    if (activity.type === 'dm_request' || activity.type === 'dm_message') {
      return 'messages';
    }
    if (
      activity.type === 'new_follower' ||
      activity.type === 'following_post' ||
      activity.type === 'nearby_post'
    ) {
      return 'social';
    }
    return 'me';
  };

  return {
    all: unreadActivities.length,
    messages: unreadActivities.filter((a) => categorizeActivity(a) === 'messages').length,
    social: unreadActivities.filter((a) => categorizeActivity(a) === 'social').length,
    me: unreadActivities.filter((a) => categorizeActivity(a) === 'me').length,
  };
}

/**
 * Mark a single activity as read
 */
export async function markAsRead(activityId: string): Promise<void> {
  await apiClient.patch(`/activities/${activityId}/read`);
}

/**
 * Mark all activities as read
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await apiClient.patch(`/activities/${userId}/read-all`);
}

/**
 * Check if user has unread activities
 */
export async function hasUnreadActivities(userId: string): Promise<boolean> {
  const response = await apiClient.get<{ hasUnread: boolean }>(`/activities/unread/${userId}`);
  return response.hasUnread;
}

/**
 * Delete an activity (optional, not in MVP)
 */
export async function deleteActivity(activityId: string): Promise<void> {
  console.warn('deleteActivity not implemented:', activityId);
  // await apiClient.delete(`/activity/${activityId}`);
}

export const activityService = {
  getActivities,
  getUnreadCounts,
  markAsRead,
  markAllAsRead,
  hasUnreadActivities,
  deleteActivity,
};

export default activityService;
