/**
 * PigeonIdRegenerator Component
 *
 * Reusable component for regenerating Pigeon IDs (passwords) with press-and-hold UX.
 * Security:
 * - In user context: Can only regenerate own password (uses authApi.regeneratePigeonId)
 * - In admin context: Can regenerate any user's password (uses admin API endpoint with admin token)
 */

import { Check, Copy, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/features/auth/services/authApi';
import { getCookie, setCookie } from '@/lib/api';
import api from '@/lib/api';

interface PigeonIdRegeneratorProps {
  /** The user ID whose password to regenerate */
  userId: string;
  /** The username for display purposes */
  userName: string;
  /** Context: 'user' for own password, 'admin' for admin regenerating user's password */
  context: 'user' | 'admin';
  /** Whether online (to disable when offline) */
  isOnline: boolean;
  /** Optional callback when regeneration succeeds */
  onSuccess?: (newPigeonId: string) => void;
}

export function PigeonIdRegenerator({
  userId,
  userName,
  context,
  isOnline,
  onSuccess,
}: PigeonIdRegeneratorProps) {
  const [pigeonId, setPigeonId] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateProgress, setRegenerateProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const regenerateTimerRef = useRef<number | null>(null);
  const regenerateIntervalRef = useRef<number | null>(null);

  // Load Pigeon ID from cookie on mount (user context only)
  useEffect(() => {
    if (context === 'user') {
      const storedPigeonId = getCookie('pigeonId');
      if (storedPigeonId) {
        setPigeonId(storedPigeonId);
      }
    }
  }, [context]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (regenerateTimerRef.current) {
        clearTimeout(regenerateTimerRef.current);
      }
      if (regenerateIntervalRef.current) {
        clearInterval(regenerateIntervalRef.current);
      }
    };
  }, []);

  // Handle copying Pigeon ID to clipboard
  const handleCopy = async () => {
    if (pigeonId) {
      try {
        await navigator.clipboard.writeText(pigeonId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        console.log('Pigeon ID copied to clipboard');
      } catch (error) {
        console.error('Failed to copy Pigeon ID:', error);
      }
    }
  };

  // Handle regenerating Pigeon ID
  const handleRegenerate = async () => {
    if (!isOnline) return;

    setIsRegenerating(true);

    try {
      let newPigeonId: string;

      if (context === 'user') {
        // User regenerating their own password - uses authApi
        newPigeonId = await authApi.regeneratePigeonId(userId);

        // Update cookie with new Pigeon ID
        setCookie('pigeonId', newPigeonId, 365);
        setPigeonId(newPigeonId);

        console.log('Pigeon ID regenerated successfully (user context)');
      } else {
        // Admin regenerating user's password - uses admin API endpoint
        const response = (await api.post(`/admin/users/${userId}/regenerate-password`)) as {
          success: boolean;
          newPassword: string;
        };

        newPigeonId = response.newPassword;
        setPigeonId(newPigeonId);

        console.log('Password regenerated successfully (admin context)');
      }

      // Call success callback
      onSuccess?.(newPigeonId);
    } catch (error) {
      console.error('Failed to regenerate Pigeon ID:', error);
      alert('Failed to regenerate password. Please try again.');
    } finally {
      setIsRegenerating(false);
      setRegenerateProgress(0);
    }
  };

  // Press and hold handlers
  const handleMouseDown = () => {
    if (isRegenerating) return;

    // Start progress animation
    setRegenerateProgress(0);
    const startTime = Date.now();
    const holdDuration = 2000; // 2 seconds hold required

    regenerateIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / holdDuration) * 100, 100);
      setRegenerateProgress(progress);
    }, 50);

    // Trigger regeneration after hold duration
    regenerateTimerRef.current = window.setTimeout(() => {
      if (regenerateIntervalRef.current) {
        clearInterval(regenerateIntervalRef.current);
      }
      setRegenerateProgress(100);
      handleRegenerate();
    }, holdDuration);
  };

  const handleMouseUp = () => {
    // Cancel if not held long enough
    if (regenerateTimerRef.current) {
      clearTimeout(regenerateTimerRef.current);
      regenerateTimerRef.current = null;
    }
    if (regenerateIntervalRef.current) {
      clearInterval(regenerateIntervalRef.current);
      regenerateIntervalRef.current = null;
    }
    setRegenerateProgress(0);
  };

  return (
    <div className="rounded-lg border-2 border-brand-purple bg-brand-purple/5 p-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={!isOnline || isRegenerating}
          className="relative shrink-0 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Hold for 2 seconds to regenerate Pigeon ID"
        >
          {isRegenerating ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-purple" />
          ) : (
            <>
              <RotateCcw className="h-4 w-4 text-brand-purple relative z-10" />
              {regenerateProgress > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 36 36"
                  aria-hidden="true"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${regenerateProgress} 100`}
                    className="text-brand-purple opacity-30"
                  />
                </svg>
              )}
            </>
          )}
        </button>
        <div className="flex flex-1 items-center justify-between rounded-md bg-white dim:bg-gray-700 dark:bg-gray-800 p-3 font-mono text-sm sm:text-base">
          <span className="font-bold text-gray-900 dim:text-gray-100 dark:text-gray-100 truncate mr-2">
            {pigeonId || 'Loading...'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
            disabled={!pigeonId}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="font-semibold text-yellow-800 dim:text-yellow-300 dark:text-yellow-200">
          ⚠️ Important:
        </p>
        <ul className="list-inside list-disc space-y-1 text-gray-700 dim:text-gray-300 dark:text-gray-400">
          <li>
            This acts as {context === 'admin' ? `${userName}'s` : 'your'} password across all
            devices
          </li>
          <li>
            Never share! - it gives full access to {context === 'admin' ? 'their' : 'your'} account
          </li>
          <li className="font-bold text-red-600 dark:text-red-400">
            Regenerating will log {context === 'admin' ? 'them' : 'you'} out from all other devices
          </li>
        </ul>
      </div>
    </div>
  );
}
