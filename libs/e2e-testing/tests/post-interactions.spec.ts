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

import { test, expect } from '@playwright/test';

test.describe('Post Like/Unlike Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display like button on posts', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    const postCount = await posts.count();
    expect(postCount).toBeGreaterThan(0);

    // Verify first post has a heart button
    const firstPost = posts.first();
    const heartButton = firstPost.locator(
      'button[aria-label*="Like"], button[aria-label*="Unlike"]'
    );
    await expect(heartButton).toBeVisible();

    // Verify heart icon is present
    const heartIcon = heartButton.locator('svg');
    await expect(heartIcon).toBeVisible();

    // Verify like count is displayed
    const likeCount = heartButton.locator('span');
    await expect(likeCount).toBeVisible();
  });

  test('should toggle like state when clicking heart button', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    // Find first post that is not own post (can be liked)
    let heartButton = null;
    const postCount = await posts.count();

    for (let i = 0; i < Math.min(postCount, 5); i++) {
      const post = posts.nth(i);
      const button = post.locator('button[aria-label*="Like"], button[aria-label*="Unlike"]');

      // Check if button is visible (not own post)
      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        heartButton = button;
        break;
      }
    }

    if (!heartButton) {
      test.skip(true, 'No likeable posts found (all posts are own posts)');
      return;
    }

    // Get initial state
    const initialAriaLabel = await heartButton.getAttribute('aria-label');
    const initialIsLiked = initialAriaLabel?.toLowerCase().includes('unlike');

    // Get initial like count
    const likeCountSpan = heartButton.locator('span');
    const initialCountText = await likeCountSpan.textContent();
    const initialCount = parseInt(initialCountText || '0', 10);

    // Get initial heart icon state (filled vs unfilled)
    const heartIcon = heartButton.locator('svg');
    const initialClasses = await heartIcon.getAttribute('class');
    const initiallyFilled = initialClasses?.includes('fill-current');

    // Click to toggle like
    await heartButton.click();

    // Wait for optimistic update
    await page.waitForTimeout(300);

    // Verify like count changed
    const newCountText = await likeCountSpan.textContent();
    const newCount = parseInt(newCountText || '0', 10);

    if (initialIsLiked) {
      // Was liked, should now be unliked (count decreased by 1)
      expect(newCount).toBe(initialCount - 1);
    } else {
      // Was not liked, should now be liked (count increased by 1)
      expect(newCount).toBe(initialCount + 1);
    }

    // Verify heart icon state changed
    const newClasses = await heartIcon.getAttribute('class');
    const nowFilled = newClasses?.includes('fill-current');

    if (initiallyFilled) {
      expect(nowFilled).toBe(false); // Should be unfilled now
    } else {
      expect(nowFilled).toBe(true); // Should be filled now
    }

    // Verify aria-label changed
    const newAriaLabel = await heartButton.getAttribute('aria-label');
    if (initialIsLiked) {
      expect(newAriaLabel?.toLowerCase()).toContain('like');
      expect(newAriaLabel?.toLowerCase()).not.toContain('unlike');
    } else {
      expect(newAriaLabel?.toLowerCase()).toContain('unlike');
    }
  });

  test('should toggle like back and forth multiple times', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    // Find a likeable post
    let heartButton = null;
    const postCount = await posts.count();

    for (let i = 0; i < Math.min(postCount, 5); i++) {
      const post = posts.nth(i);
      const button = post.locator('button[aria-label*="Like"], button[aria-label*="Unlike"]');

      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        heartButton = button;
        break;
      }
    }

    if (!heartButton) {
      test.skip(true, 'No likeable posts found');
      return;
    }

    const likeCountSpan = heartButton.locator('span');

    // Get initial state
    const initialCountText = await likeCountSpan.textContent();
    const initialCount = parseInt(initialCountText || '0', 10);

    // Click 1: Like (or unlike if already liked)
    await heartButton.click();
    await page.waitForTimeout(600); // Wait for mutation to complete

    const count1Text = await likeCountSpan.textContent();
    const count1 = parseInt(count1Text || '0', 10);
    expect(count1).not.toBe(initialCount);

    // Click 2: Toggle back
    await heartButton.click();
    await page.waitForTimeout(600);

    const count2Text = await likeCountSpan.textContent();
    const count2 = parseInt(count2Text || '0', 10);
    expect(count2).toBe(initialCount); // Should be back to initial

    // Click 3: Toggle again
    await heartButton.click();
    await page.waitForTimeout(600);

    const count3Text = await likeCountSpan.textContent();
    const count3 = parseInt(count3Text || '0', 10);
    expect(count3).toBe(count1); // Should match first toggle

    // Click 4: Toggle back to initial
    await heartButton.click();
    await page.waitForTimeout(600);

    const count4Text = await likeCountSpan.textContent();
    const count4 = parseInt(count4Text || '0', 10);
    expect(count4).toBe(initialCount); // Should be back to initial again
  });

  test('should prevent rapid duplicate likes', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    // Find a likeable post
    let heartButton = null;
    const postCount = await posts.count();

    for (let i = 0; i < Math.min(postCount, 5); i++) {
      const post = posts.nth(i);
      const button = post.locator('button[aria-label*="Like"], button[aria-label*="Unlike"]');

      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        heartButton = button;
        break;
      }
    }

    if (!heartButton) {
      test.skip(true, 'No likeable posts found');
      return;
    }

    const likeCountSpan = heartButton.locator('span');

    // Get initial count
    const initialCountText = await likeCountSpan.textContent();
    const initialCount = parseInt(initialCountText || '0', 10);

    // Rapidly click 5 times (should only register as 1 action due to debounce)
    await heartButton.click();
    await heartButton.click();
    await heartButton.click();
    await heartButton.click();
    await heartButton.click();

    // Wait for all mutations to settle
    await page.waitForTimeout(1000);

    // Check final count - should only be +1 or -1 from initial, not +5 or -5
    const finalCountText = await likeCountSpan.textContent();
    const finalCount = parseInt(finalCountText || '0', 10);

    const difference = Math.abs(finalCount - initialCount);
    expect(difference).toBeLessThanOrEqual(1); // Should be 0 or 1, not 5
  });

  test('should hide like button on own posts', async ({ page }) => {
    // Navigate to own profile to find own posts
    await page.getByTestId('user-menu-button').first().click();
    await page.getByRole('menuitem', { name: /profile/i }).click();
    await page.waitForURL('**/profile/**', { timeout: 5000 });

    // Wait for posts to load
    const posts = page.locator('article');
    await page.waitForTimeout(2000); // Give posts time to load
    const postCount = await posts.count();

    if (postCount === 0) {
      test.skip(true, 'No posts found on profile');
      return;
    }

    // Check first post - like button should not be present
    const firstPost = posts.first();
    const heartButton = firstPost.locator(
      'button[aria-label*="Like"], button[aria-label*="Unlike"]'
    );

    // Like button should be hidden on own posts
    await expect(heartButton).not.toBeVisible();

    // Comment button should still be visible (navigates to post detail)
    const commentLink = firstPost.locator('a[href^="/post/"][aria-label*="comment" i]');
    await expect(commentLink).toBeVisible();

    // Report button should also not be present on own posts
    const reportButton = firstPost.locator('button[aria-label*="Report"]');
    await expect(reportButton).not.toBeVisible();
  });

  test('should persist like state after page reload', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    // Find a likeable post (not own post, has like button visible)
    let heartButton = null;
    let postUrl = '';
    const postCount = await posts.count();

    for (let i = 0; i < Math.min(postCount, 5); i++) {
      const post = posts.nth(i);
      const button = post.locator('button[aria-label*="Like"], button[aria-label*="Unlike"]');

      // Check if button is visible (not own post)
      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        // Get the post link to navigate to detail page
        const postLink = post.locator('a[href^="/post/"]').first();
        const href = await postLink.getAttribute('href');
        if (href) {
          postUrl = href;
          heartButton = button;
          break;
        }
      }
    }

    if (!heartButton || !postUrl) {
      test.skip(true, 'No likeable posts found with valid URL');
      return;
    }

    // Get initial state
    const initialAriaLabel = await heartButton.getAttribute('aria-label');
    const initialIsLiked = initialAriaLabel?.toLowerCase().includes('unlike');

    // Toggle like state
    await heartButton.click();
    await page.waitForTimeout(600);

    // Navigate to post detail page
    await page.goto(postUrl);
    await page.waitForLoadState('networkidle');

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find the heart button on detail page
    const detailHeartButton = page
      .locator('button[aria-label*="Like"], button[aria-label*="Unlike"]')
      .first();
    await expect(detailHeartButton).toBeVisible();

    // Verify state persisted (toggled from initial)
    const newAriaLabel = await detailHeartButton.getAttribute('aria-label');
    const newIsLiked = newAriaLabel?.toLowerCase().includes('unlike');

    // State should be opposite of initial (we toggled it)
    expect(newIsLiked).toBe(!initialIsLiked);
  });
});

