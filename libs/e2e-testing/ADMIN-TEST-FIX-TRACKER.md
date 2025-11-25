# Admin E2E Test Fix Tracker

> **Created**: 2025-11-25  
> **Status**: In Progress  
> **Purpose**: Track and prioritize fixes for admin E2E test failures

## Executive Summary

**Total Tests**: 93  
**Passed**: 17 (18%)  
**Failed**: 64 (69%)  
**Skipped**: 12 (13%)

---

## Root Cause Analysis - Prioritized by Dependency

The following issues are ordered by dependency chain. Each level depends on the previous levels working correctly.

### Level 0: Foundation - Login Flow (CRITICAL)
> ⚠️ **Blocker for ALL other tests** - If login doesn't work, no admin tests can run

| Issue | Tests Affected | Status |
|-------|---------------|--------|
| Login helper doesn't properly wait for dashboard load | 13 tests | ⬜ Not Started |
| Password validation tests rely on HTML5 validation | 2 tests | ⬜ Not Started |

**Files to Fix**:
- `libs/e2e-testing/tests/admin/helpers/admin-auth.ts` - Add proper wait conditions

**Root Cause**: The `loginAsAdmin` helper navigates to dashboard but doesn't verify the page is fully loaded before returning. Tests that immediately check for elements fail because the dashboard content hasn't rendered yet.

---

### Level 1: Layout & Navigation - Missing Test IDs ✅ COMPLETE
> ✅ **RESOLVED**: All test IDs added to AdminLayout.tsx and AdminDashboardPage.tsx

| Component | Missing Test IDs | Status |
|-----------|------------------|--------|
| `AdminLayout.tsx` | `admin-header`, `admin-nav-*` | ✅ Added |
| `AdminDashboardPage.tsx` | `admin-dashboard-title`, `admin-metrics-container`, `admin-dashboard-loading` | ✅ Added |
| `MetricCard.tsx` | `metric-card-*` | ✅ Added |
| `ActivityChart.tsx` | `admin-activity-chart` | ✅ Added |

**Tests Blocked** (11 tests):
- `should display dashboard page with title`
- `should display key metrics cards`
- `should show loading state initially`
- `should display activity chart if present`
- `should navigate to Flagged Posts page`
- `should navigate to Users page`
- `should navigate to Settings page`
- `should have navigation links in header`
- `should be responsive on mobile viewport`
- `should show text labels on desktop viewport`
- `should handle metric refresh on data change`

---

### Level 2: Flagged Posts Page - Missing Test IDs ✅ COMPLETE
> ✅ **RESOLVED**: All test IDs added to FlaggedPostsPage.tsx and FlaggedPostCard.tsx

| Component | Missing Test IDs | Status |
|-----------|------------------|--------|
| `FlaggedPostsPage.tsx` | `flagged-posts-title`, `flagged-posts-list`, `flagged-posts-empty`, `filter-dropdown`, `sort-dropdown`, `select-all-checkbox`, `bulk-action-bar`, `selection-count`, `bulk-delete-button`, `flagged-posts-loading`, `flagged-posts-error`, `retry-button` | ✅ Added |
| `FlaggedPostCard.tsx` | `flagged-post-card-{id}`, `report-count-badge`, `report-breakdown`, `post-thumbnail`, `post-caption`, `delete-post-button`, `dismiss-reports-button`, `post-checkbox`, `post-detail-link`, `confirm-delete-button`, `confirm-dismiss-button` | ✅ Added |

**Tests Blocked** (20 tests):
- All tests in `Flagged Posts Page` describe block
- All tests in `Flagged Posts - Filtering` describe block
- All tests in `Flagged Posts - Sorting` describe block
- All tests in `Flagged Posts - Delete Actions` describe block
- All tests in `Flagged Posts - Dismiss Reports` describe block
- All tests in `Flagged Posts - Navigation` describe block
- All tests in `Flagged Posts - Bulk Selection` describe block
- All tests in `Flagged Posts - Loading & Error States` describe block
- All tests in `Flagged Posts - Accessibility` describe block

---

### Level 3: Users Page - Missing Test IDs ✅ COMPLETE
> ✅ **RESOLVED**: All test IDs added to UsersPage.tsx, UserCard.tsx, and UserDetailPage.tsx

