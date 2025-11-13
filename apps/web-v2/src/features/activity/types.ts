/**
 * Activity Feed Types
 *
 * Defines all notification/activity types for the Activity Feed (Phase 4.5)
 */

export type ActivityType =
  // Messages Tab
  | 'dm_request' // Someone sent you a DM request
  | 'dm_message' // New message in a conversation
  // Social Tab
  | 'new_follower' // Someone followed you
  | 'following_post' // Someone you follow posted
  | 'nearby_post' // Someone posted nearby
  // Me Tab
  | 'post_yang' // Someone liked your post (Yang vibe)
  | 'post_yin' // Someone disliked your post (Yin vibe)
  | 'comment' // Someone commented on your post
  | 'comment_reply' // Someone replied to your comment
  | 'post_hidden'; // Your post was auto-hidden (3+ Yin vibes)

export type ActivityCategory = 'messages' | 'social' | 'me' | 'all';

export type ActivityPriority = 'high' | 'medium' | 'low';

/**
 * Base Activity Interface
 * Represents a single notification/activity item
 */
export interface Activity {
  _id: string;
  type: ActivityType;
  category: ActivityCategory;
  priority: ActivityPriority;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;

  // Actor who triggered the activity
  actor: {
    userId: string;
    username: string;
    avatar?: string;
    mbti?: string;
  };

  // Target of the activity (post, comment, conversation, etc.)
  target?: {
    type: 'post' | 'comment' | 'conversation';
    id: string;
    thumbnail?: string; // For post images
    preview?: string; // Text preview
  };

  // Optional metadata
  metadata?: {
    messagePreview?: string; // For DM messages
    conversationId?: string; // For DM activities
    postId?: string; // For post-related activities
    commentId?: string; // For comment activities
    location?: string; // For nearby posts
    distance?: number; // Distance in km for nearby posts
  };

  // Grouping support (e.g., "5 people liked your post")
  groupKey?: string; // e.g., "post:123:yang"
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
  type: string;
  post?: string; // MongoDB ObjectId
  authorUserName?: string;
  userName?: string;
  userId?: string;
  isRead: boolean;
  createdAt: string | Date;
  // Additional fields from different activity types
  replyPost?: string;
  originalPosterId?: string;
  watcherUserId?: string;
  watcherUserName?: string;
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
