# Admin Dashboard Testing Patterns & Conventions

**Phase 1 Complete**: Security and Login tests fixed ✅  
**Phase 2**: Dashboard, User Management, Flagged Posts, Settings tests

---

## 🎯 New Admin Dashboard Architecture

### Component Structure
- **AdminLayout**: Sticky header with icon-based mobile nav, text labels on desktop
- **AdminDashboardPage**: Compact design, 4 metric cards, activity chart, urgent actions
- **UsersPage**: Table view with inline actions, sorting, filtering, pagination
- **FlaggedPostsPage**: Card-based with button filters, sorting dropdown, bulk actions
- **AdminSettingsPage**: Password change, moderation settings, notifications

### Key Architectural Changes
1. **UI Components**: Using `@/components/ui` and `@/components/ui-next`
2. **Loading States**: Skeleton loaders instead of spinners
3. **Navigation**: Icon-only on mobile (<768px), text labels on desktop
4. **Actions**: Inline buttons vs modal-heavy workflows
5. **Compact Layouts**: Information-dense, streamlined designs

---

## 📋 Test ID Conventions

### ✅ ESTABLISHED PATTERNS (Use These)

#### Navigation
```typescript
// Header & Nav
data-testid="admin-header"
data-testid="admin-nav-dashboard"
data-testid="admin-nav-flagged-posts"
data-testid="admin-nav-users"
data-testid="admin-nav-settings"

// With responsive text labels
data-testid="admin-nav-dashboard-text"  // Hidden on mobile
```

#### Common Patterns
```typescript
// Lists/Tables
data-testid="users-list"              // Wrapper div
data-testid="user-row-{userId}"       // Table rows
data-testid="flagged-posts-list"      // Cards container

// Loading & Empty States
data-testid="users-loading"           // Loader2 spinner
data-testid="users-empty-state"       // Empty message
data-testid="flagged-posts-loading"   // Skeleton

// Pagination
data-testid="pagination-controls"     // Container
data-testid="pagination-prev"         // Previous button
data-testid="pagination-next"         // Next button
data-testid="pagination-info"         // Page numbers

// Filters & Search
data-testid="users-search-input"      // Search input
data-testid="users-filter-select"     // Status dropdown
data-testid="filter-dropdown"         // Button group wrapper
data-testid="filter-option-all"       // Filter buttons
data-testid="sort-dropdown"           // Sort select

// Actions
data-testid="toggle-ban-button"       // Ban/unban
data-testid="delete-post-button"      // Delete
data-testid="dismiss-reports-button"  // Dismiss
data-testid="bulk-action-bar"         // Bulk actions wrapper
data-testid="select-all-checkbox"     // Select all
data-testid="selection-count"         // "X selected" badge
```

#### User Management Specific
```typescript
data-testid="user-row-{userId}"       // Table row
data-testid="user-username"           // Username cell/link
data-testid="user-pigeon-id"          // Pigeon ID display
data-testid="user-post-count"         // Post count button
data-testid="user-banned-badge"       // Banned indicator
data-testid="view-user-details-button" // View details
```

#### Flagged Posts Specific
```typescript
data-testid="flagged-post-card-{postId}"  // Card wrapper
data-testid="post-thumbnail"               // Image container
data-testid="post-checkbox"                // Selection checkbox
data-testid="post-caption"                 // Text content
data-testid="report-count-badge"           // Report count
data-testid="report-breakdown"             // Reason breakdown
data-testid="post-detail-link"             // Click for details
```

---

## 🏗️ Component Testing Patterns

### 1. **Page Load & Title**
```typescript
test('should display page with title', async ({ page }) => {
  // Multiple h1 elements exist (layout + page), so be specific
  const pageTitle = page.locator('h1').filter({ hasText: /expected text/i });
  await expect(pageTitle).toBeVisible();
  
  // Or use test ID if added
  await expect(page.getByTestId('page-title')).toContainText('Expected');
});
```

