/**
 * PostsGrid Component
 *
 * Reusable grid layout for displaying posts with consistent spacing and responsive design.
 * Used by both PostsFeed and ProfilePosts to ensure identical layout and behavior.
 *
 * Mobile: 1 column (full width)
 * Desktop: 2 columns
 */

import type { Post } from '../types';
import { PostCard } from './PostCard';

interface PostsGridProps {
  posts: Post[];
  onLike?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PostsGrid({ posts, onLike, onReport, onDelete, onComment }: PostsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onLike={onLike}
          onReport={onReport}
          onDelete={onDelete}
          onComment={onComment}
        />
      ))}
    </div>
  );
}
