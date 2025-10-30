/**
 * Cookie management utilities.
 * Provides functions for setting and retrieving browser cookies
 * used for storing user preferences and session information.
 */

// prettier-ignore
export function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
export function getCookie(name: string): string {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}
export function deleteCookie(name: string): void {
  //Get cookie, then delete it
  const cookie = getCookie(name);
  if (cookie) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}