### 2. **Loading States**
```typescript
test('should show loading state', async ({ page }) => {
  // New design uses Loader2 spinner component
  const loadingSpinner = page.getByTestId('users-loading');
  await expect(loadingSpinner).toBeVisible();
  
  // Or skeleton loaders
  const skeleton = page.locator('.animate-pulse');
  await expect(skeleton.first()).toBeVisible();
});
```

### 3. **Empty States**
```typescript
test('should show empty state', async ({ page }) => {
  const emptyState = page.getByTestId('users-empty-state');
  await expect(emptyState).toBeVisible();
  await expect(emptyState).toContainText('No users found');
});
```

### 4. **Navigation**
```typescript
test('should navigate between pages', async ({ page }) => {
  // Click nav link
  await page.getByTestId('admin-nav-users').click();
  
  // Verify URL change
  await page.waitForURL('**/admin/users', { timeout: 5000 });
  expect(page.url()).toContain('/admin/users');
});
```

### 5. **Filtering & Sorting**
```typescript
// Button-based filters (Flagged Posts)
test('should filter by status', async ({ page }) => {
  await page.getByTestId('filter-option-auto-hidden').click();
  await page.waitForLoadState('networkidle');
  expect(page.url()).toContain('filter=auto-hidden');
});

// Dropdown filters (Users)
test('should filter users', async ({ page }) => {
  const filterSelect = page.getByTestId('users-filter-select');
  await filterSelect.selectOption('banned');
  await page.waitForLoadState('networkidle');
});

// Sort dropdown
test('should sort results', async ({ page }) => {
  const sortSelect = page.getByTestId('sort-dropdown');
  await sortSelect.selectOption('most-reports');
  await page.waitForLoadState('networkidle');
});
```

### 6. **Bulk Actions**
```typescript
test('should select multiple items', async ({ page }) => {
  // Select first two items
  const items = page.locator('[data-testid^="user-row-"]');
  await items.nth(0).locator('input[type="checkbox"]').click();
  await items.nth(1).locator('input[type="checkbox"]').click();
  
  // Verify bulk action bar appears
  const bulkBar = page.getByTestId('bulk-action-bar');
  await expect(bulkBar).toBeVisible();
  
  // Verify count
  const count = page.getByTestId('selection-count');
  await expect(count).toContainText('2');
});
```

### 7. **Table Interactions**
```typescript
test('should interact with table rows', async ({ page }) => {
  // Get table rows
  const rows = page.locator('[data-testid^="user-row-"]');
  const firstRow = rows.first();
  
  // Click username to navigate
  await firstRow.getByTestId('user-username').click();
  await page.waitForURL('**/admin/users/**');
  
  // Or click action button
  await firstRow.getByTestId('toggle-ban-button').click();
  await page.waitForTimeout(500);
});
```

### 8. **Responsive Design**
```typescript
test('should be responsive on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(300);
  
  // Icons visible, text labels hidden
  const navIcon = page.getByTestId('admin-nav-dashboard').locator('svg');
  await expect(navIcon).toBeVisible();
  
  const navText = page.getByTestId('admin-nav-dashboard-text');
  await expect(navText).toBeHidden();
});
```

---

## ⚠️ Common Pitfalls to Avoid

### 1. **Multiple H1 Elements**
❌ **DON'T**:
```typescript
await expect(page.locator('h1')).toContainText('Users');
// Error: strict mode violation - 2 h1 elements (layout + page)
```

✅ **DO**:
```typescript
// Use filter
const pageTitle = page.locator('h1').filter({ hasText: /users/i });
await expect(pageTitle).toBeVisible();

// Or use nth()
await expect(page.locator('h1').nth(1)).toContainText('Users');
```

### 2. **SVG Strict Mode**
❌ **DON'T**:
```typescript
await expect(button.locator('svg')).toBeVisible();
// Error: Button has 2 SVGs (icon transitions)
```

✅ **DO**:
```typescript
await expect(button.locator('svg').first()).toBeVisible();
// Or check button itself
await expect(button).toBeVisible();
```

### 3. **Timing Issues**
❌ **DON'T**:
```typescript
await button.click();
await expect(result).toBeVisible(); // Might be too fast
```

