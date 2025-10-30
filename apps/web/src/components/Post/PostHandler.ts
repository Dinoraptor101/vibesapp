/* eslint-disable no-unused-vars */

import posthog from 'posthog-js';
import apiService from '../../services/apiService';
import type { INavigate, INotification, IPostData, PostProps } from '../../types';
import { getCookie } from '../../utils/cookieUtils';
import { logDebug } from '../../utils/utils';

/**
 * PostHandler manages all post-related operations including fetching, reacting to, and deleting posts.
 * It provides a centralized way to handle post interactions while maintaining consistent tracking and error handling.
 * The class includes methods for:
 * - Fetching post data and related content
 * - Managing post reactions (likes/dislikes)
 * - Handling post deletion
 * - Creating replies
 * - Analytics tracking of post interactions
 *
 * @class
 * @param {function} setNotification - Function to display notifications to the user
 * @param {function} navigate - React Router navigation function
 */
class PostHandler {
  // eslint-disable-next-line no-unused-vars
  private setNotification: (notification: INotification) => void;
  private navigate: INavigate;
  public currentUserId: string; //Required for all post actions

  constructor(
    // eslint-disable-next-line no-unused-vars
    setNotification: (notification: INotification) => void,
    navigate: INavigate
  ) {
    this.setNotification = setNotification;
    this.navigate = navigate;
    this.currentUserId = getCookie('userId'); //Optional, but required for all post actions
  }

  /**
   * Tracks post-related events with PostHog analytics
   * @param eventName - The type of event ('Post Viewed' or 'Post Interaction')
   * @param postId - The unique identifier of the post
   * @param additionalData - Optional object containing extra properties to track
   * @example
   * // Track a basic view
   * trackPostEvent('Post Viewed', '123');
   *
   * // Track an interaction with extra data
   * trackPostEvent('Post Interaction', '123', {
   *   action: 'like',
   *   timestamp: Date.now(),
   *   location: { lat: 123, lon: 456 }
   * });
   */
  trackPostEvent(
    eventName: 'Post Viewed' | 'Post Interaction',
    postId: string,
    additionalData = {}
  ) {
    posthog.capture(eventName, {
      post_id: postId,
      user_id: this.currentUserId,
      ...additionalData,
    });
  }

  /**
   * Convenience method to track specific post interactions
   * @param postId - The unique identifier of the post
   * @param action - The type of interaction (e.g., 'like', 'dislike', 'delete')
   */
  trackPostInteraction(postId: string, action: string) {
    this.trackPostEvent('Post Interaction', postId, {
      action,
      timestamp: new Date().toISOString(),
    });
  }

  /** this method fetches the Post data and assigns it to the variables */
  async fetchPostData(
    id: string,
    // eslint-disable-next-line no-unused-vars
    setPost: (post: IPostData) => void,
    // eslint-disable-next-line no-unused-vars
    setOriginalPost: (post: IPostData | null) => void,
    // eslint-disable-next-line no-unused-vars
    setReplies: (replies: IPostData[]) => void,
    // eslint-disable-next-line no-unused-vars
    setLikes: (likes: number) => void,
    // eslint-disable-next-line no-unused-vars
    setDislikes: (dislikes: number) => void,
    // eslint-disable-next-line no-unused-vars
    setOwnerReacted: (ownerReacted: boolean) => void,
    navigate: INavigate
  ): Promise<void> {
    try {
      const mainPostData = await this.fetchPost(id);
      if (!mainPostData) {
        navigate('/post-not-found');
        return;
      }

      // Set post data
      setPost(mainPostData.post);
      setOwnerReacted(mainPostData.ownerReacted);
      setReplies(mainPostData.replies || []);

      // Set original post data if it exists
      if (mainPostData.post.replyTo) {
        const originalPostData = await this.fetchPost(mainPostData.post.replyTo);
        logDebug(
          originalPostData
            ? 'Reply retrieved, attaching to post page.'
            : '404, likely OP post is deleted'
        );
        setOriginalPost(originalPostData ? originalPostData.post : null);
      }

      //Set likes and dislikes count
      const likesCount = (mainPostData.post.reactions || []).filter(
        (reaction: { type: 'like' | 'dislike' }) => reaction.type === 'like'
      ).length;
      const dislikesCount = (mainPostData.post.reactions || []).filter(
        (reaction: { type: 'like' | 'dislike' }) => reaction.type === 'dislike'
      ).length;
      logDebug(`Reactions Received: ${likesCount} likes, ${dislikesCount} dislikes.`);
      setLikes(likesCount);
      setDislikes(dislikesCount);

      logDebug('All Post data fetched successfully');
    } catch (error) {
      logDebug('Error fetching post data');
      throw error;
    }
  }

  private async fetchPost(postId: string): Promise<PostProps | null> {
    try {
      const response = await apiService.get(`/api/posts/${postId}?userId=${this.currentUserId}`);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async handleDelete(post: IPostData, userId: string): Promise<void> {
    try {
      await apiService.delete(`/api/posts/${post._id}`, userId);
      this.trackPostInteraction(post._id, 'delete');
      this.navigate('/');
      this.setNotification({
        message: 'Trashed',
        type: 'success',
      });
      logDebug('Post deleted successfully');
    } catch (error) {
      this.setNotification({
        message: 'The trash panda could not trash this, reported to the foxes.',
        type: 'error',
      });
      this.trackPostInteraction(post._id, 'delete-failed');
      logDebug('Error deleting post');
      posthog.capture('Post Deletion Failed', {
        userId: userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  createReply(id: string): void {
    this.trackPostInteraction(id, 'reply');
    this.navigate(`/create-post?replyTo=${id}`);
    logDebug('Navigating to create reply');
  }

  // Update reaction handler signature
  async handleReaction(
    postId: string,
    reactionType: 'like' | 'dislike',
    location: { lat: number; lon: number } | null,
    setReactionState: (likes: number, dislikes: number, ownerReacted: boolean) => void,
    currentCounts: { likes: number; dislikes: number }
  ): Promise<void> {
    if (!postId || !location) {
      throw new Error('Missing required parameters for reaction.');
    }

    try {
      const response = await apiService.post(`/api/posts/${postId}/${reactionType}`, {
        userId: this.currentUserId,
        location,
      });

      if (response.status === 200) {
        this.trackPostInteraction(postId, reactionType);

        const newCounts = {
          likes: currentCounts.likes + (reactionType === 'like' ? 1 : 0),
          dislikes: currentCounts.dislikes + (reactionType === 'dislike' ? 1 : 0),
        };
        setReactionState(newCounts.likes, newCounts.dislikes, true);
      }
    } catch (error) {
      console.error(`POST /api/posts/${postId}/${reactionType} failed:`, error);
      this.setNotification({
        message: 'Unable to react, we told the fox about it.',
        type: 'error',
      });
      posthog.capture('Reaction Failed', {
        userId: this.currentUserId,
        postId,
        reactionType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default PostHandler;
