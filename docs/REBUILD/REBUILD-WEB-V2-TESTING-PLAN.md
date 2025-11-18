# Web-V2 Playwright Testing Plan

**Created:** November 18, 2025  
**Status:** Planning Phase  
**Target:** apps/web-v2 (Vite + React + TypeScript)  
**Testing Tool:** Playwright + Vitest  

---

## 📋 Executive Summary

This document outlines a comprehensive testing strategy for the web-v2 application using Playwright for E2E/component testing and Vitest for unit testing. The goal is to achieve >80% test coverage with fast, reliable, and maintainable tests that follow the ZEN design philosophy.

---

## 🎯 Testing Goals

### Primary Objectives
1. **Coverage:** Achieve >80% test coverage across all features
2. **Speed:** Tests complete in <5 minutes for full suite
3. **Reliability:** <1% flaky test rate
4. **Maintainability:** Clear, readable tests with reusable patterns
5. **Confidence:** Catch regressions before deployment

### Testing Pyramid Strategy
```
      /\
     /E2E\         10% - Critical user journeys
    /------\
   /Component\     30% - Component interactions
  /----------\
 /    Unit    \    60% - Business logic & utilities
/--------------\
```

---

## 🏗️ Testing Architecture

### Test Types Overview

#### 1. **Unit Tests (Vitest)** - 60% of tests
- Utilities and helper functions
- Custom React hooks
- Form validation logic
- Data transformation functions
- API service methods
- Store/state management logic

#### 2. **Component Tests (Playwright)** - 30% of tests
- UI component rendering
- User interactions (click, type, scroll)
- Component state changes
- Form submissions
- Visual feedback (loading, errors)
- Accessibility checks

#### 3. **E2E Tests (Playwright)** - 10% of tests
- Complete user journeys
- Authentication flows
- Critical business workflows
- Cross-feature interactions
- Real API integration

---

## 📁 Project Structure

```
apps/web-v2/
├── src/
│   ├── __tests__/                      # Unit tests (mirror src structure)
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── utils/
│   ├── components/
│   │   └── ui/
│   │       └── Button.test.tsx         # Component tests co-located
│   ├── features/
│   │   ├── auth/
│   │   │   ├── __tests__/             # Feature-specific unit tests
│   │   │   └── auth.spec.tsx          # Feature E2E tests
│   │   ├── posts/
│   │   │   ├── __tests__/
│   │   │   └── posts.spec.tsx
│   │   └── messaging/
│   │       ├── __tests__/
│   │       └── messaging.spec.tsx
│   └── test/                          # Test utilities
│       ├── setup.ts
│       ├── helpers.ts
│       ├── mocks/
│       └── fixtures/
├── playwright.config.ts               # Playwright configuration
├── vitest.config.ts                  # Vitest configuration
└── e2e/                              # E2E test suites
    ├── auth.spec.ts
    ├── posts.spec.ts
    ├── messaging.spec.ts
    └── helpers/
```

---

## 🧪 Testing Strategy by Feature

### 1. Authentication (`features/auth/`)

#### Unit Tests (Vitest)
- [ ] `validatePigeonId()` - Format validation
- [ ] `validateUsername()` - Character rules, length
- [ ] `validateBirthDate()` - Age calculation, valid ranges
- [ ] `sanitizeInput()` - XSS prevention
- [ ] `useAuth` hook - State management
- [ ] Token storage/retrieval logic

#### Component Tests (Playwright)
- [ ] Login form - Input validation, error states
- [ ] Signup form - Multi-step flow, field validation
- [ ] Password input - Show/hide toggle
- [ ] Age selector - Year/month validation
- [ ] MBTI selector - 16 type validation
- [ ] Location input - Coordinates handling

#### E2E Tests (Playwright)
- [ ] Complete signup flow (new user)
- [ ] Login with valid Pigeon ID
- [ ] Login with invalid credentials
- [ ] Session persistence (refresh page)
- [ ] Auto-logout on session expiry
- [ ] Protected route redirection

**Priority:** 🔥 **Critical** (blocks all other features)

