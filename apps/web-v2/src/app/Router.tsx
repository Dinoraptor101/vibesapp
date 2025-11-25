/**
 * Application Router
 * Defines all routes and navigation structure
 */

import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
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
import { ActivityPage } from '@/pages/ActivityPage';
import { ConversationPage } from '@/pages/ConversationPage';
import { CreatePostPage } from '@/pages/CreatePostPage';
import { HomePage } from '@/pages/HomePage';
import { MessagesPage } from '@/pages/MessagesPage';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ReportPostPage } from '@/pages/ReportPostPage';
import { SendDMRequestPage } from '@/pages/SendDMRequestPage';
import { SettingsPage } from '@/pages/SettingsPage';

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

export function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <ConversationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <ProtectedRoute>
                <PostDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
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
      </AuthProvider>
    </BrowserRouter>
  );
}
