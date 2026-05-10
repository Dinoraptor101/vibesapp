/**
 * Authentication Context Types
 *
 * Type definitions for the authentication system
 */

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext } from 'react';
import type { AuthState } from '@/types';

export interface AuthContextType extends AuthState {
  login: (pigeonId: string, recaptchaToken?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  // Firebase auth state — populated when user signed in via Firebase.
  // null means signed-out or Firebase disabled. Consumed by PR #3+ login flows.
  firebaseUser: FirebaseUser | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
