/**
 * Helper functions for post reporting E2E tests
 * Handles test data preparation, API interactions, and post creation for reporting scenarios
 */

import type { APIRequestContext } from '@playwright/test';
import { isQAEnvironment } from '../../setup-utils';

// Test location constant
const TEST_LOCATION_API = { lat: 37.41, lon: -77.46 }; // Richmond, VA

// Determine API base URL
function getBaseURL(): string {
  return (
    isQAEnvironment() ? process.env.QA_BACKEND_BASE : process.env.LOCAL_BACKEND_BASE
  ) as string;
}

/**
 * Create API headers with authentication
 */
export function getApiHeaders(pigeonId: string) {
  const apiKey = process.env.BACKEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'BACKEND_API_KEY environment variable is not set. Please add it to your .env file in libs/e2e-testing/'
    );
  }

  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'x-pigeon-id': pigeonId,
    'x-e2e-bypass': 'e2e-test-bypass-secret-token-2024', // E2E test bypass for reCAPTCHA
  };
}

/**
 * Create a test user and return actual userId (backend generates UUID)
 */
export async function createUserForReporting(
  request: APIRequestContext,
  baseURL: string,
  userData: {
    pigeonId: string;
    userName: string;
    location?: { lat: number; lon: number };
  }
): Promise<{ userId: string; pigeonId: string }> {
  const response = await request.post(`${baseURL}/api/users/create`, {
    headers: getApiHeaders(userData.pigeonId),
    data: {
      pigeonId: userData.pigeonId,
      userId: 'temp',
      userName: userData.userName,
      birthYear: 1990,
      birthMonth: 6,
      sex: 'male',
      location: userData.location || TEST_LOCATION_API,
      recaptchaToken: 'bypass', // Required field but bypassed via x-e2e-bypass header
    },
  });

  if (response.status() !== 201) {
    throw new Error(`User creation failed: ${await response.text()}`);
  }

  const user = await response.json();
  return { userId: user.userId, pigeonId: userData.pigeonId };
}

/**
 * Upload test image to S3 and return the key
 */
export async function uploadTestImage(
  request: APIRequestContext,
  baseURL: string,
  pigeonId: string
): Promise<string> {
  // Get presigned S3 URL
  const s3Response = await request.get(`${baseURL}/api/s3/s3Url`, {
    headers: getApiHeaders(pigeonId),
  });
  const { url, key } = await s3Response.json();

  // Read the test image file
  const fs = await import('fs');
  const path = await import('path');
  const imagePath = path.join(__dirname, '../../assets/test_image.jpeg');
  const imageBuffer = fs.readFileSync(imagePath);

  // Upload to S3
  await request.put(url, {
    data: imageBuffer,
    headers: {
      'Content-Type': 'image/jpeg',
    },
  });

  return key;
}

/**
 * Create a test post for reporting scenarios
 */
export async function createPostForReporting(
  request: APIRequestContext,
  baseURL: string,
  postData: {
    userId: string;
    pigeonId: string;
    text?: string;
    location?: { lat: number; lon: number };
    image?: string;
  }
) {
  // Upload image if not provided
  const imageKey = postData.image || (await uploadTestImage(request, baseURL, postData.pigeonId));

  return await request.post(`${baseURL}/api/posts/create`, {
    headers: getApiHeaders(postData.pigeonId),
    data: {
      userId: postData.userId,
      text: postData.text || 'Test post',
      image: imageKey,
      location: postData.location || TEST_LOCATION_API,
    },
  });
}

/**
 * Report a post via API
 */
export async function reportPostAPI(
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
  return await request.post(`${baseURL}/api/posts/${reportData.postId}/report`, {
    headers: getApiHeaders(reportData.pigeonId),
    data: {
      userId: reportData.userId,
      reason: reportData.reason,
      location: reportData.location || TEST_LOCATION_API,
    },
  });
}

/**
 * Setup test environment for report post API tests
 * Creates a post author and test post, returns IDs for use in tests
 */
export async function setupReportTestEnvironment(request: APIRequestContext): Promise<{
  baseURL: string;
  testPostId: string;
  postAuthor: { userId: string; pigeonId: string };
}> {
  const baseURL = getBaseURL();

  // Create post author with unique ID including random suffix to avoid collisions
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const postAuthor = await createUserForReporting(request, baseURL, {
    pigeonId: `pigeon-author-${uniqueSuffix}`,
    userName: 'Report Test Author',
    location: TEST_LOCATION_API,
  });

  // Create test post
  const postResponse = await createPostForReporting(request, baseURL, {
    userId: postAuthor.userId,
    pigeonId: postAuthor.pigeonId,
    text: 'Test post for reporting',
    location: TEST_LOCATION_API,
  });

  const postData = await postResponse.json();
  const testPostId = postData.post?._id || postData._id;

  return { baseURL, testPostId, postAuthor };
}

/**
 * Export test location for use in tests
 */
export { TEST_LOCATION_API };
