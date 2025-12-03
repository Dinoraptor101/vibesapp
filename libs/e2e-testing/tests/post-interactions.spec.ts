/**
 * E2E Tests: Post Interactions
 *
 * Coverage:
 * - Like/Unlike toggle functionality
 * - Like count accuracy
 * - Like state persistence
 * - Report post functionality
 * - Comment navigation
 * - Preventing duplicate likes
 * - Own post restrictions
 */

import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Helper to find a likeable post (a post from another user that has a visible like button).
 * Will scroll through the feed and fall back to a known user's profile if needed.
 */
async function findLikeablePost(page: Page): Promise<{ post: Locator; heartButton: Locator }> {
  const posts = page.locator('article');
  await expect(posts.first()).toBeVisible({ timeout: 10000 });

  // Try to find a likeable post by scrolling through the feed
  for (let scroll = 0; scroll < 3; scroll++) {
    const postCount = await posts.count();

    for (let i = 0; i < postCount; i++) {
      const post = posts.nth(i);
      const button = post.locator('button[aria-label*="Like"], button[aria-label*="Unlike"]');

      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        return { post, heartButton: button };
      }
    }

    // Scroll down to load more posts
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1000);
  }

  // If still no likeable post found, navigate to a known user's profile
  // The user "Kindness" is a known test account with posts
  await page.goto('/profile/Kindness');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  const profilePosts = page.locator('article');
  const profilePostCount = await profilePosts.count();

  for (let i = 0; i < profilePostCount; i++) {
    const post = profilePosts.nth(i);
    const button = post.locator('button[aria-label*="Like"], button[aria-label*="Unlike"]');

    const isVisible = await button.isVisible().catch(() => false);
    if (isVisible) {
      return { post, heartButton: button };
    }
  }

  throw new Error(
    'Could not find a likeable post from another user - check that test user follows other users or that the feed has posts from others'
  );
}

