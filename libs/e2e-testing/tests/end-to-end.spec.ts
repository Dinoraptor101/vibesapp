import { test, expect } from '@playwright/test';
import path from 'path';

// SKIP: This test targets Web V1 UI structure (qa.vibesapp.net)
// TODO: Update selectors for Web V2 when deployed to QA
// - Replace .ql-editor with new contentEditable RichTextEditor
// - Replace .posts-grid with new feed structure
// - Update all data-testid selectors to match Web V2 components
test.fixme('Create post, group chat, and delete the post', async ({ page }) => {
  // Arrange: Login with existing user credentials
  await page.goto('https://qa.vibesapp.net/');

  // Action: Create a post
  await page.getByTestId('tab-create-post').click();
  const imagePath = path.join(__dirname, '../assets/placeholder.jpg');
  await page.locator('input[type="file"]').setInputFiles(imagePath);
  await page.getByTestId('crop-button').click();
  await page.getByTestId('floating-editor').click(); // expands the text editor
  await page.locator('.ql-editor').fill('This is a test post');
  await page.getByTestId('editor-dispatch-button').click(); // only visible when the text editor is expanded

  // Assert: Post is created and displayed on post grid
  await page.waitForSelector('.posts-grid');
  let firstPost;
  for (let i = 0; i < 3; i++) {
    try {
      await page.waitForSelector('.grid-post-link:not(.invisible)', { timeout: 10000 }); // wait for all posts to be visible
      firstPost = page.locator('.posts-grid .grid-post-link').first();
      await expect(firstPost).toBeVisible();
      await expect(firstPost.locator('.grid-post-content')).toHaveText('This is a test post');
      break; // exit loop if no error
    } catch (error) {
      if (i === 2) throw error; // rethrow error if it's the last attempt
      await page.waitForTimeout(5000); // wait for 5 seconds before retrying
      await page.reload();
    }
  }
  const firstPostTestId = await firstPost.getAttribute('data-testid');
  if (firstPostTestId) {
    expect(firstPostTestId).toBeTruthy();
  } else {
    throw new Error('Could not retrieve the first post Id, did post-grid load?'); // terminate the test
  }

  // Action: Navigate to the post detail page
  await firstPost.click();
  await page.waitForSelector('.post-container');

  // Assert: Confirm that all the buttons are displayed
  await expect(page.getByTestId('like-button')).toBeVisible();
  await expect(page.getByTestId('dislike-button')).toBeVisible();
  await expect(page.getByTestId('reply-button')).toBeVisible();
  await expect(page.getByTestId('delete-button')).toBeVisible();

  // Confirm that the captions are displayed
  await expect(page.locator('.post-user-info')).toBeVisible();
  await expect(page.locator('.post-date')).toBeVisible();

  // Action: Input something in the group chat and send
  await page.locator('.conversation-box').scrollIntoViewIfNeeded();
  await page.locator('.conversation-box').click(); // Expands the group chat
  await page.getByTestId('group-chat-input').fill('This is a test message');
  await page.getByTestId('group-chat-send-button').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.message-content')).toContainText('This is a test message');

  // Delete the post
  await page.locator('.overlay').click(); // Dismiss the group chat
  await expect(page.getByTestId('delete-button')).toBeVisible();
  await page.getByTestId('delete-button').click();

  // Assert: Post is deleted and no longer displayed on post grid
  await page.waitForSelector('.posts-grid');
  await expect(page.getByTestId(firstPostTestId)).not.toBeVisible();
});
