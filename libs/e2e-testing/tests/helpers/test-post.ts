/**
 * Shared helper functions for creating test posts and users
 *
 * IMPORTANT: All test users should use pigeonId starting with "test-"
 * This allows the global teardown script to identify and clean up test data.
 */

import type { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Read API base URL from environment variables (configured in .env)
const API_BASE_URL =
  process.env.PLAYWRIGHT_CONFIG_QA === 'true'
    ? process.env.QA_BACKEND_BASE
    : process.env.LOCAL_BACKEND_BASE;

const TEST_LOCATION = { lat: 37.41, lon: -77.46 }; // Richmond, VA

// Automation-immune test user constants
const AUTOMATION_BOTS = {
  QA: 'test-automation-bot-qa',
  LOCAL: 'test-automation-bot-local',
};

// Get the appropriate automation bot for current environment
function getAutomationBot(): string {
  return process.env.PLAYWRIGHT_CONFIG_QA === 'true' ? AUTOMATION_BOTS.QA : AUTOMATION_BOTS.LOCAL;
}

// Store and retrieve automation bot credentials
function getAutomationBotCredentials(): { pigeonId: string; userId: string } {
  const botId = getAutomationBot();
  const credentialsPath = path.join(__dirname, '../../', `${botId}-credentials.json`);

  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    return credentials;
  } catch {
    // Return the pigeonId for creation, userId will be set after user creation
    return { pigeonId: botId, userId: '' };
  }
}

function saveAutomationBotCredentials(credentials: { pigeonId: string; userId: string }): void {
  const botId = getAutomationBot();
  const credentialsPath = path.join(__dirname, '../../', `${botId}-credentials.json`);

  fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
  console.log(`🤖 Saved automation bot credentials for: ${botId}`);
}

// Ensure automation bot exists and return its credentials
async function ensureAutomationBot(
  request: APIRequestContext
): Promise<{ pigeonId: string; userId: string }> {
  const credentials = getAutomationBotCredentials();

  // If we have a userId, the bot already exists
  if (credentials.userId) {
    return credentials;
  }

  // Create the automation bot
  console.log(`🤖 Creating automation bot: ${credentials.pigeonId}`);
  try {
    const user = await createTestUser(request, {
      pigeonId: credentials.pigeonId,
      userName: `Automation Bot ${process.env.PLAYWRIGHT_CONFIG_QA === 'true' ? 'QA' : 'Local'}`,
    });

    const fullCredentials = { pigeonId: credentials.pigeonId, userId: user.userId };
    saveAutomationBotCredentials(fullCredentials);
    return fullCredentials;
  } catch (error) {
    console.error(`Failed to create automation bot: ${error}`);
    // Return what we have and let the calling function handle the error
    return credentials;
  }
}

// Helper to get credentials from storage state
function getCredentials(storageStateFile: string = 'storageState.json') {
  try {
    const storageStatePath = path.join(__dirname, '../../', storageStateFile);
    const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));
    const pigeonIdCookie = storageState.cookies?.find(
      (c: { name: string }) => c.name === 'pigeonId'
    );
    const userIdCookie = storageState.cookies?.find((c: { name: string }) => c.name === 'userId');

    return {
      pigeonId: pigeonIdCookie?.value || 'test-pigeon-id',
      userId: userIdCookie?.value || 'test-user-id',
    };
  } catch {
    return {
      pigeonId: 'test-pigeon-id',
      userId: 'test-user-id',
    };
  }
}

// Export helper to get credentials for second test user
export function getSecondUserCredentials() {
  return getCredentials('storageState2.json');
}

// Helper to get API headers with authentication
function getApiHeaders(pigeonIdOverride?: string) {
  const { pigeonId } = getCredentials();
  const apiKey = process.env.BACKEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'BACKEND_API_KEY environment variable is not set. Please add it to your .env file in libs/e2e-testing/'
    );
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'x-pigeon-id': pigeonIdOverride || pigeonId,
    'x-e2e-bypass': 'e2e-test-bypass-secret-token-2024', // E2E test bypass for reCAPTCHA
  };

  // Log bypass header when creating API requests (verbose logging)
  if (process.env.VERBOSE_E2E_LOGGING === 'true') {
    console.log('🔓 [E2E Test] API request headers include reCAPTCHA bypass:');
    console.log('   - Header: x-e2e-bypass');
    console.log('   - Token: e2e-test-bypass-secret-token-2024');
    console.log(`   - Pigeon ID: ${pigeonIdOverride || pigeonId}\n`);
  }

  return headers;
}

/**
 * Create a test user
 * @param request - Playwright APIRequestContext
 * @param userData - User creation data
 * @returns Created user with userId and pigeonId
 */
