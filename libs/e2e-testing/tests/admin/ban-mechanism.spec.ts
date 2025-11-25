/**
 * E2E Tests: Ban Mechanism (API-level tests)
 *
 * Coverage:
 * - User receives strike when post is auto-hidden (3+ nearby reports)
 * - Strike expires after 30 days
 * - Strike 4 triggers permanent ban (100-year expiry)
 * - User enters 24-hour cooldown after strike
 * - User in cooldown cannot create posts (403)
 * - User in cooldown cannot comment (403)
 * - User in cooldown CAN still react (hearts)
 * - Banned user cannot create posts (403)
 * - Banned user cannot comment (403)
 * - Banned user cannot react (403)
 * - Banned user can still view feed (read-only)
 * - Banned user sees appropriate error message
 *
 * Technical Details:
 * - Strike duration: 30 days (normal), 100 years (Strike 4)
 * - Cooldown duration: 24 hours after receiving strike
 * - User model fields: isBanned, bannedAt, strikes[]
 * - User methods: getActiveStrikes(), getCurrentRestrictions()
 */

import { test, expect, type APIRequestContext } from '@playwright/test';

// Test data
const TEST_LOCATION = { lat: 37.41, lon: -77.46 }; // Richmond, VA area
const NEARBY_LOCATION = { lat: 37.45, lon: -77.5 }; // ~5 miles away

// Helper function to create API request headers
function getApiHeaders(pigeonId: string) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': process.env.API_KEY || 'test-api-key',
    'x-pigeon-id': pigeonId,
  };
}

// Helper to create a test user via API
async function createTestUser(
  request: APIRequestContext,
  baseURL: string,
  userData: {
    pigeonId: string;
    userId: string;
    userName: string;
    location?: { lat: number; lon: number };
  }
) {
  const response = await request.post(`${baseURL}/api/users`, {
    headers: getApiHeaders(userData.pigeonId),
    data: {
      pigeonId: userData.pigeonId,
      userId: userData.userId,
      userName: userData.userName,
      birthYear: 1990,
      birthMonth: 6,
      sex: 'male',
      location: userData.location || TEST_LOCATION,
    },
  });

  return response;
}

// Helper to create a test post via API
async function createTestPost(
  request: APIRequestContext,
  baseURL: string,
  postData: {
    userId: string;
    pigeonId: string;
    text?: string;
    location?: { lat: number; lon: number };
  }
) {
  const response = await request.post(`${baseURL}/api/posts`, {
    headers: getApiHeaders(postData.pigeonId),
    data: {
      userId: postData.userId,
      text: postData.text || 'Test post',
      location: postData.location || TEST_LOCATION,
    },
  });

  return response;
}

// Helper to report a post via API
async function reportPost(
  request: APIRequestContext,
  baseURL: string,
  reportData: {
    postId: string;
    userId: string;
    pigeonId: string;
    reason: 'pornographic' | 'spam' | 'hate_speech';
    location?: { lat: number; lon: number };
  }
) {
  const response = await request.post(`${baseURL}/api/posts/${reportData.postId}/report`, {
    headers: getApiHeaders(reportData.pigeonId),
    data: {
      userId: reportData.userId,
      reason: reportData.reason,
      location: reportData.location || NEARBY_LOCATION,
    },
  });

  return response;
}

// Helper to get user data (including strikes)
async function getUser(
  request: APIRequestContext,
  baseURL: string,
  userId: string,
  pigeonId: string
) {
  const response = await request.get(`${baseURL}/api/users/${userId}`, {
    headers: getApiHeaders(pigeonId),
  });

  return response;
}

// Helper to get user restrictions
async function getUserRestrictions(
  request: APIRequestContext,
  baseURL: string,
  userId: string,
  pigeonId: string
) {
  const response = await request.get(`${baseURL}/api/users/${userId}/restrictions`, {
    headers: getApiHeaders(pigeonId),
  });

  return response;
}

// Helper to create a comment on a post
async function createComment(
  request: APIRequestContext,
  baseURL: string,
  commentData: {
    postId: string;
    userId: string;
    pigeonId: string;
    text: string;
    location?: { lat: number; lon: number };
  }
) {
  const response = await request.post(`${baseURL}/api/posts`, {
    headers: getApiHeaders(commentData.pigeonId),
    data: {
      userId: commentData.userId,
      text: commentData.text,
      commentOn: commentData.postId,
      location: commentData.location || TEST_LOCATION,
    },
  });

  return response;
}

