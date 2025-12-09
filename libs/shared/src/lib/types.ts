// ===== USER TYPES =====
export interface IUserData {
  _id: string;
  username: string;
  polarity: string;
  mbtiPersonality: string;
  profilePictureUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  vibes?: number;
  createdAt: Date;
  updatedAt: Date;
  isOnline?: boolean;
  lastSeen?: Date;
}

// ===== POST TYPES =====
export interface IPost {
  _id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  vibes: number;
  createdAt: Date;
  updatedAt: Date;
  comments?: IComment[];
}

export interface IComment {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== MESSAGE TYPES =====
export interface IMessage {
  _id: string;
  senderId: string;
  receiverId?: string;
  groupChatId?: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  createdAt: Date;
  updatedAt: Date;
  isRead?: boolean;
}

export interface IConversation {
  _id: string;
  participants: string[];
  lastMessage?: IMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupChat {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  admins: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== ACTIVITY TYPES =====
export interface IActivity {
  _id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  targetId: string;
  targetType: 'post' | 'user' | 'comment';
  createdAt: Date;
  isRead: boolean;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== LOCATION TYPES =====
export interface ILocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

// ===== AUTHENTICATION TYPES =====
export interface IAuthUser {
  id: string;
  username: string;
  email?: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
