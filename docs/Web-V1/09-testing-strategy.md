# Testing Strategy

This document outlines the comprehensive testing approach for VibesApp, including unit tests, integration tests, end-to-end tests, and quality assurance procedures.

## Testing Philosophy

### Testing Pyramid

```
    E2E Tests (Few)
   ┌─────────────────┐
   │  User Workflows │  ← Critical user journeys
   └─────────────────┘

  ┌─────────────────────┐
  │ Integration Tests   │  ← Component interactions
  │   (Some)           │
  └─────────────────────┘

┌───────────────────────────┐
│    Unit Tests (Many)      │  ← Pure functions, hooks, utils
└───────────────────────────┘
```

### Testing Principles

- **Fast feedback loops** - Quick test execution for development
- **Reliable tests** - Consistent results across environments
- **Maintainable tests** - Easy to update when code changes
- **Realistic testing** - Tests that match real user behavior
- **Comprehensive coverage** - Critical paths and edge cases covered

## Testing Stack

### Frontend Testing Tools

- **Jest** - JavaScript testing framework
- **React Testing Library** - Component testing utilities
- **Testing Library User Event** - User interaction simulation
- **MSW (Mock Service Worker)** - API mocking
- **Playwright** - End-to-end testing framework

### Backend Testing Tools

- **Jest** - Node.js testing framework
- **Supertest** - HTTP assertion library
- **MongoDB Memory Server** - In-memory database for testing
- **Socket.IO Client** - Real-time feature testing

## Unit Testing

### Component Testing Strategy

```typescript
// Post.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Post } from './Post';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Post Component', () => {
  const mockPost: IPost = {
    id: '1',
    text: 'Test post content',
    image: 'test-image.jpg',
    user: {
      userId: 'user1',
      userName: 'testuser',
      location: { lat: 40.7128, lon: -74.0060 }
    },
    likes: 5,
    dislikes: 1,
    createdAt: '2025-06-27T00:00:00Z',
    isHidden: false
  };

  it('renders post content correctly', () => {
    renderWithProviders(<Post post={mockPost} />);

    expect(screen.getByText('Test post content')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Post by testuser');
  });

  it('handles like action with user interaction', async () => {
    const user = userEvent.setup();
    const mockOnLike = jest.fn();

    renderWithProviders(
      <Post post={mockPost} onLike={mockOnLike} />
    );

    const likeButton = screen.getByRole('button', { name: /like post/i });
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith('1');
  });

  it('shows appropriate actions based on permissions', () => {
    const lowVibesUser = { ...mockPost.user, vibes: 40 };
    const postWithLowVibes = { ...mockPost, user: lowVibesUser };

    renderWithProviders(<Post post={postWithLowVibes} />);

    // User with < 50 vibes shouldn't see interaction buttons
    expect(screen.queryByRole('button', { name: /like/i })).not.toBeInTheDocument();
  });

  it('handles loading and error states', async () => {
    const postWithMissingImage = { ...mockPost, image: null };

    renderWithProviders(<Post post={postWithMissingImage} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Test post content')).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// usePostData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { usePostData } from './usePostData';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePostData Hook', () => {
  it('fetches posts successfully', async () => {
    const { result } = renderHook(() => usePostData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors gracefully', async () => {
    // Mock API to return error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(
      new Error('API Error')
    );

    const { result } = renderHook(() => usePostData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.posts).toEqual([]);
  });
});
```

### Utility Function Testing