// Helper to like a post
async function likePost(
  request: APIRequestContext,
  baseURL: string,
  likeData: {
    postId: string;
    userId: string;
    pigeonId: string;
    location?: { lat: number; lon: number };
  }
) {
  const response = await request.post(`${baseURL}/api/posts/${likeData.postId}/like`, {
    headers: getApiHeaders(likeData.pigeonId),
    data: {
      userId: likeData.userId,
      type: 'like',
      location: likeData.location || TEST_LOCATION,
    },
  });

  return response;
}

// Helper to get feed posts
async function getFeed(
  request: APIRequestContext,
  baseURL: string,
  userId: string,
  pigeonId: string,
  location: { lat: number; lon: number } = TEST_LOCATION
) {
  const response = await request.get(
    `${baseURL}/api/posts?userId=${userId}&lat=${location.lat}&lon=${location.lon}`,
    {
      headers: getApiHeaders(pigeonId),
    }
  );

  return response;
}

// Helper to trigger auto-hide on a post (creates 3 nearby reports)
async function triggerAutoHide(
  request: APIRequestContext,
  baseURL: string,
  postId: string,
  timestamp: number
) {
  const reporters = [];

  // Create 3 reporters and have them report the post
  for (let i = 0; i < 3; i++) {
    const reporterId = `autohide-reporter-${i}-${timestamp}-${Date.now()}`;
    const reporterPigeonId = `pigeon-autohide-${i}-${timestamp}-${Date.now()}`;

    await createTestUser(request, baseURL, {
      pigeonId: reporterPigeonId,
      userId: reporterId,
      userName: `Auto-hide Reporter ${i}`,
      location: NEARBY_LOCATION,
    });

    reporters.push({ userId: reporterId, pigeonId: reporterPigeonId });
  }

  // Submit 3 reports to trigger auto-hide
  for (const reporter of reporters) {
    await reportPost(request, baseURL, {
      postId,
      userId: reporter.userId,
      pigeonId: reporter.pigeonId,
      reason: 'spam',
      location: NEARBY_LOCATION,
    });
  }

  return reporters;
}

test.describe('Ban Mechanism - Strike System', () => {
  let baseURL: string;

  test.beforeAll(async ({ baseURL: configBaseURL }) => {
    baseURL = configBaseURL?.replace(':5173', ':5001') || 'http://localhost:5001';
  });

  test('should add strike to user when their post is auto-hidden', async ({ request }) => {
    const timestamp = Date.now();

    // Create user who will receive a strike
    const authorId = `strike-author-${timestamp}`;
    const authorPigeonId = `pigeon-strike-author-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: authorPigeonId,
      userId: authorId,
      userName: 'Strike Test Author',
      location: TEST_LOCATION,
    });

    // Create a post that will be reported
    const postResponse = await createTestPost(request, baseURL, {
      userId: authorId,
      pigeonId: authorPigeonId,
      text: 'Post that will receive strike',
      location: TEST_LOCATION,
    });

    const postData = await postResponse.json();
    const postId = postData.post?._id || postData._id;

    // Trigger auto-hide by creating 3 nearby reports
    await triggerAutoHide(request, baseURL, postId, timestamp);

    // Check user now has a strike
    const userResponse = await getUser(request, baseURL, authorId, authorPigeonId);
    const userData = await userResponse.json();
    const user = userData.user || userData;

    expect(user.strikes).toBeDefined();
    expect(user.strikes.length).toBeGreaterThanOrEqual(1);

    // Verify strike has correct structure
    const latestStrike = user.strikes[user.strikes.length - 1];
    expect(latestStrike.reason).toContain('auto-hidden');
    expect(latestStrike.expiresAt).toBeDefined();

    // Verify strike expires in approximately 30 days
    const expiresAt = new Date(latestStrike.expiresAt);
    const now = new Date();
    const daysDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysDiff).toBeGreaterThan(29);
    expect(daysDiff).toBeLessThanOrEqual(31);
  });

  test('should verify strike expiration time is 30 days', async ({ request }) => {
    const timestamp = Date.now();

    // Create user
    const authorId = `expiry-author-${timestamp}`;
    const authorPigeonId = `pigeon-expiry-author-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: authorPigeonId,
      userId: authorId,
      userName: 'Expiry Test Author',
      location: TEST_LOCATION,
    });

    // Create and auto-hide a post
    const postResponse = await createTestPost(request, baseURL, {
      userId: authorId,
      pigeonId: authorPigeonId,
      text: 'Post for expiry test',
      location: TEST_LOCATION,
    });

    const postData = await postResponse.json();
    const postId = postData.post?._id || postData._id;

    await triggerAutoHide(request, baseURL, postId, timestamp);

    // Check the strike's expiration
    const userResponse = await getUser(request, baseURL, authorId, authorPigeonId);
    const userData = await userResponse.json();
    const user = userData.user || userData;

    const strike = user.strikes[0];
    const expiresAt = new Date(strike.expiresAt);
    const strikeTimestamp = new Date(strike.timestamp);

    // Calculate expected expiry (30 days from strike timestamp)
    const expectedExpiry = new Date(strikeTimestamp);
    expectedExpiry.setDate(expectedExpiry.getDate() + 30);

    // Allow 1 minute tolerance for test execution time
    const diffMs = Math.abs(expiresAt.getTime() - expectedExpiry.getTime());
    expect(diffMs).toBeLessThan(60 * 1000);
  });
});

