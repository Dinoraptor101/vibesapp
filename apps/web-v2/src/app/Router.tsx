/**
 * Application Router
 * Defines all routes and navigation structure
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

        {/* Admin routes (will be implemented in Phase 0.4) */}
        <Route path="/admin/*" element={<div>Admin Panel Coming Soon</div>} />

        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
