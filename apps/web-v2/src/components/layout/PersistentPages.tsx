/**
 * PersistentPages Component
 *
 * Keeps main navigation pages mounted at all times to preserve state.
 * Pages slide horizontally based on navigation order, creating a native app feel.
 *
 * Benefits:
 * - Preserves scroll position when navigating between pages
 * - Preserves form state (e.g., draft posts, search queries)
 * - Preserves chat state and message drafts
 * - Instant page transitions with no loading
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { ActivityPageContent } from '@/pages/ActivityPage';
import { CreatePostPageContent } from '@/pages/CreatePostPage';
import { HomePageContent } from '@/pages/HomePage';
import { MessagesPageContent } from '@/pages/MessagesPage';
import { PostDetailPageContent } from '@/pages/PostDetailPage';
import { ProfilePageContent } from '@/pages/ProfilePage';
import { SettingsPageContent } from '@/pages/SettingsPage';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';

// Define the order of persistent pages (left to right)
// PostDetail is at the end as a slide-over from any page
const PERSISTENT_PAGES = [
  { path: '/', Component: HomePageContent, key: 'home' },
  { path: '/activity', Component: ActivityPageContent, key: 'activity' },
  { path: '/create-post', Component: CreatePostPageContent, key: 'create-post' },
  { path: '/messages', Component: MessagesPageContent, key: 'messages' },
  { path: '/settings', Component: SettingsPageContent, key: 'settings' },
] as const;

// Get the index of a path in the persistent pages array
function getPageIndex(pathname: string): number {
  const exactIndex = PERSISTENT_PAGES.findIndex((p) => p.path === pathname);
  if (exactIndex !== -1) return exactIndex;

  return -1;
}

// Check if path is a post detail page
function isPostDetailPath(pathname: string): boolean {
  return pathname.startsWith('/post/');
}

// Extract post ID from path
function getPostIdFromPath(pathname: string): string | null {
  if (!isPostDetailPath(pathname)) return null;
  const parts = pathname.split('/');
  return parts[2] || null;
}

// Check if path is a profile page
function isProfilePath(pathname: string): boolean {
  return pathname.startsWith('/profile/');
}

// Extract user ID from profile path
function getProfileUserIdFromPath(pathname: string): string | null {
  if (!isProfilePath(pathname)) return null;
  const parts = pathname.split('/');
  return parts[2] || null;
}

// Check if a path should be handled by persistent pages (including post detail and profile)
export function isPersistentPage(pathname: string): boolean {
  return getPageIndex(pathname) !== -1 || isPostDetailPath(pathname) || isProfilePath(pathname);
}

export function PersistentPages() {
  const location = useLocation();
  const { isOnline } = useNetworkStatus();
  const currentIndex = getPageIndex(location.pathname);
  const isPostDetail = isPostDetailPath(location.pathname);
  const currentPostId = getPostIdFromPath(location.pathname);
  const isProfile = isProfilePath(location.pathname);
  const currentProfileUserId = getProfileUserIdFromPath(location.pathname);
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const postDetailRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Track the last main page index (for returning from post detail)
  const lastMainPageIndex = useRef(0);

  // Track which pages have been visited (to know if we should restore scroll)
  const visitedPages = useRef<Set<number>>(new Set([0])); // Home is visited by default

  // Store scroll positions when navigating away
  const scrollPositions = useRef<number[]>(PERSISTENT_PAGES.map(() => 0));

  // Update last main page when on a main page
  useEffect(() => {
    if (currentIndex >= 0) {
      lastMainPageIndex.current = currentIndex;
    }
  }, [currentIndex]);

  // Save scroll position when leaving a page, mark new page as visited
  useEffect(() => {
    // Save scroll positions for all pages except current
    scrollContainerRefs.current.forEach((container, index) => {
      if (container && index !== currentIndex) {
        scrollPositions.current[index] = container.scrollTop;
      }
    });

    // Mark current page as visited
    if (currentIndex >= 0) {
      visitedPages.current.add(currentIndex);
    }
  }, [currentIndex]);

  // Restore scroll position when returning to a previously visited page
  // For first-time visits, scroll starts at 0 (default)
  useEffect(() => {
    if (currentIndex >= 0) {
      const container = scrollContainerRefs.current[currentIndex];
      if (container) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          // Only restore if we've visited this page before
          if (visitedPages.current.has(currentIndex)) {
            container.scrollTop = scrollPositions.current[currentIndex];
          } else {
            // First visit - ensure we're at the top
            container.scrollTop = 0;
          }
        });
      }
    }
  }, [currentIndex]);

  // Reset post detail scroll when opening a new post
  useEffect(() => {
    if (isPostDetail && postDetailRef.current) {
      postDetailRef.current.scrollTop = 0;
    }
  }, [isPostDetail, location.pathname]);

  // Reset profile scroll when opening a new profile
  useEffect(() => {
    if (isProfile && profileRef.current) {
      profileRef.current.scrollTop = 0;
    }
  }, [isProfile, location.pathname]);

  // If we're not on a persistent page, post detail, or profile, don't render
  if (currentIndex === -1 && !isPostDetail && !isProfile) {
    return null;
  }

  // Determine which main page to show (current or last visited when on post detail)
  const activeMainIndex = currentIndex >= 0 ? currentIndex : lastMainPageIndex.current;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navigation (Desktop) */}
      <TopNav />

      {/* Mobile Offline Indicator */}
      {!isOnline && (
        <div className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated/95 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-lg">
          <OfflineIndicator />
        </div>
      )}

      {/* Main Content - Horizontal sliding pages */}
      <main className="flex-1 pb-20 md:pb-0 overflow-hidden relative">
        {/* Main persistent pages */}
        <div
          className="absolute inset-0 flex transition-transform duration-300 ease-out"
          style={{
            width: `${PERSISTENT_PAGES.length * 100}%`,
            transform: `translateX(-${activeMainIndex * (100 / PERSISTENT_PAGES.length)}%)`,
          }}
        >
          {PERSISTENT_PAGES.map((page, index) => {
            const PageComponent = page.Component;
            const isActive = index === activeMainIndex && !isPostDetail && !isProfile;

            return (
              <div
                key={page.key}
                ref={(el) => {
                  scrollContainerRefs.current[index] = el;
                }}
                className="h-full overflow-y-auto overscroll-contain"
                style={{ width: `${100 / PERSISTENT_PAGES.length}%` }}
                inert={!isActive ? true : undefined}
                aria-hidden={!isActive}
              >
                <PageComponent />
              </div>
            );
          })}
        </div>

        {/* Post Detail - Slides in from right as overlay */}
        <div
          className={`absolute inset-0 bg-surface transition-transform duration-300 ease-out ${
            isPostDetail ? 'translate-x-0' : 'translate-x-full'
          }`}
          aria-hidden={!isPostDetail}
          inert={!isPostDetail ? true : undefined}
        >
          <div ref={postDetailRef} className="h-full overflow-y-auto overscroll-contain">
            {currentPostId ? (
              <PostDetailPageContent postId={currentPostId} />
            ) : (
              /* Skeleton placeholder when no postId */
              <div className="max-w-2xl mx-auto p-4 animate-pulse">
                <div className="h-8 w-20 bg-surface-elevated rounded mb-4" />
                <div className="aspect-square bg-surface-elevated rounded-lg mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-surface-elevated rounded w-3/4" />
                  <div className="h-4 bg-surface-elevated rounded w-1/2" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile - Slides in from right as overlay */}
        <div
          className={`absolute inset-0 bg-surface transition-transform duration-300 ease-out ${
            isProfile ? 'translate-x-0' : 'translate-x-full'
          }`}
          aria-hidden={!isProfile}
          inert={!isProfile ? true : undefined}
        >
          <div ref={profileRef} className="h-full overflow-y-auto overscroll-contain">
            {currentProfileUserId ? (
              <ProfilePageContent userId={currentProfileUserId} />
            ) : (
              /* Skeleton placeholder when no userId */
              <div className="max-w-4xl mx-auto p-4 animate-pulse">
                <div className="h-8 w-20 bg-surface-elevated rounded mb-6" />
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-24 h-24 bg-surface-elevated rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-surface-elevated rounded w-1/3" />
                    <div className="h-4 bg-surface-elevated rounded w-1/4" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-surface-elevated rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