---

### 2. Posts (`features/posts/`)

#### Unit Tests (Vitest)
- [ ] `validatePostContent()` - Length, XSS prevention
- [ ] `calculateTimeAgo()` - Relative time display
- [ ] `formatVibesCount()` - Number formatting
- [ ] `extractMentions()` - @username parsing
- [ ] `usePostActions` hook - Like/dislike logic
- [ ] Post filtering utilities

#### Component Tests (Playwright)
- [ ] Post card - Rendering all fields
- [ ] Post card - Like button interaction
- [ ] Post card - Dislike/report button
- [ ] Post card - Comments expand/collapse
- [ ] Post grid - Scrolling, lazy loading
- [ ] Create post form - Text input, image upload
- [ ] Create post - Character counter
- [ ] Image preview - Upload, crop, remove

#### E2E Tests (Playwright)
- [ ] Create post with text only
- [ ] Create post with image
- [ ] Like/unlike a post
- [ ] Report a post (auto-hide at 3 reports)
- [ ] View post detail page
- [ ] Delete own post
- [ ] Comment on post
- [ ] View nearby posts (location-based)

**Priority:** 🔥 **Critical** (core feature)

---

### 3. Profile & Settings (`features/profile/`, `features/settings/`)

#### Unit Tests (Vitest)
- [ ] `calculateAge()` - From birth year/month
- [ ] `validateBio()` - Length limits
- [ ] `validateLocation()` - Coordinates range
- [ ] `formatDistance()` - Km display
- [ ] Profile data transformations
- [ ] Settings auto-save debouncing

#### Component Tests (Playwright)
- [ ] Profile view (read-only) - All fields display
- [ ] Settings Account tab - Edit bio
- [ ] Settings Account tab - Change MBTI
- [ ] Settings Account tab - Update location
- [ ] Settings Account tab - Toggle polarity
- [ ] Settings Account tab - Copy Pigeon ID
- [ ] Settings Preferences - Proximity slider
- [ ] Settings Support - Links work
- [ ] Auto-save on blur (no Save button)

#### E2E Tests (Playwright)
- [ ] View own profile
- [ ] View another user's profile
- [ ] Edit profile settings (full flow)
- [ ] Change proximity range (affects posts)
- [ ] Logout from settings
- [ ] Copy Pigeon ID to clipboard

**Priority:** 🟡 **High** (important UX)

---

### 4. Messaging (`features/messaging/`)

#### Unit Tests (Vitest)
- [ ] `validateMessage()` - Length, content
- [ ] `sortConversations()` - By recent message
- [ ] `markAsRead()` - Read status logic
- [ ] `formatMessageTime()` - Timestamp display
- [ ] Conversation filtering/search
- [ ] Unread count calculation

#### Component Tests (Playwright)
- [ ] Conversation list - Display all conversations
- [ ] Conversation item - Unread badge
- [ ] Message input - Character limit
- [ ] Message bubble - Sender/receiver styles
- [ ] DM request modal - Accept/decline
- [ ] DM request cooldown (2 days)
- [ ] Real-time message receive (mocked Socket.IO)

#### E2E Tests (Playwright)
- [ ] Send DM request to user
- [ ] Accept DM request
- [ ] Decline DM request (cooldown applies)
- [ ] Send message in conversation
- [ ] Receive message (real-time)
- [ ] Mark conversation as read
- [ ] Delete conversation

**Priority:** 🟡 **High** (core social feature)

---

### 5. Activity & Notifications (`features/activity/`)

#### Unit Tests (Vitest)
- [ ] Activity type categorization
- [ ] Notification filtering (read/unread)
- [ ] Activity cleanup logic (7 days read)
- [ ] Activity sorting (by timestamp)
- [ ] Unread count badge logic

#### Component Tests (Playwright)
- [ ] Activity list - Render all types
- [ ] Activity item - Like notification
- [ ] Activity item - Comment notification
- [ ] Activity item - DM request notification
- [ ] Activity item - Mark as read on view
- [ ] Activity filters - By type
- [ ] Empty state - No activities

