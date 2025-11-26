/**
 * E2E Tests: Ban Mechanism (Admin-Only)
 *
 * Coverage:
 * - Admin can ban/unban user from admin panel (see user-management.spec.ts)
 * - Banned user restrictions (to be implemented when needed)
 *
 * Technical Details:
 * - Banning is ADMIN-ONLY - no automatic strike system exists
 * - No cooldown periods exist
 * - No auto-ban after X strikes exists
 * - User model fields: isBanned, bannedAt
 *
 * NOTE: The actual ban/unban functionality is tested in user-management.spec.ts
 * This file is reserved for future tests of banned user restrictions (403 errors, etc.)
 */

import { test, expect } from '@playwright/test';

test.describe('Ban Mechanism - Manual Admin Bans Only', () => {
  test('should reference admin panel for ban/unban functionality', () => {
    // NOTE: Banning/unbanning is done manually by admins through the admin panel UI
    // See user-management.spec.ts for UI-based ban toggle tests
    // There is NO automatic strike system, cooldown periods, or auto-ban functionality
    expect(true).toBe(true);
  });
});
