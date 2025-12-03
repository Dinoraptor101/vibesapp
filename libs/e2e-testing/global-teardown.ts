/**
 * Global Teardown for E2E Tests
 *
 * Cleans up all test data created during test runs by:
 * - Deleting all test users (identified by pigeonId prefix 'test-')
 * - Deleting all test posts created by those users
 * - Cleaning up any orphaned data
 */

import { chromium } from '@playwright/test';

async function globalTeardown() {
  console.log('\n🧹 Starting test cleanup...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Determine the base URL based on environment
    const isQAEnvironment = process.env.TEST_ENV === 'qa';
    const baseURL = isQAEnvironment ? 'https://qa.vibesapp.net' : 'http://localhost:5001';

    // Call the cleanup endpoint
    const response = await page.request.delete(`${baseURL}/api/admin/cleanup-test-data`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'DxgVLXfMi4uJCk', // Internal API key
      },
    });

    if (response.ok()) {
      const result = await response.json();
      console.log('✅ Cleanup successful:');
      console.log(`   - Users deleted: ${result.deletedUsers || 0}`);
      console.log(`   - Posts deleted: ${result.deletedPosts || 0}`);
      console.log(`   - Reports deleted: ${result.deletedReports || 0}`);
    } else {
      const status = response.status();
      const text = await response.text();
      console.error(`❌ Cleanup failed with status ${status}:`, text);
    }
  } catch (error) {
    console.error(
      '❌ Error during cleanup:',
      error instanceof Error ? error.message : String(error)
    );
  } finally {
    await browser.close();
    console.log('🧹 Cleanup complete\n');
  }
}

export default globalTeardown;
