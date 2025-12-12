/**
 * Application Router
 * Defines all routes and navigation structure
 *
 * Uses PersistentPages for main navigation (Home, Activity, CreatePost, Messages, Settings)
 * to preserve state and scroll position across navigation.
 */

import { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { PersistentPages } from '@/components/layout/PersistentPages';
import { isPersistentPage } from '@/components/layout/persistentPagesUtils';
import {
  AdminDashboardPage,
  AdminLayout,
  AdminLoginPage,
  AdminSettingsPage,
  FlaggedPostDetailPage,
  FlaggedPostsPage,
  ProtectedAdminRoute,
  UserDetailPage,
  UserPostsPage,
  UsersPage,
} from '@/features/admin';
import { AuthProvider, LoginPage, ProtectedRoute, SignupPage } from '@/features/auth';
import { FeedbackPage } from '@/features/feedback/pages/FeedbackPage';
import { ConversationPage } from '@/pages/ConversationPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { ReportPostPage } from '@/pages/ReportPostPage';
import { SendDMRequestPage } from '@/pages/SendDMRequestPage';
import { TermsPage } from '@/pages/TermsPage';

/**
 * GitHub Pages SPA Redirect Handler
 * Restores the original path after a 404 redirect from GitHub Pages
 */
function GitHubPagesRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run on the root path
    if (location.pathname === '/') {
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath) {
        sessionStorage.removeItem('redirectPath');
        navigate('/' + redirectPath, { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  return null;
}

/**
 * Admin Layout Wrapper with Outlet for nested routes
 * Keeps the header persistent across admin page navigation
 */
function AdminLayoutWithOutlet() {
  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedAdminRoute>
  );
}

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-purple mb-4">404</h1>
        <p className="text-text-secondary">Page not found</p>
      </div>
    </div>
  );
}

/**
 * Main App Shell - renders persistent pages and overlay routes
 */
function AppShell() {
  const location = useLocation();
  const showPersistentPages = isPersistentPage(location.pathname);

  return (
    <>
      {/* Persistent pages - always mounted when on a persistent route */}
      {showPersistentPages && (
        <ProtectedRoute>
          <PersistentPages />
        </ProtectedRoute>
      )}

      {/* Overlay routes - rendered on top of or instead of persistent pages */}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Persistent routes - handled by PersistentPages, just need route matching */}
        <Route path="/" element={null} />
        <Route path="/activity" element={null} />
        <Route path="/create-post" element={null} />
        <Route path="/messages" element={null} />
        <Route path="/settings" element={null} />
        <Route path="/post/:postId" element={null} />
        <Route path="/profile/:userId" element={null} />

        {/* Overlay routes - these render with their own layout */}
        <Route
          path="/messages/:conversationId"
          element={
            <ProtectedRoute>
              <ConversationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dm-request/:userId"
          element={
            <ProtectedRoute>
              <SendDMRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:postId"
          element={
            <ProtectedRoute>
              <ReportPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms"
          element={
            <ProtectedRoute>
              <TermsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <ProtectedRoute>
              <PrivacyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayoutWithOutlet />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="flagged" element={<FlaggedPostsPage />} />
          <Route path="flagged/:postId" element={<FlaggedPostDetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:userId" element={<UserDetailPage />} />
          <Route path="users/:userId/posts" element={<UserPostsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GitHubPagesRedirectHandler />
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
