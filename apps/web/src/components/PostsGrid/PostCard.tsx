import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import type React from 'react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/utils';
import './PostCard.css';
import type { PostCardProps } from '../../types';

/**
 * Sanitizes and truncates HTML text content
 * @param text - The HTML text to sanitize
 * @returns Sanitized and truncated string
 */
const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(
    text
      .replace(/<br\s*\/?>/gi, ' | ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100) + (text.length > 100 ? '...' : ''),
    { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }
  );
};

/**
 * Checks if the content is empty after sanitization
 * This determines if content overlay should be displayed
 * @param text - The HTML text to check
 * @returns Boolean indicating if content is empty
 */
const isContentEmpty = (text: string): boolean => {
  const sanitizedText = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  return !sanitizedText.trim() || sanitizedText === '<p></p>\n';
};

/**
 * PostCard Component
 *
 * Renders an individual post card within the grid layout.
 * Features include:
 * - Image display with loading states
 * - Content sanitization and truncation
 * - Link to detailed post view
 * - Author information display
 * - Responsive layout handling
 *
 * @component
 * @param {PostCardProps} props - Props containing post data and visibility state
 */
const PostCard: React.FC<PostCardProps> = memo(
  ({ post, isVisible, imageResolution = 'low' }) => {
    return (
      <Link
        to={`/post/${post._id}`}
        key={post._id}
        className={`grid-post-link ${isVisible ? '' : 'invisible'}`}
        data-testid={`post-link-${post._id}`}
      >
        <div className="post">
          <div className="grid-post-author">
            <p>{post.user.userName}</p>
          </div>
          <div className="grid-post-image">
            <img
              src={getImageUrl(post.image, imageResolution)}
              alt={post.text}
              loading="lazy"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.onerror = null; // Prevent future errors
                // Don't try to dispatch events, let PostsGrid handle it naturally
              }}
            />
          </div>
          {!isContentEmpty(post.text) && (
            <div className="grid-post-content">{parse(sanitizeText(post.text))}</div>
          )}
        </div>
      </Link>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.isVisible === nextProps.isVisible && prevProps.post._id === nextProps.post._id;
  }
);

PostCard.displayName = 'PostCard';

export default PostCard;