| Component | Missing Test IDs | Status |
|-----------|------------------|--------|
| `UsersPage.tsx` | `users-list`, `users-search-input`, `users-filter-select`, `users-loading`, `users-empty-state`, `pagination-controls`, `pagination-info`, `pagination-next`, `pagination-prev` | ✅ Added |
| `UserCard.tsx` | `user-card-{id}`, `user-username`, `user-pigeon-id`, `user-banned-badge`, `toggle-ban-button`, `regenerate-password-button`, `view-user-details-button` | ✅ Added |
| `UserDetailPage.tsx` | `user-detail-header`, `user-detail-username`, `user-detail-pigeon-id`, `user-posts-section`, `delete-all-posts-button`, `soft-delete-user-button`, `full-ban-button`, `user-strike-count`, `user-activity-summary` | ✅ Added |

**Tests Blocked** (16 tests):
- All tests in `User Management` describe block
- All tests in `Admin Ban Actions` describe block
- All tests in `User Management - Pagination` describe block
- All tests in `User Management - Loading States` describe block
- All tests in `User Detail Page - Actions` describe block

---

### Level 4: API Authentication (MEDIUM)
> ⚠️ **Blocks**: API-based tests (report flow, ban mechanism)

| Issue | Tests Affected | Status |
|-------|---------------|--------|
| API helpers missing `x-api-key` header | 12 tests | ⬜ Not Started |
| API helpers missing `x-pigeon-id` header | 10 tests | ⬜ Not Started |

**Files to Fix**:
- `libs/e2e-testing/tests/admin/helpers/api-helpers.ts` (if exists)
- Create new API test utilities

---

### Level 5: User Model Data Issues (LOW)
> ⚠️ **Blocks**: Tests that check user data fields

| Issue | Tests Affected | Status |
|-------|---------------|--------|
| `pigeonId` field expected but actual field is `pigeon_id` | 5 tests | ⬜ Not Started |

**Files to Check**:
- User model field naming in frontend types vs backend schema

---

### Level 6: Selector Ambiguity (LOW)
> ⚠️ **Blocks**: Tests using ambiguous selectors

| Issue | Tests Affected | Status |
|-------|---------------|--------|
| Multiple elements matching generic selectors | 1 test | ⬜ Not Started |

---

## Implementation Plan

### Phase 1: Add Missing Test IDs to Admin Components ✅ IN PROGRESS

#### 1.1 AdminLayout.tsx
```tsx
// Add these data-testid attributes:
- header: data-testid="admin-header"
- Dashboard nav: data-testid="admin-nav-dashboard"
- Dashboard nav text: data-testid="admin-nav-dashboard-text"
- Flagged nav: data-testid="admin-nav-flagged-posts"
- Users nav: data-testid="admin-nav-users"
- Settings nav: data-testid="admin-nav-settings"
```

#### 1.2 AdminDashboardPage.tsx
```tsx
// Add these data-testid attributes:
- Title h1: data-testid="admin-dashboard-title"
- Metrics container: data-testid="admin-metrics-container"
- Loading state: data-testid="admin-dashboard-loading"
```

#### 1.3 MetricCard.tsx
```tsx
// Add these data-testid attributes (dynamic based on title):
- Card wrapper: data-testid="metric-card-{slug}"
- Title: data-testid="metric-card-title"
- Value: data-testid="metric-card-value"
- Subtitle: data-testid="metric-card-subtitle"
- Trend: data-testid="metric-card-trend"
```

#### 1.4 ActivityChart.tsx
```tsx
// Add this data-testid attribute:
- Chart container: data-testid="admin-activity-chart"
```

#### 1.5 FlaggedPostsPage.tsx
```tsx
// Add these data-testid attributes:
- Title: data-testid="flagged-posts-title"
- List container: data-testid="flagged-posts-list"
- Empty state: data-testid="flagged-posts-empty"
- Loading state: data-testid="flagged-posts-loading"
- Error state: data-testid="flagged-posts-error"
- Retry button: data-testid="retry-button"
- Filter dropdown: data-testid="filter-dropdown"
- Filter options: data-testid="filter-option-{value}"
- Sort dropdown: data-testid="sort-dropdown"
- Sort options: data-testid="sort-option-{value}"
- Select all checkbox: data-testid="select-all-checkbox"
- Bulk action bar: data-testid="bulk-action-bar"
- Selection count: data-testid="selection-count"
- Bulk delete button: data-testid="bulk-delete-button"
```

