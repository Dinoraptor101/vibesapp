/**
 * Authentication Context Types
 *
 * Type definitions for the authentication system
 */

import { createContext } from 'react';
import type { AuthState } from '@/types';

export interface AuthContextType extends AuthState {
  login: (pigeonId: string, recaptchaToken?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
