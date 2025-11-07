/**
 * Posts Feature Barrel Export
 *
 * Centralized exports for all post-related components, types, and services.
 */

// Types
export type {
  Post,
  PostUser,
  Reaction,
  PostStats,
  CreatePostPayload,
  PostFilters,
} from './types';

// Components
export { UserBadge } from './components/UserBadge';
export { PostCard } from './components/PostCard';
export { PostSkeleton } from './components/PostSkeleton';
export { PostActions } from './components/PostActions';
export { ImageViewer } from './components/ImageViewer';

// API Services
export {
  fetchPosts,
  getPostById,
  createPost,
  reactToPost,
  deletePost,
  getNearbyPosts,
  getUserPosts,
  getPostsByMBTI,
} from './api/postService';