#### 1.6 FlaggedPostCard.tsx
```tsx
// Add these data-testid attributes:
- Card wrapper: data-testid="flagged-post-card-{postId}"
- Checkbox: data-testid="post-checkbox"
- Thumbnail: data-testid="post-thumbnail"
- Caption: data-testid="post-caption"
- Report badge: data-testid="report-count-badge"
- Report breakdown: data-testid="report-breakdown"
- Detail link: data-testid="post-detail-link"
- Delete button: data-testid="delete-post-button"
- Dismiss button: data-testid="dismiss-reports-button"
```

#### 1.7 UsersPage.tsx
```tsx
// Add these data-testid attributes:
- Users list: data-testid="users-list"
- Search input: data-testid="users-search-input"
- Filter select: data-testid="users-filter-select"
- Loading state: data-testid="users-loading"
- Empty state: data-testid="users-empty-state"
- Pagination controls: data-testid="pagination-controls"
- Pagination info: data-testid="pagination-info"
- Pagination next: data-testid="pagination-next"
- Pagination prev: data-testid="pagination-prev"
```

#### 1.8 UserCard.tsx
```tsx
// Add these data-testid attributes:
- Card wrapper: data-testid="user-card-{userId}"
- Username: data-testid="user-username"
- Pigeon ID: data-testid="user-pigeon-id"
- Banned badge: data-testid="user-banned-badge"
- Toggle ban button: data-testid="toggle-ban-button"
- Regenerate password button: data-testid="regenerate-password-button"
- View details button: data-testid="view-user-details-button"
```

### Phase 2: Fix Login Helper
- Add `waitForSelector` for dashboard title after navigation
- Add proper network idle wait
- Add retry logic for flaky dashboard loads

### Phase 3: Fix API Authentication
- Create API request interceptor with proper headers
- Add `x-api-key` and admin token to all API calls

### Phase 4: Fix Data Model Alignment
- Verify User model field names match between frontend and backend
- Update tests or types as needed

---

## Progress Log

| Date | Phase | Action | Result |
|------|-------|--------|--------|
| 2025-11-25 | 1 | Created tracking document | ✅ |
| 2025-11-25 | 1 | Added test IDs to AdminLayout.tsx | ✅ |
| 2025-11-25 | 1 | Added test IDs to AdminDashboardPage.tsx | ✅ |
| 2025-11-25 | 1 | Added test IDs to MetricCard.tsx | ✅ |
| 2025-11-25 | 1 | Added test IDs to ActivityChart.tsx | ✅ |
| 2025-11-25 | 1 | Added test IDs to FlaggedPostsPage.tsx | ✅ |
| 2025-11-25 | 1 | Added test IDs to FlaggedPostCard.tsx | ✅ |
| 2025-11-25 | 1 | Added test IDs to UsersPage.tsx | ✅ |
| 2025-11-25 | 1 | Added test IDs to UserCard.tsx | ✅ |
| 2025-11-25 | 1 | Added test IDs to UserDetailPage.tsx | ✅ |

---

## Test Coverage After Fixes (Projected)

| Category | Before | After (Est.) |
|----------|--------|--------------|
| Login Tests | 8/13 | 13/13 |
| Dashboard Tests | 0/11 | 11/11 |
| Flagged Posts Tests | 0/20 | 18/20 |
| User Management Tests | 0/16 | 14/16 |
| API Tests | 5/22 | 20/22 |
| **Total** | **17/93 (18%)** | **~80/93 (~86%)** |

---

## Files Modified

### Components (Test IDs Added)
- [x] `apps/web-v2/src/features/admin/components/AdminLayout.tsx`
- [x] `apps/web-v2/src/features/admin/pages/AdminDashboardPage.tsx`
- [x] `apps/web-v2/src/features/admin/components/MetricCard.tsx`
- [x] `apps/web-v2/src/features/admin/components/ActivityChart.tsx`
- [x] `apps/web-v2/src/features/admin/pages/FlaggedPostsPage.tsx`
- [x] `apps/web-v2/src/features/admin/components/FlaggedPostCard.tsx`
- [x] `apps/web-v2/src/features/admin/pages/UsersPage.tsx`
- [x] `apps/web-v2/src/features/admin/components/UserCard.tsx`
- [x] `apps/web-v2/src/features/admin/pages/UserDetailPage.tsx`

### Test Helpers
- [ ] `libs/e2e-testing/tests/admin/helpers/admin-auth.ts`

---

## Notes

1. **Test IDs should be stable** - Use post._id, user.userId as suffixes
2. **Keep test IDs semantic** - Use kebab-case, descriptive names
3. **Don't break existing functionality** - Test IDs are additive only
4. **Consider accessibility** - Some test IDs can double as aria labels
