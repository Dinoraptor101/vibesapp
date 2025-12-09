/**
 * Shared utilities for E2E test setup
 * Used by both global-setup.ts (QA) and global-setup.local.ts (localhost)
 */

import { chromium, type BrowserContext } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

/**
 * Check if tests are running against QA environment
 * @returns true if ENVIRONMENT is set to 'qa', false otherwise
 */
export function isQAEnvironment(): boolean {
  return process.env.ENVIRONMENT === 'qa';
}

/**
 * Load environment variables from .env file
 */
export function loadEnvVariables(): void {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    Object.keys(envConfig).forEach((key) => {
      process.env[key] = envConfig[key];
    });
  }
}

/**
 * Fetch userId dynamically by logging in with pigeonId
 * Works for both QA and localhost environments (both use same MongoDB Atlas)
 */
export async function fetchUserIdByPigeonId(pigeonId: string, apiBase: string): Promise<string> {
  const apiKey = process.env.BACKEND_API_KEY;

  if (!pigeonId) {
    throw new Error('pigeonId is required to fetch userId');
  }
  if (!apiBase) {
    throw new Error('apiBase parameter is required');
  }
  if (!apiKey) {
    throw new Error('BACKEND_API_KEY environment variable is not set');
  }

  if (!process.env.CI) {
    console.log(`🔍 Fetching userId for pigeonId: ${pigeonId}...`);
  }

  const response = await fetch(`${apiBase}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-e2e-bypass': 'e2e-test-bypass-secret-token-2024',
    },
    body: JSON.stringify({ pigeonId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch userId for pigeonId ${pigeonId}: ${response.status} ${errorText}`
    );
  }

  const userData = await response.json();
  if (!userData.userId) {
    throw new Error(`API response missing userId for pigeonId ${pigeonId}`);
  }

  if (!process.env.CI) {
    console.log(`✓ Fetched userId: ${userData.userId}\n`);
  }
  return userData.userId;
}

interface CookieConfig {
  domain: string;
  secure: boolean;
  userId: string;
  pigeonId: string;
}

/**
 * Create standard cookies for test authentication
 */
export function createAuthCookies(config: CookieConfig) {
  const { domain, secure, userId, pigeonId } = config;

  return [
    {
      name: 'range',
      value: '275',
      domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure,
      sameSite: 'Lax' as const,
    },
    {
      name: 'user_location',
      value: '%7B%22lat%22%3A37.42%2C%22lon%22%3A-77.46%7D',
      domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure,
      sameSite: 'Lax' as const,
    },
    {
      name: 'userId',
      value: userId,
      domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure,
      sameSite: 'Lax' as const,
    },
    {
      name: 'pigeonId',
      value: pigeonId,
      domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure,
      sameSite: 'Lax' as const,
    },
    {
      name: 'e2eBypass',
      value: 'e2e-test-bypass-secret-token-2024',
      domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure,
      sameSite: 'Lax' as const,
    },
  ];
}

/**
 * Log reCAPTCHA bypass information
 */
export function logRecaptchaBypass(domain: string): void {
  if (!process.env.CI) {
    console.log('🔓 reCAPTCHA bypass cookie added:');
    console.log('   - Cookie name: e2eBypass');
    console.log('   - Token: e2e-test-bypass-secret-token-2024');
    console.log(`   - Domain: ${domain}`);
    console.log('   - Purpose: Bypass Google reCAPTCHA verification for E2E tests\n');
  }
}

interface SetupUserConfig {
  pigeonId: string;
  apiBase: string;
  domain: string;
  secure: boolean;
}

/**
 * Setup a user context with authentication cookies
 * Returns the context for saving storage state
 */
export async function setupUserContext(config: SetupUserConfig): Promise<BrowserContext> {
  const { pigeonId, apiBase, domain, secure } = config;

  // Fetch userId dynamically
  const userId = await fetchUserIdByPigeonId(pigeonId, apiBase);

  // Create browser context
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Add authentication cookies
  const cookies = createAuthCookies({ domain, secure, userId, pigeonId });
  await context.addCookies(cookies);

  return context;
}
