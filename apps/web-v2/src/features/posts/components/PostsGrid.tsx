/**
 * PostsGrid Component
 *
 * Reusable grid layout for displaying posts with consistent spacing and responsive design.
 * Used by both PostsFeed and ProfilePosts to ensure identical layout and behavior.
 *
 * Mobile: 1 column (full width)
 * Desktop: 2 columns
 */

import { motion } from 'framer-motion';
import type { Post } from '../types';
import { PostCard } from './PostCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

interface PostsGridProps {
  posts: Post[];
  onLike?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PostsGrid({ posts, onLike, onReport, onDelete, onComment }: PostsGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {posts.map((post) => (
        <motion.div key={post._id} variants={itemVariants}>
          <PostCard
            post={post}
            onLike={onLike}
            onReport={onReport}
            onDelete={onDelete}
            onComment={onComment}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
