/**
 * Protected Route Component
 *
 * Wrapper component for routes that require authentication.
 * Redirects to login if user is not authenticated.
 */

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Navigate, type To } from 'react-router-dom';
import { Spinner } from '@/components/ui-next';
import { useAuth } from '@/features/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: To;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoader, setShowLoader] = useState(false);

  // ZEN: Only show loading spinner after 1 second delay
  useEffect(() => {
    if (!isLoading) {
      setShowLoader(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Show nothing while checking auth (under 1 second)
  if (isLoading && !showLoader) {
    return null;
  }

  // Show loading spinner only if auth check takes longer than 1 second
  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg-base dark:bg-dark-bg-base">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="xl" variant="primary" />
          <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render protected content
  return <>{children}</>;
}
