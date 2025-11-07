/**
 * LoginPage
 *
 * Full-page wrapper for the login form with centered layout.
 */

import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <LoginForm />
    </div>
  );
}
