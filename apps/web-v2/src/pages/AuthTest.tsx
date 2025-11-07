import { useState } from 'react';
import { Button, Input } from '@/components/ui-next';
import { useAuth } from '@/features/auth';

/**
 * Temporary test page to validate authentication flow
 * This page helps test:
 * - Login with pigeonId
 * - Cookie storage
 * - User state management
 * - Logout functionality
 * - Session restoration
 */
export function AuthTest() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [pigeonId, setPigeonId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(pigeonId);
      setPigeonId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading auth state...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Auth System Test</h1>

      {/* Authentication Status */}
      <div className="mb-8 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-xl font-semibold">Status</h2>
        <div className="space-y-2">
          <p>
            <strong>Authenticated:</strong>{' '}
            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {isAuthenticated ? 'Yes' : 'No'}
            </span>
          </p>
          {user && (
            <>
              <p>
                <strong>User ID:</strong> {user._id}
              </p>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>MBTI:</strong> {user.mbtiPersonality || 'Not set'}
              </p>
              <p>
                <strong>Polarity:</strong> {user.polarity}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Cookie Info */}
      <div className="mb-8 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-xl font-semibold">Cookies</h2>
        <div className="space-y-2 font-mono text-sm">
          <p>
            <strong>pigeonId:</strong>{' '}
            {document.cookie.includes('pigeonId') ? '✓ Present' : '✗ Missing'}
          </p>
          <p>
            <strong>userId:</strong>{' '}
            {document.cookie.includes('userId') ? '✓ Present' : '✗ Missing'}
          </p>
        </div>
      </div>

      {/* Login Form */}
      {!isAuthenticated ? (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-xl font-semibold">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="pigeonId" className="mb-2 block text-sm font-medium">
                Pigeon ID
              </label>
              <Input
                id="pigeonId"
                type="password"
                value={pigeonId}
                onChange={(e) => setPigeonId(e.target.value)}
                placeholder="Enter your Pigeon ID"
                required
              />
            </div>
            {error && (
              <div className="rounded border border-red-500 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" disabled={!pigeonId.trim()}>
              Login
            </Button>
          </form>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-xl font-semibold">Actions</h2>
          <div className="space-y-4">
            <Button onClick={logout} variant="destructive">
              Logout
            </Button>
            <div className="rounded border border-blue-500 bg-blue-50 p-4 text-sm text-blue-800">
              <p className="mb-2 font-semibold">✓ Auth system working!</p>
              <ul className="list-inside list-disc space-y-1">
                <li>User data loaded</li>
                <li>Cookies stored</li>
                <li>Context state updated</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-xl font-semibold">Test Instructions</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm">
          <li>Enter a valid Pigeon ID (password) and click Login</li>
          <li>Verify user data appears above</li>
          <li>Check cookies are present</li>
          <li>Refresh the page - should stay logged in</li>
          <li>Click Logout - should clear state and cookies</li>
          <li>Navigate away and back - should redirect to login if not authenticated</li>
        </ol>
      </div>
    </div>
  );
}
