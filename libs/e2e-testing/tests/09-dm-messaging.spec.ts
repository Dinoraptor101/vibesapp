/**
 * DM (Direct Messaging) E2E Tests
 *
 * Tests the complete DM flow:
 * 1. DM Request: User1 sends request to User2
 * 2. Request Management: User2 accepts/declines
 * 3. Conversation: After approval, users can exchange messages
 *
 * DESIGN NOTE: DMs require approval before messaging - this is intentional
 * to protect users from unwanted messages.
 */

import { expect, test } from '@playwright/test';
import { isQAEnvironment, getSecondUserCredentials } from './helpers/test-post';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = isQAEnvironment()
  ? process.env.QA_BACKEND_BASE
  : process.env.LOCAL_BACKEND_BASE;

function getApiHeaders(pigeonId: string) {
  const apiKey = process.env.BACKEND_API_KEY;
  if (!apiKey) {
    throw new Error('BACKEND_API_KEY environment variable is not set');
  }
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'x-pigeon-id': pigeonId,
    'x-e2e-bypass': 'e2e-test-bypass-secret-token-2024',
  };
}

function getUser1Credentials() {
  try {
    const env = isQAEnvironment() ? 'qa' : 'local';
    const storageStatePath = path.join(__dirname, '../', `storageState-user1.${env}.json`);
    const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));
    const pigeonIdCookie = storageState.cookies?.find(
      (c: { name: string }) => c.name === 'pigeonId'
    );
    const userIdCookie = storageState.cookies?.find((c: { name: string }) => c.name === 'userId');
    return {
      pigeonId: pigeonIdCookie?.value || '',
      userId: userIdCookie?.value || '',
    };
  } catch {
    return { pigeonId: '', userId: '' };
  }
}

test.describe('DM Request Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let user1: { pigeonId: string; userId: string };
  let user2: { pigeonId: string; userId: string };
  let dmRequestId: string;
  let conversationId: string;

  test.beforeAll(() => {
    user1 = getUser1Credentials();
    user2 = getSecondUserCredentials();

    if (!user1.pigeonId || !user2.pigeonId) {
      console.warn('Test users not configured - some tests may be skipped');
    }
  });

  test('should check DM request status before sending', async ({ request }) => {
    test.skip(!user1.pigeonId || !user2.userId, 'Test users not configured');

    const response = await request.get(`${API_BASE_URL}/api/dm-requests/status/${user2.userId}`, {
      headers: getApiHeaders(user1.pigeonId),
    });

    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('canSend');
    }
  });

  test('should send DM request from User1 to User2', async ({ request }) => {
    test.skip(!user1.pigeonId || !user2.userId, 'Test users not configured');

    const response = await request.post(`${API_BASE_URL}/api/dm-requests/${user2.userId}`, {
      headers: getApiHeaders(user1.pigeonId),
      data: {
        message: 'E2E Test: Hello, would you like to chat?',
      },
    });

    // Could be 201 (created) or 400 (already exists) or 200 (success)
    expect([200, 201, 400]).toContain(response.status());

    if (response.status() === 201 || response.status() === 200) {
      const data = await response.json();
      if (data._id) {
        dmRequestId = data._id;
      }
    }
  });

  test('should get pending DM requests as recipient (User2)', async ({ request }) => {
    test.skip(!user2.pigeonId, 'User2 not configured');

    const response = await request.get(`${API_BASE_URL}/api/dm-requests`, {
      headers: getApiHeaders(user2.pigeonId),
    });

    expect(response.status()).toBe(200);
    const requests = await response.json();
    expect(Array.isArray(requests)).toBe(true);

    // Find request from user1 if it exists
    const fromUser1 = requests.find(
      (r: { sender?: { userId: string } }) => r.sender?.userId === user1.userId
    );
    if (fromUser1) {
      dmRequestId = fromUser1._id;
    }
  });

  test('should accept DM request (User2 accepts User1)', async ({ request }) => {
    test.skip(!user2.pigeonId || !dmRequestId, 'No DM request to accept');

    const response = await request.post(`${API_BASE_URL}/api/dm-requests/${dmRequestId}/accept`, {
      headers: getApiHeaders(user2.pigeonId),
    });

    // 200 success or 400 if already accepted
    expect([200, 400]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      if (data.conversation?._id) {
        conversationId = data.conversation._id;
      }
    }
  });
});