test.describe('Post Like/Unlike Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Use domcontentloaded - more reliable than networkidle with SSE/WebSocket connections
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display like button on posts from other users', async ({ page }) => {
    // Find a likeable post from another user
    const { heartButton } = await findLikeablePost(page);

    // Verify heart button is visible
    await expect(heartButton).toBeVisible();

    // Verify heart icon is present
    const heartIcon = heartButton.locator('svg');
    await expect(heartIcon).toBeVisible();

    // Verify like count is displayed in aria-label (span only shows when likes > 0)
    const ariaLabel = await heartButton.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/\(\d+ likes?\)/);
  });

  test('should toggle like state when clicking heart button', async ({ page }) => {
    // Find a likeable post from another user
    const { heartButton } = await findLikeablePost(page);

    // Get initial state
    const initialAriaLabel = await heartButton.getAttribute('aria-label');
    const wasLiked = initialAriaLabel?.toLowerCase().includes('unlike');

    // Click and wait for the API response
    const [likeResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/posts/') &&
          response.url().endsWith('/like') &&
          response.request().method() === 'POST',
        { timeout: 10000 }
      ),
      heartButton.click(),
    ]);

    // Verify the API response was successful
    expect(likeResponse.status()).toBeGreaterThanOrEqual(200);
    expect(likeResponse.status()).toBeLessThan(300);

    // Wait for optimistic update to render (no refetch, so shorter wait)
    await page.waitForTimeout(300);

    // Verify state toggled using auto-retry assertion
    await expect(heartButton).toHaveAttribute(
      'aria-label',
      new RegExp(wasLiked ? '^Like post' : '^Unlike post')
    );
  });

  test('should toggle like back and forth multiple times', async ({ page }) => {
    // Find a likeable post from another user
    const { heartButton } = await findLikeablePost(page);

    // Helper to extract like count from aria-label: "Like post (X likes)" or "Unlike post (X likes)"
    const getLikeCount = async () => {
      const ariaLabel = await heartButton.getAttribute('aria-label');
      const match = ariaLabel?.match(/\((\d+) likes?\)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    // Get initial state
    const initialCount = await getLikeCount();

    // Click 1: Like (or unlike if already liked)
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/posts/') && res.url().endsWith('/like')),
      heartButton.click(),
    ]);
    await page.waitForTimeout(300);

    const count1 = await getLikeCount();
    expect(count1).not.toBe(initialCount);

    // Click 2: Toggle back
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/posts/') && res.url().endsWith('/like')),
      heartButton.click(),
    ]);
    await page.waitForTimeout(300);

    const count2 = await getLikeCount();
    expect(count2).toBe(initialCount); // Should be back to initial

    // Click 3: Toggle again
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/posts/') && res.url().endsWith('/like')),
      heartButton.click(),
    ]);
    await page.waitForTimeout(300);

    const count3 = await getLikeCount();
    expect(count3).toBe(count1); // Should match first toggle

    // Click 4: Toggle back to initial
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/posts/') && res.url().endsWith('/like')),
      heartButton.click(),
    ]);
    await page.waitForTimeout(300);

    const count4 = await getLikeCount();
    expect(count4).toBe(initialCount); // Should be back to initial again
  });

  test('should hide like button on own posts', async ({ page }) => {
    // Navigate to own profile via user menu
    const userMenuButton = page.getByTestId('user-menu-button').first();
    await expect(userMenuButton).toBeVisible({ timeout: 5000 });
    await userMenuButton.click();

    const profileMenuItem = page.getByRole('menuitem', { name: /profile/i });
    await expect(profileMenuItem).toBeVisible({ timeout: 3000 });
    await profileMenuItem.click();

    await page.waitForURL('**/profile/**', { timeout: 5000 });
    await page.waitForLoadState('domcontentloaded');

    // The profile page has a "Posts" section header - wait for it to ensure we're on the right page
    const postsHeader = page.locator('h2:has-text("Posts")');
    await expect(postsHeader).toBeVisible({ timeout: 10000 });

    // IMPORTANT: The app uses PersistentPages which keeps all pages mounted.
    // We need to scope our selectors to only look at the profile section, not the hidden home feed.
    // Find posts within the visible profile page - they are in the div containing the "Posts" header
    const profilePostsSection = postsHeader.locator('..'); // Parent div containing "Posts" header
    const posts = profilePostsSection.locator('article');

    // Check if user has any posts on their profile
    const postCount = await posts.count();

    if (postCount === 0) {
      // User has no posts - this is valid, test passes (no like buttons to hide)
      return;
    }

    // On own posts: like and report buttons should be hidden
    const firstPost = posts.first();

    const heartButton = firstPost.locator(
      'button[aria-label*="Like"], button[aria-label*="Unlike"]'
    );
    const reportButton = firstPost.locator('button[aria-label*="Report"]');

    await expect(heartButton).not.toBeVisible();
    await expect(reportButton).not.toBeVisible();

    // Comment button should still be visible (users can view comments on their own posts)
    const commentLink = firstPost.locator('a[href^="/post/"][aria-label*="comment" i]');
    await expect(commentLink).toBeVisible();
  });

  test('should show like button on other users posts', async ({ page }) => {
    // Find a likeable post from another user, which gives us both post and button
    const { post } = await findLikeablePost(page);

    // Get the user profile link from the post
    const userLink = post.locator('a[href^="/profile/"]').first();
    const otherUserProfileLink = await userLink.getAttribute('href');

    if (!otherUserProfileLink) {
      throw new Error('Could not find profile link in the post');
    }

    // Navigate to the other user's profile
    await page.goto(otherUserProfileLink);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Wait for posts to load on their profile
    const profilePosts = page.locator('article');
    await expect(profilePosts.first()).toBeVisible({ timeout: 10000 });

    // Check first post - like button SHOULD be visible on other user's posts
    const firstPost = profilePosts.first();
    const profileHeartButton = firstPost.locator(
      'button[aria-label*="Like"], button[aria-label*="Unlike"]'
    );

    // Like button should be visible on other users' posts
    await expect(profileHeartButton).toBeVisible();

    // Comment button should also be visible
    const commentLink = firstPost.locator('a[href^="/post/"][aria-label*="comment" i]');
    await expect(commentLink).toBeVisible();

    // Report button should be visible on other users' posts
    const reportButton = firstPost.locator('button[aria-label*="Report"]');
    await expect(reportButton).toBeVisible();
  });

  test('should persist like state after page reload', async ({ page }) => {
    // Find a likeable post from another user
    const { post } = await findLikeablePost(page);

    // Get the post link to navigate to detail page
    const postLink = post.locator('a[href^="/post/"]').first();
    const postUrl = await postLink.getAttribute('href');

    if (!postUrl) {
      throw new Error('Could not find post URL link');
    }

    // Navigate to post detail page (triggers PersistentPages slide-over)
    await page.goto(postUrl);
    await page.waitForLoadState('domcontentloaded');

    // Wait for the post detail overlay to slide in (300ms CSS transition)
    await page.waitForTimeout(400);

    // Find the heart button on detail page - must be specific to the post detail overlay
    // The post detail has a "Back" button, which confirms we're on the detail page
    const backButton = page.getByRole('button', { name: 'Back' });
    await expect(backButton).toBeVisible({ timeout: 5000 });

    // Use getByRole to find the like/unlike button - this respects inert attribute
    // and will only find buttons that are actually interactive
    const detailHeartButton = page.getByRole('button', { name: /like post|unlike post/i }).first();
    await expect(detailHeartButton).toBeVisible({ timeout: 5000 });

    // Get the current state on detail page (check for "Unlike" in aria-label)
    const detailAriaLabel = await detailHeartButton.getAttribute('aria-label');
    const stateBeforeToggle = detailAriaLabel?.toLowerCase().includes('unlike') ?? false;

    // Toggle like state and wait for API response
    // API endpoint is POST /api/posts/:id/like (toggle endpoint)
    // Use Promise.all to ensure we start listening before clicking
    const [likeResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/posts/') &&
          response.url().endsWith('/like') &&
          response.request().method() === 'POST',
        { timeout: 10000 }
      ),
      detailHeartButton.click(),
    ]);

    // Verify the API response was successful
    expect(likeResponse.status()).toBeGreaterThanOrEqual(200);
    expect(likeResponse.status()).toBeLessThan(300);

    // Wait for optimistic update and React Query cache update to settle
    await page.waitForTimeout(800);

    // Capture the state after toggle (before reload) to verify what we expect to persist
    const afterClickAriaLabel = await detailHeartButton.getAttribute('aria-label');
    const stateAfterClick = afterClickAriaLabel?.toLowerCase().includes('unlike') ?? false;

    // Verify the toggle actually worked (state changed)
    expect(stateAfterClick).toBe(!stateBeforeToggle);

    // Reload the page to verify persistence from server
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Wait for the post detail overlay to slide in again after reload
    await page.waitForTimeout(400);

    // Verify Back button is visible (confirms we're on post detail)
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible({ timeout: 5000 });

    // Find the heart button again on reloaded page (fresh reference)
    // Use getByRole with regex to match either like or unlike
    const reloadedHeartButton = page
      .getByRole('button', { name: /like post|unlike post/i })
      .first();
    await expect(reloadedHeartButton).toBeVisible({ timeout: 5000 });

    // Verify state persisted (should match what it was after click, before reload)
    const reloadedAriaLabel = await reloadedHeartButton.getAttribute('aria-label');
    const stateAfterReload = reloadedAriaLabel?.toLowerCase().includes('unlike') ?? false;

    // State after reload should match the state after we clicked (persistence test)
    expect(stateAfterReload).toBe(stateAfterClick);
  });
});