export async function createTestUser(
  request: APIRequestContext,
  userData: {
    pigeonId: string;
    userName: string;
    location?: { lat: number; lon: number };
  }
): Promise<{ userId: string; pigeonId: string }> {
  const response = await request.post(`${API_BASE_URL}/api/users/create`, {
    headers: getApiHeaders(userData.pigeonId),
    data: {
      pigeonId: userData.pigeonId,
      userId: 'temp',
      userName: userData.userName,
      birthYear: 1990,
      birthMonth: 6,
      sex: 'male',
      location: userData.location || TEST_LOCATION,
      recaptchaToken: 'bypass', // Required field but bypassed via x-e2e-bypass header
    },
  });

  if (response.status() !== 201) {
    const text = await response.text();
    throw new Error(`User creation failed: ${text}`);
  }

  const user = await response.json();
  return { userId: user.userId, pigeonId: userData.pigeonId };
}

interface CreateTestPostOptions {
  caption?: string;
  contentType?: 'text' | 'image';
  images?: string[];
  location?: { lat: number; lon: number };
  pigeonId?: string;
}

/**
 * Upload test image to S3 and return the key
 * @param request - Playwright APIRequestContext
 * @param pigeonId - Optional pigeonId to use for authentication
 * @returns S3 key for the uploaded image
 */
async function uploadTestImage(request: APIRequestContext, pigeonId?: string): Promise<string> {
  // Get presigned S3 URL
  const s3Response = await request.get(`${API_BASE_URL}/api/s3/s3Url`, {
    headers: getApiHeaders(pigeonId),
  });

  if (!s3Response.ok()) {
    const errorText = await s3Response.text();
    throw new Error(`Failed to get S3 presigned URL: ${s3Response.status()} ${errorText}`);
  }

  const s3Data = await s3Response.json();

  // Log the actual response for debugging
  console.log('S3 Response:', JSON.stringify(s3Data, null, 2));

  const { url, key } = s3Data;

  if (!url || !key) {
    throw new Error(
      `Invalid S3 response - missing url or key. Response: ${JSON.stringify(s3Data)}`
    );
  }

  // Read the test image file
  const imagePath = path.join(__dirname, '../../assets/test_image.jpeg');
  const imageBuffer = fs.readFileSync(imagePath);

  // Upload to S3
  const uploadResponse = await request.put(url, {
    data: imageBuffer,
    headers: {
      'Content-Type': 'image/jpeg',
    },
  });

  if (!uploadResponse.ok()) {
    const errorText = await uploadResponse.text();
    throw new Error(`Failed to upload image to S3: ${uploadResponse.status()} ${errorText}`);
  }

  return key;
}

/**
 * Create a test post
 * @param request - Playwright APIRequestContext
 * @param options - Post creation options
 * @returns The created post object with _id
 */
export async function createTestPost(
  request: APIRequestContext,
  options: CreateTestPostOptions = {}
) {
  const { caption = 'Test post for E2E', location = TEST_LOCATION, pigeonId } = options;

  let postCreatorPigeonId: string;

  if (pigeonId) {
    // Use specific pigeonId provided (for special cases)
    const uniquePigeonId = `${pigeonId}-${Date.now()}`;
    await createTestUser(request, {
      pigeonId: uniquePigeonId,
      userName: `Test User ${uniquePigeonId.slice(-8)}`,
      location,
    });
    postCreatorPigeonId = uniquePigeonId;
  } else {
    // Use automation bot by default (immune to bans/strikes)
    try {
      const botCredentials = await ensureAutomationBot(request);
      postCreatorPigeonId = botCredentials.pigeonId;
      console.log(`🤖 Using automation bot for post creation: ${postCreatorPigeonId}`);
    } catch (error) {
      console.warn(`🤖 Automation bot failed, falling back to unique user: ${error}`);
      // Fallback: create unique user
      const fallbackPigeonId = `test-fallback-${Date.now()}`;
      await createTestUser(request, {
        pigeonId: fallbackPigeonId,
        userName: `Fallback User ${fallbackPigeonId.slice(-8)}`,
        location,
      });
      postCreatorPigeonId = fallbackPigeonId;
    }
  }

  // Upload test image to S3 and get the key
  const imageKey = await uploadTestImage(request, postCreatorPigeonId);

  const response = await request.post(`${API_BASE_URL}/api/posts/create`, {
    headers: getApiHeaders(postCreatorPigeonId),
    data: {
      text: caption,
      image: imageKey,
      location,
    },
  });

  if (response.status() !== 201) {
    const text = await response.text();

    // If automation bot is banned (shouldn't happen with immunity), try fallback
    if (response.status() === 403 && text.includes('banned') && !pigeonId) {
      console.warn('🤖 Automation bot appears banned, trying fallback user...');
      const fallbackPigeonId = `test-emergency-${Date.now()}`;
      await createTestUser(request, {
        pigeonId: fallbackPigeonId,
        userName: `Emergency User ${fallbackPigeonId.slice(-8)}`,
        location,
      });

      const fallbackImageKey = await uploadTestImage(request, fallbackPigeonId);
      const fallbackResponse = await request.post(`${API_BASE_URL}/api/posts/create`, {
        headers: getApiHeaders(fallbackPigeonId),
        data: {
          text: caption,
          image: fallbackImageKey,
          location,
        },
      });

      if (fallbackResponse.status() !== 201) {
        const fallbackText = await fallbackResponse.text();
        throw new Error(
          `Failed to create test post (fallback): ${fallbackResponse.status()} ${fallbackText}`
        );
      }

      const fallbackData = await fallbackResponse.json();
      const fallbackPost = fallbackData.post || fallbackData;

      if (!fallbackPost || !fallbackPost._id) {
        throw new Error(
          `Invalid post response structure (fallback): ${JSON.stringify(fallbackData)}`
        );
      }

      return fallbackPost;
    }

    throw new Error(`Failed to create test post: ${response.status()} ${text}`);
  }

  const data = await response.json();

  // Handle both possible response structures
  const post = data.post || data;

  if (!post || !post._id) {
    throw new Error(`Invalid post response structure: ${JSON.stringify(data)}`);
  }

  return post;
}

