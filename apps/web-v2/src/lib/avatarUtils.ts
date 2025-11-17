/**
 * Avatar URL Utilities
 *
 * Ensures avatar URLs are properly constructed with CDN prefix
 */

/**
 * Get full avatar URL from potentially partial URL/key
 * Handles:
 * - Full URLs (starting with http/https) - returns as-is
 * - S3 keys - prepends CDN URL
 * - null/undefined - returns undefined
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string | undefined {
  if (!avatarUrl) return undefined;

  // Already a full URL
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // S3 key - construct full CDN URL
  const CDN_URL = import.meta.env.VITE_CDN_URL;
  if (!CDN_URL) {
    console.error('VITE_CDN_URL environment variable is required for avatar URLs');
    return undefined;
  }

  return `${CDN_URL}/${avatarUrl}`;
}