```typescript
// utils.test.ts
import { formatDate, calculateDistance, validatePostContent, sanitizeInput } from './utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats recent dates correctly', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      expect(formatDate(fiveMinutesAgo.toISOString())).toBe('5 minutes ago');
    });

    it('formats old dates with full date', () => {
      const oldDate = new Date('2024-01-01T00:00:00Z');

      expect(formatDate(oldDate.toISOString())).toBe('Jan 1, 2024');
    });
  });

  describe('calculateDistance', () => {
    it('calculates distance between coordinates', () => {
      // New York to Los Angeles (approximately 2445 miles)
      const distance = calculateDistance(
        40.7128,
        -74.006, // NYC
        34.0522,
        -118.2437, // LA
      );

      expect(distance).toBeCloseTo(2445, -2); // Within 100 miles
    });

    it('handles same location', () => {
      const distance = calculateDistance(40.7128, -74.006, 40.7128, -74.006);

      expect(distance).toBe(0);
    });
  });

  describe('validatePostContent', () => {
    it('validates correct post content', () => {
      const validPost = {
        text: 'Valid post content',
        image: 'valid-image-key',
        user: {
          location: { lat: 40.7128, lon: -74.006 },
        },
      };

      expect(() => validatePostContent(validPost)).not.toThrow();
    });

    it('throws error for invalid content', () => {
      const invalidPost = {
        text: 'x'.repeat(501), // Too long
        image: 'valid-image-key',
        user: {
          location: { lat: 40.7128, lon: -74.006 },
        },
      };

      expect(() => validatePostContent(invalidPost)).toThrow();
    });
  });
});
```

## Integration Testing

### Component Integration Tests

```typescript
// PostsGrid.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { PostsGrid } from './PostsGrid';
import { AppProviders } from '../test-utils/AppProviders';

const server = setupServer(
  rest.get('/api/post/', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: '1',
        text: 'First post',
        user: { userName: 'user1' },
        likes: 5,
        createdAt: '2025-06-27T00:00:00Z'
      },
      {
        id: '2',
        text: 'Second post',
        user: { userName: 'user2' },
        likes: 3,
        createdAt: '2025-06-27T01:00:00Z'
      }
    ]));
  }),

  rest.post('/api/post/:postId/like', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PostsGrid Integration', () => {
  it('loads and displays posts from API', async () => {
    render(
      <AppProviders>
        <PostsGrid />
      </AppProviders>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('First post')).toBeInTheDocument();
      expect(screen.getByText('Second post')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('handles post interactions correctly', async () => {
    const user = userEvent.setup();

    render(
      <AppProviders>
        <PostsGrid />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('First post')).toBeInTheDocument();
    });

    const likeButton = screen.getAllByRole('button', { name: /like/i })[0];
    await user.click(likeButton);

    // Verify optimistic update
    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument(); // Likes increased
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/post/', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    render(
      <AppProviders>
        <PostsGrid />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading posts/i)).toBeInTheDocument();
    });
  });
});
```

### Real-time Feature Testing

