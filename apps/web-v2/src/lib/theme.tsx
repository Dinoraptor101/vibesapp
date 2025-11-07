/**
 * Theme Context and Hook
 *
 * Provides theme state management (light/dim/dark) with localStorage persistence.
 * Used throughout the app for theme switching.
 */

import { createContext, useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dim' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  const applyTheme = useCallback((newTheme: Theme) => {
    // Remove all theme classes
    document.body.classList.remove('light', 'dim', 'dark');
    // Add the new theme class
    document.body.classList.add(newTheme);
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  }, []);

  useEffect(() => {
    // Load saved theme from localStorage or default to 'light'
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, [applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

// Export hook in separate file to avoid fast refresh issues
export { ThemeContext };
