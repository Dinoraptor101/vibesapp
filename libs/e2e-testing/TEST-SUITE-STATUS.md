# E2E Test Suite Status

## Summary
✅ **99 tests total** (6 integration tests rewritten for Web-V2)
🌍 **Environment Support:** Localhost + QA (both test Web-V2)
🧹 **Automatic Cleanup:** Test data automatically deleted after test runs

## Latest Updates

**Automatic Test Data Cleanup (Dec 2, 2025)**
- ✅ Global teardown script automatically cleans up test data after all tests complete
- ✅ Backend cleanup endpoint (`DELETE /api/admin/cleanup-test-data`)
- ✅ Removes all test users, posts, and reports created during test runs
- ✅ Works in both localhost and QA environments
- ✅ Comprehensive documentation added (TEST-DATA-CLEANUP.md)
- ✅ Prevents test spam from accumulating in database

**Post Interactions Tests Added (Nov 23, 2025)**
- ✅ Comprehensive like/unlike toggle functionality tests
- ✅ Tests for preventing duplicate mutations
- ✅ Like count accuracy validation
- ✅ State persistence after page reload
- ✅ Own post restrictions (cannot like own posts)
- ✅ Report button functionality
- ✅ Comment navigation
- ✅ Offline state handling
- ✅ Edge cases and error scenarios

**Integration Tests Rewritten (Nov 2025)**
- ✅ All 6 integration tests completely rewritten for Web-V2
- ✅ Tests zen minimal login design and authentication flow
- ✅ Tests settings navigation, theme toggle, and home page
- ✅ Uses modern Playwright selectors (getByPlaceholder, getByRole, getByTestId)
- ✅ No legacy V1 patterns or CSS class selectors

**Environment Configuration (Nov 2025)**
- ✅ Tests support both localhost and QA environments (both running Web-V2)
- ✅ Dynamic baseURL configuration via `TEST_ENV` environment variable
- ✅ All tests use relative URLs for portability
- ✅ Auto-starts dev servers for localhost testing
- ✅ Added convenient npm scripts: `test:localhost` and `test:qa`

## Test Coverage (New!)
Added comprehensive E2E tests for previously untested features:
- ✅ **Post Interactions (Like/Unlike)** (9 tests) - NEW!
- ✅ **Post Report Functionality** (2 tests) - NEW!
- ✅ **Post Comment Navigation** (2 tests) - NEW!
- ✅ **Edge Cases & Error Handling** (2 tests) - NEW!
- ✅ **Account Settings & Preferences** (6 tests)
- ✅ **Theme Switching** (3 tests)
- ✅ **DM Requests** (5 tests)
- ✅ **Conversations & Messaging** (7 tests)
- ✅ **Following Users** (6 tests)
- ✅ **Privacy & Blocking** (3 tests)

**Total new tests added:** 45 tests across all feature areas

## Test Results (Last Run)
```
Running 59 tests using 3 workers
58 passed (10.1s)
1 skipped
```

_Note: New user features tests pending first run_

## Test Coverage (New!)

### ✅ API Service Layer Tests (8 tests)
- URL construction
- HTTP methods (GET, POST, PUT, DELETE)
- Request headers

### ✅ Error Handling Tests (8 tests)
- 400 validation errors
- 401 authentication errors
- 403 permission errors
- 404 not found errors
- 429 rate limiting
- 500 server errors
- Unknown API errors
- Unexpected errors

### ✅ Data Transformation Tests (3 tests)
- API post data transformation
- Time ago calculations
- Invalid date string handling

### ✅ Permission System Tests (3 tests)
- Vibe-based permissions
- Vibe requirement validation
- Edge case threshold handling

### ✅ Cookie and Storage Tests (4 tests)
- Setting cookies
- Getting cookies
- Non-existent cookies
- Deleting cookies

### ✅ Validation Utilities Tests (5 tests)
- Username pattern validation
- Email pattern validation
- Pigeon ID pattern validation
- User input sanitization
- Username error messages

### ✅ Date Utilities Tests (3 tests)
- Birth year validation
- Birth month validation
- Age calculation

### ✅ Location Utilities Tests (3 tests)
- Distance calculation
- Coordinate validation
- Same coordinate handling

### ✅ MBTI Utilities Tests (3 tests)
- MBTI type validation
- MBTI dimension parsing
- Case insensitive input

### ✅ Post Content Tests (1 test)
- Post content validation

### ✅ Playwright Configuration Tests (6 tests)
- Base configuration
- Browser configuration
- Geolocation permissions
- Launch options
- Chromium project setup
- Global setup script

