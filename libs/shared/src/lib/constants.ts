// ===== API CONSTANTS =====
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
  },

  // Users
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
    SEARCH: '/api/users/search',
    NEARBY: '/api/users/nearby',
    FOLLOWERS: '/api/users/followers',
    FOLLOWING: '/api/users/following',
  },

  // Posts
  POSTS: {
    CREATE: '/api/posts',
    FEED: '/api/posts/feed',
    USER_POSTS: '/api/posts/user',
    NEARBY: '/api/posts/nearby',
    LIKE: '/api/posts/like',
    UNLIKE: '/api/posts/unlike',
    COMMENT: '/api/posts/comment',
  },

  // Messages
  MESSAGES: {
    CONVERSATIONS: '/api/messages/conversations',
    SEND: '/api/messages/send',
    MARK_READ: '/api/messages/read',
    DELETE: '/api/messages/delete',
  },

  // Group Chats
  GROUP_CHATS: {
    CREATE: '/api/groupchats',
    JOIN: '/api/groupchats/join',
    LEAVE: '/api/groupchats/leave',
    MESSAGES: '/api/groupchats/messages',
    MEMBERS: '/api/groupchats/members',
  },

  // Activities
  ACTIVITIES: {
    GET: '/api/activities',
    MARK_READ: '/api/activities/read',
    MARK_ALL_READ: '/api/activities/read-all',
  },

  // File Upload
  UPLOAD: {
    IMAGE: '/api/upload/image',
    PROFILE_PICTURE: '/api/upload/profile-picture',
    POST_IMAGE: '/api/upload/post-image',
  },
} as const;

// ===== APP CONSTANTS =====
export const APP_CONFIG = {
  NAME: 'VibesApp',
  VERSION: '0.21.1',
  DESCRIPTION: 'Picture based social network',
  HOMEPAGE: 'https://vibesapp.net',

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File Upload Limits
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_WIDTH: 2048,
  MAX_IMAGE_HEIGHT: 2048,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Text Limits
  MAX_POST_LENGTH: 500,
  MAX_COMMENT_LENGTH: 200,
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_BIO_LENGTH: 150,

  // Location
  DEFAULT_LOCATION_RADIUS: 10, // kilometers
  MAX_LOCATION_RADIUS: 100, // kilometers
} as const;

// ===== UI CONSTANTS =====
export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: '#007AFF',
    SECONDARY: '#5856D6',
    SUCCESS: '#34C759',
    WARNING: '#FF9500',
    ERROR: '#FF3B30',
    BACKGROUND: '#F2F2F7',
    SURFACE: '#FFFFFF',
    TEXT_PRIMARY: '#000000',
    TEXT_SECONDARY: '#6D6D80',
  },

  BREAKPOINTS: {
    MOBILE: '480px',
    TABLET: '768px',
    DESKTOP: '1024px',
    LARGE_DESKTOP: '1440px',
  },

  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },

  ANIMATION: {
    DURATION_FAST: '150ms',
    DURATION_NORMAL: '300ms',
    DURATION_SLOW: '500ms',
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ===== STORAGE KEYS =====
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'vibes_auth_token',
  REFRESH_TOKEN: 'vibes_refresh_token',
  USER_DATA: 'vibes_user_data',
  APP_SETTINGS: 'vibes_app_settings',
  LOCATION_PERMISSION: 'vibes_location_permission',
  ONBOARDING_COMPLETED: 'vibes_onboarding_completed',
  THEME_PREFERENCE: 'vibes_theme_preference',
  LANGUAGE_PREFERENCE: 'vibes_language_preference',
} as const;

// ===== ERROR CODES =====
export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_USERNAME_ALREADY_EXISTS: 'AUTH_USERNAME_ALREADY_EXISTS',

  // Validation
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_PASSWORD: 'VALIDATION_INVALID_PASSWORD',
  VALIDATION_PASSWORD_MISMATCH: 'VALIDATION_PASSWORD_MISMATCH',

  // Network
  NETWORK_CONNECTION_ERROR: 'NETWORK_CONNECTION_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_SERVER_ERROR: 'NETWORK_SERVER_ERROR',

  // File Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',

  // Location
  LOCATION_PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  LOCATION_TIMEOUT: 'LOCATION_TIMEOUT',

  // General
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
} as const;

// ===== SOCKET EVENTS =====
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',

  // Messages
  NEW_MESSAGE: 'newMessage',
  MESSAGE_READ: 'messageRead',
  TYPING_START: 'typingStart',
  TYPING_STOP: 'typingStop',

  // Activities
  NEW_ACTIVITY: 'newActivity',
  ACTIVITY_READ: 'activityRead',

  // Users
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  USER_LOCATION_UPDATE: 'userLocationUpdate',

  // Posts
  NEW_POST: 'newPost',
  POST_LIKED: 'postLiked',
  POST_COMMENTED: 'postCommented',
} as const;