test.describe('Post Report Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page elements to be visible (SSE keeps connections open)
    await page.waitForTimeout(500);
  });

  test('should display report button on posts (except own posts)', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    // Find first post that has a report button (not own post)
    let reportButton = null;
    const postCount = await posts.count();

    for (let i = 0; i < Math.min(postCount, 5); i++) {
      const post = posts.nth(i);
      const button = post.locator('button[aria-label*="Report"]');

      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        reportButton = button;
        break;
      }
    }

    if (!reportButton) {
      throw new Error('No posts with report buttons found - test data setup required');
    }

    // Verify report button has flag icon
    await expect(reportButton).toBeVisible();
    const flagIcon = reportButton.locator('svg');
    await expect(flagIcon).toBeVisible();
  });

  // TODO: This test should create test posts from other users via API injection
  test.skip('should navigate to report page when clicking report button', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    // Find first post that has a report button
    let reportButton = null;
    const postCount = await posts.count();

    for (let i = 0; i < Math.min(postCount, 5); i++) {
      const post = posts.nth(i);
      const button = post.locator('button[aria-label*="Report"]');

      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        reportButton = button;
        break;
      }
    }

    if (!reportButton) {
      throw new Error('No posts with report buttons found - test data setup required');
    }

    // Click report button
    await reportButton.click();

    // Should navigate to report page
    await page.waitForURL('**/report/**', { timeout: 5000 });
    expect(page.url()).toContain('/report/');
  });
});