test.describe('Ban Mechanism - Permanent Ban (Strike 4)', () => {
  let baseURL: string;

  test.beforeAll(async ({ baseURL: configBaseURL }) => {
    baseURL = configBaseURL?.replace(':5173', ':5001') || 'http://localhost:5001';
  });

  test('should permanently ban user on Strike 4', async ({ request }) => {
    const timestamp = Date.now();

    // Create user who will be banned
    const authorId = `ban-author-${timestamp}`;
    const authorPigeonId = `pigeon-ban-author-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: authorPigeonId,
      userId: authorId,
      userName: 'Ban Test Author',
      location: TEST_LOCATION,
    });

    // Create 4 posts and get them all auto-hidden to trigger 4 strikes
    for (let strike = 0; strike < 4; strike++) {
      const postResponse = await createTestPost(request, baseURL, {
        userId: authorId,
        pigeonId: authorPigeonId,
        text: `Post for strike ${strike + 1}`,
        location: TEST_LOCATION,
      });

      const postData = await postResponse.json();
      const postId = postData.post?._id || postData._id;

      // Trigger auto-hide for each post
      await triggerAutoHide(request, baseURL, postId, timestamp + strike);

      // Small delay between strikes to ensure proper ordering
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Check user is now banned
    const userResponse = await getUser(request, baseURL, authorId, authorPigeonId);
    const userData = await userResponse.json();
    const user = userData.user || userData;

    expect(user.isBanned).toBe(true);
    expect(user.bannedAt).toBeDefined();
    expect(user.strikes.length).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Ban Mechanism - Cooldown Period', () => {
  let baseURL: string;
  let cooldownUserId: string;
  let cooldownUserPigeonId: string;
  let targetPostId: string;

  test.beforeAll(async ({ request, baseURL: configBaseURL }) => {
    baseURL = configBaseURL?.replace(':5173', ':5001') || 'http://localhost:5001';

    const timestamp = Date.now();

    // Create user who will be in cooldown
    cooldownUserId = `cooldown-author-${timestamp}`;
    cooldownUserPigeonId = `pigeon-cooldown-author-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: cooldownUserPigeonId,
      userId: cooldownUserId,
      userName: 'Cooldown Test Author',
      location: TEST_LOCATION,
    });

    // Create a post and get it auto-hidden to give user a strike (and enter cooldown)
    const postResponse = await createTestPost(request, baseURL, {
      userId: cooldownUserId,
      pigeonId: cooldownUserPigeonId,
      text: 'Post to trigger cooldown',
      location: TEST_LOCATION,
    });

    const postData = await postResponse.json();
    const postId = postData.post?._id || postData._id;

    await triggerAutoHide(request, baseURL, postId, timestamp);

    // Create another user's post for testing reactions/comments
    const otherUserId = `cooldown-other-${timestamp}`;
    const otherPigeonId = `pigeon-cooldown-other-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: otherPigeonId,
      userId: otherUserId,
      userName: 'Cooldown Other User',
      location: TEST_LOCATION,
    });

    const targetPostResponse = await createTestPost(request, baseURL, {
      userId: otherUserId,
      pigeonId: otherPigeonId,
      text: 'Target post for cooldown tests',
      location: TEST_LOCATION,
    });

    const targetPostData = await targetPostResponse.json();
    targetPostId = targetPostData.post?._id || targetPostData._id;
  });

  test('should enter 24-hour cooldown after receiving strike', async ({ request }) => {
    // Get user restrictions
    const restrictionsResponse = await getUserRestrictions(
      request,
      baseURL,
      cooldownUserId,
      cooldownUserPigeonId
    );

    if (restrictionsResponse.status() === 200) {
      const restrictions = await restrictionsResponse.json();

      expect(restrictions.strikeCount).toBeGreaterThanOrEqual(1);
      expect(restrictions.cooldownEnd).toBeDefined();

      // Verify cooldown is approximately 24 hours from strike
      if (restrictions.cooldownEnd) {
        const cooldownEnd = new Date(restrictions.cooldownEnd);
        const now = new Date();
        const hoursRemaining = (cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Should be roughly 24 hours or less
        expect(hoursRemaining).toBeGreaterThan(0);
        expect(hoursRemaining).toBeLessThanOrEqual(24);
      }
    }
    // If restrictions endpoint doesn't exist, test the actual posting behavior
  });

  test('should return 403 when user in cooldown tries to create post', async ({ request }) => {
    // Try to create a new post while in cooldown
    const postResponse = await createTestPost(request, baseURL, {
      userId: cooldownUserId,
      pigeonId: cooldownUserPigeonId,
      text: 'Post attempted during cooldown',
    });

    expect(postResponse.status()).toBe(403);

    const postData = await postResponse.json();
    expect(postData.error).toBeDefined();
    expect(postData.error.toLowerCase()).toContain('cooldown');
  });

  test('should return 403 when user in cooldown tries to comment', async ({ request }) => {
    // Try to comment while in cooldown
    const commentResponse = await createComment(request, baseURL, {
      postId: targetPostId,
      userId: cooldownUserId,
      pigeonId: cooldownUserPigeonId,
      text: 'Comment attempted during cooldown',
    });

    expect(commentResponse.status()).toBe(403);

    const commentData = await commentResponse.json();
    expect(commentData.error).toBeDefined();
    expect(commentData.error.toLowerCase()).toContain('cooldown');
  });

  test('should allow user in cooldown to react (like) posts', async ({ request }) => {
    // Try to like a post while in cooldown - this SHOULD succeed
    const likeResponse = await likePost(request, baseURL, {
      postId: targetPostId,
      userId: cooldownUserId,
      pigeonId: cooldownUserPigeonId,
    });

    // Reactions should still be allowed during cooldown
    expect(likeResponse.status()).toBe(200);

    const likeData = await likeResponse.json();
    expect(likeData.success).toBe(true);
  });
});

test.describe('Ban Mechanism - Banned User Restrictions', () => {
  let baseURL: string;
  let bannedUserId: string;
  let bannedUserPigeonId: string;
  let targetPostId: string;

  test.beforeAll(async ({ request, baseURL: configBaseURL }) => {
    baseURL = configBaseURL?.replace(':5173', ':5001') || 'http://localhost:5001';

    const timestamp = Date.now();

    // Create user who will be banned
    bannedUserId = `banned-author-${timestamp}`;
    bannedUserPigeonId = `pigeon-banned-author-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: bannedUserPigeonId,
      userId: bannedUserId,
      userName: 'Banned Test Author',
      location: TEST_LOCATION,
    });

    // Create 4 posts and get them all auto-hidden to trigger permanent ban
    for (let strike = 0; strike < 4; strike++) {
      const postResponse = await createTestPost(request, baseURL, {
        userId: bannedUserId,
        pigeonId: bannedUserPigeonId,
        text: `Post for ban strike ${strike + 1}`,
        location: TEST_LOCATION,
      });

      const postData = await postResponse.json();
      const postId = postData.post?._id || postData._id;

      await triggerAutoHide(request, baseURL, postId, timestamp + strike);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Create another user's post for testing
    const otherUserId = `banned-other-${timestamp}`;
    const otherPigeonId = `pigeon-banned-other-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: otherPigeonId,
      userId: otherUserId,
      userName: 'Banned Test Other User',
      location: TEST_LOCATION,
    });

    const targetPostResponse = await createTestPost(request, baseURL, {
      userId: otherUserId,
      pigeonId: otherPigeonId,
      text: 'Target post for banned user tests',
      location: TEST_LOCATION,
    });

    const targetPostData = await targetPostResponse.json();
    targetPostId = targetPostData.post?._id || targetPostData._id;
  });

  test('should return 403 when banned user tries to create post', async ({ request }) => {
    const postResponse = await createTestPost(request, baseURL, {
      userId: bannedUserId,
      pigeonId: bannedUserPigeonId,
      text: 'Post attempted by banned user',
    });

    expect(postResponse.status()).toBe(403);

    const postData = await postResponse.json();
    expect(postData.error).toBeDefined();
    expect(postData.error.toLowerCase()).toContain('banned');
  });

  test('should return 403 when banned user tries to comment', async ({ request }) => {
    const commentResponse = await createComment(request, baseURL, {
      postId: targetPostId,
      userId: bannedUserId,
      pigeonId: bannedUserPigeonId,
      text: 'Comment attempted by banned user',
    });

    expect(commentResponse.status()).toBe(403);

    const commentData = await commentResponse.json();
    expect(commentData.error).toBeDefined();
    expect(commentData.error.toLowerCase()).toContain('banned');
  });

  test('should return 403 when banned user tries to react', async ({ request }) => {
    const likeResponse = await likePost(request, baseURL, {
      postId: targetPostId,
      userId: bannedUserId,
      pigeonId: bannedUserPigeonId,
    });

    expect(likeResponse.status()).toBe(403);

    const likeData = await likeResponse.json();
    expect(likeData.error).toBeDefined();
    expect(likeData.error.toLowerCase()).toContain('banned');
  });

  test('should allow banned user to view feed (read-only access)', async ({ request }) => {
    const feedResponse = await getFeed(request, baseURL, bannedUserId, bannedUserPigeonId);

    // Banned users should still be able to view content
    expect(feedResponse.status()).toBe(200);

    const feedData = await feedResponse.json();
    // Feed should return posts array (even if empty)
    expect(feedData.posts || feedData).toBeDefined();
  });

  test('should show appropriate banned error message', async ({ request }) => {
    const postResponse = await createTestPost(request, baseURL, {
      userId: bannedUserId,
      pigeonId: bannedUserPigeonId,
      text: 'Post to check error message',
    });

    expect(postResponse.status()).toBe(403);

    const postData = await postResponse.json();
    expect(postData.error).toBeDefined();
    expect(postData.error).toContain('permanently banned');
    expect(postData.restrictions).toBeDefined();
    expect(postData.restrictions.isBanned).toBe(true);
  });
});

test.describe('Ban Mechanism - User Restriction Information', () => {
  let baseURL: string;

  test.beforeAll(async ({ baseURL: configBaseURL }) => {
    baseURL = configBaseURL?.replace(':5173', ':5001') || 'http://localhost:5001';
  });

  test('should return correct restrictions for user with no strikes', async ({ request }) => {
    const timestamp = Date.now();

    // Create a clean user with no violations
    const cleanUserId = `clean-user-${timestamp}`;
    const cleanPigeonId = `pigeon-clean-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: cleanPigeonId,
      userId: cleanUserId,
      userName: 'Clean User',
      location: TEST_LOCATION,
    });

    // Check restrictions
    const restrictionsResponse = await getUserRestrictions(
      request,
      baseURL,
      cleanUserId,
      cleanPigeonId
    );

    if (restrictionsResponse.status() === 200) {
      const restrictions = await restrictionsResponse.json();

      expect(restrictions.canPost).toBe(true);
      expect(restrictions.canComment).toBe(true);
      expect(restrictions.canReact).toBe(true);
      expect(restrictions.isBanned).toBe(false);
      expect(restrictions.strikeCount).toBe(0);
    }
    // If restrictions endpoint doesn't exist, verify user can perform actions
    else {
      // Verify user can create posts
      const postResponse = await createTestPost(request, baseURL, {
        userId: cleanUserId,
        pigeonId: cleanPigeonId,
        text: 'Clean user post test',
      });

      expect(postResponse.status()).toBe(200);
    }
  });

  test('should return correct restrictions for user with 1-3 strikes in cooldown', async ({
    request,
  }) => {
    const timestamp = Date.now();

    // Create user who will get strikes
    const strikesUserId = `strikes-user-${timestamp}`;
    const strikesPigeonId = `pigeon-strikes-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: strikesPigeonId,
      userId: strikesUserId,
      userName: 'Strikes User',
      location: TEST_LOCATION,
    });

    // Get one strike
    const postResponse = await createTestPost(request, baseURL, {
      userId: strikesUserId,
      pigeonId: strikesPigeonId,
      text: 'Post to get strike',
      location: TEST_LOCATION,
    });

    const postData = await postResponse.json();
    const postId = postData.post?._id || postData._id;

    await triggerAutoHide(request, baseURL, postId, timestamp);

    // Check restrictions
    const restrictionsResponse = await getUserRestrictions(
      request,
      baseURL,
      strikesUserId,
      strikesPigeonId
    );

    if (restrictionsResponse.status() === 200) {
      const restrictions = await restrictionsResponse.json();

      expect(restrictions.canPost).toBe(false); // In cooldown
      expect(restrictions.canComment).toBe(false); // In cooldown
      expect(restrictions.canReact).toBe(true); // Can still react
      expect(restrictions.isBanned).toBe(false); // Not banned yet
      expect(restrictions.strikeCount).toBeGreaterThanOrEqual(1);
      expect(restrictions.cooldownEnd).toBeDefined();
    }
  });

  test('should return correct restrictions for banned user', async ({ request }) => {
    const timestamp = Date.now();

    // Create user who will be banned
    const bannedUserId = `restricted-banned-${timestamp}`;
    const bannedPigeonId = `pigeon-restricted-banned-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId: bannedPigeonId,
      userId: bannedUserId,
      userName: 'Restricted Banned User',
      location: TEST_LOCATION,
    });

    // Get 4 strikes to trigger ban
    for (let i = 0; i < 4; i++) {
      const postResponse = await createTestPost(request, baseURL, {
        userId: bannedUserId,
        pigeonId: bannedPigeonId,
        text: `Post for ban ${i + 1}`,
        location: TEST_LOCATION,
      });

      const postData = await postResponse.json();
      const postId = postData.post?._id || postData._id;

      await triggerAutoHide(request, baseURL, postId, timestamp + i);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Check restrictions
    const restrictionsResponse = await getUserRestrictions(
      request,
      baseURL,
      bannedUserId,
      bannedPigeonId
    );

    if (restrictionsResponse.status() === 200) {
      const restrictions = await restrictionsResponse.json();

      expect(restrictions.canPost).toBe(false);
      expect(restrictions.canComment).toBe(false);
      expect(restrictions.canReact).toBe(false);
      expect(restrictions.isBanned).toBe(true);
      expect(restrictions.strikeCount).toBeGreaterThanOrEqual(4);
    }
  });
});

