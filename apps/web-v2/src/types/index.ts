/**
 * Shared TypeScript types and interfaces for VibesApp V2
 * Re-exports types from the shared library and adds frontend-specific types
 */

// Re-export shared types from the monorepo
export type {
  IActivity,
  IComment,
  IConversation,
  IGroupChat,
  IMessage,
  IPost,
  IUserData,
} from '@vibesapp/shared';

// Frontend-specific types

export type Theme = 'light' | 'dim' | 'dark';

export interface User {
  _id: string;
  userId: string; // UUID - business logic identifier
  username: string; // Frontend uses lowercase (transformed from backend's userName)
  // SECURITY: pigeonId should NEVER be included in API responses
  // It's only stored client-side in cookies for authentication
  polarity: string;
  mbtiPersonality: string;
  sex?: string; // User's sex/gender
  profilePictureUrl?: string;
  bio?: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
  };
  vibes?: number;
  createdAt: Date;
  updatedAt: Date;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Post {
  _id: string;
  userId: string;
  user?: User; // Populated user data
  content: string;
  imageUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
  vibes: number;
  hasVibed?: boolean; // Current user's vibe status
  commentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  user?: User; // Populated user data
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  senderId: string;
  sender?: User; // Populated user data
  receiverId?: string;
  groupChatId?: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  createdAt: Date;
  updatedAt: Date;
  isRead?: boolean;
}

export interface Conversation {
  _id: string;
  participants: string[];
  participantData?: User[]; // Populated user data
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  _id: string;
  userId: string;
  type: 'vibe' | 'comment' | 'follow' | 'message' | 'dm-request';
  actor?: User; // User who performed the action
  targetId: string;
  targetType?: 'post' | 'user' | 'message';
  isRead: boolean;
  createdAt: Date;
}

export interface DMRequest {
  _id: string;
  fromUserId: string;
  fromUser?: User;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

// MBTI types
export type MBTIType =
  | 'INTJ'
  | 'INTP'
  | 'ENTJ'
  | 'ENTP'
  | 'INFJ'
  | 'INFP'
  | 'ENFJ'
  | 'ENFP'
  | 'ISTJ'
  | 'ISFJ'
  | 'ESTJ'
  | 'ESFJ'
  | 'ISTP'
  | 'ISFP'
  | 'ESTP'
  | 'ESFP';

// Polarity types
export type PolarityType = 'yang' | 'yin' | 'neutral';

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Admin-specific types
export interface FlaggedPost {
  _id: string;
  text: string;
  image: string;
  user: {
    userId: string;
    userName: string;
    location?: {
      lat: number;
      lon: number;
    };
  };
  reactions: Array<{
    userId: string;
    type: string;
  }>;
  reports?: Array<{
    userId: string;
    reason: string;
    timestamp: string;
  }>;
  proximal_likes: number;
  proximal_dislikes: number;
  proximal_users: number;
  isHidden: boolean;
  hiddenBy?: 'auto' | 'admin' | null;
  hiddenAt?: string;
  createdAt: string;
  dislikeCount?: number; // Legacy - dislike system
  reportCount?: number; // Phase 3.4 - community reports
  reportsByReason?: Record<string, number>; // Phase 3.4 - breakdown by reason
  reporters: Array<{
    userId: string;
    userName: string;
  }>;
}

export interface AdminUser {
  _id: string;
  userId: string;
  userName: string;
  pigeonId: string;
  mbtiPersonality?: string;
  masculineFeminineScale?: number;
  profilePictureUrl?: string;
  bio?: string;
  age?: number;
  sex?: string;
  location?: {
    lat: number;
    lon: number;
    city?: string;
    state?: string;
  };
  isBanned?: boolean;
  bannedAt?: string;
  createdAt: string;
  postCount?: number;
  flaggedPostCount?: number;
  isOnline?: boolean;
  lastActive?: string;
}
