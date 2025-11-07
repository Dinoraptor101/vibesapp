/**
 * Authentication Context for VibesApp
 *
 * Manages user authentication state, login/logout, and session persistence.
 * Uses Pigeon ID (password-only) authentication system.
 */

import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteCookie, getCookie, setCookie } from '@/lib/api';
import type { AuthState, User } from '@/types';
import { authApi } from '../services/authApi';

interface AuthContextType extends AuthState {
  login: (pigeonId: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
   */
  const login = useCallback(
    async (pigeonId: string) => {
      try {
        setIsLoading(true);
        const userData = await authApi.login(pigeonId);

        // Store credentials in cookies
        setCookie('pigeonId', pigeonId, 30); // 30 days
        setCookie('userId', userData._id, 30);

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
   */
  const logout = useCallback(() => {
    setUser(null);
    deleteCookie('pigeonId');
    deleteCookie('userId');
    navigate('/login');
  }, [navigate]);

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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