```typescript
// GroupChat.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { io } from 'socket.io-client';
import { GroupChat } from './GroupChat';

// Mock Socket.IO
jest.mock('socket.io-client');
const mockIo = io as jest.MockedFunction<typeof io>;

describe('GroupChat Integration', () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      disconnect: jest.fn(),
    };

    mockIo.mockReturnValue(mockSocket);
  });

  it('sends and receives messages via socket', async () => {
    const user = userEvent.setup();

    render(
      <GroupChat postId="post-1" isVisible={true} onClose={() => {}} />
    );

    // Verify socket connection
    expect(mockSocket.emit).toHaveBeenCalledWith('join-post-chat', 'post-1');

    // Send a message
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'Test message');
    await user.click(sendButton);

    expect(mockSocket.emit).toHaveBeenCalledWith('send-group-message', {
      postId: 'post-1',
      senderId: 'current-user-id',
      content: 'Test message',
    });

    // Simulate receiving a message
    const messageHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'new-group-message'
    )[1];

    messageHandler({
      id: 'msg-1',
      content: 'Received message',
      senderId: 'other-user',
      timestamp: new Date().toISOString(),
    });

    await waitFor(() => {
      expect(screen.getByText('Received message')).toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test-automation/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Critical User Journey Tests

```typescript
// end-to-end.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete user onboarding flow', async ({ page }) => {
    // Start onboarding
    await page.click('text=Get Started');

    // Enter pigeon ID
    await page.fill('[placeholder="Enter your Pigeon ID"]', 'test-user-123');
    await page.click('text=Continue');

    // Fill profile information
    await page.fill('[name="userName"]', 'Test User');
    await page.selectOption('[name="birthYear"]', '1995');
    await page.selectOption('[name="birthMonth"]', '6');
    await page.selectOption('[name="mbtiPersonality"]', 'INFP');
    await page.click('text=Next');

    // Handle location permission (mock)
    await page.click('text=Allow Location');

    // Complete onboarding
    await page.click('text=Start Exploring');

    // Verify user is on main feed
    await expect(page.locator('[data-testid="posts-grid"]')).toBeVisible();
  });

  test('create and interact with posts', async ({ page }) => {
    // Login first
    await loginUser(page, 'existing-user-123');

    // Create a new post
    await page.click('[data-testid="create-post-button"]');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-automation/assets/placeholder.jpg');

    // Add text content
    await page.fill('[data-testid="post-text-editor"]', 'This is my test post!');

    // Submit post
    await page.click('text=Post');

    // Verify post appears in feed
    await expect(page.locator('text=This is my test post!')).toBeVisible();

    // Like the post
    await page.click('[aria-label="Like post"]');

    // Verify like count increased
    await expect(page.locator('text=1 like')).toBeVisible();
  });

  test('group chat functionality', async ({ page }) => {
    await loginUser(page, 'chat-user-123');

    // Find a post and open group chat
    await page.click('[data-testid="group-chat-button"]');

    // Verify chat interface opens
    await expect(page.locator('[data-testid="group-chat"]')).toBeVisible();

    // Send a message
    await page.fill('[placeholder="Type a message..."]', 'Hello everyone!');
    await page.press('[placeholder="Type a message..."]', 'Enter');

    // Verify message appears
    await expect(page.locator('text=Hello everyone!')).toBeVisible();
  });

  test('direct messaging workflow', async ({ page }) => {
    await loginUser(page, 'dm-user-123');

    // Navigate to user profile
    await page.click('[data-testid="user-profile-link"]');

    // Send DM request
    await page.click('text=Send Message');

    // Fill DM request form
    await page.fill('[placeholder="Introduce yourself..."]', 'Hi, would love to connect!');
    await page.click('text=Send Request');

    // Verify request sent
    await expect(page.locator('text=Message request sent')).toBeVisible();
  });

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await loginUser(page, 'mobile-user-123');

    // Verify mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    // Test touch interactions
    await page.tap('[data-testid="create-post-button"]');
    await expect(page.locator('[data-testid="create-post-modal"]')).toBeVisible();

    // Test swipe gestures (if implemented)
    const postElement = page.locator('[data-testid="post"]').first();
    await postElement.hover();
    // Add swipe gesture tests here
  });
});

