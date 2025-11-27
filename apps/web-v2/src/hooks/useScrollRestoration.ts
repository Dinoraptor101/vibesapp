/**
 * Scroll Restoration Hook
 *
 * Saves scroll position when navigating away from a page and restores it when returning.
 * Uses sessionStorage to persist scroll positions across navigation.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_STORAGE_KEY = 'vibes_scroll_positions';

// Get stored scroll positions from sessionStorage
function getScrollPositions(): Record<string, number> {
  try {
    const stored = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save scroll positions to sessionStorage
function saveScrollPositions(positions: Record<string, number>): void {
  try {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook to restore scroll position for a specific route
 * @param key - Unique key for this scroll position (usually the route path)
 * @param enabled - Whether scroll restoration is enabled (default: true)
 */
export function useScrollRestoration(key?: string, enabled = true) {
  const location = useLocation();
  const scrollKey = key || location.pathname;
  const hasRestoredRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // Save current scroll position
  const saveScrollPosition = useCallback(() => {
    if (!enabled) return;

    const scrollY = window.scrollY;
    const positions = getScrollPositions();
    positions[scrollKey] = scrollY;
    saveScrollPositions(positions);
  }, [scrollKey, enabled]);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    if (!enabled || hasRestoredRef.current) return;

    const positions = getScrollPositions();
    const savedPosition = positions[scrollKey];

    if (savedPosition !== undefined && savedPosition > 0) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
        hasRestoredRef.current = true;
      });
    }
  }, [scrollKey, enabled]);

  // Save scroll position when leaving the page
  useEffect(() => {
    if (!enabled) return;

    // Save on beforeunload (page refresh/close)
    const handleBeforeUnload = () => saveScrollPosition();
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Save on visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScrollPosition();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Save position when component unmounts (navigation)
      saveScrollPosition();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveScrollPosition, enabled]);

  // Restore scroll position on mount
  useEffect(() => {
    if (!enabled || !isInitialMountRef.current) return;

    isInitialMountRef.current = false;

    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      restoreScrollPosition();
    }, 50);

    return () => clearTimeout(timer);
  }, [restoreScrollPosition, enabled]);

  // Reset restoration flag when key changes
  useEffect(() => {
    hasRestoredRef.current = false;
  }, [scrollKey]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
  };
}

/**
 * Clear saved scroll position for a specific key
 */
export function clearScrollPosition(key: string): void {
  const positions = getScrollPositions();
  delete positions[key];
  saveScrollPositions(positions);
}

/**
 * Clear all saved scroll positions
 */
export function clearAllScrollPositions(): void {
  try {
    sessionStorage.removeItem(SCROLL_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
