import {
  faArrowLeft,
  faReply,
  faThumbsDown,
  faThumbsUp,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import usePostData from '../../hooks/usePostData';
import useUserDistance from '../../hooks/useUserDistance';
import GroupChat from '../GroupChat/GroupChat';
import RepliesGrid from '../PostsGrid/RepliesGrid';
import Spinner from '../Spinner/Spinner';
import './Post.css';
import './ParsedContent.css';
import '../QuillFormat.css';
import moment from 'moment';
import type { INotification } from '../../types';
import { formatDistance, getImageUrl, logDebug } from '../../utils/utils';
import PostHandler from './PostHandler';

interface PostProps {
  // eslint-disable-next-line no-unused-vars
  setNotification: (notification: INotification) => void;
}

/**
 * Post component displays a single post with its details, including images, text, reactions,
 * and related content (original post if it's a reply, and any replies to this post).
 * It handles user interactions such as liking, disliking, replying, and deletion of posts.
 * The component also integrates with group chat and tracking functionality.
 *
 * @component
 * @param {Object} props - Component props
 * @param {function} props.setNotification - Function to display notifications to the user
 */
const Post: React.FC<PostProps> = ({ setNotification }) => {
  const { id: postId } = useParams<{ id: string }>();
  if (!postId) {
    throw new Error('Post ID is required');
  }

  const navigate = useNavigate();
  const postHandler = useMemo(
    () => new PostHandler(setNotification, navigate),
    [setNotification, navigate]
  );

  // Fix property name to match the interface
  const [reactionState, setReactionState] = useState({
    likes: 0,
    dislikes: 0,
    ownerReacted: false,
  });

  // Update state setter to use correct property name
  const updateReactionState = (likes: number, dislikes: number, ownerReacted: boolean) => {
    setReactionState({ likes, dislikes, ownerReacted });
  };

  // Use post data hook
  const { post, originalPost, replies, error } = usePostData(postId, setNotification);
  const distance = useUserDistance(post, setNotification);

  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Memoize expensive computations
  const postReactions = useMemo(() => {
    if (!post?.reactions) return { likesCount: 0, dislikesCount: 0, ownerReacted: false };

    return {
      likesCount: post.reactions.filter((r) => r.type === 'like').length,
      dislikesCount: post.reactions.filter((r) => r.type === 'dislike').length,
      ownerReacted: post.reactions.some((r) => r.userId === postHandler.currentUserId),
    };
  }, [post?.reactions, postHandler.currentUserId]);

  useEffect(() => {
    // Preload image
    if (post?.image) {
      const img = new Image();
      img.src = getImageUrl(post.image, 'full');
    }
  }, [post?.image]);

  // Replace existing image rendering with optimized version
  const renderPostImage = useCallback(
    () => (
      <div className={`detail-post-image ${!imageLoaded ? 'loading' : ''}`}>
        {post?.image && (
          <img
            ref={imageRef}
            src={getImageUrl(post.image, 'full')}
            alt="Content"
            className={imageLoaded ? 'loaded' : ''}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        )}
      </div>
    ),
    [post?.image, imageLoaded, handleImageLoad]
  );

  useEffect(() => {
    if (post && postId) {
      postHandler.trackPostEvent('Post Viewed', postId, {
        has_original: !!originalPost,
        has_replies: replies.length > 0,
        distance: distance ?? 0,
      });

      // Set initial reaction state
      setReactionState({
        likes: postReactions.likesCount,
        dislikes: postReactions.dislikesCount,
        ownerReacted: postReactions.ownerReacted,
      });
    }
  }, [post, postId, originalPost, replies.length, distance, postHandler, postReactions]);

  // Simplified reaction handler
  const handleReaction = (type: 'like' | 'dislike') => {
    if (!post?.user?.location) return;

    postHandler
      .handleReaction(postId, type, post.user.location, updateReactionState, {
        likes: reactionState.likes,
        dislikes: reactionState.dislikes,
      })
      .catch((error) => {
        console.error(`Failed to handle reaction: ${error.message}`);
      });
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Add a loading state until the data is fetched and state variables are updated
  if (
    !post ||
    reactionState.likes === undefined ||
    reactionState.dislikes === undefined ||
    reactionState.ownerReacted === null
  ) {
    return <Spinner />;
  }

  // Log post data at the time of rendering
  logDebug('Post data at render:', {
    likes: reactionState.likes,
    dislikes: reactionState.dislikes,
    ownerReacted: reactionState.ownerReacted,
  });

  // If text content is empty then don't render it
  const isContentEmpty = (text: string): boolean => {
    const sanitizedText = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    return !sanitizedText.trim() || sanitizedText === '<p></p>\n';
  };

  const calculateAge = (birthMonth: number, birthYear: number): number => {
    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const monthDifference = today.getMonth() - birthMonth;
    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < new Date(today.getFullYear(), birthMonth, 0).getDate())
    ) {
      age--;
    }
    return age;
  };

  /**
   * If the post is the user's own post,
   * then allow the user to delete it.
   * this also disables the like and dislike buttons.
   */
  const isOwnPost = post.user && post.user.userId === postHandler.currentUserId;

  // Simplify the condition for disabling reactions
  const reactionsDisabled = isOwnPost || reactionState.ownerReacted;

  return (
    <>
      <button
        type="button"
        className="back-button"
        onClick={() => navigate(-1)}
        data-testid="back-button"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <div className="post-container">
        <div className={`post-stack ${originalPost ? 'has-original' : ''}`}>
          {originalPost && (
            <Link
              to={`/post/${originalPost._id}`}
              className="original-post-card post"
              data-testid="original-post-link"
            >
              <div className="post-label">
                <p>Previous Post</p>
              </div>
              <div className="grid-post-image">
                <img src={getImageUrl(originalPost.image, 'full')} alt="Content" />
              </div>
              <div className="original-post-content post-content">
                <div className="parsed-content">
                  {parse(
                    DOMPurify.sanitize(originalPost.text, {
                      ALLOWED_TAGS: [],
                      ALLOWED_ATTR: [],
                    })
                  )}
                </div>
              </div>
            </Link>
          )}
          <div className="post-card">
            <div className="post-header">
              <div className="post-user-info">
                {post.user ? (
                  <Link to={`/user/${post.user.userId}`} className="user-profile-link">
                    {post.user.userName},
                    {post.user.age || calculateAge(post.user.birthMonth, post.user.birthYear)}
                    {post.user.sex === 'Male' ? 'M' : post.user.sex === 'Female' ? 'F' : ''},
                    {formatDistance(distance)}
                  </Link>
                ) : (
                  <p>Anonymous</p>
                )}
              </div>
              <div className="post-date">
                <p>{moment(post.createdAt).fromNow()}</p>
              </div>
            </div>
            {renderPostImage()}
            <div className="post-buttons">
              <button
                type="button"
                className="post-button"
                onClick={() => handleReaction('like')}
                disabled={reactionsDisabled}
                data-testid="like-button"
              >
                <FontAwesomeIcon icon={faThumbsUp} /> {reactionState.likes}
              </button>
              <button
                type="button"
                className="post-button"
                onClick={() => handleReaction('dislike')}
                disabled={reactionsDisabled}
                data-testid="dislike-button"
              >
                <FontAwesomeIcon icon={faThumbsDown} /> {reactionState.dislikes}
              </button>
              <button
                type="button"
                className="post-button"
                onClick={() => postHandler.createReply(postId)}
                data-testid="reply-button"
              >
                <FontAwesomeIcon icon={faReply} />
              </button>
              {isOwnPost && (
                <button
                  type="button"
                  className="post-button"
                  onClick={() => postHandler.handleDelete(post, postHandler.currentUserId)}
                  data-testid="delete-button"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
            {!isContentEmpty(post.text) && (
              <div className="post-text">
                <div className="parsed-content">
                  {parse(post.text)} {/* Do not sanitize main post */}
                </div>
              </div>
            )}
          </div>
        </div>
        <GroupChat postId={postId} userId={postHandler.currentUserId} />
        {replies.length > 0 && (
          <div className="replies-section">
            <hr className="replies-divider" />
            <h2 className="replies-label">Replies</h2>
            <RepliesGrid posts={replies} />
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(Post); // Memoize the entire component
