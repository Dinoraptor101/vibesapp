/**
 * Admin Authentication Context
 * Manages admin session state and authentication
 */

import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import { deleteCookie, getCookie, setCookie } from '@/lib/api';

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiry: number | null;
}

interface AdminAuthContextValue extends AdminAuthState {
  login: (password: string, recaptchaToken?: string) => Promise<void>;
  logout: () => void;
  checkSession: () => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

// Session duration: 1 hour (in milliseconds)
const SESSION_DURATION = 60 * 60 * 1000;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isLoading: true,
    sessionExpiry: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const adminToken = getCookie('adminToken');
      const expiry = getCookie('adminSessionExpiry');

      if (adminToken && expiry) {
        const expiryTime = Number.parseInt(expiry, 10);
        const now = Date.now();

        if (now < expiryTime) {
          // Session is still valid
          setState({
            isAuthenticated: true,
            isLoading: false,
            sessionExpiry: expiryTime,
          });
          return;
        }
      }

      // No valid session
      setState({
        isAuthenticated: false,
        isLoading: false,
        sessionExpiry: null,
      });
    };

    checkExistingSession();
  }, []);

  const logout = useCallback((): void => {
    // Clear session cookies
    deleteCookie('adminToken');
    deleteCookie('adminSessionExpiry');

    setState({
      isAuthenticated: false,
      isLoading: false,
      sessionExpiry: null,
    });
  }, []);

  // Auto-logout when session expires
  useEffect(() => {
    if (!state.sessionExpiry) return;

    const timeUntilExpiry = state.sessionExpiry - Date.now();

    if (timeUntilExpiry <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
      window.alert('Your admin session has expired. Please log in again.');
    }, timeUntilExpiry);

    return () => clearTimeout(timer);
  }, [state.sessionExpiry, logout]);

  const login = async (password: string, recaptchaToken?: string): Promise<void> => {
    // Call backend API to verify password
    try {
      // Verify admin credentials with backend
      const apiBaseURL = import.meta.env.VITE_API_URL;

      if (!apiBaseURL) {
        throw new Error('VITE_API_URL environment variable is required');
      }

      const response = await fetch(`${apiBaseURL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, recaptchaToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid password');
      }

      const data = await response.json();

      // Set session cookies
      const expiry = Date.now() + SESSION_DURATION;
      setCookie('adminToken', data.token, 1 / 24); // 1 hour
      setCookie('adminSessionExpiry', expiry.toString(), 1 / 24);

      setState({
        isAuthenticated: true,
        isLoading: false,
        sessionExpiry: expiry,
      });
    } catch (err) {
      console.error('Admin login error:', err);
      throw err;
    }
  };

  const checkSession = (): boolean => {
    if (!state.sessionExpiry) return false;
    return Date.now() < state.sessionExpiry;
  };

  const value: AdminAuthContextValue = {
    ...state,
    login,
    logout,
    checkSession,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

// Export context for use in hook
export { AdminAuthContext };
