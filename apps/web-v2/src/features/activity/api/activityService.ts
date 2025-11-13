/**
 * Activity API Service
 *
 * Handles all API calls for the Activity Feed system (Phase 4.5)
 */

import apiClient from '@/lib/api';
import type { Activity, BackendActivity, ActivityCounts, ActivityCategory } from '../types';

/**
 * Transform backend activity to frontend Activity interface
 */
function transformActivity(backendActivity: BackendActivity): Activity {
  const type = backendActivity.type as Activity['type'];

  // Determine category based on type
  let category: ActivityCategory = 'all';
  let priority: Activity['priority'] = 'low';

  if (type === 'dm_request' || type === 'dm_message') {
    category = 'messages';
    priority = 'high';
  } else if (type === 'new_follower' || type === 'following_post' || type === 'nearby_post') {
    category = 'social';
    priority = 'medium';
  } else {
    category = 'me';
    priority = 'low';
  }

  // Build actor object
  const actor = {
    userId: backendActivity.userId || backendActivity.authorUserId || '',
    username: backendActivity.userName || backendActivity.authorUserName || 'Unknown',
    avatar: undefined, // Backend doesn't provide avatar in activity response
    mbti: undefined,
  };

  // Build target object if applicable
  let target: Activity['target'] | undefined;
  if (backendActivity.post) {
    target = {
      type: 'post',
      id: backendActivity.post,
    };
  }

  // Build metadata
  const metadata: Activity['metadata'] = {};
  if (backendActivity.post) metadata.postId = backendActivity.post;
  if (backendActivity.replyPost) metadata.commentId = backendActivity.replyPost;
  if (backendActivity.messageId) metadata.messagePreview = 'New message';
  if (backendActivity.groupChatId) metadata.conversationId = backendActivity.groupChatId;

  return {
    _id: backendActivity._id,
    type,
    category,
    priority,
    isRead: backendActivity.isRead,
    readAt: undefined,
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
  const response = await apiClient.get<BackendActivity[]>(`/api/activities/${userId}`);
  return response.map(transformActivity);
}

/**
 * Get unread activity counts by category
 */
export async function getUnreadCounts(userId: string): Promise<ActivityCounts> {
  if (!userId || userId === 'undefined') {
    console.warn('getUnreadCounts called with invalid userId:', userId);
    return { all: 0, messages: 0, social: 0, me: 0 };
  }

  // For now, fetch all activities and count client-side
  // TODO: Backend could provide a dedicated endpoint for efficiency
  const activities = await getActivities(userId);
  const unreadActivities = activities.filter((a) => !a.isRead);

  return {
    all: unreadActivities.length,
    messages: unreadActivities.filter((a) => a.category === 'messages').length,
    social: unreadActivities.filter((a) => a.category === 'social').length,
    me: unreadActivities.filter((a) => a.category === 'me').length,
  };
}

/**
 * Mark a single activity as read
 */
export async function markAsRead(activityId: string): Promise<void> {
  // Backend endpoint doesn't exist yet, so this is a placeholder
  // TODO: Backend needs POST /activity/:activityId/read endpoint
  console.warn('markAsRead not implemented in backend yet:', activityId);

  // For now, we'll just make a dummy call
  // await apiClient.post(`/activity/${activityId}/read`);
}

/**
 * Mark all activities as read
 */
export async function markAllAsRead(userId: string): Promise<void> {
  // Backend endpoint doesn't exist yet, so this is a placeholder
  // TODO: Backend needs POST /activity/read-all endpoint
  console.warn('markAllAsRead not implemented in backend yet:', userId);

  // For now, we'll just make a dummy call
  // await apiClient.post(`/activity/read-all`, { userId });
}

/**
 * Check if user has unread activities
 */
export async function hasUnreadActivities(userId: string): Promise<boolean> {
  const response = await apiClient.get<{ hasUnread: boolean }>(`/api/activities/unread/${userId}`);
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
