/**
 * Persistent Pages Utilities
 * Helper functions for determining if a path should use persistent page layout
 */

// Check if path is a post detail page
function isPostDetailPath(pathname: string): boolean {
  return pathname.startsWith('/post/');
}

// Check if path is a profile page
function isProfilePath(pathname: string): boolean {
  return pathname.startsWith('/profile/');
}

// Define the persistent page paths
const PERSISTENT_PAGE_PATHS = ['/', '/activity', '/create-post', '/messages', '/settings'];

// Get the index of a path in the persistent pages array
function getPageIndex(pathname: string): number {
  return PERSISTENT_PAGE_PATHS.indexOf(pathname);
}

/**
 * Check if a path should be handled by persistent pages
 * This includes main navigation pages, post detail pages, and profile pages
 */
export function isPersistentPage(pathname: string): boolean {
  return getPageIndex(pathname) !== -1 || isPostDetailPath(pathname) || isProfilePath(pathname);
}