#### E2E Tests (Playwright)
- [ ] View activity feed
- [ ] Receive new activity (real-time)
- [ ] Click activity item (navigate to source)
- [ ] Auto-cleanup read activities (7 days)

**Priority:** 🟢 **Medium** (nice to have)

---

### 6. Admin Panel (`features/admin/`)

#### Unit Tests (Vitest)
- [ ] `validateAdminPassword()` - Password check
- [ ] Admin session management
- [ ] Admin token generation
- [ ] Flagged posts filtering
- [ ] Bulk action selection logic

#### Component Tests (Playwright)
- [ ] Admin login form
- [ ] Admin dashboard - Stats display
- [ ] Flagged posts list - Display all
- [ ] Flagged post actions - Delete/dismiss
- [ ] User management list
- [ ] User ban toggle (no confirmation)
- [ ] Bulk delete posts

#### E2E Tests (Playwright)
- [ ] Admin login flow
- [ ] View flagged posts dashboard
- [ ] Delete single post
- [ ] Delete multiple posts (bulk)
- [ ] Ban/unban user
- [ ] Session timeout and redirect

**Priority:** 🟢 **Medium** (admin-only)

---

### 7. Search (`features/search/`)

#### Unit Tests (Vitest)
- [ ] Search query sanitization
- [ ] Search result filtering
- [ ] Search result sorting
- [ ] Debounce search input

#### Component Tests (Playwright)
- [ ] Search input - Typing triggers search
- [ ] Search results - Display posts
- [ ] Search results - Display users
- [ ] Search filters - By type (posts/users)
- [ ] Empty search state

#### E2E Tests (Playwright)
- [ ] Search for posts (global)
- [ ] Search for users (global)
- [ ] Click search result (navigation)

**Priority:** 🟢 **Low** (secondary feature)

---

## 🛠️ Test Setup & Configuration

### 1. Install Dependencies

```bash
cd apps/web-v2

# Install Playwright
npm install -D @playwright/test @playwright/experimental-ct-react

# Install Vitest
npm install -D vitest @vitest/ui @testing-library/react @testing-library/user-event
npm install -D jsdom happy-dom

# Install additional testing utilities
npm install -D @faker-js/faker
npm install -D msw # Mock Service Worker for API mocking
```

### 2. Configure Vitest

**File:** `apps/web-v2/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. Configure Playwright for Component Testing

**File:** `apps/web-v2/playwright-ct.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/experimental-ct-react';
import path from 'path';

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.spec.tsx',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:5173',
    ctViteConfig: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 4. Configure Playwright for E2E Testing

**File:** `apps/web-v2/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5. Create Test Setup Files

**File:** `apps/web-v2/src/test/setup.ts`

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});
```

**File:** `apps/web-v2/src/test/helpers.tsx`

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

**File:** `apps/web-v2/src/test/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock login endpoint
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 'user-123',
        username: 'TestUser',
        pigeonId: 'TEST1234',
      },
    });
  }),

  // Mock posts endpoint
  http.get('/api/posts', () => {
    return HttpResponse.json({
      success: true,
      posts: [
        {
          id: 'post-1',
          content: 'Test post content',
          author: { username: 'TestUser' },
          vibesCount: 5,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }),

  // Add more handlers as needed
];
```

---

## 📝 Test Examples

### Example 1: Unit Test (Vitest)

