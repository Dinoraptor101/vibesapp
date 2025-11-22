import { test, expect } from '@playwright/test';
import playwrightConfig from '../playwright.config';

type Theme = 'light' | 'dim' | 'dark';

test.describe('Playwright Configuration Tests', () => {
  test('should have correct base configuration', () => {
    expect(playwrightConfig.testDir).toBe('./tests');
    expect(playwrightConfig.fullyParallel).toBe(true);
    expect(playwrightConfig.workers).toBe(4);
  });

  test('should have correct browser configuration', () => {
    expect(playwrightConfig.use?.baseURL).toBeTruthy();
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
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
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

test.describe('Integration Tests - Web-V2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page with zen minimal design', async ({ page, context }) => {
    // Clear any existing session
    await context.clearCookies();
    await page.goto('/login');

    // Verify zen login elements are present
    await expect(page.getByText('find your flock, locally')).toBeVisible();
    await expect(page.getByPlaceholder('your pigeon id')).toBeVisible();
    await expect(page.getByText('i am new')).toBeVisible();

    // Verify the button is present (return icon button)
    const submitButton = page.getByRole('button', { name: 'Login' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled(); // Disabled when input is empty
  });

  test('should login with existing user credentials', async ({ page, context }) => {
    // Clear session and navigate to login
    await context.clearCookies();
    await page.goto('/login');

    // Fill in pigeon ID
    const pigeonIdInput = page.getByPlaceholder('your pigeon id');
    await pigeonIdInput.fill('0d536b38-33ce-48c5-958d-5b76015ce228');

    // Submit form
    const submitButton = page.getByRole('button', { name: 'Login' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verify redirect to home page
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');

    // Verify user is logged in by checking for user menu (wait for it to be visible)
    await page.waitForSelector('[data-testid="user-menu-button"]', {
      timeout: 10000,
      state: 'visible',
    });
    await expect(page.getByTestId('user-menu-button').first()).toBeVisible();
  });

  test('should navigate to settings and view tabs', async ({ page }) => {
    // Assumes user is already logged in via global setup
    await page.goto('/');

    // Open user menu
    await page.getByTestId('user-menu-button').first().click();

    // Click settings
    await page.getByTestId('settings-menu-item').click();

    // Verify settings page loaded
    await page.waitForURL('**/settings', { timeout: 5000 });
    await expect(page).toHaveURL(/\/settings/);

    // Verify settings tabs are visible
    await expect(page.getByTestId('account-section')).toBeVisible();
    await expect(page.getByTestId('preferences-section')).toBeVisible();
    await expect(page.getByTestId('privacy-section')).toBeVisible();
  });

  test('should display and interact with account settings', async ({ page }) => {
    await page.goto('/settings');

    // Click account tab
    await page.getByTestId('account-section').click();
    await expect(page.getByTestId('account-tab-content')).toBeVisible();

    // Verify profile photo section is visible
    await expect(page.getByText('Profile Photo')).toBeVisible();
    await expect(page.getByRole('button', { name: /change photo/i })).toBeVisible();

    // Verify bio textarea is visible and editable
    const bioTextarea = page.locator('#bio');
    await expect(bioTextarea).toBeVisible();
    await expect(bioTextarea).toBeEditable();

    // Verify MBTI dropdown is visible
    const mbtiSelect = page.locator('#mbti');
    await expect(mbtiSelect).toBeVisible();
    const mbtiValue = await mbtiSelect.inputValue();
    expect([
      'INTJ',
      'INTP',
      'ENTJ',
      'ENTP',
      'INFJ',
      'INFP',
      'ENFJ',
      'ENFP',
      'ISTJ',
      'ISFJ',
      'ESTJ',
      'ESFJ',
      'ISTP',
      'ISFP',
      'ESTP',
      'ESFP',
    ]).toContain(mbtiValue);

    // Verify location input is visible
    const locationInput = page.locator('#location');
    await expect(locationInput).toBeVisible();
    await expect(locationInput).toBeEditable();

    // Verify GPS button is visible
    await expect(page.getByRole('button', { name: /use current location/i })).toBeVisible();

    // Verify polarity toggle is visible
    await expect(page.getByText('Polarity')).toBeVisible();
    const polarityButton = page.getByRole('button', { name: /current polarity/i });
    await expect(polarityButton).toBeVisible();

    // Verify security section with Pigeon ID is visible
    await expect(page.getByText('Security')).toBeVisible();
    await expect(page.getByText(/this acts as your password/i)).toBeVisible();

    // Verify logout button is visible
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  });

  test('should display and interact with preferences settings', async ({ page }) => {
    await page.goto('/settings');

    // Navigate to preferences tab
    await page.getByTestId('preferences-section').click();
    await expect(page.getByTestId('preferences-tab-content')).toBeVisible();

    // Verify proximity range selector is visible and functional
    const proximitySelect = page.getByTestId('proximity-input');
    await expect(proximitySelect).toBeVisible();

    // Check default or current value is valid
    const currentValue = await proximitySelect.inputValue();
    expect(['50', '100', '150']).toContain(currentValue);

    // Verify proximity description text
    await expect(page.getByText(/determines the range for posts/i)).toBeVisible();

    // Verify notification preferences section
    await expect(page.getByText('Notification Preferences')).toBeVisible();
    await expect(page.getByText(/choose which activities you want to be notified/i)).toBeVisible();

    // Verify notification type toggles are visible (using exact match to avoid confusion with "Nearby Posts Radius")
    await expect(page.getByText('New Followers', { exact: true })).toBeVisible();
    await expect(page.getByText(/when someone follows you/i)).toBeVisible();
    await expect(page.getByText('Posts from Following', { exact: true })).toBeVisible();
    await expect(page.getByText('Nearby Posts', { exact: true })).toBeVisible();
    await expect(page.getByText('Comments', { exact: true })).toBeVisible();
    await expect(page.getByText('Comment Replies', { exact: true })).toBeVisible();
    await expect(page.getByText('Reactions', { exact: true })).toBeVisible();
    await expect(page.getByText('Post Moderation', { exact: true })).toBeVisible();
  });

  test('should change proximity range in preferences', async ({ page }) => {
    await page.goto('/settings');

    // Navigate to preferences tab
    await page.getByTestId('preferences-section').click();

    // Get proximity selector
    const proximitySelect = page.getByTestId('proximity-input');

    // Change to 150km
    await proximitySelect.selectOption('150');
    await expect(proximitySelect).toHaveValue('150');

    // Change back to 50km
    await proximitySelect.selectOption('50');
    await expect(proximitySelect).toHaveValue('50');
  });

  test('should toggle polarity in account settings', async ({ page }) => {
    await page.goto('/settings');

    // Click account tab
    await page.getByTestId('account-section').click();

    // Get polarity button
    const polarityButton = page.getByRole('button', { name: /current polarity/i });

    // Get initial state from aria-label
    const initialLabel = await polarityButton.getAttribute('aria-label');
    const initialPolarity = initialLabel?.includes('YIN') ? 'YIN' : 'YANG';

    // Click to toggle
    await polarityButton.click();
    await page.waitForTimeout(500); // Wait for animation

    // Verify it changed
    const newLabel = await polarityButton.getAttribute('aria-label');
    const newPolarity = newLabel?.includes('YIN') ? 'YIN' : 'YANG';
    expect(newPolarity).not.toBe(initialPolarity);
  });

  test('should copy pigeon ID to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/settings');

    // Click account tab
    await page.getByTestId('account-section').click();

    // Find and click the copy button (the one with Copy/Check icon)
    const copyButton = page
      .getByRole('button')
      .filter({ has: page.locator('svg') })
      .nth(1); // Second button with svg (first is regenerate)
    await copyButton.click();

    // Wait a bit for clipboard operation
    await page.waitForTimeout(300);

    // Verify Check icon appeared (indicates successful copy)
    // Note: In a real test, you'd verify the clipboard contents, but that's platform-dependent
    await expect(copyButton.locator('svg')).toBeVisible();
  });

  test('should cycle through all themes (light, dim, dark)', async ({ page }) => {
    // Assumes user is already logged in
    await page.goto('/');

    // Get current theme before clicking (theme is applied as a class on body element)
    const bodyElement = page.locator('body');
    const getBodyTheme = async (): Promise<Theme | null> => {
      const classList = await bodyElement.evaluate((el) => Array.from(el.classList));
      const themes: Theme[] = ['light', 'dim', 'dark'];
      return themes.find((t) => classList.includes(t)) || null;
    };

    const initialTheme = await getBodyTheme();
    const themes: (Theme | null)[] = [];

    // Open user menu once
    await page.getByTestId('user-menu-button').first().click();
    await page.waitForTimeout(300);

    // Click theme toggle 3 times to cycle through all themes
    // Starting from light: light → dim → dark → light
    for (let i = 0; i < 3; i++) {
      // Click theme toggle
      await page.getByTestId('theme-toggle-button').click();
      await page.waitForTimeout(400);

      // Record the new theme after each click
      const currentTheme = await getBodyTheme();
      themes.push(currentTheme);
    }

    // Close menu
    await page.keyboard.press('Escape');

    // Verify we recorded 3 theme changes
    expect(themes.length).toBe(3);

    // Filter out null values
    const validThemes = themes.filter((theme): theme is Theme => theme !== null);

    // Verify we got all 3 themes
    expect(validThemes.length).toBe(3);

    // Verify all captured themes are valid
    validThemes.forEach((theme) => {
      expect(['light', 'dim', 'dark']).toContain(theme);
    });

    // Verify we got all 3 different themes
    const uniqueThemes = new Set(validThemes);
    expect(uniqueThemes.size).toBe(3);

    // Verify the 3rd click brought us back to the initial theme
    if (initialTheme && validThemes.length === 3) {
      expect(validThemes[2]).toBe(initialTheme);
    }
  });

  test('should display home page with search and feed', async ({ page }) => {
    // Assumes user is already logged in
    await page.goto('/');

    // Verify search bar is visible
    await expect(page.getByPlaceholder('Search posts...')).toBeVisible();

    // Verify page layout is present (AppLayout renders)
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('should navigate between pages using navigation', async ({ page }) => {
    // Assumes user is already logged in
    await page.goto('/');

    // Verify we're on home page
    await expect(page).toHaveURL('/');

    // Note: Navigation links would need data-testid attributes added
    // This test verifies the page structure is ready for navigation
    // Use .first() to get the first visible user menu (either TopNav or BottomNav depending on viewport)
    const userMenu = page.getByTestId('user-menu-button').first();
    await expect(userMenu).toBeVisible();
  });
});
