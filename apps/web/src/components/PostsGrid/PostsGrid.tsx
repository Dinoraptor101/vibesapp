import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './PostsGrid.css';
import { AxiosError } from 'axios';
import { useInfiniteQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useErrorReporting } from '../../hooks/useErrorReporting';
import useLocation from '../../hooks/useLocation';
import apiService from '../../services/apiService';
import { getPermissionControls } from '../../services/userPermissions';
import { logout } from '../../services/userService';
import type { IFetchPostsParams, INotification, IPage, IPost } from '../../types';
import { getCookie } from '../../utils/cookieUtils';
import { getImageUrl, logDebug } from '../../utils/utils';
import LocationRequest from '../LocationRequest/LocationRequest';
import Notification from '../Notification/Notification';
import Spinner from '../Spinner/Spinner';
import Controls from './Controls';
import PostCard from './PostCard';

/**
 * Custom hook that provides a debounced value of a number ( in this case, distance radius )
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
const useDebounce = (value: number, delay: number): number => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value === 999 ? 0 : value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Calculates the optimal number of posts to load based on viewport dimensions
 * @returns The calculated limit of posts to fetch
 */
const calculateLimit = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = 300;
  const cardHeight = 300;
  const cardsPerRow = Math.floor(viewportWidth / cardWidth);
  const rowsPerPage = Math.floor(viewportHeight / cardHeight);
  return Math.min(cardsPerRow * rowsPerPage * 2, 12); // Load triple that of the view port capacity, but max 20.
};

/**
 * Fetches posts from the API based on provided parameters
 * @param params - Object containing fetch parameters (pageParam, lat, lon, range, withReplies)
 * @returns Promise containing the fetched posts data
 */
const fetchPosts = async ({ pageParam = 1, lat, lon, range, withReplies }: IFetchPostsParams) => {
  try {
    const limit = calculateLimit();
    logDebug(`Calculated limit: ${limit}`);
    logDebug(
      `Fetching posts: page=${pageParam}, lat=${lat}, lon=${lon}, range=${range}, withReplies=${withReplies}, limit=${limit}`
    );
    const url = `/api/posts?lat=${lat}&lon=${lon}&withReplies=${withReplies}&range=${range}&page=${pageParam}&limit=${limit}`;
    const response = await apiService.get(url);
    logDebug(
      `Fetched ${response.data.results.length} posts, nextPage=${response.data.nextPage}, totalPosts=${response.data.totalPosts}`
    );
    return response.data;
  } catch (error: unknown) {
    logDebug('Error fetching posts.');
    if (error instanceof AxiosError)
      if (error.response?.status === 408 || error.response?.status === 401) {
        logDebug('User session invalid, logging out.');
        logout();
      }
    throw new Error(String(error));
  }
};

/**
 * PostsGrid Component
 *
 * Main grid (Home Feed) component for displaying posts with infinite scrolling functionality.
 * Features include:
 * - Location-based post fetching
 * - Infinite scroll with IntersectionObserver
 * - Dynamic post loading based on viewport size
 * - Image lazy loading with loading states
 * - Range and reply filtering controls
 * - Error handling and loading states
 *
 * @component
 */
