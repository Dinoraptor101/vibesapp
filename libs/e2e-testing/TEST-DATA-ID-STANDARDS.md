# Test Data-ID Standards

**MANDATORY FOR ALL E2E TESTS**

## The Golden Rule

**NEVER use CSS selectors, class names, or aria-labels as primary locators in E2E tests.**  
**ALWAYS use `data-testid` attributes.**

## Why This Matters

| ❌ CSS Selectors | ✅ Test Data IDs |
|-----------------|------------------|
| Break when classes change | Stable across refactors |
| Slow to query | Fast direct lookups |
| Unclear test intent | Explicit test contracts |
| Couple tests to implementation | Decouple tests from UI structure |

## Implementation Rules

### Rule 1: Frontend - Add Test IDs to Interactive Elements

**If it can be clicked, typed into, or read by a test → it needs a `data-testid`.**

```tsx
// ✅ CORRECT
<button 
  data-testid="post-like-button" 
  onClick={handleLike}
>
  Like
</button>

// ❌ WRONG - Missing test ID
<button 
  className="like-btn" 
  aria-label="Like post"
  onClick={handleLike}
>
  Like
</button>
```

### Rule 2: Tests - Use getByTestId() Only

```typescript
// ✅ CORRECT - Use test ID
const likeButton = page.getByTestId('post-like-button');
await expect(likeButton).toBeVisible();
await likeButton.click();

// ❌ WRONG - CSS selector
const likeButton = page.locator('button[aria-label*="Like"]');
const likeButton = page.locator('.like-btn');
const likeButton = page.locator('button:has-text("Like")');
```

### Rule 3: When Test ID Is Missing → Add It to Production Code

**DO NOT work around missing test IDs. Add them!**

```typescript
// ❌ WRONG - Working around missing test ID
const likeButton = page.locator('button[aria-label*="Like"]');

// ✅ CORRECT
// 1. Add to production code:
//    <button data-testid="post-like-button" ...>
// 2. Update test:
const likeButton = page.getByTestId('post-like-button');
```

## Post Interaction Test IDs

### PostCard Component
**Location**: `apps/web-v2/src/features/posts/components/PostCard.tsx`

#### Like Button
```tsx
data-testid="post-like-button"
```
- **Visibility**: Only on OTHER users' posts (not own posts)
- **State**: Displays like count when > 0
- **Aria-label**: "Like post (X likes)" or "Unlike post (X likes)"

#### Comment Link
```tsx
data-testid="post-comment-link"
```
- **Action**: Navigates to post detail page
- **State**: Displays comment count when > 0
- **Aria-label**: "View comments (X)"

#### Report Button
```tsx
data-testid="post-report-button"
```
- **Visibility**: Only on OTHER users' posts (not own posts)
- **Action**: Opens report dialog
- **Aria-label**: "Report post"

#### Delete Button
```tsx
data-testid="post-delete-button"
```
- **Visibility**: Only on OWN posts (not other users' posts)
- **Interaction**: Hold-to-confirm (progress indicator)
- **Aria-label**: "Hold to delete post"

## Critical: Test Data Creation Requirements

### Problem: Tests Fail When Using Wrong User Context

**Like and report buttons only appear on OTHER users' posts.**  
**Delete buttons only appear on YOUR OWN posts.**

If you don't create proper test data, buttons won't exist and tests will fail!

### Solution: Always Create Test Posts from Different Users

```typescript
// ✅ CORRECT - Test like button (needs OTHER user's post)
test('should display like button', async ({ page, request }) => {
  // Create post from SECOND test user
  const user2Credentials = getSecondUserCredentials();
  await createTestPost(request, {
    caption: 'Test post',
    pigeonId: user2Credentials.pigeonId, // Different user!
  });

  // Navigate to feed (logged in as user 1)
  await page.goto('/');
  
  // Like button exists because post is from user 2
  const likeButton = page.getByTestId('post-like-button');
  await expect(likeButton).toBeVisible(); // ✅ Passes!
});

// ❌ WRONG - No test data creation
test('should display like button', async ({ page }) => {
  await page.goto('/');
  
  // Fails! Logged-in user's own posts don't have like buttons
  const likeButton = page.getByTestId('post-like-button');
  await expect(likeButton).toBeVisible(); // ❌ Fails!
});
```

### Test Data Creation Pattern

```typescript
import { createTestPost, getSecondUserCredentials } from './helpers/test-post';

test.describe('Post Interactions', () => {
  test('like button works', async ({ page, request }) => {
    // STEP 1: Create test data from different user
    const user2 = getSecondUserCredentials();
    await createTestPost(request, {
      caption: `Test post ${Date.now()}`,
      pigeonId: user2.pigeonId, // CRITICAL: Different user
    });

    // STEP 2: Navigate to feed (as user 1)
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // STEP 3: Interact with test data
    const posts = page.locator('article');
    await expect(posts.first()).toBeVisible();
    
    const likeButton = posts.first().getByTestId('post-like-button');
    await expect(likeButton).toBeVisible(); // ✅ Works!
    await likeButton.click();
  });
});
```

## Common Test ID Patterns

### Navigation
```typescript
'user-menu-button'      // User menu dropdown
'settings-menu-item'    // Settings in user menu  
'nav-home'              // Home navigation
'nav-messages'          // Messages navigation
```

### Settings
```typescript
'account-section'       // Account settings tab
'preferences-section'   // Preferences tab
'privacy-section'       // Privacy tab
'proximity-input'       // Proximity range selector
'theme-toggle-button'   // Theme switcher
```

### Forms
```typescript
'login-input'           // Login pigeon ID input
'login-submit'          // Login submit button
'create-post-input'     // Post caption input
'create-post-submit'    // Post submit button
```

## Documentation to Update

When adding new test IDs, update these files:

1. **`/libs/e2e-testing/REQUIRED-TEST-IDS.md`** - Master list of all test IDs
2. **`/docs/Web-v2/05-testing-strategy.md`** - Testing architecture
3. **Component documentation** - Document test IDs in component files

## Enforcement

### Pre-Merge Checklist
- [ ] All new interactive elements have `data-testid` attributes
- [ ] All E2E tests use `getByTestId()` (no CSS selectors)
- [ ] Test data is created from appropriate user context
- [ ] Test IDs documented in REQUIRED-TEST-IDS.md

### Code Review Checklist
- [ ] No `page.locator()` with CSS selectors
- [ ] No `button[aria-label*="..."]` locators
- [ ] All tests create proper test data before assertions
- [ ] Tests don't assume logged-in user's posts will have like buttons
