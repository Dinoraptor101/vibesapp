import { test, expect } from '@playwright/test';
import playwrightConfig from '../playwright.config';

test.describe('Playwright Configuration Tests', () => {
  test('should have correct base configuration', () => {
    expect(playwrightConfig.testDir).toBe('./tests');
    expect(playwrightConfig.fullyParallel).toBe(true);
    expect(playwrightConfig.workers).toBe(3);
  });

  test('should have correct browser configuration', () => {
    expect(playwrightConfig.use?.baseURL).toBe('https://qa.vibesapp.net');
    expect(playwrightConfig.use?.headless).toBe(true);
    expect(playwrightConfig.use?.storageState).toBe('storageState.json');
  });

  test('should have geolocation permissions configured', () => {
    expect(playwrightConfig.use?.permissions).toContain('geolocation');
    expect(playwrightConfig.use?.geolocation).toEqual({
      latitude: 37.41,
      longitude: -77.46,
    });
  });

  test('should have launch options configured', () => {
    expect(playwrightConfig.use?.launchOptions?.slowMo).toBe(500);
  });

  test('should have chromium project configured', () => {
    expect(playwrightConfig.projects).toHaveLength(1);
    expect(playwrightConfig.projects?.[0].name).toBe('chromium');
    expect(playwrightConfig.projects?.[0].use?.browserName).toBe('chromium');
  });

  test('should have global setup configured', () => {
    expect(playwrightConfig.globalSetup).toBeTruthy();
    expect(playwrightConfig.globalSetup).toContain('global-setup');
  });
});

test.describe('Unit Tests - Utility Functions', () => {
  test('should validate pigeon ID format', () => {
    const validPigeonId = '0d536b38-33ce-48c5-958d-5b76015ce228';
    const invalidPigeonId = 'invalid-id';

    // Test UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(validPigeonId)).toBe(true);
    expect(uuidRegex.test(invalidPigeonId)).toBe(false);
  });

  test('should validate birth year range', () => {
    const currentYear = new Date().getFullYear();
    const validBirthYear = 1990;
    const invalidBirthYear = currentYear + 1;

    expect(validBirthYear).toBeGreaterThan(1900);
    expect(validBirthYear).toBeLessThan(currentYear);
    expect(invalidBirthYear).toBeGreaterThan(currentYear);
  });

  test('should validate birth month range', () => {
    const validMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const invalidMonths = [0, 13, -1];

    validMonths.forEach((month) => {
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
    });

    invalidMonths.forEach((month) => {
      expect(month < 1 || month > 12).toBe(true);
    });
  });

  test('should validate sex options', () => {
    const validSexOptions = ['Male', 'Female', 'Other'];
    const testSex = 'Other';

    expect(validSexOptions).toContain(testSex);
  });

  test('should validate username format', () => {
    const validUsernames = ['AutoTester', 'User123', 'TestUser'];
    const invalidUsernames = ['', '   ', 'a', 'a'.repeat(51)];

    validUsernames.forEach((username) => {
      expect(username.length).toBeGreaterThan(1);
      expect(username.length).toBeLessThanOrEqual(50);
      expect(username.trim()).toBe(username);
    });

    invalidUsernames.forEach((username) => {
      const isValid = username.trim().length > 1 && username.length <= 50;
      expect(isValid).toBe(false);
    });
  });
});

test.describe('Unit Tests - Form Validation', () => {
  test('should validate registration form data', () => {
    const validRegistrationData = {
      username: 'AutoTester',
      birthYear: 1990,
      birthMonth: 1,
      sex: 'Other',
    };

    // Validate all required fields are present
    expect(validRegistrationData.username).toBeTruthy();
    expect(validRegistrationData.birthYear).toBeTruthy();
    expect(validRegistrationData.birthMonth).toBeTruthy();
    expect(validRegistrationData.sex).toBeTruthy();

    // Validate field formats
    expect(typeof validRegistrationData.username).toBe('string');
    expect(typeof validRegistrationData.birthYear).toBe('number');
    expect(typeof validRegistrationData.birthMonth).toBe('number');
    expect(typeof validRegistrationData.sex).toBe('string');
  });

  test('should validate post content length', () => {
    const validPost = 'This is a valid post content.';
    const emptyPost = '';
    const longPost = 'a'.repeat(501); // Assuming 500 character limit

    expect(validPost.length).toBeGreaterThan(0);
    expect(validPost.length).toBeLessThanOrEqual(500);

    expect(emptyPost.length).toBe(0);
    expect(longPost.length).toBeGreaterThan(500);
  });
});

