import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import '../PostsGrid/PostsGrid.css';
import type { RepliesGridProps } from '../../types';
import { getImageUrl } from '../../utils/utils';
import PostCard from './PostCard';

/**
 * RepliesGrid Component
 *
 * Renders a grid of reply posts with managed image loading states.
 * Similar to PostsGrid but specifically for displaying replies to a post.
 * Handles lazy loading of images and provides visual feedback during loading.
 *
 * @component
 * @param {RepliesGridProps} props - Props containing array of posts to display
 */
const RepliesGrid: React.FC<RepliesGridProps> = ({ posts }) => {
  const [imageLoadStatus, setImageLoadStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const handleImageLoad = useCallback((postId: string) => {
    setImageLoadStatus((prevStatus) => ({ ...prevStatus, [postId]: true }));
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      posts.forEach((post) => {
        const img = new Image();
        img.src = getImageUrl(post.image, 'low'); // Use low resolution
        img.onload = () => handleImageLoad(post._id);
      });
    }
  }, [posts, handleImageLoad]);

  return (
    <div className="posts-grid">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          isVisible={imageLoadStatus[post._id] || false}
          data-testid={`post-card-${post._id}`}
          imageResolution="low" // Pass low resolution
        />
      ))}
    </div>
  );
};

export default RepliesGrid;
