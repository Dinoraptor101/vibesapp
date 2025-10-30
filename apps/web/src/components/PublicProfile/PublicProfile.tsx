import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../Spinner/Spinner';
import './PublicProfile.css';
import {
  getUserAge,
  getUserMBTIPersonality,
  getUserName,
  getUserPolarity,
  getUserPosts,
  getUserSex,
} from '../../services/userService';
import type { INotification, IPost } from '../../types';
import { getCookie } from '../../utils/cookieUtils';
import { getMBTIDescription } from '../../utils/mbtiUtils';
import RepliesGrid from '../PostsGrid/RepliesGrid';
import RequestButton from './RequestButton/RequestButton';

/**
 * PublicProfile component displays public user information.
 * It shows basic user details like name, age, sex, polarity, and MBTI personality.
 *
 * @component
 */
const PublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState(0);
  const [userSex, setUserSex] = useState('');
  const [userPolarity, setUserPolarity] = useState('');
  const [userMBTIPersonality, setUserMBTIPersonality] = useState('');
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);
  const [notification, setNotification] = useState<INotification | null>(null);
  const currentUserId = getCookie('userId');

  const getPolarityDisplay = (polarity: string) => {
    if (polarity.toLowerCase() === 'yin') {
      return 'Yin (Feminine)';
    } else if (polarity.toLowerCase() === 'yang') {
      return 'Yang (Masculine)';
    }
    return polarity;
  };

  const loadMorePosts = useCallback(async () => {
    if (!userId || !hasMore) return;

    try {
      const response = await getUserPosts({ userId, page });
      setUserPosts((prev) => {
        const postSet = new Set(prev.map((post) => post._id));
        const newPosts = response.results.filter((post) => !postSet.has(post._id));
        return [...prev, ...newPosts];
      });
      setHasMore(response.nextPage !== null);
      if (response.results.length > 0) {
        setPage((prev) => prev + 1);
      }
    } catch (_err) {
      setError('Failed to load more posts');
    }
  }, [userId, hasMore, page]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setUserName(await getUserName(userId));
        setUserAge(await getUserAge(userId));
        setUserSex(await getUserSex(userId));
        setUserPolarity(await getUserPolarity(userId));
        setUserMBTIPersonality(await getUserMBTIPersonality(userId));
        const response = await getUserPosts({ userId, page: 1 });
        setUserPosts(response.results);
        setPage(2); // Start from the second page for subsequent loads
        setHasMore(!!response.nextPage);
        setLoading(false);
      } catch (_err) {
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    };

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore) {
        loadMorePosts();
      }
    }, options);

    const currentLoader = loader.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loadMorePosts]);

  if (loading) return <Spinner />;
  if (error) return <div>{error}</div>;


  return (
    <div className="public-profile">
      <div className="public-profile-card">
        <div className="public-profile-header">
          <h1 className="user-name">{userName}</h1>
          <div className="user-details">
            A {userAge} years old {userSex.toLowerCase() !== 'other' && userSex.toLowerCase()}
          </div>
        </div>
        <div className="public-profile-content">
          <div className="public-user-info">
            <table>
              <tbody>
                {userPolarity && (
                  <tr>
                    <td>Polarity:</td>
                    <td>{getPolarityDisplay(userPolarity)}</td>
                  </tr>
                )}
                {userMBTIPersonality && (
                  <tr>
                    <td>MBTI:</td>
                    <td>
                      {userMBTIPersonality} - {getMBTIDescription(userMBTIPersonality)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {userId && <RequestButton profileUserId={userId} setNotification={setNotification} />}
        {notification && (
          <div className={`notification ${notification.type}`}>{notification.message}</div>
        )}
      </div>
      {userPosts.length > 0 && (
        <div className="public-user-posts-section">
          <hr className="public-replies-divider" />
          <h2 className="public-replies-label">Posts</h2>
          <RepliesGrid posts={userPosts} />
          <div ref={loader} style={{ height: '20px' }}>
            {hasMore && <Spinner />}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
