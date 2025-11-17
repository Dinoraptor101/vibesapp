/**
 * useAuth Hook
 *
 * Custom hook to access authentication context
 */

import { useContext } from 'react';
import { AuthContext } from './types';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
