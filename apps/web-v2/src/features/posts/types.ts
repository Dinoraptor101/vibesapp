/**
 * Post Feature Types
 *
 * Type definitions for posts, reactions, and related entities.
 * Based on MongoDB Post model schema.
 */

// Post user embedded schema
export interface PostUser {
  userId: string;
  userName: string;
  birthYear: number;
  birthMonth: number;
  sex: 'male' | 'female' | 'other';
  location: {
    lat: number;
    lon: number;
    city?: string;
  };
  // Optional fields (may be populated from User model)
  mbtiPersonality?: string;
  profilePictureUrl?: string;
}

// Reaction schema (like/dislike)
export interface Reaction {
  userId: string;
  type: 'like' | 'dislike';
  location: {
    lat: number;
    lon: number;
  };
  _id?: string;
}

// Full post interface
export interface Post {
  _id: string;
  text?: string; // Optional caption (null if no caption)
  image: string; // Required - S3 URL
  blurPlaceholder?: string; // Base64 blur placeholder for progressive loading
  user: PostUser;
  replyTo?: string; // Post ID if this is a reply/comment (legacy - for post-to-post replies)
  commentOn?: string; // Post ID if this is a comment on a post
  replyToCommentId?: string; // Comment ID if this is a reply to another comment
  reactions: Reaction[];

  // Computed by backend - frontend should NOT derive these
  likeCount: number; // Always present, 0 if none
  commentCount: number; // Always present, 0 if none

  proximal_likes: number; // Likes from nearby users
  proximal_dislikes: number; // Dislikes from nearby users
  proximal_users: number; // Total nearby users who reacted
  isHidden: boolean; // Auto-hidden if proximal_dislikes >= 3
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Computed post stats (derived from reactions)
export interface PostStats {
  totalLikes: number;
  totalDislikes: number;
  vibesScore: number; // likes - dislikes
  userReaction?: 'like' | 'dislike' | null;
  isHidden: boolean;
}

// Post with computed stats
export interface PostWithStats extends Post {
  stats: PostStats;
}

// Post create/update payload
export interface CreatePostPayload {
  text?: string;
  image: string; // S3 URL after upload
  blurPlaceholder?: string; // Base64 blur placeholder for progressive loading
  location: {
    lat: number;
    lon: number;
  };
}

export interface UpdatePostPayload {
  text?: string;
}

// Post reaction payload
export interface ReactToPostPayload {
  type: 'like' | 'dislike';
  location: {
    lat: number;
    lon: number;
  };
}

// Post query filters
export interface PostFilters {
  userId?: string; // Posts by specific user
  nearby?: {
    lat: number;
    lon: number;
    radius: number; // meters
  };
  following?: boolean; // Only posts from followed users
  includeHidden?: boolean; // Include auto-hidden posts (admin only)
}

// Paginated posts response
export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
