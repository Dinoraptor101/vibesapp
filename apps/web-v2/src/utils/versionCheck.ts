/**
 * Build Version Cache Invalidation
 *
 * Prevents users from running stale cached code after a new deployment.
 * The build process embeds a version hash in index.html via a meta tag.
 * On app load, we check if the running code matches the deployed version.
 * If there's a mismatch, we force a hard reload to get fresh assets.
 */

const VERSION_CHECK_KEY = 'vibesapp_build_version';
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

/**
 * Get the current build version from the meta tag injected at build time
 */
function getCurrentBuildVersion(): string | null {
  const metaTag = document.querySelector('meta[name="build-version"]');
  return metaTag?.getAttribute('content') || null;
}

/**
 * Get the current build version for display purposes (e.g., in Settings)
 * Returns the build hash or null if not available
 */
export function getBuildVersion(): string | null {
  return getCurrentBuildVersion();
}

/**
 * Get the build version that was cached when the app first loaded
 */
function getCachedBuildVersion(): string | null {
  return sessionStorage.getItem(VERSION_CHECK_KEY);
}

/**
 * Store the current build version in session storage
 */
function cacheBuildVersion(version: string): void {
  sessionStorage.setItem(VERSION_CHECK_KEY, version);
}

/**
 * Check if the current deployment version matches what we're running
 * If there's a mismatch, force a hard reload to get fresh assets
 */
export async function checkForNewDeployment(): Promise<void> {
  try {
    // Fetch index.html with cache-busting to get the latest version
    const response = await fetch(`/?_=${Date.now()}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) return;

    const html = await response.text();

    // Extract build-version from the fetched HTML
    const versionMatch = html.match(/<meta name="build-version" content="([^"]+)"/);
    const latestVersion = versionMatch?.[1];

    if (!latestVersion) return;

    const currentVersion = getCurrentBuildVersion();

    if (currentVersion && latestVersion !== currentVersion) {
      console.log(`[VersionCheck] New deployment detected: ${currentVersion} → ${latestVersion}`);
      console.log('[VersionCheck] Reloading to get fresh assets...');

      // Clear service worker caches if present
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Unregister service workers to ensure clean reload
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }

      // Hard reload from server, bypassing all caches
      window.location.reload();
    }
  } catch (error) {
    console.warn('[VersionCheck] Failed to check for new deployment:', error);
  }
}

/**
 * Initialize version checking on app startup
 */
export function initializeVersionCheck(): void {
  const currentVersion = getCurrentBuildVersion();

  if (!currentVersion) {
    console.warn('[VersionCheck] No build version found in HTML meta tag');
    return;
  }

  const cachedVersion = getCachedBuildVersion();

  if (!cachedVersion) {
    // First load in this session - store the version
    cacheBuildVersion(currentVersion);
    console.log(`[VersionCheck] Initialized with version: ${currentVersion}`);
  } else if (cachedVersion !== currentVersion) {
    // This shouldn't normally happen (would be caught by checkForNewDeployment)
    // but handle it just in case
    console.log(
      `[VersionCheck] Version mismatch detected on init: ${cachedVersion} → ${currentVersion}`
    );
    cacheBuildVersion(currentVersion);
  }

  // Set up periodic checks for new deployments
  setInterval(checkForNewDeployment, VERSION_CHECK_INTERVAL);

  // Also check when the page becomes visible again (user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkForNewDeployment();
    }
  });
}