test.describe('DM Conversation Flow (Post-Approval)', () => {
  test.describe.configure({ mode: 'serial' });

  let user1: { pigeonId: string; userId: string };
  let user2: { pigeonId: string; userId: string };
  let conversationId: string;

  test.beforeAll(() => {
    user1 = getUser1Credentials();
    user2 = getSecondUserCredentials();
  });

  test('should get conversations for User1', async ({ request }) => {
    test.skip(!user1.pigeonId || !user1.userId, 'User1 not configured');

    const response = await request.get(`${API_BASE_URL}/api/dm/conversations/${user1.userId}`, {
      headers: getApiHeaders(user1.pigeonId),
    });

    expect(response.status()).toBe(200);
    const conversations = await response.json();
    expect(Array.isArray(conversations)).toBe(true);

    // Find conversation with user2
    const withUser2 = conversations.find(
      (c: { user1Id?: string; user2Id?: string; otherUser?: { userId: string } }) =>
        c.otherUser?.userId === user2.userId ||
        c.user1Id === user2.userId ||
        c.user2Id === user2.userId
    );

    if (withUser2) {
      conversationId = withUser2._id;
    }
  });

  test('should send message in approved conversation', async ({ request }) => {
    test.skip(!user1.pigeonId || !conversationId, 'No conversation available');

    const response = await request.post(`${API_BASE_URL}/api/dm/message`, {
      headers: getApiHeaders(user1.pigeonId),
      data: {
        conversationId,
        body: 'E2E Test: This is a test message!',
      },
    });

    expect([200, 201]).toContain(response.status());

    if (response.ok()) {
      const message = await response.json();
      expect(message).toHaveProperty('body');
      expect(message.body).toBe('E2E Test: This is a test message!');
    }
  });

  test('should get specific conversation by ID', async ({ request }) => {
    test.skip(!user1.pigeonId || !conversationId, 'No conversation available');

    const response = await request.get(`${API_BASE_URL}/api/dm/conversation/${conversationId}`, {
      headers: getApiHeaders(user1.pigeonId),
    });

    expect(response.status()).toBe(200);
    const conversation = await response.json();
    expect(conversation).toHaveProperty('_id', conversationId);
    expect(conversation).toHaveProperty('messages');
    expect(Array.isArray(conversation.messages)).toBe(true);
  });

  test('should mark messages as read', async ({ request }) => {
    test.skip(!user2.pigeonId || !conversationId, 'No conversation available');

    const response = await request.post(
      `${API_BASE_URL}/api/dm/conversation/${conversationId}/markAsRead`,
      {
        headers: getApiHeaders(user2.pigeonId),
      }
    );

    expect([200, 204]).toContain(response.status());
  });

  test('should get conversation status between users', async ({ request }) => {
    test.skip(!user1.pigeonId || !user1.userId || !user2.userId, 'Users not configured');

    const response = await request.get(`${API_BASE_URL}/api/dm/status`, {
      headers: getApiHeaders(user1.pigeonId),
      params: {
        userId1: user1.userId,
        userId2: user2.userId,
      },
    });

    expect(response.status()).toBe(200);
    const status = await response.json();
    expect(status).toHaveProperty('status');
  });
});

test.describe('DM Security - Authorization Checks', () => {
  let user1: { pigeonId: string; userId: string };

  test.beforeAll(() => {
    user1 = getUser1Credentials();
  });

  test('should prevent sending message without authentication', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/dm/message`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.BACKEND_API_KEY || '',
        // Missing x-pigeon-id
      },
      data: {
        conversationId: 'fake-conversation-id',
        body: 'Unauthorized message',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should prevent sending DM request without authentication', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/dm-requests/some-user-id`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.BACKEND_API_KEY || '',
        // Missing x-pigeon-id
      },
      data: {
        message: 'Unauthorized request',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should prevent accepting DM request without authentication', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/dm-requests/fake-request-id/accept`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.BACKEND_API_KEY || '',
        // Missing x-pigeon-id
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should prevent accessing conversations without authentication', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/dm/conversations/some-user-id`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.BACKEND_API_KEY || '',
        // Missing x-pigeon-id
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should prevent message to non-existent conversation', async ({ request }) => {
    test.skip(!user1.pigeonId, 'User1 not configured');

    const response = await request.post(`${API_BASE_URL}/api/dm/message`, {
      headers: getApiHeaders(user1.pigeonId),
      data: {
        conversationId: '000000000000000000000000', // Valid ObjectId format but doesn't exist
        body: 'Message to nowhere',
      },
    });

    // Should fail - conversation doesn't exist or user not a participant
    expect([400, 403, 404]).toContain(response.status());
  });
});

test.describe('DM Request Decline Flow', () => {
  test('should handle declining a DM request', async ({ request }) => {
    const user2 = getSecondUserCredentials();
    test.skip(!user2.pigeonId, 'User2 not configured');

    // First get pending requests
    const listResponse = await request.get(`${API_BASE_URL}/api/dm-requests`, {
      headers: getApiHeaders(user2.pigeonId),
    });

    if (listResponse.status() !== 200) {
      test.skip(true, 'Could not fetch DM requests');
      return;
    }

    const requests = await listResponse.json();
    const pendingRequest = requests.find((r: { status: string }) => r.status === 'pending');

    if (!pendingRequest) {
      // No pending request to decline - that's okay, just verify the endpoint works
      const response = await request.post(
        `${API_BASE_URL}/api/dm-requests/000000000000000000000000/decline`,
        {
          headers: getApiHeaders(user2.pigeonId),
        }
      );

      // Should fail with 404 (not found) rather than server error
      expect([400, 404]).toContain(response.status());
    } else {
      // Actually decline the request
      const declineResponse = await request.post(
        `${API_BASE_URL}/api/dm-requests/${pendingRequest._id}/decline`,
        {
          headers: getApiHeaders(user2.pigeonId),
        }
      );

      expect([200, 400]).toContain(declineResponse.status());
    }
  });
});
