/**
 * Document Scroll Utilities
 * Reusable utilities for smooth scrolling in long-form documents
 * with table of contents navigation
 */

/**
 * Smooth scroll to a target position with easing animation
 * @param targetPosition - The scroll position to scroll to
 * @param duration - Duration of the animation in milliseconds (default: 800ms)
 */
export function smoothScrollTo(targetPosition: number, duration = 800): void {
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animation = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);

    window.scrollTo(0, startPosition + distance * easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
}

/**
 * Scroll to an element by ID with offset for fixed navigation bars
 * @param elementId - The ID of the element to scroll to
 * @param offset - Offset from top in pixels (default: 80px for nav bar)
 * @param duration - Duration of the animation in milliseconds (default: 1000ms)
 * @param updateUrl - Whether to update the URL hash (default: true)
 * @returns true if element was found and scrolled to, false otherwise
 */
export function scrollToElement(
  elementId: string,
  offset = 80,
  duration = 1000,
  updateUrl = true
): boolean {
  const element = document.getElementById(elementId);
  if (!element) {
    return false;
  }

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;
  smoothScrollTo(offsetPosition, duration);

  if (updateUrl) {
    window.history.pushState(null, '', `#${elementId}`);
  }

  return true;
}

/**
 * Handle click event for table of contents links
 * @param e - React mouse event
 * @param sectionId - The ID of the section to scroll to
 * @param offset - Offset from top in pixels (default: 80px)
 * @param duration - Duration of the animation in milliseconds (default: 1000ms)
 */
export function handleTOCClick(
  e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  sectionId: string,
  offset = 80,
  duration = 1000
): void {
  e.preventDefault();
  scrollToElement(sectionId, offset, duration);
}

/**
 * Check if user has scrolled past a specific element
 * Used to show/hide back-to-top or back-to-TOC buttons
 * @param selector - CSS selector for the element (e.g., '[data-toc]')
 * @returns true if scrolled past the element, false otherwise
 */
export function hasScrolledPast(selector: string): boolean {
  const element = document.querySelector(selector);
  if (!element) {
    return false;
  }

  const elementBottom = element.getBoundingClientRect().bottom + window.scrollY;
  const currentScroll = window.scrollY;
  return currentScroll > elementBottom;
}

/**
 * Hook to track whether user has scrolled past an element
 * @param selector - CSS selector for the element to track
 * @returns [hasScrolledPast, checkScroll] - Current state and manual check function
 */
export function useScrollPastElement(selector: string): [boolean, () => void] {
  const [hasScrolled, setHasScrolled] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    setHasScrolled(hasScrolledPast(selector));
  }, [selector]);

  React.useEffect(() => {
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, [checkScroll]);

  return [hasScrolled, checkScroll];
}

/**
 * Hook to handle initial hash navigation on page load
 * Scrolls to the hash target with offset when the page loads
 * @param offset - Offset from top in pixels (default: 80px)
 * @param duration - Duration of the animation in milliseconds (default: 1000ms)
 * @param delay - Delay before scrolling in milliseconds (default: 100ms to ensure DOM is ready)
 */
export function useInitialHashScroll(offset = 80, duration = 1000, delay = 100): void {
  React.useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => {
        scrollToElement(hash, offset, duration, false);
      }, delay);
    }
  }, [offset, duration, delay]);
}

// Re-export React for convenience in hooks
import * as React from 'react';
