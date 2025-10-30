// useReplyToPost.js
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../services/apiService';
import { logDebug } from '../utils/utils';

/**
 * A custom hook that manages the state and fetching of a post that is being replied to.
 * It extracts the 'replyTo' parameter from the URL query string and fetches the corresponding post data.
 * @param {string} userId - The ID of the current user
 * @returns {object|null} The post being replied to, or null if not replying
 */
const useReplyToPost = (userId: string) => {
  const [replyToPost, setReplyToPost] = useState(null);
  const locationState = useLocation();

  useEffect(() => {
    const replyTo = new URLSearchParams(locationState.search).get('replyTo');
    if (replyTo) {
      const fetchReplyToPost = async (post: string) => {
        try {
          const response = await apiService.get(`/api/posts/${post}?userId=${userId}`);
          setReplyToPost(response.data.post);
          logDebug('Fetched replyTo post successfully');
        } catch (_error) {
          logDebug('Error fetching replyTo post');
        }
      };
      fetchReplyToPost(replyTo);
    }
  }, [locationState.search, userId]);

  return replyToPost;
};

export default useReplyToPost;
