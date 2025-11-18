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
export { CommentCard } from './components/CommentCard';
export { CommentInput } from './components/CommentInput';
export { CommentList } from './components/CommentList';
export { CommentSkeleton } from './components/CommentSkeleton';
export { CreatePostForm } from './components/CreatePostForm';
export { CreatePostModal } from './components/CreatePostModal';
export { FilterBar } from './components/FilterBar';
export type { FeedTab } from './components/FilterBar';
export { ImageUploader } from './components/ImageUploader';
export { ImageViewer } from './components/ImageViewer';
export { PostActions } from './components/PostActions';
export { PostCard } from './components/PostCard';
export { PostsGrid } from './components/PostsGrid';
export { PostSkeleton } from './components/PostSkeleton';
export { PostsFeed } from './components/PostsFeed';
export { ReportModal } from './components/ReportModal';
export { ReportPostDialog } from './components/ReportPostDialog';
export { UserBadge } from './components/UserBadge';

// Hooks
export { useComments } from './hooks/useComments';
export { useCreateComment } from './hooks/useCreateComment';
export { useCreatePost } from './hooks/useCreatePost';
export { useDeleteComment } from './hooks/useDeleteComment';
export { useHeartComment } from './hooks/useHeartComment';
export { useInfinitePosts } from './hooks/useInfinitePosts';
export { usePost } from './hooks/usePost';
export { usePostFilters } from './hooks/usePostFilters';
export { useReportPost } from './hooks/useReportPost';

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
