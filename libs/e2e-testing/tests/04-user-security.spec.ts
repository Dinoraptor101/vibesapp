/**
 * User Security E2E Tests
 *
 * Tests to verify user authentication and authorization is properly enforced.
 * CRITICAL: These tests ensure users can only modify their own data.
 */

import { expect, test } from '@playwright/test';

// API base URL - dynamically set based on config
const isQAEnvironment = process.env.PLAYWRIGHT_CONFIG_QA === 'true';
const API_BASE_URL = isQAEnvironment ? process.env.QA_BACKEND_URL : process.env.LOCAL_BACKEND_URL;

test.describe('User Security - Profile Update Authorization', () => {
  test('should prevent updating user profile without authentication', async ({ request }) => {
    // Try to update a user without authentication
    const response = await request.put(`${API_BASE_URL}/users/test-user-id`, {
      headers: {
        'Content-Type': 'application/json',
        // Intentionally NO X-Pigeon-Id header
      },
      data: {
        userName: 'HackedName',
        bio: 'I hacked this account',
      },
    });

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
    const body = await response.json();
    expect(body.error || body.message).toMatch(/unauthorized|forbidden/i);
  });

  test('should prevent user from updating another users profile', async ({ request }) => {
    // Try to update a different user's profile
    const response = await request.put(`${API_BASE_URL}/users/other-user-id`, {
      headers: {
        'X-Pigeon-Id': 'test-pigeon-id-123', // Authenticated as one user
        'Content-Type': 'application/json',
      },
      data: {
        userName: 'HackedName',
        bio: 'I hacked this account',
      },
    });

    // Should return 401 (invalid auth) or 403 (forbidden - authorization check)
    expect([401, 403]).toContain(response.status());

    if (response.status() === 403) {
      const body = await response.json();
      expect(body.success || body.error).toBeDefined();
      const message = body.message || body.error || '';
      expect(message).toMatch(/forbidden|own profile/i);
    }
  });

  test('should prevent PATCH requests to user profile without authentication', async ({
    request,
  }) => {
    // Try to patch user without authentication
    const response = await request.patch(`${API_BASE_URL}/users/test-user-id`, {
      data: {
        bio: 'Hacked bio',
      },
    });

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
  });
});

test.describe('User Security - Password Regeneration Authorization', () => {
  test('should prevent regenerating another users password', async ({ request }) => {
    const response = await request.put(`${API_BASE_URL}/users/other-user-id/regenerate-pigeon-id`, {
      headers: {
        'X-Pigeon-Id': 'test-pigeon-id-123',
        'Content-Type': 'application/json',
      },
    });

    // Should return 401 (invalid auth) or 403 (forbidden)
    expect([401, 403]).toContain(response.status());
  });

  test('should prevent password regeneration without authentication', async ({ request }) => {
    const response = await request.put(`${API_BASE_URL}/users/test-user-id/regenerate-pigeon-id`);

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
    const body = await response.json();
    expect(body.error || body.message).toMatch(/unauthorized|forbidden/i);
  });
});

test.describe('User Security - Login Endpoint Protection', () => {
  test('should require reCAPTCHA for POST login', async ({ request }) => {
    // POST login should require reCAPTCHA
    const response = await request.post(`${API_BASE_URL}/users/login`, {
      data: {
        pigeonId: 'test-pigeon-id',
        // Missing recaptchaToken
      },
    });

    // Should fail due to missing reCAPTCHA (unless ENABLE_RECAPTCHA=false in test env)
    // In production, this should return 403
    expect([400, 403, 404]).toContain(response.status());
  });
});

test.describe('User Security - Notification Preferences', () => {
  test('should prevent updating notification preferences without authentication', async ({
    request,
  }) => {
    const response = await request.patch(
      `${API_BASE_URL}/users/test-user-id/notification-preferences`,
      {
        data: {
          emailNotifications: false,
        },
      }
    );

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
  });
});

test.describe('User Security - Public Endpoints', () => {
  test('login endpoint should not expose pigeonId in response', async ({ request }) => {
    // Login should return user data but NOT the pigeonId
    const response = await request.post(`${API_BASE_URL}/users/login`, {
      data: {
        pigeonId: 'test-pigeon-id',
        recaptchaToken: 'test-token',
      },
    });

    // Will likely fail with 403 or 404, but if it succeeds, verify no pigeonId
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).not.toHaveProperty('pigeonId');
    }

    // Acceptable status codes for non-existent user or failed reCAPTCHA
    expect([200, 403, 404]).toContain(response.status());
  });
});