test.describe('Post Report Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
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
      test.skip(true, 'No posts with report buttons found (may be viewing only own posts)');
      return;
    }

    // Verify report button has flag icon
    await expect(reportButton).toBeVisible();
    const flagIcon = reportButton.locator('svg');
    await expect(flagIcon).toBeVisible();
  });

  test('should navigate to report page when clicking report button', async ({ page }) => {
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
      test.skip(true, 'No posts with report buttons found');
      return;
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
    await page.waitForLoadState('networkidle');
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
    await page.waitForLoadState('networkidle');
  });

  test('should handle offline state gracefully', async ({ page, context }) => {
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
      test.skip(true, 'No likeable posts found');
      return;
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

  test('should display correct like count format for large numbers', async ({ page }) => {
    // Wait for posts to load
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });

    const firstPost = posts.first();
    const heartButton = firstPost.locator(
      'button[aria-label*="Like"], button[aria-label*="Unlike"]'
    );

    await expect(heartButton).toBeVisible();

    // Get like count text
    const likeCountSpan = heartButton.locator('span');
    const countText = await likeCountSpan.textContent();

    // Verify it's a valid number or formatted number (e.g., "1K", "1M")
    expect(countText).toBeTruthy();
    expect(countText?.trim()).toMatch(/^\d+[KM]?$/);
  });
});