### ✅ Form Validation Tests (2 tests)
- Registration form data validation
- Post content length validation

### ✅ Integration Tests (6 tests) - REWRITTEN FOR WEB-V2
- Display login page with zen minimal design
- Login with existing user credentials
- Navigate to settings and view preferences
- Toggle theme from light to dark
- Display home page with search and feed
- Navigate between pages using navigation

### ✅ Post Interaction Tests (15 tests) - NEW!

#### Post Like/Unlike Toggle (9 tests)
- Display like button on posts
- Toggle like state when clicking heart button
- Toggle like back and forth multiple times
- Prevent rapid duplicate likes
- Disable like button on own posts
- Persist like state after page reload
- Display correct like count
- Show filled/unfilled heart icon
- Update aria-label for accessibility

#### Post Report Functionality (2 tests)
- Display report button on posts (except own posts)
- Navigate to report page when clicking report button

#### Post Comment Navigation (2 tests)
- Display comment button on posts
- Navigate to post detail when clicking comment button

#### Edge Cases & Error Handling (2 tests)
- Handle offline state gracefully
- Display correct like count format for large numbers

### ✅ User Features Tests (30 tests) - EXISTING

#### Account Settings and Preferences (6 tests)
- Display all settings sections
- Update proximity range preference
- Toggle MBTI visibility
- Toggle location sharing
- Update notification preferences
- Display account information correctly

#### Theme Switching (3 tests)
- Switch from light to dark theme
- Persist theme preference across sessions
- Apply theme-specific colors correctly

#### DM Requests (5 tests)
- Display DM requests section
- Show pending DM request details
- Accept DM request
- Reject DM request
- Display empty state when no requests

#### Conversations and Messaging (7 tests)
- Display conversations list
- Show conversation preview information
- Open conversation and display message history
- Send a message in conversation
- Show typing indicator when enabled
- Display message timestamps
- End/delete conversation

#### Following Users (6 tests)
- Display follow button on user profile
- Follow a user
- Unfollow a user
- Display following count
- View list of following
- View list of followers

#### Privacy and Blocking (3 tests)
- Block a user
- View blocked users list in settings
- Unblock a user

## Test Configuration

### Environment Support
Tests support both **Localhost** and **QA** environments (both running Web-V2):

**Localhost - Default:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- Auto-starts dev servers before tests
- Best for: Development, debugging, rapid iteration

**QA Environment:**
- URL: `https://qa.vibesapp.net`
- No local servers needed
- Best for: Pre-production validation, regression testing

**Running Tests:**
```bash
# Localhost (default)
npm run test
npm run test:localhost

# QA environment
npm run test:qa
TEST_ENV=qa npm test
```

### Base URL
- Dynamically set via `TEST_ENV` environment variable
- Configured in `playwright.config.ts`
- All tests use relative URLs for portability

### Browser Settings
- **Browser:** Chromium only
- **Headless:** Yes
- **Workers:** 3 parallel workers
- **Retries:** 1 retry per failed test
- **Permissions:** Geolocation enabled
- **Location:** 37.41, -77.46 (Richmond, VA)

### Authentication
- Uses `storageState.json` for authenticated sessions
- Global setup script injects cookies (userId, pigeonId, range, user_location)

## Next Steps

1. **High Priority:** Run new user features tests against QA environment
   - Verify all data-testid attributes exist in components
   - Update selectors as needed for current UI structure
   - Add missing test IDs to components (settings, messaging, following)

2. **High Priority:** Add unit tests for new components
   - RichTextEditor.tsx
   - RichTextToolbarV2.tsx
   - CreatePostForm.tsx (mode switching, HTML stripping)

## Test Execution Commands

```bash
# Run all tests (current configuration)
npm test

# Run tests in specific file
npx playwright test tests/unit-tests.spec.ts

# List all tests without running them
npx playwright test --list

# Run tests with UI for debugging
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

## Documentation
- **Web-V2 Verification:** `WEB-V2-VERIFICATION.md` - Confirms all tests are Web-V2 ready
- **Environment Setup:** `TESTING-ENVIRONMENTS.md` - Detailed guide for running tests in different environments
- **Quick Start:** `README.md` - Getting started with e2e testing
- **Required Test IDs:** `REQUIRED-TEST-IDS.md` - All data-testid attributes needed for tests
- Playwright Config: `playwright.config.ts`
- Global Setup: `global-setup.ts`
- Authentication: Uses pre-existing test user with credentials