// Helper function
async function loginUser(page: any, pigeonId: string) {
  await page.goto('/welcome');
  await page.fill('[placeholder="Enter your Pigeon ID"]', pigeonId);
  await page.click('text=Login');
  await page.waitForURL('/');
}
```

### Performance Testing

```typescript
// performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for main content to load
    await page.waitForSelector('[data-testid="posts-grid"]');

    const loadTime = Date.now() - startTime;

    // Expect page to load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('image loading performance', async ({ page }) => {
    await page.goto('/');

    // Wait for images to load
    const images = page.locator('img[data-testid="post-image"]');
    await expect(images.first()).toBeVisible();

    // Check if images are properly optimized
    const firstImage = images.first();
    const src = await firstImage.getAttribute('src');

    // Verify CDN usage for images
    expect(src).toContain('cloudfront');
  });

  test('infinite scroll performance', async ({ page }) => {
    await page.goto('/');

    // Scroll to trigger infinite loading
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait for new content to load
      await page.waitForTimeout(1000);
    }

    // Verify multiple pages loaded
    const posts = page.locator('[data-testid="post"]');
    const postCount = await posts.count();

    expect(postCount).toBeGreaterThan(20); // Assuming 10 posts per page
  });
});
```

## Visual Regression Testing

### Screenshot Testing

```typescript
// visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('homepage layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="posts-grid"]');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('post component appearance', async ({ page }) => {
    await page.goto('/');

    const firstPost = page.locator('[data-testid="post"]').first();
    await expect(firstPost).toHaveScreenshot('post-component.png');
  });

  test('dark theme appearance', async ({ page }) => {
    await page.goto('/');

    // Switch to dark theme
    await page.click('[data-testid="theme-toggle"]');
    await page.selectOption('[data-testid="theme-select"]', 'dark');

    await expect(page).toHaveScreenshot('homepage-dark-theme.png');
  });

  test('mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });
});
```

## Accessibility Testing

### Automated Accessibility Tests

```typescript
// accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage accessibility', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).include('[data-testid="main-content"]').analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Continue tabbing and verify focus management
    const focusableElements = [
      '[data-testid="create-post-button"]',
      '[data-testid="like-button"]',
      '[data-testid="dislike-button"]',
    ];

    for (const selector of focusableElements) {
      await page.keyboard.press('Tab');
      // Verify element can receive focus
    }
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/');

    // Verify ARIA labels are present
    const postElements = page.locator('[role="article"]');
    await expect(postElements.first()).toHaveAttribute('aria-labelledby');

    // Check button accessibility
    const likeButtons = page.locator('[aria-label*="Like post"]');
    await expect(likeButtons.first()).toBeVisible();
  });
});
```

## Test Data Management

### Test Fixtures

```typescript
// test-fixtures/posts.ts
export const mockPosts: IPost[] = [
  {
    id: 'test-post-1',
    text: 'This is a test post for automated testing',
    image: 'test-image-1.jpg',
    user: {
      userId: 'test-user-1',
      userName: 'TestUser1',
      location: { lat: 40.7128, lon: -74.006 },
    },
    likes: 5,
    dislikes: 0,
    createdAt: '2025-06-27T00:00:00Z',
    isHidden: false,
  },
  // More test posts...
];

export const mockUsers: IUserData[] = [
  {
    userId: 'test-user-1',
    pigeonId: 'test-pigeon-1',
    userName: 'TestUser1',
    vibes: 150,
    location: { lat: 40.7128, lon: -74.006 },
    birthYear: 1995,
    birthMonth: 6,
    mbtiPersonality: 'INFP',
    polarity: 'yin',
    sex: 'female',
  },
  // More test users...
];
```

### Test Database Setup

```typescript
// test-setup/database.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  // Seed test data
  await seedTestData();
};

export const teardownTestDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

const seedTestData = async () => {
  // Insert test users, posts, etc.
};
```

## Continuous Integration Testing

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, qa]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Coverage Goals

### Coverage Targets

- **Unit tests**: 90% coverage for utils, hooks, and pure functions
- **Integration tests**: 80% coverage for component interactions
- **E2E tests**: 100% coverage for critical user journeys
- **Visual regression**: Key UI components and layouts

### Coverage Reporting

```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.test.{ts,tsx}",
      "!src/**/*.stories.{ts,tsx}",
      "!src/index.tsx",
      "!src/reportWebVitals.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## Future Testing Enhancements

### Planned Improvements

- **Contract testing** - API contract validation between frontend and backend
- **Load testing** - Performance testing under high user load
- **Security testing** - Automated security vulnerability scanning
- **Mutation testing** - Testing the quality of test suites
- **Cross-browser compatibility** - Extended browser and device coverage

### Testing Tools Evaluation

- **Cypress vs Playwright** - Continue evaluating E2E testing tools
- **Storybook testing** - Component isolation and visual testing
- **Percy/Chromatic** - Enhanced visual regression testing
- **Artillery/k6** - Performance and load testing tools
