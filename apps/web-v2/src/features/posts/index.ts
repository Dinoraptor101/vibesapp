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
  PostsResponse,
} from './types';

// Components
export { CreatePostForm } from './components/CreatePostForm';
export { CreatePostModal } from './components/CreatePostModal';
export { FilterBar } from './components/FilterBar';
export { ImageUploader } from './components/ImageUploader';
export { ImageViewer } from './components/ImageViewer';
export { PostActions } from './components/PostActions';
export { PostCard } from './components/PostCard';
export { PostSkeleton } from './components/PostSkeleton';
export { PostsFeed } from './components/PostsFeed';
export { ReportModal } from './components/ReportModal';
export { ReportPostDialog } from './components/ReportPostDialog';
export { UserBadge } from './components/UserBadge';

// Hooks
export { useCreatePost } from './hooks/useCreatePost';
export { useInfinitePosts } from './hooks/useInfinitePosts';
export { usePost } from './hooks/usePost';
export { usePostFilters } from './hooks/usePostFilters';
export type { FeedFilters, SortOption } from './hooks/usePostFilters';

// API Services
export {
  createPost,
  deletePost,
  fetchPosts,
  getPostById,
  getNearbyPosts,
  getPostsByMBTI,
  getUserPosts,
  reactToPost,
} from './api/postService';
