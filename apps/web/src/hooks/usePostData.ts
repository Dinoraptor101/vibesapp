import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostHandler from '../components/Post/PostHandler';
import type { INotification, IPostData } from '../types';
import { logDebug } from '../utils/utils';

const usePostData = (
  postId: string,
  // eslint-disable-next-line no-unused-vars
  setNotification: (notification: INotification) => void
) => {
  const [post, setPost] = useState<IPostData | null>(null);
  const [originalPost, setOriginalPost] = useState<IPostData | null>(null);
  const [replies, setReplies] = useState<IPostData[]>([]);
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  const [ownerReacted, setOwnerReacted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const postHandler = useCallback(
    () => new PostHandler(setNotification, navigate),
    [setNotification, navigate]
  );

  useEffect(() => {
    let isMounted = true;

    if (!postId) {
      throw new Error('Error: Post ID is undefined');
    }

    postHandler()
      .fetchPostData(
        postId,
        setPost,
        setOriginalPost,
        setReplies,
        setLikes,
        setDislikes,
        setOwnerReacted,
        navigate
      )
      .then(() => {
        if (isMounted) logDebug('Fetched post data successfully');
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      });

    return () => {
      isMounted = false;
      setPost(null);
      setOriginalPost(null);
      setReplies([]);
    };
  }, [postId, postHandler, navigate]);

  return { post, originalPost, replies, likes, dislikes, ownerReacted, error };
};

export default usePostData;