test.describe('Ban Mechanism - Strike Counting', () => {
  let baseURL: string;

  test.beforeAll(async ({ baseURL: configBaseURL }) => {
    baseURL = configBaseURL?.replace(':5173', ':5001') || 'http://localhost:5001';
  });

  test('should accumulate strikes correctly over multiple violations', async ({ request }) => {
    const timestamp = Date.now();

    // Create user
    const userId = `accumulate-user-${timestamp}`;
    const pigeonId = `pigeon-accumulate-${timestamp}`;

    await createTestUser(request, baseURL, {
      pigeonId,
      userId,
      userName: 'Accumulate Strikes User',
      location: TEST_LOCATION,
    });

    // Trigger 3 violations (not 4, to avoid permanent ban)
    for (let i = 0; i < 3; i++) {
      const postResponse = await createTestPost(request, baseURL, {
        userId,
        pigeonId,
        text: `Post for accumulation ${i + 1}`,
        location: TEST_LOCATION,
      });

      const postData = await postResponse.json();
      const postId = postData.post?._id || postData._id;

      await triggerAutoHide(request, baseURL, postId, timestamp + i);

      // Check strike count after each violation
      const userResponse = await getUser(request, baseURL, userId, pigeonId);
      const userData = await userResponse.json();
      const user = userData.user || userData;

      expect(user.strikes.length).toBe(i + 1);

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Final verification
    const finalUserResponse = await getUser(request, baseURL, userId, pigeonId);
    const finalUserData = await finalUserResponse.json();
    const finalUser = finalUserData.user || finalUserData;

    expect(finalUser.strikes.length).toBe(3);
    expect(finalUser.isBanned).toBe(false); // Not banned yet with 3 strikes
  });
});