/**
 * Create a test comment on a post
 * @param request - Playwright APIRequestContext
 * @param postId - The post ID to comment on
 * @param text - Comment text
 * @param pigeonId - Optional pigeonId override
 * @returns The created comment object
 */
export async function createTestComment(
  request: APIRequestContext,
  postId: string,
  text: string = 'Test comment',
  pigeonId?: string
) {
  const response = await request.post(`${API_BASE_URL}/api/comments`, {
    headers: getApiHeaders(pigeonId),
    data: {
      postId,
      text,
      location: TEST_LOCATION,
    },
  });

  if (response.status() !== 201 && response.status() !== 200) {
    const responseText = await response.text();
    throw new Error(`Failed to create test comment: ${response.status()} ${responseText}`);
  }

  const data = await response.json();
  return data.comment || data.post;
}

/**
 * Report a post
 * @param request - Playwright APIRequestContext
 * @param reportData - Report data
 */
export async function reportPost(
  request: APIRequestContext,
  reportData: {
    postId: string;
    userId: string;
    pigeonId: string;
    reason: 'pornographic' | 'spam' | 'hate_speech';
  }
): Promise<void> {
  const response = await request.post(`${API_BASE_URL}/api/posts/${reportData.postId}/report`, {
    headers: getApiHeaders(reportData.pigeonId),
    data: {
      userId: reportData.userId,
      reason: reportData.reason,
      location: TEST_LOCATION,
    },
  });

  if (response.status() !== 200) {
    const text = await response.text();
    throw new Error(`Report failed: ${text}`);
  }
}

/**
 * Creates flagged posts for admin testing.
 * Creates posts with images and reports them multiple times.
 *
 * @param request - Playwright API request context
 * @param count - Number of flagged posts to create (default: 3)
 * @returns Array of created post IDs
 */
export async function createFlaggedTestPosts(
  request: APIRequestContext,
  count: number = 3
): Promise<string[]> {
  const timestamp = Date.now();
  const postIds: string[] = [];

  console.log(`Creating ${count} flagged test posts...`);

  // Use automation bot as post author (immune to bans)
  let authorCredentials: { pigeonId: string; userId: string };
  try {
    authorCredentials = await ensureAutomationBot(request);
    console.log(`🤖 Using automation bot for flagged posts: ${authorCredentials.pigeonId}`);
  } catch (error) {
    console.warn(`🤖 Automation bot failed for flagged posts, using unique author: ${error}`);
    const author = await createTestUser(request, {
      pigeonId: `test-author-${timestamp}`,
      userName: 'Test Post Author',
    });
    authorCredentials = { pigeonId: author.pigeonId, userId: author.userId };
  }

  // Upload a single test image to reuse
  const imageKey = await uploadTestImage(request, authorCredentials.pigeonId);

  for (let i = 0; i < count; i++) {
    // Create a post
    const response = await request.post(`${API_BASE_URL}/api/posts/create`, {
      headers: getApiHeaders(authorCredentials.pigeonId),
      data: {
        text: `Test flagged post ${i + 1} - created at ${new Date().toISOString()}`,
        image: imageKey,
        location: TEST_LOCATION,
      },
    });

    if (response.status() !== 201) {
      const text = await response.text();
      throw new Error(`Post creation failed: ${text}`);
    }

    const data = await response.json();
    const postId = data.post?._id || data._id;
    postIds.push(postId);

    // Create reporters and report the post
    const reasons: Array<'pornographic' | 'spam' | 'hate_speech'> = [
      'pornographic',
      'spam',
      'hate_speech',
    ];

    // Report each post 1-3 times with different reasons
    const reportCount = (i % 3) + 1;
    for (let j = 0; j < reportCount; j++) {
      const reporter = await createTestUser(request, {
        pigeonId: `test-reporter-${timestamp}-${i}-${j}`,
        userName: `Test Reporter ${i}-${j}`,
      });

      await reportPost(request, {
        postId,
        userId: reporter.userId,
        pigeonId: reporter.pigeonId,
        reason: reasons[j % reasons.length],
      });
    }

    console.log(`Created flagged post ${i + 1}/${count} with ${reportCount} reports`);
  }

  console.log(`Successfully created ${count} flagged test posts`);
  return postIds;
}
