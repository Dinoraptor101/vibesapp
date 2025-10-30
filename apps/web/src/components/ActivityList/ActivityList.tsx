import {
  faBell,
  faComments,
  faReply,
  faThumbsDown,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActivities } from '../../services/activityService';
import './ActivityList.css';
import moment from 'moment';
import { FixedSizeList as List } from 'react-window';
import { getUserName } from '../../services/userService';
import type { IActivity } from '../../types';
import { logDebug } from '../../utils/utils';
import Spinner from '../Spinner/Spinner';

/**
 * Custom hook to track window dimensions
 * This helps optimize re-renders when the window is resized
 * @returns {Object} Current window dimensions
 */
const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
};

/**
 * ActivityList Component - Displays a virtualized list of user activities
 * Uses react-window for efficient rendering of large lists by only rendering
 * items that are currently visible in the viewport
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.userId - ID of the user whose activities to display
 */
const ActivityList: React.FC<{ userId: string }> = ({ userId }) => {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  /**
   * Memoized array of icons for the animation cycle
   * Prevents recreation of array on each render
   */
  const icons = useMemo(() => [faBell, faThumbsUp, faComments, faReply], []);

  /**
   * Generates the message and icon for each activity type
   * Memoized to prevent regeneration on each render
   */
  const getActivityDetails = useCallback((activity: IActivity) => {
    const authorUserName = activity.authorUserName || activity.userName;

    const messageMap = {
      reply: { icon: faReply, message: `${authorUserName} replied to a post` },
      like: { icon: faThumbsUp, message: 'Someone has liked your post' },
      dislike: {
        icon: faThumbsDown,
        message: 'Someone has disliked your post',
      },
      groupreply: {
        icon: faReply,
        message: `${authorUserName} replied to a message`,
      },
      watch: {
        icon: faReply,
        message: `${authorUserName} replied to a message`,
      },
      groupchat: {
        icon: faComments,
        message: `${authorUserName} commented in a conversation`,
      },
    };

    return messageMap[activity.type] || { icon: null, message: '' };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [icons.length]);

  const fetchActivities = useCallback(async () => {
    try {
      setError(null);
      const activities = await getActivities(userId);
      logDebug('Fetched activities:', activities);
      setActivities(activities);
    } catch (error) {
      setError('Failed to fetch activities');
      logDebug('Error fetching activities', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserName = useCallback(async () => {
    try {
      const userName = await getUserName();
      setUserName(userName);
    } catch (error) {
      logDebug('Error fetching user name', error);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    fetchUserName();
  }, [fetchUserName]);

  const { width, height } = useWindowDimensions();

  /**
   * Calculate dimensions for the virtualized list
   * Responsive to window size changes
   */
  const listDimensions = useMemo(
    () => ({
      height: height - 145, // Subtract header and footer heights from the dynamic list
      width: width < 768 ? '95%' : '80%', // Use 95% width on mobile, 80% on larger screens
    }),
    [width, height]
  );

  /**
   * Handles scroll events and updates top/bottom indicators
   * Used by react-window to track scroll position
   */
  const handleScroll = useCallback(
    (props: { scrollOffset: number; scrollUpdateWasRequested: boolean }) => {
      const { scrollOffset } = props;
      const listElement = document.querySelector('.activity-list');
      if (!listElement) return;

      setIsAtTop(scrollOffset <= 0);
      setIsAtBottom(scrollOffset + listElement.clientHeight >= activities.length * 70); // 70 is itemSize
    },
    [activities.length]
  );

  // Memoize the list of activities to prevent unnecessary re-renders
  const memoizedActivities = useMemo(() => activities, [activities]);

  const getListWidth = useCallback(() => {
    const viewportWidth = window.innerWidth;
    // Calculate width with constraints
    const width = Math.min(Math.max(355, viewportWidth - 20), 425);
    return width;
  }, []);

  const renderActivity = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const activity = memoizedActivities[index];
    const { icon, message } = getActivityDetails(activity);

    const adjustedStyle = {
      ...style,
      width: '100%', // Use full width of parent
      paddingLeft: '5px',
      paddingRight: '5px',
    };

    return (
      <Link
        to={`/post/${activity.post}`}
        className="activity-link"
        data-testid={`activity-link-${activity._id}`}
        style={adjustedStyle}
      >
        <li className={`activity-item ${activity.isRead ? '' : 'unread'}`}>
          <div className="icon">{icon && <FontAwesomeIcon icon={icon} />}</div>
          <div className="text">
            {message}
            {activity.createdAt && (
              <div className="activity-time">{moment(activity.createdAt).fromNow()}</div>
            )}
          </div>
        </li>
      </Link>
    );
  };

  return (
    <div className="activity-feed">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <Spinner />
      ) : (
        <ul className={`activity-list ${isAtTop ? 'at-top' : ''} ${isAtBottom ? 'at-bottom' : ''}`}>
          {activities.length === 0 ? (
            <div className="no-activity">
              <div className="icon-container">
                <FontAwesomeIcon
                  icon={icons[currentIcon]}
                  size="2x"
                  className="activity-icon fade"
                  key={currentIcon} // Key helps trigger animation
                />
              </div>
              <p>Welcome {userName}! Activities on your content will appear here.</p>
            </div>
          ) : (
            <List
              height={listDimensions.height}
              itemCount={memoizedActivities.length}
              itemSize={56} // 46px height + 10px margin
              width={getListWidth()} // Use dynamic width calculation
              onScroll={handleScroll}
            >
              {renderActivity}
            </List>
          )}
        </ul>
      )}
    </div>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(ActivityList);