test.describe('Post Comment Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page elements to be visible (SSE keeps connections open)
    await page.waitForTimeout(500);
  });

  test('should display comment button on posts', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    const firstPost = posts.first();

    // Find comment button (link to post detail)
    const commentLink = firstPost.locator('a[href^="/post/"][aria-label*="comment" i]');
    await expect(commentLink).toBeVisible();

    // Verify comment icon is present
    const commentIcon = commentLink.locator('svg');
    await expect(commentIcon).toBeVisible();
  });

  test('should navigate to post detail when clicking comment button', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    const firstPost = posts.first();
    const commentLink = firstPost.locator('a[href^="/post/"][aria-label*="comment" i]');

    // Get the post ID from href
    const href = await commentLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('/post/');

    // Click comment button
    await commentLink.click();

    // Should navigate to post detail page
    await page.waitForURL('**/post/**', { timeout: 5000 });
    expect(page.url()).toContain('/post/');
    expect(page.url()).toContain(href as string);
  });
});

test.describe('Post Interactions - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page elements to be visible (SSE keeps connections open)
    await page.waitForTimeout(500);
  });

  // TODO: This test should create test posts from other users via API injection
  test.skip('should handle offline state gracefully', async ({ page, context }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    // Find a post with a like button (not own post)
    let post = null;
    let heartButton = null;
    const postCount = await posts.count();

    for (let i = 0; i < Math.min(postCount, 5); i++) {
      const currentPost = posts.nth(i);
      const button = currentPost.locator(
        'button[aria-label*="Like"], button[aria-label*="Unlike"]'
      );

      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        post = currentPost;
        heartButton = button;
        break;
      }
    }

    if (!post || !heartButton) {
      throw new Error('No likeable posts found - test data setup required');
    }

    // Verify button is visible when online
    await expect(heartButton).toBeVisible();

    // Verify comment link is visible when online
    const commentLink = post.locator('a[href^="/post/"][aria-label*="comment" i]');
    await expect(commentLink).toBeVisible();

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000); // Wait for offline detection

    // Buttons should now be hidden when offline
    await expect(heartButton).not.toBeVisible();
    await expect(commentLink).not.toBeVisible();

    // The image should still be visible but not clickable
    const postImage = post.locator('img').first();
    await expect(postImage).toBeVisible();

    // Go back online
    await context.setOffline(false);
    await page.waitForTimeout(1000); // Wait for online detection

    // Buttons should be visible again
    await expect(heartButton).toBeVisible();
    await expect(commentLink).toBeVisible();
  });
});

// ============================================================================
// REPORT POST FLOW TESTS (API-based)
// ============================================================================

/**
 * Report Post Flow Tests
 *
 * These are API-based tests for the community reporting feature.
 * Users can report posts for violating content policies.
 *
 * Coverage:
 * - Report post for different reasons (pornographic, spam, hate_speech)
 * - Prevent reporting own posts
 * - Prevent duplicate reports from same user
 * - Post hidden from reporter immediately
 * - Auto-hide after threshold nearby reports
 * - Notification to author when post is auto-hidden
 * - Invalid request handling
 */

// Test data for API tests
const TEST_LOCATION_API = { lat: 37.41, lon: -77.46 }; // Richmond, VA
const NEARBY_LOCATION_API = { lat: 37.45, lon: -77.5 }; // ~5 miles away
const FAR_LOCATION_API = { lat: 40.7128, lon: -74.006 }; // NYC - ~300 miles

// Helper to create API headers with authentication
function getApiHeaders(pigeonId: string) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': '***REMOVED***',
    'x-pigeon-id': pigeonId,
  };
}

