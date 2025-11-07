/**
 * LoginForm Component
 *
 * Simple password-only login form for Pigeon ID authentication.
 * Shows error messages, loading state, and links to signup.
 */

import { AlertCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardFooter, CardHeader, Input } from '@/components/ui-next';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui-next';
import { useAuth } from '@/features/auth/context/useAuth';

export function LoginForm() {
  const [pigeonId, setPigeonId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!pigeonId.trim()) {
      setError('Please enter your Pigeon ID');
      return;
    }

    setIsLoading(true);

    try {
      await login(pigeonId.trim());
      // AuthContext handles navigation after successful login
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error ? err.message : 'Invalid Pigeon ID. Please check and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-brand-purple">Welcome Back</h1>
            <p className="text-text-secondary">Enter your Pigeon ID to continue</p>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-vibe-negative-bg border border-vibe-negative rounded-lg">
                <AlertCircle className="w-5 h-5 text-vibe-negative flex-shrink-0 mt-0.5" />
                <p className="text-sm text-vibe-negative">{error}</p>
              </div>
            )}

            {/* Pigeon ID input */}
            <Input
              type="password"
              label="Pigeon ID"
              placeholder="your-pigeon-id-1234"
              value={pigeonId}
              onChange={(e) => setPigeonId(e.target.value)}
              disabled={isLoading}
              showPasswordToggle
              required
              helperText="Your unique Pigeon ID is your password"
              autoComplete="current-password"
              autoFocus
            />

            {/* Forgot password link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-brand-purple hover:underline focus:outline-none focus:underline"
              >
                Lost your Pigeon ID?
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            {/* Login button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading || !pigeonId.trim()}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>

            {/* Signup link */}
            <div className="text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-brand-purple font-semibold hover:underline focus:outline-none focus:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent>
          <DialogTitle>Lost Your Pigeon ID?</DialogTitle>
          <DialogDescription className="space-y-4">
            <p>
              Your Pigeon ID is your unique password for VibesApp. If you've lost it, you'll need to
              contact an administrator to regenerate it.
            </p>
            <div className="bg-surface-alt p-4 rounded-lg border border-border">
              <p className="text-sm text-text-secondary">
                <strong className="text-text-primary">How to get help:</strong>
                <br />
                1. Contact the VibesApp admin team
                <br />
                2. Provide your username or email
                <br />
                3. They will regenerate your Pigeon ID
                <br />
                4. You'll receive your new Pigeon ID securely
              </p>
            </div>
            <p className="text-sm text-text-tertiary">
              For security reasons, Pigeon IDs cannot be recovered - they can only be regenerated by
              an administrator.
            </p>
          </DialogDescription>

          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowForgotModal(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