const PostsGrid: React.FC = () => {
  const [withReplies, setWithReplies] = useState(false);
  const [range, setRange] = useState(100); //sets the default range in miles if not set by user.
  const [showControls, setShowControls] = useState(false);
  const [notification, setNotification] = useState<INotification | null>(null);
  const [isLocationChecked, setIsLocationChecked] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState<IPost[]>([]);
  const [imageLoadStatus, setImageLoadStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { location, isDenied } = useLocation();
  const debouncedRange = useDebounce(range, 500);
  const { reportApiError } = useErrorReporting({
    featureName: 'posts_grid',
    userId: getCookie('pigeonId') || undefined,
  });

  const handleImageLoad = useCallback((postId: string, status: number) => {
    if (status === 403) {
      setVisiblePosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      logDebug(`Post with ID: ${postId} was removed due to a 403 error on image load`);
    } else {
      setImageLoadStatus((prevStatus) => ({ ...prevStatus, [postId]: true }));
    }
  }, []);

  useEffect(() => {
    const fetchControlState = async () => {
      const hasPermission = await getPermissionControls();
      const withRepliesCookie = getCookie('withReplies');
      setWithReplies(
        hasPermission && withRepliesCookie !== undefined ? withRepliesCookie === 'true' : false
      );

      const rangeCookie = getCookie('range');
      setRange(
        hasPermission && rangeCookie !== undefined && !Number.isNaN(parseInt(rangeCookie, 10))
          ? parseInt(rangeCookie, 10)
          : 400
      );

      setShowControls(hasPermission);
      setIsLocationChecked(true);
    };

    fetchControlState();
  }, []);

  const { data, fetchNextPage, hasNextPage, isError, error, isFetchingNextPage } = useInfiniteQuery(
    ['posts', location, debouncedRange, withReplies],
    ({ pageParam = 1 }) =>
      fetchPosts({
        pageParam,
        lat: location?.lat ?? 0,
        lon: location?.lon ?? 0,
        range: debouncedRange,
        withReplies,
      }),
    {
      getNextPageParam: (lastPage: IPage) => {
        return lastPage.nextPage ?? false;
      },
      enabled: !!location?.lat && !!location?.lon && isLocationChecked,
      onError: (error: unknown) => {
        reportApiError('fetchPosts', error, {
          context: 'PostsGrid infinite scroll',
          metadata: {
            location: location ? { lat: location.lat, lon: location.lon } : null,
            range: debouncedRange,
            withReplies,
          },
        });
      },
    }
  );

  useEffect(() => {
    if (location !== null && location.lat !== null && location.lon !== null) {
      logDebug(`Location available, fetching posts: lat=${location?.lat}, lon=${location?.lon}`);
    }
  }, [location]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' } // Trigger when 200px from the bottom
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) observer.observe(currentLoadMoreRef);

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (data) {
      const allPosts = data.pages.flatMap((page) => page.results);
      setVisiblePosts(allPosts);
    }
  }, [data]);

  useEffect(() => {
    if (visiblePosts.length > 0) {
      visiblePosts.forEach((post) => {
        const img = new Image();
        img.src = getImageUrl(post.image, 'low'); // Use low resolution
        img.onload = () => handleImageLoad(post._id, 200);
        img.onerror = (event) => {
          if (event && typeof event !== 'string') {
            const target = event.target as HTMLImageElement;
            if (target.naturalWidth === 0) {
              handleImageLoad(post._id, 403);
            }
          }
        };
      });
    }
  }, [visiblePosts, handleImageLoad]);

  const renderNoPostsMessage = () => {
    if (!data) return null;
    const allPosts = data.pages.flatMap((page) => page.results);
    if (allPosts.length === 0) {
      return (
        <div className="no-posts">
          <p>No posts in range.</p>
          <p>Be the first Pioneer and create a post!</p>
          <Link to="/create-post" className="icon-container">
            <FontAwesomeIcon icon={faPlus} size="2x" className="post-icon" />
          </Link>
        </div>
      );
    }
    return null;
  };

  if (isDenied) return <LocationRequest />;
  if (isError) return <div className="error">Error fetching posts: {(error as Error).message}</div>;

  return (
    <div className="posts-grid-wrapper">
      {notification && (
        <Notification
          message={notification.message}
          onClose={() => setNotification(null)}
          type={notification.type}
        />
      )}
      {showControls && (
        <Controls
          withReplies={withReplies}
          setWithReplies={setWithReplies}
          range={range}
          setRange={setRange}
          data-testid="controls"
        />
      )}
      {renderNoPostsMessage()}
      <div className="posts-grid">
        {visiblePosts.map((post: IPost) => (
          <PostCard
            key={post._id}
            post={post}
            isVisible={imageLoadStatus[post._id] || false}
            data-testid={`post-card-${post._id}`}
            imageResolution="low" // Pass low resolution
          />
        ))}
        <div ref={loadMoreRef}></div>
      </div>
      {isFetchingNextPage && (
        <div className="spinner-container">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default PostsGrid;