**File:** `apps/web-v2/src/lib/__tests__/validation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { validateUsername, validatePostContent } from '../validation';

describe('validateUsername', () => {
  it('should accept valid usernames', () => {
    expect(validateUsername('ValidUser123')).toEqual({ isValid: true });
    expect(validateUsername('user_name')).toEqual({ isValid: true });
    expect(validateUsername('User-Name')).toEqual({ isValid: true });
  });

  it('should reject usernames that are too short', () => {
    const result = validateUsername('ab');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Username must be at least 3 characters');
  });

  it('should reject usernames with invalid characters', () => {
    const result = validateUsername('user@name');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Username contains invalid characters');
  });

  it('should sanitize XSS attempts', () => {
    const result = validateUsername('<script>alert("xss")</script>');
    expect(result.isValid).toBe(false);
  });
});

describe('validatePostContent', () => {
  it('should accept valid post content', () => {
    expect(validatePostContent('This is a valid post!')).toEqual({ isValid: true });
  });

  it('should reject empty content', () => {
    const result = validatePostContent('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Post content cannot be empty');
  });

  it('should reject content exceeding 500 characters', () => {
    const longContent = 'a'.repeat(501);
    const result = validatePostContent(longContent);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Post content cannot exceed 500 characters');
  });
});
```

### Example 2: Component Test (Playwright)

**File:** `apps/web-v2/src/components/ui/Button.spec.tsx`

```typescript
import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from './Button';

test.describe('Button Component', () => {
  test('should render with default variant', async ({ mount }) => {
    const component = await mount(<Button>Click me</Button>);
    await expect(component).toBeVisible();
    await expect(component).toHaveText('Click me');
  });

  test('should handle click events', async ({ mount }) => {
    let clicked = false;
    const component = await mount(
      <Button onClick={() => (clicked = true)}>Click me</Button>
    );
    await component.click();
    expect(clicked).toBe(true);
  });

  test('should be disabled when disabled prop is true', async ({ mount }) => {
    const component = await mount(<Button disabled>Disabled</Button>);
    await expect(component).toBeDisabled();
  });

  test('should render with different variants', async ({ mount }) => {
    const primary = await mount(<Button variant="primary">Primary</Button>);
    const secondary = await mount(<Button variant="secondary">Secondary</Button>);
    
    await expect(primary).toHaveClass(/primary/);
    await expect(secondary).toHaveClass(/secondary/);
  });

  test('should show loading state', async ({ mount }) => {
    const component = await mount(<Button loading>Loading</Button>);
    await expect(component).toBeDisabled();
    await expect(component.locator('[data-testid="spinner"]')).toBeVisible();
  });
});
```

### Example 3: E2E Test (Playwright)

**File:** `apps/web-v2/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete signup flow successfully', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');
    
    // Fill in username
    await page.fill('[data-testid="username-input"]', 'NewUser123');
    
    // Select birth date
    await page.selectOption('[data-testid="birth-year"]', '1995');
    await page.selectOption('[data-testid="birth-month"]', '6');
    
    // Select MBTI
    await page.click('[data-testid="mbti-selector"]');
    await page.click('[data-testid="mbti-option-INTJ"]');
    
    // Enable location (mock permission)
    await page.click('[data-testid="enable-location-btn"]');
    
    // Submit form
    await page.click('[data-testid="signup-submit"]');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
    
    // Should show welcome message with Pigeon ID
    await expect(page.locator('[data-testid="pigeon-id"]')).toBeVisible();
  });

  test('should login with existing Pigeon ID', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="pigeon-id-input"]', 'TEST1234ABCD');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle invalid Pigeon ID', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="pigeon-id-input"]', 'INVALID');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toHaveText(
      'Invalid Pigeon ID format'
    );
  });

  test('should redirect protected routes to login', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto('/settings');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should persist session after page refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="pigeon-id-input"]', 'TEST1234ABCD');
    await page.click('[data-testid="login-submit"]');
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

---

## 🚀 Test Execution Strategy

### Development Workflow

```bash
# Run unit tests in watch mode
npm run test:unit

# Run unit tests with coverage
npm run test:unit:coverage

# Run component tests
npm run test:component

# Run E2E tests (requires dev server running)
npm run test:e2e

# Run all tests
npm run test

# Open Vitest UI
npm run test:ui

# Open Playwright UI
npx playwright test --ui
```

### CI/CD Pipeline

```yaml
# .github/workflows/test-web-v2.yml
name: Test Web-V2

on:
  push:
    branches: [main, rebuilding-front-end]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit:coverage
      - uses: codecov/codecov-action@v3

  component-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:component

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:component",
    "test:unit": "vitest",
    "test:unit:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:component": "playwright test -c playwright-ct.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 📊 Testing Metrics & Reporting

