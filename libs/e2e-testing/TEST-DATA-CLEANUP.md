# E2E Test Data Cleanup

## Overview

The E2E test suite automatically cleans up all test data after test runs complete. This prevents test spam from accumulating in the database and ensures a clean environment for subsequent test runs.

## How It Works

### 1. Test Data Identification

All test users are created with specific prefixes in their `pigeonId` field:
- `test-*` - General test users
- `pigeon-author-*` - Test post authors
- `pigeon-reporter-*` - Test reporters
- `test-author-*` - Alternative test author pattern
- `test-reporter-*` - Alternative test reporter pattern

### 2. Global Teardown

The `global-teardown.ts` script runs automatically after all Playwright tests complete. It:

1. Connects to the API endpoint
2. Calls the cleanup endpoint with proper authentication
3. Reports statistics on deleted data

**Location**: `libs/e2e-testing/global-teardown.ts`

### 3. Cleanup Endpoint

The backend provides a dedicated cleanup endpoint:

```
DELETE /api/admin/cleanup-test-data
```

**Authentication**: Requires `x-api-key` header (internal API key)

**What It Cleans**:
- All test users (identified by pigeonId patterns)
- All posts created by test users
- All reports made by test users
- Orphaned test data

**Location**: `apps/api/src/controllers/admin.js` - `cleanupTestData` function

### 4. Configuration

The global teardown is configured in `playwright.config.ts`:

```typescript
export default defineConfig({
  // ... other config
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'), // Cleanup script
});
```

## Usage

### Automatic Cleanup

Cleanup runs automatically when you execute tests:

```bash
# All tests with automatic cleanup
npm run test:e2e

# Or directly with Playwright
npx playwright test
```

The cleanup will run after **all** tests complete, regardless of pass/fail status.

### Manual Cleanup

You can manually trigger cleanup via API:

```bash
# Using curl
curl -X DELETE http://localhost:5001/api/admin/cleanup-test-data \
  -H "x-api-key: DxgVLXfMi4uJCk"

# For QA environment
curl -X DELETE https://qa.vibesapp.net/api/admin/cleanup-test-data \
  -H "x-api-key: DxgVLXfMi4uJCk"
```

## Writing Tests That Follow Cleanup Convention

When creating test data in your tests, always use the approved prefixes:

### Example: Creating Test Users

```typescript
// ✅ Good - Will be cleaned up
const testUser = await createUser(request, baseURL, {
  pigeonId: `test-user-${Date.now()}`,
  userName: 'Test User',
});

// ✅ Good - Will be cleaned up
const postAuthor = await createUser(request, baseURL, {
  pigeonId: `pigeon-author-${uniqueId}`,
  userName: 'Post Author',
});

// ❌ Bad - Will NOT be cleaned up
const user = await createUser(request, baseURL, {
  pigeonId: `myuser-${Date.now()}`, // Wrong prefix!
  userName: 'User',
});
```

### Approved Prefixes

| Prefix | Purpose | Example |
|--------|---------|---------|
| `test-` | General test data | `test-user-1234` |
| `pigeon-author-` | Post authors | `pigeon-author-5678` |
| `pigeon-reporter-` | Users reporting posts | `pigeon-reporter-9012` |
| `test-author-` | Alternative author pattern | `test-author-3456` |
| `test-reporter-` | Alternative reporter pattern | `test-reporter-7890` |

## Environment Support

Cleanup works in both environments:
- **Localhost**: `http://localhost:5001`
- **QA**: `https://qa.vibesapp.net`

The environment is automatically detected based on the `TEST_ENV` variable.

## Troubleshooting

### Cleanup Not Running

1. Check that `globalTeardown` is configured in `playwright.config.ts`
2. Verify the API server is running
3. Check console output for cleanup statistics

### Test Data Not Being Cleaned

1. Verify your test users use approved `pigeonId` prefixes
2. Check the cleanup endpoint logs in the API server
3. Manually trigger cleanup to see error messages

### Manual Verification

Check if test users exist in the database:

```javascript
// In MongoDB shell or Compass
db.users.find({ pigeonId: /^test-/i })
db.users.find({ pigeonId: /^pigeon-author-/i })
```

## Statistics Example

After successful cleanup, you'll see output like:

```
🧹 Starting test cleanup...
✅ Cleanup successful:
   - Users deleted: 15
   - Posts deleted: 42
   - Reports deleted: 8
🧹 Cleanup complete
```

## Security

- Cleanup endpoint requires internal API key authentication
- Only accessible via `x-api-key` header (not admin token)
- Designed for CI/CD and automated testing environments
- Should not be exposed to public internet without additional authentication

## Related Files

- `libs/e2e-testing/global-teardown.ts` - Teardown script
- `libs/e2e-testing/playwright.config.ts` - Playwright configuration
- `apps/api/src/controllers/admin.js` - `cleanupTestData` function
- `apps/api/src/routes/admin.js` - Cleanup route registration
- `libs/e2e-testing/tests/admin/helpers/test-data.ts` - Test data creation helpers

## Future Improvements

- [ ] Add metrics tracking for cleanup operations
- [ ] Implement cleanup scheduling for abandoned test data
- [ ] Add support for cleaning specific test runs by ID
- [ ] Create cleanup report generation
- [ ] Add S3 cleanup for test images
