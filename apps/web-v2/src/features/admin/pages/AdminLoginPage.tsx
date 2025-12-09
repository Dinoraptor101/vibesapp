/**
 * Admin Login Page
 * Password-only authentication for admin access
 * Includes invisible reCAPTCHA v3 for bot protection.
 * ZEN: Minimal, shake-on-error, combined input+button
 */

import { CircleSlash, CornerDownLeft } from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui-next';
import { useAdminAuth } from '../hooks/useAdminAuth';
import '../../auth/components/LoginForm.css'; // Shake animation

const RECAPTCHA_ENABLED = import.meta.env.VITE_ENABLE_RECAPTCHA === 'true';

export function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
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

  const triggerErrorFeedback = () => {
    setShowError(true);
    setIsShaking(true);

    // Timeline: 0-600ms shake, 800ms clear
    setTimeout(() => setIsShaking(false), 600);
    setTimeout(() => {
      setPassword('');
      setShowError(false);
    }, 800);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password.trim()) {
      triggerErrorFeedback();
      return;
    }

    setIsLoading(true);

    try {
      const recaptchaToken = await handleRecaptchaVerify();
      await login(password, recaptchaToken);
      navigate('/admin/dashboard');
    } catch {
      triggerErrorFeedback();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dim:bg-gray-900 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo/Header - ZEN: Clean, no redundant text */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-brand-purple rounded-xl flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dim:text-white dark:text-white">
            Vibes Admin
          </h1>
        </div>

        {/* Login Form - ZEN: Combined input + button, shake on error */}
        <form onSubmit={handleSubmit} data-testid="admin-login-form">
          <div className="flex items-center gap-0">
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              placeholder="Enter password"
              className={`flex-1 h-12 px-4 bg-white dim:bg-gray-800 dark:bg-gray-900 border border-gray-200 dim:border-gray-700 dark:border-gray-800 rounded-l-lg 
                         text-gray-900 dim:text-white dark:text-white placeholder:text-gray-400 dim:placeholder:text-gray-500 dark:placeholder:text-gray-600
                         focus:outline-none focus:ring-2 focus:ring-brand-purple/50 
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         ${isShaking ? 'animate-shake' : ''}`}
            />

            {/* Submit button - morphs to error icon on failure */}
            <Button
              type="submit"
              variant={showError ? 'destructive' : 'primary'}
              size="md"
              disabled={isLoading || !password.trim()}
              className="h-12 w-12 min-w-[48px] p-0 rounded-l-none border-l-0 transition-all duration-300"
              aria-label="Login"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {/* Default return icon */}
                <CornerDownLeft
                  className={`absolute transition-all duration-300 ${
                    showError ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                  }`}
                  size={20}
                />
                {/* Error icon */}
                <CircleSlash
                  className={`absolute transition-all duration-300 ${
                    showError ? 'opacity-100 scale-100' : 'opacity-0 scale-125'
                  }`}
                  size={20}
                />
              </div>
            </Button>
          </div>
        </form>

        {/* Footer - ZEN: Clean deterrent message */}
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500 dim:text-gray-400 dark:text-gray-500">
            IP address and location logged.{' '}
            <a
              href="https://www.ic3.gov/Home/ComplaintChoice"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dim:text-gray-300 dark:text-gray-400 hover:text-brand-purple dim:hover:text-brand-purple dark:hover:text-brand-purple transition-colors underline"
            >
              Report fraud
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