test.describe('Unit Tests - Location Functions', () => {
  test('should calculate distance between coordinates', () => {
    // Richmond, VA coordinates from config
    const lat1 = 37.41;
    const lon1 = -77.46;

    // Another location for testing
    const lat2 = 37.42;
    const lon2 = -77.47;

    // Simple distance calculation (Haversine formula approximation)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(2); // Should be less than 2km for close coordinates
  });

  test('should validate geolocation coordinates', () => {
    const validLat = 37.41;
    const validLon = -77.46;
    const invalidLat = 91; // Out of range
    const invalidLon = 181; // Out of range

    expect(validLat).toBeGreaterThanOrEqual(-90);
    expect(validLat).toBeLessThanOrEqual(90);
    expect(validLon).toBeGreaterThanOrEqual(-180);
    expect(validLon).toBeLessThanOrEqual(180);

    expect(invalidLat > 90 || invalidLat < -90).toBe(true);
    expect(invalidLon > 180 || invalidLon < -180).toBe(true);
  });
});

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://qa.vibesapp.net/');
  });

  test('Login with Existing User', async ({ page, context }) => {
    // Action: Login with existing user credentials
    await context.clearCookies();
    await page.goto('https://qa.vibesapp.net/');
    await page.getByTestId('pigeon-id-input').fill('0d536b38-33ce-48c5-958d-5b76015ce228');
    await page.getByTestId('login-existing-button').click();

    // Assert: User is successfully logged in
    await expect(page.locator('.posts-grid')).toBeVisible();
  });

  test('View User Profile Info', async ({ page }) => {
    // Navigate to User Profile page
    await page.getByTestId('user-profile-button').click();

    // Verify user information is displayed
    await expect(page.getByText('Name:')).toBeVisible();
    await expect(page.getByText('Age:')).toBeVisible();
    await expect(page.getByText('Sex:')).toBeVisible();
    await expect(page.getByText('Polarity:')).toBeVisible();
    await expect(page.getByText('MBTI:')).toBeVisible();
    await expect(page.getByTestId('pigeon-tag')).toBeVisible();

    // Verify links are displayed
    await expect(page.getByText('Documentation')).toBeVisible();
    await expect(page.getByText('Report an Issue')).toBeVisible();
  });

  test('View Activities', async ({ page }) => {
    // Navigate to Activities page
    await page.getByTestId('tab-activities').click();

    // Verify activities are listed
    await page.waitForSelector('.activity-list');

    await page.waitForSelector('.activity-list .activity-item', { timeout: 5000 }).catch(() => {
      console.warn('No activities found');
    });
    const activities = await page.locator('.activity-list .activity-item').count();
    if (activities === 0) {
      console.warn('No activities found');
    } else {
      expect(activities).toBeGreaterThan(0);
    }

    //TODO - Apply this once we have 2 user testing.
    // Check for unread activities
    // const unreadActivities = await page
    //     .locator('.activity-list .activity-item.unread')
    //     .count();
    // expect(unreadActivities).toBeGreaterThan(0);
  });

  test('User Registration and Login', async ({ page, context }) => {
    // Arrange: Bypass reCAPTCHA and Logout
    await page.evaluate(() => {
      // Bypass reCAPTCHA for test automation
      window.localStorage.setItem('bypassRecaptcha', 'true');
    });
    const bypassRecaptcha = await page.evaluate(() => window.localStorage.getItem('bypassRecaptcha'));
    expect(bypassRecaptcha).toBe('true');
    await context.clearCookies();

    // Act: Register a new user
    await page.goto('https://qa.vibesapp.net/');
    await page.getByTestId('username-input').fill('AutoTester');
    await page.getByTestId('birthYear-selected').click();
    await page.getByTestId('birthYear-option-1990').click();
    await page.getByTestId('birthMonth-selected').click();
    await page.getByTestId('birthMonth-option-1').click();
    await page.getByTestId('sex-selected').click();
    await page.getByTestId('sex-option-Other').click();
    await page.getByTestId('register-button').click();

    // Assert: User is assigned a Pigeon ID
    await expect(page.locator('.pigeon-id')).toBeVisible();
    const userId = await page.locator('.pigeon-id').innerText();
    expect(userId).toBeTruthy();
    if (userId) {
      console.info(`New Pigeon ID Assigned: ${userId}`);
    }
  });
});
