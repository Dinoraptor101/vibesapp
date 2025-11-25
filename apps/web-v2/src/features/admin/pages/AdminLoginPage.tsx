/**
 * Admin Login Page
 * Password-only authentication for admin access
 * Includes invisible reCAPTCHA v3 for bot protection.
 */

import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const RECAPTCHA_ENABLED = import.meta.env.VITE_ENABLE_RECAPTCHA === 'true';

export function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleRecaptchaVerify = useCallback(async () => {
    if (!RECAPTCHA_ENABLED || !executeRecaptcha) {
      return undefined;
    }
    try {
      const token = await executeRecaptcha('admin_login');
      return token;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return undefined;
    }
  }, [executeRecaptcha]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }

    setIsLoading(true);

    try {
      // Get reCAPTCHA token if enabled
      const recaptchaToken = await handleRecaptchaVerify();

      await login(password, recaptchaToken);
      // Redirect to admin dashboard on success
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-1 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-purple mb-2">Vibes Admin</h1>
          <p className="text-text-secondary text-sm">Enter admin password to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-2 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Password Input */}
            <div className="mb-6">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Admin Password
              </label>
              <input
                id="admin-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-1 border border-border rounded-lg 
                         text-text-primary placeholder-text-tertiary
                         focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent
                         transition-all duration-200"
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-vibe-negative-light/10 border border-vibe-negative-light rounded-lg">
                <p className="text-sm text-vibe-negative-light">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-3 bg-brand-purple hover:bg-brand-purple-dark 
                       text-white font-medium rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 focus:ring-offset-surface-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-tertiary">
            Admin access is restricted. All login attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