✅ **DO**:
```typescript
await button.click();
await page.waitForLoadState('networkidle');
// Or wait for specific element
await page.waitForSelector('[data-testid="result"]');
```

### 4. **Test ID Specificity**
❌ **DON'T**:
```typescript
// Assuming specific test IDs that don't exist
await page.getByTestId('metric-card-active-users');
```

✅ **DO**:
```typescript
// Use what exists or use positional selectors
const metricsContainer = page.getByTestId('admin-metrics-container');
const firstCard = metricsContainer.locator('.metric-card').first();
```

---

## 🔧 Helper Functions

### Navigation Helpers
```typescript
async function navigateToUsers(page: Page) {
  await page.getByTestId('admin-nav-users').click();
  await page.waitForURL('**/admin/users', { timeout: 5000 });
}

async function navigateToFlaggedPosts(page: Page) {
  await page.getByTestId('admin-nav-flagged-posts').click();
  await page.waitForURL('**/admin/flagged', { timeout: 5000 });
}
```

### Wait Helpers
```typescript
async function waitForData(page: Page, testId: string) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 10000 });
}
```

---

## 📊 Test Coverage Goals

### Dashboard (admin-dashboard.spec.ts)
- [ ] Page load with title and metrics
- [ ] Metric cards display (4 cards: active users, posts, reports, auto-hidden)
- [ ] Skeleton loading state
- [ ] Activity chart (if data exists)
- [ ] Urgent actions banner (conditional)
- [ ] Navigation links (dashboard, flagged, users, settings)
- [ ] Responsive behavior (mobile vs desktop)

### User Management (user-management.spec.ts)
- [ ] User list/table display
- [ ] Search by username
- [ ] Filter by status (all/active/banned)
- [ ] Sort by columns (username, MBTI, polarity, posts)
- [ ] Toggle ban on user
- [ ] View user details navigation
- [ ] View user posts navigation
- [ ] Bulk selection
- [ ] Pagination

### Flagged Posts (flagged-posts.spec.ts)
- [ ] Flagged posts list display
- [ ] Report count badges
- [ ] Report reason breakdown
- [ ] Filter by status (all/auto-hidden/under-review)
- [ ] Sort by (most reports, recent, oldest)
- [ ] Delete single post
- [ ] Bulk delete posts
- [ ] Dismiss reports
- [ ] Navigation to detail page
- [ ] Empty state

### Settings (admin-settings.spec.ts)
- [ ] Password change form
- [ ] Moderation settings
- [ ] Notification settings
- [ ] Form validation
- [ ] Success/error messages
- [ ] Settings persistence

---

## 🚀 Phase 2 Execution Plan

### Agent 1: admin-dashboard.spec.ts
**Status**: 4 tests failing  
**Task**: Fix loading state, activity chart, navigation, responsive tests  
**Estimated Time**: 1-2 hours

### Agent 2: user-management.spec.ts
**Status**: 24 tests failing (complete rewrite needed)  
**Task**: Rewrite for table view, new test IDs, updated workflows  
**Estimated Time**: 3-4 hours

### Agent 3: flagged-posts.spec.ts
**Status**: 13 tests failing  
**Task**: Update filter/sort UI, bulk actions, toast messages  
**Estimated Time**: 2-3 hours

### Agent 4: admin-settings.spec.ts
**Status**: No existing tests  
**Task**: Write comprehensive test suite from scratch  
**Estimated Time**: 2-3 hours

---

## ✅ Phase 1 Complete Summary

**Fixed Tests**:
- ✅ admin-security.spec.ts: 16/16 passing
- ✅ admin-login.spec.ts: 13/13 passing

**Added Test IDs**:
- `users-list` wrapper
- `bulk-action-bar` wrapper
- `admin-login-form` form
- Updated placeholder text to match test expectations

**Updated Component Files**:
- `AdminLoginPage.tsx`
- `UsersPage.tsx`
- `FlaggedPostsPage.tsx`

---

Ready for Phase 2 parallel execution! 🚀
