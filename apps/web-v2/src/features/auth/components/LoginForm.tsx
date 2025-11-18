/**
 * LoginForm Component
 *
 * Zen minimal login - poetic tagline, single input, clean design.
 */

import { CircleSlash, CornerDownLeft } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui-next';
import { useAuth } from '@/features/auth/context/useAuth';
import { deleteCookie } from '@/lib';
import './LoginForm.css';

export function LoginForm() {
  const [pigeonId, setPigeonId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear any stale cookies when landing on login page
  useEffect(() => {
    deleteCookie('pigeonId');
    deleteCookie('userId');
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!pigeonId.trim()) {
      // Trigger error animation for empty input
      setShowError(true);
      setIsShaking(true);

      setTimeout(() => setIsShaking(false), 600);
      setTimeout(() => setShowError(false), 800);
      return;
    }

    setIsLoading(true);

    try {
      await login(pigeonId.trim());
      navigate('/');
    } catch {
      // Animate error feedback (logging handled by AuthContext)
      setShowError(true);
      setIsShaking(true);

      // Timeline:
      // 0-800ms: Show error icon (red)
      // 300-600ms: Shake input
      // 800ms: Clear input and reset button

      setTimeout(() => {
        setIsShaking(false);
      }, 600);

      setTimeout(() => {
        setPigeonId('');
        setShowError(false);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Logo + Tagline */}
      <div className="text-center space-y-3">
        <div className="text-6xl mb-2">🕊️</div>
        <p className="text-base text-text-secondary font-light tracking-wide">
          find your flock, locally
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pigeon ID input with inline return button */}
        <div className="flex items-center gap-0">
          <input
            type="text"
            value={pigeonId}
            onChange={(e) => setPigeonId(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="current-password"
            placeholder="your pigeon id"
            className={`flex-1 h-12 px-4 bg-surface border border-border rounded-l-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isShaking ? 'animate-shake' : ''
            }`}
          />

          {/* Return icon button - morphs to error icon */}
          <Button
            type="submit"
            variant={showError ? 'destructive' : 'primary'}
            size="md"
            disabled={isLoading || !pigeonId.trim()}
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

      {/* Sign Up Link */}
      <div className="text-center">
        <Link
          to="/signup"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          i am new
        </Link>
      </div>
    </div>
  );
}
