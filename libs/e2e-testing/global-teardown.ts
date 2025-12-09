/**
 * Global Teardown for E2E Tests
 *
 * Cleans up all test data created during test runs by:
 * - Deleting all test users (identified by pigeonId prefix 'test-')
 * - Deleting all test posts created by those users
 * - Cleaning up any orphaned data
 */

import { chromium } from '@playwright/test';
import { isQAEnvironment } from './setup-utils';

async function globalTeardown() {
  console.log('\n🧹 Starting test cleanup...');

  // Validate API key is available
  const apiKey = process.env.BACKEND_API_KEY;
  if (!apiKey) {
    console.error('❌ BACKEND_API_KEY environment variable is not set');
    console.error('   Please add BACKEND_API_KEY to your .env file in libs/e2e-testing/');
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Determine the base URL based on environment
    const baseURL = isQAEnvironment()
      ? process.env.QA_BACKEND_BASE
      : process.env.LOCAL_BACKEND_BASE;

    // Call the cleanup endpoint
    const response = await page.request.delete(`${baseURL}/api/admin/cleanup-test-data`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });

    if (response.ok()) {
      const result = await response.json();
      console.log('✅ Cleanup successful:');
      console.log(`   - Users deleted: ${result.deletedUsers || 0}`);
      console.log(`   - Posts deleted: ${result.deletedPosts || 0}`);
      console.log(`   - S3 images deleted: ${result.deletedImages || 0}`);
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
