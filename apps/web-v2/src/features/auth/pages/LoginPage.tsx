/**
 * LoginPage
 *
 * Full-page wrapper for the login form with centered layout.
 */

import { Unplug } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LoginForm } from '../components/LoginForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export function LoginPage() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Check backend health on mount
    fetch(`${API_URL}/api/health`, { method: 'GET' })
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
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <LoginForm />
    </div>
  );
}
