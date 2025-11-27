/**
 * Test Data Helper for Admin E2E Tests
 *
 * Creates flagged posts with images for testing the admin flagged posts page.
 */

import type { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const TEST_LOCATION = { lat: 37.41, lon: -77.46 }; // Richmond, VA

// Helper to create API headers with authentication
function getApiHeaders(pigeonId: string) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': 'DxgVLXfMi4uJCk',
    'x-pigeon-id': pigeonId,
  };
}

// Helper to create a user
async function createUser(
  request: APIRequestContext,
  baseURL: string,
  userData: {
    pigeonId: string;
    userName: string;
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
      location: TEST_LOCATION,
    },
  });

  if (response.status() !== 201) {
    const text = await response.text();
    throw new Error(`User creation failed: ${text}`);
  }

  const user = await response.json();
  return { userId: user.userId, pigeonId: userData.pigeonId };
}

// Helper to upload test image to S3
async function uploadTestImage(
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
  const imagePath = path.join(__dirname, '../../../assets/test_image.jpeg');
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

// Helper to create a post with image
async function createPost(
  request: APIRequestContext,
  baseURL: string,
  postData: {
    userId: string;
    pigeonId: string;
    text: string;
    image: string;
  }
): Promise<string> {
  const response = await request.post(`${baseURL}/api/posts/create`, {
    headers: getApiHeaders(postData.pigeonId),
    data: {
      userId: postData.userId,
      text: postData.text,
      image: postData.image,
      location: TEST_LOCATION,
    },
  });

  if (response.status() !== 201) {
    const text = await response.text();
    throw new Error(`Post creation failed: ${text}`);
  }

  const data = await response.json();
  return data.post?._id || data._id;
}

// Helper to report a post
async function reportPost(
  request: APIRequestContext,
  baseURL: string,
  reportData: {
    postId: string;
    userId: string;
    pigeonId: string;
    reason: 'pornographic' | 'spam' | 'hate_speech';
  }
): Promise<void> {
  const response = await request.post(`${baseURL}/api/posts/${reportData.postId}/report`, {
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
  const baseURL = process.env.VITE_API_URL || 'http://localhost:5001';
  const timestamp = Date.now();
  const postIds: string[] = [];

  console.log(`Creating ${count} flagged test posts...`);

  // Create post author
  const author = await createUser(request, baseURL, {
    pigeonId: `test-author-${timestamp}`,
    userName: 'Test Post Author',
  });

  // Upload a single test image to reuse
  const imageKey = await uploadTestImage(request, baseURL, author.pigeonId);

  for (let i = 0; i < count; i++) {
    // Create a post
    const postId = await createPost(request, baseURL, {
      userId: author.userId,
      pigeonId: author.pigeonId,
      text: `Test flagged post ${i + 1} - created at ${new Date().toISOString()}`,
      image: imageKey,
    });

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
      const reporter = await createUser(request, baseURL, {
        pigeonId: `test-reporter-${timestamp}-${i}-${j}`,
        userName: `Test Reporter ${i}-${j}`,
      });

      await reportPost(request, baseURL, {
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
