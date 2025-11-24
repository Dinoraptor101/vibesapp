# Testing Strategy

## Overview

The Web-v2 testing strategy follows a comprehensive pyramid approach with 60% unit tests, 30% component tests, and 10% end-to-end tests. The goal is to achieve >80% code coverage with fast, reliable test execution.

## Testing Pyramid

### Unit Tests (60%)
**Focus**: Individual functions, utilities, and hooks
**Tools**: Vitest + React Testing Library
**Coverage Target**: 70% of codebase

### Component Tests (30%)
**Focus**: React components and user interactions
**Tools**: Vitest + React Testing Library + MSW
**Coverage Target**: All user-facing components

### E2E Tests (10%)
**Focus**: Complete user journeys and critical flows
**Tools**: Playwright
**Coverage Target**: Core user workflows

## Unit Testing

### Setup
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

### Test Structure
```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCount } from '../utils';

describe('formatCount', () => {
  it('formats numbers under 1000', () => {
    expect(formatCount(42)).toBe('42');
  });

  it('formats thousands', () => {
    expect(formatCount(1500)).toBe('1.5K');
  });

  it('formats millions', () => {
    expect(formatCount(2500000)).toBe('2.5M');
  });
});
```

### Hook Testing
```typescript
// __tests__/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuth', () => {
  it('returns user data when authenticated', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });
});
```

## Component Testing

### Setup with MSW
```typescript
// src/test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Component Test Example
```typescript
// __tests__/PostCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostCard } from '../components/PostCard';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PostCard', () => {
  const mockPost = {
    _id: '1',
    text: 'Test post',
    imageUrl: 'test.jpg',
    user: { username: 'testuser' },
    hearts: 5,
    comments: 2,
  };

  it('displays post content', () => {
    render(<PostCard post={mockPost} />, { wrapper: createWrapper() });

    expect(screen.getByText('Test post')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('handles heart interaction', async () => {
    render(<PostCard post={mockPost} />, { wrapper: createWrapper() });

    const heartButton = screen.getByRole('button', { name: /heart/i });
    fireEvent.click(heartButton);

    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

### E2E Test Example
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="pigeon-id-input"]', 'valid-pigeon-id');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('user sees error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="pigeon-id-input"]', 'invalid-pigeon-id');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

## Test Categories

### Authentication Tests
- Login/logout flows
- Session persistence
- Password regeneration
- Invalid credential handling

### Post Tests
- Creating posts with images
- Heart/comment interactions
- Grid layout responsiveness
- Post detail navigation

### Messaging Tests
- Sending DM requests
- Conversation flows
- Real-time message updates
- Request accept/decline

### Profile Tests
- Profile editing
- Avatar upload
- Settings persistence
- Privacy controls

### Admin Tests
- Admin login
- User management
- Post moderation
- Bulk operations

## Mock Data Strategy

### API Mocks (MSW)
```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/posts', (req, res, ctx) => {
    return res(ctx.json([
      {
        _id: '1',
        text: 'Mock post',
        imageUrl: 'mock.jpg',
        user: { username: 'mockuser' },
        hearts: 10,
        comments: 5,
      },
    ]));
  }),

  rest.post('/api/posts/:id/heart', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
];
```

### Component Props Mocks
```typescript
// src/test/mocks/posts.ts
export const mockPost = {
  _id: '1',
  text: 'Test post content',
  imageUrl: 'https://example.com/image.jpg',
  createdAt: '2025-11-24T10:00:00Z',
  user: {
    _id: 'user1',
    username: 'testuser',
    profilePictureUrl: 'https://example.com/avatar.jpg',
  },
  hearts: 42,
  comments: 7,
  userHasHearted: false,
};
```

## Test Data Management

### Fixtures
- **Static data**: JSON files for consistent test data
- **Dynamic generation**: Faker.js for varied test data
- **Database seeding**: Test database with known state

### Test Isolation
- **Database cleanup**: Reset between tests
- **API mocking**: Isolated from external services
- **Browser state**: Clean sessions between tests

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run component tests
        run: npm run test:component

      - name: Run E2E tests
        run: npm run test:e2e
```

### Coverage Reporting
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

## Performance Testing

### Test Execution Time
- **Unit tests**: <30 seconds
- **Component tests**: <2 minutes
- **E2E tests**: <5 minutes
- **Full suite**: <10 minutes

### Parallel Execution
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        useAtomics: true,
      },
    },
  },
});
```

## Accessibility Testing

### Automated Checks
```typescript
// __tests__/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

describe('Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing Checklist
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators are visible
- [ ] Touch targets are adequate

## Test Maintenance

### Flaky Test Prevention
- **Deterministic tests**: Avoid random data
- **Proper waits**: Use waitFor instead of setTimeout
- **Clean state**: Reset between tests
- **Retry logic**: Automatic retry for transient failures

### Test Organization
```
src/
├── components/
│   └── __tests__/
│       ├── Component.test.tsx
│       └── Component.a11y.test.tsx
├── hooks/
│   └── __tests__/
│       └── useHook.test.ts
├── utils/
│   └── __tests__/
│       └── utility.test.ts
└── test/
    ├── mocks/
    ├── fixtures/
    └── utils/
```

## Success Metrics

### Coverage Targets
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >85%
- **Lines**: >80%

### Quality Gates
- **Linting**: Zero errors
- **TypeScript**: Zero type errors
- **Tests**: All passing
- **Accessibility**: WCAG AA compliant

### Performance Benchmarks
- **Test execution**: <10 minutes
- **Bundle size**: <500KB
- **Lighthouse**: >90 score
- **Time to interactive**: <2 seconds

## Future Enhancements

### Advanced Testing
- **Visual regression**: Screenshot comparison
- **Performance testing**: Runtime performance metrics
- **Load testing**: Concurrent user simulation
- **Cross-browser testing**: BrowserStack integration

### Test Automation
- **Test generation**: AI-assisted test creation
- **Smart retries**: Intelligent failure handling
- **Test parallelization**: Distributed test execution
- **Real device testing**: Mobile device farms

### Analytics & Insights
- **Test metrics**: Execution time and failure analysis
- **Coverage trends**: Historical coverage tracking
- **Quality metrics**: Defect density and escape rates
- **ROI measurement**: Testing efficiency and effectiveness