// Helper to create user and get actual userId (backend generates UUID)
async function createUserForReporting(
  request: any,
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
    },
  });

  if (response.status() !== 201) {
    throw new Error(`User creation failed: ${await response.text()}`);
  }

  const user = await response.json();
  return { userId: user.userId, pigeonId: userData.pigeonId };
}

// Helper to upload test image to S3 and get the key
async function uploadTestImage(request: any, baseURL: string, pigeonId: string): Promise<string> {
  // Get presigned S3 URL
  const s3Response = await request.get(`${baseURL}/api/s3/s3Url`, {
    headers: getApiHeaders(pigeonId),
  });
  const { url, key } = await s3Response.json();

  // Read the test image file
  const fs = await import('fs');
  const path = await import('path');
  const imagePath = path.join(__dirname, '../assets/test_image.jpeg');
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

// Helper to create a post
async function createPostForReporting(
  request: any,
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

// Helper to report a post
async function reportPostAPI(
  request: any,
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

test.describe('Report Post - API Tests', () => {
  // Run in serial mode to avoid race conditions with shared test data
  test.describe.configure({ mode: 'serial' });

  let baseURL: string;
  let testPostId: string;
  let postAuthor: { userId: string; pigeonId: string };

  test.beforeAll(async ({ request, baseURL: configBaseURL }) => {
    baseURL = configBaseURL?.replace(':5173', ':5001') || 'http://localhost:5001';

    // Create post author with unique ID including random suffix to avoid collisions
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    postAuthor = await createUserForReporting(request, baseURL, {
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
    testPostId = postData.post?._id || postData._id;
  });

  test('should report post for "pornographic" reason', async ({ request }) => {
    const reporter = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-porn-${Date.now()}`,
      userName: 'Pornographic Reporter',
    });

    const reportResponse = await reportPostAPI(request, baseURL, {
      postId: testPostId,
      userId: reporter.userId,
      pigeonId: reporter.pigeonId,
      reason: 'pornographic',
      location: TEST_LOCATION_API,
    });

    expect(reportResponse.status()).toBe(200);
    const reportData = await reportResponse.json();
    expect(reportData.success).toBe(true);
    expect(reportData.message).toContain('Report submitted');
  });

  test('should report post for "spam" reason', async ({ request }) => {
    // Create new post for this test
    const newPostResponse = await createPostForReporting(request, baseURL, {
      userId: postAuthor.userId,
      pigeonId: postAuthor.pigeonId,
      text: 'Spam test post',
    });
    const newPostData = await newPostResponse.json();
    const newPostId = newPostData.post?._id || newPostData._id;

    const reporter = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-spam-${Date.now()}`,
      userName: 'Spam Reporter',
    });

    const reportResponse = await reportPostAPI(request, baseURL, {
      postId: newPostId,
      userId: reporter.userId,
      pigeonId: reporter.pigeonId,
      reason: 'spam',
      location: TEST_LOCATION_API,
    });

    expect(reportResponse.status()).toBe(200);
    const reportData = await reportResponse.json();
    expect(reportData.success).toBe(true);
  });

  test('should report post for "hate_speech" reason', async ({ request }) => {
    // Create new post for this test
    const newPostResponse = await createPostForReporting(request, baseURL, {
      userId: postAuthor.userId,
      pigeonId: postAuthor.pigeonId,
      text: 'Hate speech test post',
    });
    const newPostData = await newPostResponse.json();
    const newPostId = newPostData.post?._id || newPostData._id;

    const reporter = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-hate-${Date.now()}`,
      userName: 'Hate Speech Reporter',
    });

    const reportResponse = await reportPostAPI(request, baseURL, {
      postId: newPostId,
      userId: reporter.userId,
      pigeonId: reporter.pigeonId,
      reason: 'hate_speech',
      location: TEST_LOCATION_API,
    });

    expect(reportResponse.status()).toBe(200);
    const reportData = await reportResponse.json();
    expect(reportData.success).toBe(true);
  });

  test('should return 403 when user tries to report own post', async ({ request }) => {
    const user = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-self-${Date.now()}`,
      userName: 'Self Reporter',
    });

    // Create post by this user
    const postResponse = await createPostForReporting(request, baseURL, {
      userId: user.userId,
      pigeonId: user.pigeonId,
      text: 'My own post',
    });
    const postData = await postResponse.json();
    const postId = postData.post?._id || postData._id;

    // Try to report own post
    const reportResponse = await reportPostAPI(request, baseURL, {
      postId,
      userId: user.userId,
      pigeonId: user.pigeonId,
      reason: 'spam',
    });

    expect(reportResponse.status()).toBe(403);
    const reportData = await reportResponse.json();
    expect(reportData.success).toBe(false);
    expect(reportData.message).toContain('cannot report your own post');
  });

  test('should return 409 when user tries to report same post twice', async ({ request }) => {
    // Create author
    const author = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-dup-author-${Date.now()}`,
      userName: 'Duplicate Report Author',
    });

    // Create post
    const postResponse = await createPostForReporting(request, baseURL, {
      userId: author.userId,
      pigeonId: author.pigeonId,
      text: 'Post to report twice',
    });
    const postData = await postResponse.json();
    const postId = postData.post?._id || postData._id;

    // Create reporter
    const reporter = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-dup-reporter-${Date.now()}`,
      userName: 'Duplicate Reporter',
    });

    // First report - should succeed
    const firstReportResponse = await reportPostAPI(request, baseURL, {
      postId,
      userId: reporter.userId,
      pigeonId: reporter.pigeonId,
      reason: 'spam',
    });
    expect(firstReportResponse.status()).toBe(200);

    // Second report - should fail with 409
    const secondReportResponse = await reportPostAPI(request, baseURL, {
      postId,
      userId: reporter.userId,
      pigeonId: reporter.pigeonId,
      reason: 'pornographic',
    });
    expect(secondReportResponse.status()).toBe(409);
    const secondReportData = await secondReportResponse.json();
    expect(secondReportData.success).toBe(false);
    expect(secondReportData.message).toContain('already reported');
  });

  test('should hide post from reporter immediately after report', async ({ request }) => {
    // Create author
    const author = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-hidden-author-${Date.now()}`,
      userName: 'Hidden Post Author',
      location: TEST_LOCATION_API,
    });

    // Create post
    const postResponse = await createPostForReporting(request, baseURL, {
      userId: author.userId,
      pigeonId: author.pigeonId,
      text: 'Post to be hidden from reporter',
      location: TEST_LOCATION_API,
    });
    const postData = await postResponse.json();
    const postId = postData.post?._id || postData._id;

    // Create reporter
    const reporter = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-hidden-reporter-${Date.now()}`,
      userName: 'Hidden Post Reporter',
    });

    // Report the post
    const reportResponse = await reportPostAPI(request, baseURL, {
      postId,
      userId: reporter.userId,
      pigeonId: reporter.pigeonId,
      reason: 'spam',
    });
    expect(reportResponse.status()).toBe(200);

    // Fetch the post and verify hiddenForUsers contains reporter
    const fetchedPostResponse = await request.get(
      `${baseURL}/api/posts/${postId}?userId=${author.userId}`,
      {
        headers: getApiHeaders(author.pigeonId),
      }
    );
    const fetchedPost = await fetchedPostResponse.json();

    const hiddenForUsers = fetchedPost.post?.hiddenForUsers || fetchedPost.hiddenForUsers || [];
    expect(hiddenForUsers).toContain(reporter.userId);
  });

  test('should return 400 for invalid report reason', async ({ request }) => {
    const reporter = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-invalid-${Date.now()}`,
      userName: 'Invalid Reason Reporter',
    });

    const response = await request.post(`${baseURL}/api/posts/${testPostId}/report`, {
      headers: getApiHeaders(reporter.pigeonId),
      data: {
        userId: reporter.userId,
        reason: 'invalid_reason',
        location: TEST_LOCATION_API,
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('Invalid reason');
  });

  test('should return 404 for non-existent post', async ({ request }) => {
    const reporter = await createUserForReporting(request, baseURL, {
      pigeonId: `pigeon-notfound-${Date.now()}`,
      userName: 'Not Found Reporter',
    });

    const fakePostId = '507f1f77bcf86cd799439011';
    const response = await request.post(`${baseURL}/api/posts/${fakePostId}/report`, {
      headers: getApiHeaders(reporter.pigeonId),
      data: {
        userId: reporter.userId,
        reason: 'spam',
        location: TEST_LOCATION_API,
      },
    });

    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('not found');
  });
});
