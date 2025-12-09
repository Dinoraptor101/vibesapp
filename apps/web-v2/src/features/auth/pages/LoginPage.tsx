/**
 * LoginPage
 *
 * Full-page wrapper for the login form with centered layout.
 * Includes reCAPTCHA v3 disclosure text at bottom.
 */

import { Unplug } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LoginForm } from '../components/LoginForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const RECAPTCHA_ENABLED = import.meta.env.VITE_ENABLE_RECAPTCHA === 'true';

export function LoginPage() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Check backend health on mount
    fetch(`${API_URL}/health`, { method: 'GET' })
      .then((res) => setBackendOnline(res.ok))
      .catch(() => setBackendOnline(false));
  }, []);

  // Show nothing while checking
  if (backendOnline === null) {
    return null;
  }

  // Show offline icon if backend unreachable
  if (!backendOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Unplug className="w-32 h-32 text-text-tertiary opacity-40" strokeWidth={1.5} />
      </div>
    );
  }

  // Show login form if backend online
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4">
      <LoginForm />

      {/* reCAPTCHA disclosure - required by Google ToS */}
      {RECAPTCHA_ENABLED && (
        <p className="fixed bottom-4 left-0 right-0 text-center text-xs text-text-tertiary/50">
          Protected by reCAPTCHA.{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-tertiary"
          >
            Privacy
          </a>
          {' · '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-tertiary"
          >
            Terms
          </a>
        </p>
      )}
    </div>
  );
}
