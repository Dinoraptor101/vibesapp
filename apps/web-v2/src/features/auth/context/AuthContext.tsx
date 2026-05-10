/**
 * Authentication Provider Component
 *
 * Manages user authentication state, login/logout, and session persistence.
 * Uses Pigeon ID (password-only) authentication system.
 */

import { useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalSSE } from '@/components/GlobalSSE';
import { clearAllScrollPositions } from '@/hooks/useScrollRestoration';
import { deleteCookie, getCookie, setCookie } from '@/lib/api';
import { getFirebaseAuth } from '@/lib/firebase';
import type { User } from '@/types';
import { authApi } from '../services/authApi';
import { AuthContext, type AuthContextType } from './types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /**
   * Initialize auth state from cookies on mount
   */
  const initializeAuth = useCallback(async () => {
    try {
      const pigeonId = getCookie('pigeonId');
      const userId = getCookie('userId');

      if (pigeonId && userId) {
        // Validate session by fetching user data
        const userData = await authApi.getCurrentUser(userId);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear invalid cookies
      deleteCookie('pigeonId');
      deleteCookie('userId');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with Pigeon ID
   * @param pigeonId - The user's Pigeon ID (password)
   * @param recaptchaToken - Optional reCAPTCHA v3 token for bot protection
   */
  const login = useCallback(
    async (pigeonId: string, recaptchaToken?: string) => {
      try {
        setIsLoading(true);
        const userData = await authApi.login(pigeonId, recaptchaToken);

        // Store credentials in cookies (10 years - effectively permanent)
        setCookie('pigeonId', pigeonId, 3650); // 10 years
        setCookie('userId', userData._id, 3650); // 10 years

        setUser(userData);
        navigate('/');
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Logout and clear session
   * Clears all user-specific data to prevent leaking to next user
   */
  const logout = useCallback(() => {
    // 1. Clear React state
    setUser(null);

    // 2. Clear auth cookies
    deleteCookie('pigeonId');
    deleteCookie('userId');

    // 3. Clear React Query cache (posts, messages, activities, profiles, etc.)
    queryClient.clear();

    // 4. Clear scroll positions from sessionStorage
    clearAllScrollPositions();

    // 5. Clear user-specific localStorage (keep theme - it's app-wide)
    localStorage.removeItem('proximityRange');

    // 6. Navigate to login
    navigate('/login');
  }, [navigate, queryClient]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const userId = getCookie('userId');
      if (userId) {
        const userData = await authApi.getCurrentUser(userId);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout
      logout();
    }
  }, [logout]);

  /**
   * Listen for unauthorized events from API client
   */
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      deleteCookie('pigeonId');
      deleteCookie('userId');
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  /**
   * Initialize auth on mount
   */
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Subscribe to Firebase auth state. No-op if Firebase isn't configured
   * (env vars missing) — legacy pigeonId path keeps working untouched.
   */
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
    firebaseUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {user && <GlobalSSE userId={user._id} />}
      {children}
    </AuthContext.Provider>
  );
}
