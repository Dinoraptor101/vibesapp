/**
 * Application Router
 * Defines all routes and navigation structure
 */

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ButtonExamplesPage } from '@/app/pages/ButtonExamplesPage';
import { CardExamplesPage } from '@/app/pages/CardExamplesPage';
import { DialogExamplesPage } from '@/app/pages/DialogExamplesPage';
import { InputExamplesPage } from '@/app/pages/InputExamplesPage';
import {
  AdminDashboardPage,
  AdminLoginPage,
  AdminSettingsPage,
  FlaggedPostsPage,
  ProtectedAdminRoute,
  UsersPage,
} from '@/features/admin';
import { AuthProvider, LoginPage, ProtectedRoute, SignupPage } from '@/features/auth';
import { ActivityPage } from '@/pages/ActivityPage';
import { AuthTest } from '@/pages/AuthTest';
import { CreatePostPage } from '@/pages/CreatePostPage';
import AvatarExamplesPage from '@/pages/examples/AvatarExamplesPage';
import BadgeExamplesPage from '@/pages/examples/BadgeExamplesPage';
import LoadingExamplesPage from '@/pages/examples/LoadingExamplesPage';
import PostsExamplePage from '@/pages/examples/PostsExamplePage';
import { HomePage } from '@/pages/HomePage';
import { MessagesPage } from '@/pages/MessagesPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';

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
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePostPage />
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
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Auth Testing */}
          <Route path="/test/auth" element={<AuthTest />} />

          {/* Component Examples */}
          <Route path="/examples/button" element={<ButtonExamplesPage />} />
          <Route path="/examples/input" element={<InputExamplesPage />} />
          <Route path="/examples/card" element={<CardExamplesPage />} />
          <Route path="/examples/dialog" element={<DialogExamplesPage />} />
          <Route path="/examples/avatar" element={<AvatarExamplesPage />} />
          <Route path="/examples/badge" element={<BadgeExamplesPage />} />
          <Route path="/examples/loading" element={<LoadingExamplesPage />} />
          <Route path="/examples/posts" element={<PostsExamplePage />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/flagged"
            element={
              <ProtectedAdminRoute>
                <FlaggedPostsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <UsersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminSettingsPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
