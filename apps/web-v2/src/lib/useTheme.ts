/**
 * useTheme Hook
 *
 * Access theme state and setter from ThemeContext.
 * Separated from ThemeProvider to avoid fast refresh issues.
 */

import { useContext } from 'react';
import { ThemeContext } from './theme';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
