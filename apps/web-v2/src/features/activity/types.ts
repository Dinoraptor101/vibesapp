/**
 * Activity Feed Types
 *
 * Defines all notification/activity types for the Activity Feed (Phase 4.5)
 */

export type ActivityType =
  // New unified activity types from backend
  | 'new_follower' // Someone followed you
  | 'following_post' // Someone you follow posted
  | 'nearby_post' // Someone posted nearby
  | 'comment' // Someone commented on your post
  | 'comment_reply' // Someone replied to your comment
  | 'reaction' // Someone liked your post
  | 'post_hidden' // Your post was auto-hidden (3+ reports)
  // Legacy types (for backward compatibility)
  | 'dm_request' // Someone sent you a DM request
  | 'dm_message' // New message in a conversation
  | 'post_yang' // Legacy - Someone liked your post (Yang vibe)
  | 'post_yin'; // Legacy - Someone disliked your post (Yin vibe)

export type ActivityCategory = 'messages' | 'social' | 'me' | 'all';

export type ActivityPriority = 'high' | 'medium' | 'low';

/**
 * Base Activity Interface
 * Matches backend unified Activity model
 */
export interface Activity {
  _id: string;
  recipientId: string; // Who receives the notification
  type: ActivityType;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;

  // Actor who triggered the activity
  actor: {
    userId: string;
    username: string;
    avatar?: string;
  };

  // Target of the activity (post, comment, user)
  target?: {
    type: 'post' | 'comment' | 'user';
    id: string;
    thumbnail?: string; // Image URL for posts
    preview?: string; // Text preview
  };

  // Optional metadata (legacy support)
  metadata?: {
    messagePreview?: string; // For DM messages
    conversationId?: string; // For DM activities
    postId?: string; // For post-related activities
    commentId?: string; // For comment activities
    location?: string; // For nearby posts
    distance?: number; // Distance in km for nearby posts
  };

  // Grouping support (e.g., "5 people liked your post")
  groupKey?: string; // e.g., "post:123:reaction"
  groupCount?: number; // Number of similar activities grouped
  groupActors?: Array<{
    // First 3-5 actors in group
    userId: string;
    username: string;
    avatar?: string;
  }>;
}

/**
 * Backend Activity Response
 * What we get from the API (transformed to Activity interface)
 */
export interface BackendActivity {
  _id: string;
  recipientId?: string;
  type: string;
  isRead: boolean;
  readAt?: string | Date;
  createdAt: string | Date;

  // New unified structure (from Activity model)
  actor?: {
    userId: string;
    username: string;
    avatar?: string;
  };
  target?: {
    type: string;
    id: string;
    preview?: string;
    thumbnail?: string;
  };

  // Legacy fields (for backward compatibility with old activity types)
  post?: string; // MongoDB ObjectId
  authorUsername?: string;
  username?: string;
  userId?: string;
  replyPost?: string;
  originalPosterId?: string;
  watcherUserId?: string;
  watcherUsername?: string;
  authorUserId?: string;
  messageId?: string;
  groupChatId?: string;
  parentMessageId?: string;
}

/**
 * Activity Counts by Category
 */
export interface ActivityCounts {
  all: number;
  messages: number;
  social: number;
  me: number;
}

/**
 * Activity Filter Options
 */
export interface ActivityFilters {
  category?: ActivityCategory;
  isRead?: boolean;
  types?: ActivityType[];
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Grouped Activities (for date-based grouping)
 */
export interface GroupedActivities {
  today: Activity[];
  yesterday: Activity[];
  thisWeek: Activity[];
  older: Activity[];
}
