/**
 * Main component for the application.
 * Handles routing, user authentication state, theme management,
 * and renders the core layout including navigation and content areas.
 * Provides notification system and activity tracking functionality.
 */

import { faAdjust, faMoon, faSun, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Suspense, useCallback, useEffect, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useParams,
} from 'react-router-dom';
import ActivityList from './components/ActivityList/ActivityList';
import CreatePost from './components/CreatePost/CreatePost/CreatePost';
import ConversationList from './components/DirectMessage/ConversationList/ConversationList';
import Messenger from './components/DirectMessage/Messenger/Messenger';
import Document from './components/Document/Document';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import Issue from './components/Issue/Issue';
import Post from './components/Post/Post';
import PostNotFound from './components/Post/PostNotFound/PostNotFound';
import PostsGrid from './components/PostsGrid/PostsGrid';
import PublicProfile from './components/PublicProfile/PublicProfile';
import Spinner from './components/Spinner/Spinner';
import UserProfile from './components/UserProfile/UserProfile';
import WelcomeForm from './components/WelcomeForm/WelcomeForm';
import { getCookie } from './utils/cookieUtils';
import './App.css';
import NavigationAware from './components/NavigationAware/NavigationAware';
import NavLink from './components/NavLink/NavLink';
import Notification from './components/Notification/Notification';
import { LocationProvider } from './hooks/useLocation';
import { getUnreadActivities } from './services/activityService';
import dmService from './services/dmService';
import type { INotification } from './types';
import { logDebug } from './utils/utils';

const USER_COOKIE = 'userId';
const PIGEON_COOKIE = 'pigeonId';
const VERSION = '0.12.23';

const App = () => {
  const [userId] = useState<string>(() => {
    const savedUserId = getCookie(USER_COOKIE);
    return savedUserId || '';
  });
  const [pigeonId] = useState<string>(() => {
    const savedPigeonId = getCookie(PIGEON_COOKIE);
    return savedPigeonId || '';
  });
  const [userDetailsSet, setUserDetailsSet] = useState<boolean>(!!userId && !!pigeonId);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadActivities, setUnreadActivities] = useState<boolean>(false);
  const [unreadConversations, setUnreadConversations] = useState<boolean>(false);

  // Get theme from localStorage or default to 'dim'
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'dim');
  const [notification, setNotification] = useState<INotification | null>(null);

  useEffect(() => {
    setUserDetailsSet(!!userId && !!pigeonId);
    setLoading(false);
    logDebug('Loading complete');
  }, [userId, pigeonId]);

  /**
   * Unified method to check for both activity and conversation unread status
   * This gets called by the NavigationAware component on page changes and periodically
   */
  const updateUnreadStatus = useCallback(async () => {
    if (userId) {
      // Check for unread activities
      const hasUnreadActivities = await getUnreadActivities(userId);
      setUnreadActivities(hasUnreadActivities ?? false);

      // Check for unread conversations or pending DM requests
      const hasUnreadConversations = await dmService.getUnreadConversations(userId);
      setUnreadConversations(hasUnreadConversations);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === 'light') return 'dim';
      if (prevTheme === 'dim') return 'dark';
      return 'light';
    });
  };

  if (loading) {
    return <Spinner />;
  }
  const MessengerWrapper = () => {
    const { conversationId } = useParams<{ conversationId: string }>();
    if (!conversationId) {
      return <Navigate to="/conversations" />;
    } else {
      return <Messenger conversationId={conversationId} />;
    }
  };

  const DMRequestWrapper = () => {
    const { requestId } = useParams<{ requestId: string }>();
    if (!requestId) {
      return <Navigate to="/conversations" />;
    } else {
      return <Messenger conversationId={requestId} isDMRequest={true} />;
    }
  };

  return (
    <ErrorBoundary
      context={{
        featureName: 'app',
        userId: pigeonId,
        lastUserAction: 'app_loaded',
      }}
    >
      <LocationProvider>
        {notification && (
          <Notification
            message={notification.message}
            onClose={() => setNotification(null)}
            type={notification.type}
          />
        )}
        <Router basename="/">
          <div className="app">
            <header className="page-header">
              <h2 className="title">Vibes</h2>
              {userDetailsSet && (
                <>
                  <Link
                    to="/user-profile"
                    className="user-profile-button"
                    data-testid="user-profile-button"
                  >
                    <FontAwesomeIcon icon={faUser} />
                  </Link>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="theme-toggle-button"
                    data-testid="theme-toggle-button"
                  >
                    <FontAwesomeIcon
                      icon={theme === 'light' ? faSun : theme === 'dim' ? faAdjust : faMoon}
                    />
                  </button>
                </>
              )}
            </header>
            {userDetailsSet && (
              <nav className="tabs">
                <NavLink to="/" label="Posts" data-testid="nav-posts" />
                <NavLink to="/create-post" label="Create Post" data-testid="nav-create-post" />
                <NavLink
                  to="/activities"
                  label="Activities"
                  unread={unreadActivities}
                  data-testid="nav-activities"
                />
                <NavLink
                  to="/conversations"
                  label="Conversations"
                  unread={unreadConversations}
                  data-testid="nav-conversations"
                />
              </nav>
            )}
            <NavigationAware updateUnreadStatus={updateUnreadStatus} />
            <div className="app-content">
              <Suspense fallback={<Spinner />}>
                <Routes>
                  <Route
                    path="/conversations/:conversationId"
                    element={
                      <ErrorBoundary context={{ featureName: 'messaging', userId: pigeonId }}>
                        <MessengerWrapper />
                      </ErrorBoundary>
                    }
                  />
                  <Route path="/document" element={<Document />} />
                  <Route path="/issue" element={<Issue setNotification={setNotification} />} />
                  <Route
                    path="/user/:userId"
                    element={
                      <ErrorBoundary context={{ featureName: 'public_profile', userId: pigeonId }}>
                        <PublicProfile />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/conversations"
                    element={
                      <ErrorBoundary context={{ featureName: 'conversations', userId: pigeonId }}>
                        <ConversationList userId={userId} />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/dm-request/:requestId"
                    element={
                      <ErrorBoundary context={{ featureName: 'dm_request', userId: pigeonId }}>
                        <DMRequestWrapper />
                      </ErrorBoundary>
                    }
                  />
                  {!userDetailsSet ? (
                    <Route path="*" element={<WelcomeForm setNotification={setNotification} />} />
                  ) : (
                    <>
                      <Route
                        path="/"
                        element={
                          <ErrorBoundary context={{ featureName: 'posts_feed', userId: pigeonId }}>
                            <PostsGrid />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/post/:id"
                        element={
                          <ErrorBoundary context={{ featureName: 'post_detail', userId: pigeonId }}>
                            <Post setNotification={setNotification} />
                          </ErrorBoundary>
                        }
                      />
                      <Route path="/post-not-found" element={<PostNotFound />} />
                      <Route
                        path="/create-post"
                        element={
                          <ErrorBoundary context={{ featureName: 'create_post', userId: pigeonId }}>
                            <CreatePost userId={userId} setNotification={setNotification} />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/activities"
                        element={
                          <ErrorBoundary context={{ featureName: 'activities', userId: pigeonId }}>
                            <ActivityList userId={userId} />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/user-profile"
                        element={
                          <ErrorBoundary
                            context={{ featureName: 'user_profile', userId: pigeonId }}
                          >
                            <UserProfile version={VERSION} setNotification={setNotification} />
                          </ErrorBoundary>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  )}
                </Routes>
              </Suspense>
            </div>
          </div>
        </Router>
      </LocationProvider>
    </ErrorBoundary>
  );
};

export default App;
