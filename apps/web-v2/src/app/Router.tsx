/**
 * Application Router
 * Defines all routes and navigation structure
 */

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
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Placeholder pages (will be created in future phases)
function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-purple mb-4">VibesApp V2</h1>
        <p className="text-text-secondary">Home Feed Coming Soon</p>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        <p className="text-text-secondary">Login page coming soon</p>
      </div>
    </div>
  );
}

function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
        <p className="text-text-secondary">Signup page coming soon</p>
      </div>
    </div>
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
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Component Examples */}
        <Route path="/examples/button" element={<ButtonExamplesPage />} />
        <Route path="/examples/input" element={<InputExamplesPage />} />
        <Route path="/examples/card" element={<CardExamplesPage />} />
        <Route path="/examples/dialog" element={<DialogExamplesPage />} />

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
    </BrowserRouter>
  );
}