### Coverage Goals
- **Overall Coverage:** >80%
- **Critical Paths:** 100% (auth, payments, data mutations)
- **UI Components:** >70%
- **Utilities:** >90%

### Performance Benchmarks
- **Unit Tests:** <30 seconds for full suite
- **Component Tests:** <2 minutes for full suite
- **E2E Tests:** <5 minutes for full suite
- **Flaky Test Rate:** <1%

### Monitoring Dashboard
Track these metrics over time:
- Test count by type (unit/component/E2E)
- Coverage percentage
- Test execution time
- Flaky test rate
- Failed test rate
- Time to fix broken tests

---

## 🔄 Test Maintenance Best Practices

### 1. Test Organization
- Co-locate component tests with components
- Group unit tests by feature in `__tests__` folders
- Keep E2E tests separate in `/e2e` directory
- Use clear, descriptive test names

### 2. Test Data Management
- Use factories for test data generation
- Create reusable fixtures for common scenarios
- Mock external dependencies consistently
- Avoid hardcoded IDs/dates that change

### 3. Test Reliability
- Avoid timing-based assertions (use waitFor)
- Clean up after each test (reset state, clear mocks)
- Use data-testid for stable selectors
- Retry flaky tests (max 2 retries in CI)

### 4. Performance Optimization
- Run tests in parallel when possible
- Use test.only during development
- Skip slow tests in watch mode
- Cache dependencies in CI

---

## 📅 Implementation Timeline

### Week 1: Setup & Foundation
- [ ] Install and configure Vitest
- [ ] Install and configure Playwright
- [ ] Create test utilities and helpers
- [ ] Setup MSW for API mocking
- [ ] Write first 5 unit tests (validation utilities)
- [ ] Write first component test (Button)
- [ ] Setup CI/CD pipeline

### Week 2: Core Features Testing
- [ ] Auth feature tests (unit + component + E2E)
- [ ] Posts feature tests (unit + component)
- [ ] Profile feature tests (unit + component)
- [ ] Achieve 30% overall coverage

### Week 3: Advanced Features Testing
- [ ] Messaging feature tests
- [ ] Activity feature tests
- [ ] Settings feature tests
- [ ] Achieve 50% overall coverage

### Week 4: E2E & Polish
- [ ] Complete E2E test suites
- [ ] Admin panel tests
- [ ] Search feature tests
- [ ] Visual regression tests (optional)
- [ ] Achieve 80% overall coverage

### Ongoing Maintenance
- [ ] Add tests for new features
- [ ] Fix flaky tests
- [ ] Update tests when UI changes
- [ ] Review test coverage reports

---

## 🎯 Success Criteria

### Definition of Done
- ✅ All tests pass on main branch
- ✅ >80% overall test coverage
- ✅ <1% flaky test rate
- ✅ Tests run in <5 minutes
- ✅ CI/CD pipeline integrated
- ✅ Test documentation complete
- ✅ Team trained on testing practices

### Quality Gates
- No PR can be merged with failing tests
- No PR can be merged with <80% coverage on new code
- E2E tests must pass before production deployment

---

## 📚 Resources & References

### Documentation
- [Playwright Testing Guide](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Internal Docs
- [REBUILD-PLAN.md](./REBUILD-PLAN.md) - Overall rebuild strategy
- [REBUILD-COMPONENT-AUDIT.md](./REBUILD-COMPONENT-AUDIT.md) - Component complexity
- [REBUILD-UI-PATTERNS.md](./REBUILD-UI-PATTERNS.md) - Design patterns

---

## ✅ Next Steps

1. **Review this plan** with the team
2. **Approve testing strategy** and timeline
3. **Begin Week 1 tasks** (setup & configuration)
4. **Schedule weekly check-ins** to track progress
5. **Create test writing guidelines** document
6. **Setup test coverage reporting** in CI/CD

---

**Let's build confidence through comprehensive testing! 🧪✨**
