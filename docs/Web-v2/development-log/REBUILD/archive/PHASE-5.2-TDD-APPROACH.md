# Phase 5.2: Test-Driven Development Approach

**Created:** November 18, 2025  
**Status:** 🚧 In Progress (Red Phase Complete)  
**Methodology:** Test-Driven Development (TDD)

---

## TDD Workflow

### Classic TDD Cycle

```
┌─────────────┐
│   Red       │  Write failing tests that define requirements
│   Phase     │  
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Green     │  Implement minimum code to make tests pass
│   Phase     │  
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Refactor   │  Clean up code while keeping tests green
│   Phase     │  
└─────┬───────┘
      │
      └──────────► Repeat for next feature
```

### Our Implementation

**✅ Red Phase Complete (Session 1)**
- 19 comprehensive E2E tests written
- All tests fail with ERR_CONNECTION_REFUSED (expected)
- Tests define complete specification for offline features

**🚧 Green Phase (Sessions 2-5)**
- Implement features to make tests pass
- Run tests iteratively after each component
- Watch tests progressively turn green

**⏳ Refactor Phase (Session 6)**
- Optimize code while tests remain green
- Improve performance and structure
- Add polish and documentation

---

## Why TDD for Offline Features?

### Benefits

1. **Clear Specification**
   - Tests document exactly how offline mode should work
   - No ambiguity about expected behavior
   - User scenarios translated directly to tests

2. **Immediate Feedback**
   - Know instantly when features work correctly
   - Catch bugs during development, not in production
   - See progress as tests turn green

3. **Prevent Regression**
   - Existing tests catch breaks during refactoring
   - Safe to optimize and restructure code
   - Confidence in changes

4. **Complex State Management**
   - Offline mode involves intricate state (queue, cache, network)
   - Tests validate state transitions comprehensively
   - Edge cases documented and tested

5. **Living Documentation**
   - Tests show how to use offline features
   - Examples of expected behavior
   - Self-updating as features evolve

### Challenges of Offline Testing

**Why we chose TDD:**
- Offline scenarios are hard to test manually
- Network state changes create complex edge cases
- IndexedDB operations are asynchronous and error-prone
- Service workers have subtle timing issues
- Conflict resolution requires careful validation

**TDD solves these by:**
- Automating offline scenario testing
- Codifying edge case handling
- Validating async operations reliably
- Detecting service worker issues early
- Proving conflict resolution works

---

## Test Suite Overview

### Test Infrastructure

**File:** `libs/e2e-testing/tests/offline/helpers.ts`

**13 Utility Functions:**

| Function | Purpose | Example Usage |
|----------|---------|---------------|
| `goOffline(context)` | Simulate offline state | `await goOffline(context)` |
| `goOnline(context)` | Restore online state | `await goOnline(context)` |
| `getQueuedMutations(page)` | Inspect queue | `const queue = await getQueuedMutations(page)` |
| `clearQueue(page)` | Clear queue | `await clearQueue(page)` |
| `getCachedPosts(page)` | Get cached posts | `const posts = await getCachedPosts(page)` |
| `waitForSync(page)` | Wait for sync | `await waitForSync(page, 5000)` |
| `mockS3Upload(page)` | Mock S3 uploads | `await mockS3Upload(page, 'success')` |
| `mockHealthCheck(page)` | Mock health API | `await mockHealthCheck(page, 200)` |
| `expectQueuedMutation()` | Assert queue | `expectQueuedMutation(queue, 'like', {...})` |
| `getNetworkState(page)` | Check online | `const online = await getNetworkState(page)` |
| `waitForOfflineBanner()` | Wait for UI | `await waitForOfflineBanner(page)` |
| `waitForOnlineBanner()` | Wait for UI | `await waitForOnlineBanner(page)` |
| `createTestImageBlob()` | Generate image | `const blob = await createTestImageBlob(page)` |

### Test Specifications (19 Tests)

#### **1. Post Creation Offline (3 tests)**

**File:** `01-post-creation-offline.spec.ts`  
**Scenario:** Nature Photographer (Alex) creating posts on mountain hike

| Test | What It Validates |
|------|------------------|
| Create post with image | Post queued, image compressed, S3 upload queued, syncs on reconnect |
| S3 upload failure retry | Handles upload failures, exponential backoff, manual retry button |
| Large image compression | Images compressed to 1920x1920 @ 85% quality before IndexedDB storage |

**Why These Tests:**
- Images are large - need compression
- S3 uploads can fail - need retry logic
- User needs feedback on upload status

#### **2. Message Sending Offline (3 tests)**

**File:** `02-message-sending-offline.spec.ts`  
**Scenario:** Commuter (Sarah) messaging on subway

| Test | What It Validates |
|------|------------------|
| Send messages offline | Instant UI update, "syncing..." indicator, queue ordering |
| Read cached conversations | Conversations survive offline, all messages accessible |
| Queue multiple messages | Messages queued in order, timestamps preserved, batch sync |

**Why These Tests:**
- Messages are time-sensitive - need optimistic UI
- Conversations must be readable offline
- Message order is critical

#### **3. Interactions Offline (5 tests)**

**File:** `03-interactions-offline.spec.ts`  
**Scenario:** Social engagement while offline

| Test | What It Validates |
|------|------------------|
| Heart posts offline | Optimistic button state, multiple hearts queued |
| Comment offline | Auto-save on blur (ZEN), optimistic display |
| Batch sync | Mixed mutation types sync in priority order |
| Toggle optimization | Heart→unheart→heart = final state only |
| Conflict resolution | Conflicting mutations handled gracefully |

**Why These Tests:**
- Social actions are frequent - need fast feedback
- Toggle optimization saves bandwidth
- Conflict resolution prevents data corruption

#### **4. Conflict Resolution (4 tests)**

**File:** `04-conflict-resolution.spec.ts`  
**Scenario:** Edge cases and smart queue behavior

| Test | What It Validates |
|------|------------------|
| Create then delete | Smart cancellation - both operations cancel out |
| Toggle optimization | Only final state synced (saves bandwidth) |
| Batch settings | Multiple settings updates batched into one |
| Deleted post handling | Silent failure when commenting on deleted post (ZEN) |

**Why These Tests:**
- Users make mistakes (create then delete)
- Network efficiency matters
- Silent failures improve UX (ZEN philosophy)

#### **5. Cache Persistence (5 tests)**

**File:** `05-cache-persistence.spec.ts`  
**Scenario:** Cache survival and hydration

| Test | What It Validates |
|------|------------------|
| Posts cache reload | Posts cache survives page reload, IndexedDB hydration |
| Queue persistence | Queue survives browser restart |
| Hydration skeleton | Loading skeleton shows during cache hydration |
| Auto-sync after reload | Queue auto-syncs when reconnecting after reload |
| Cache eviction | LRU eviction when storage limit reached (TODO) |

**Why These Tests:**
- Cache must survive browser restarts
- Hydration should be smooth
- Storage limits require eviction strategy

---

## User Scenarios Mapped to Tests

### Scenario 1: Commuter (Sarah)

**Context:** 30-minute subway ride, no cell signal

**Tests:**
- ✅ `02-message-sending-offline.spec.ts` - All 3 tests
- ✅ `05-cache-persistence.spec.ts` - Posts cache, reload tests

**User Journey:**
1. Opens app underground → cached from yesterday
2. Scrolls through Nearby feed → sees last 100 cached posts
3. Hearts 3 posts → optimistic UI updates
4. Writes comment → appears immediately with "syncing..." badge
5. Opens Messages → sees last 50 conversations
6. Sends message to friend → instant delivery appearance
7. Emerges from subway → automatic sync begins
8. Toast: "Synced 5 actions"

### Scenario 2: Nature Photographer (Alex)

**Context:** Mountain hike, 4 hours offline, wants to share photos

**Tests:**
- ✅ `01-post-creation-offline.spec.ts` - All 3 tests
- ✅ `04-conflict-resolution.spec.ts` - Create then delete

**User Journey:**
1. Takes stunning sunset photo
2. Creates post with caption
3. Image compressed automatically (2.4MB → 800KB)
4. Post queued with compressed image
5. Sees post in feed immediately
6. Realizes typo, deletes post
7. Creates new corrected post
8. Back at trailhead with signal
9. Queue processes: Delete cancels first create, syncs second post

### Scenario 3: Coffee Shop (Mike)

**Context:** Unreliable WiFi, connection drops frequently

**Tests:**
- ✅ `03-interactions-offline.spec.ts` - All 5 tests
- ✅ `05-cache-persistence.spec.ts` - Auto-sync after reload

**User Journey:**
1. Browsing feed, hearts post (online)
2. WiFi drops, hearts another (queued)
3. Connection returns briefly, sync succeeds
4. WiFi drops again immediately
5. Continues browsing cached content
6. Hearts 5 more posts offline
7. Writes 2 comments
8. Connection stabilizes
9. All actions sync automatically

### Scenario 4: Student (Emma)

**Context:** Dead zone between classes, 10 minutes

**Tests:**
- ✅ `03-interactions-offline.spec.ts` - Heart, comment tests
- ✅ `05-cache-persistence.spec.ts` - Cache reload

**User Journey:**
1. Walks into building dead zone
2. App still works - cached posts available
3. Catches up on feed
4. Hearts 7 posts, comments on 2
5. All appear instantly
6. Exits building, reconnects
7. Everything syncs in < 5 seconds

### Scenario 5: Traveler (Raj)

**Context:** 5-hour flight, airplane mode

**Tests:**
- ✅ `05-cache-persistence.spec.ts` - Posts cache, reload
- ✅ `02-message-sending-offline.spec.ts` - Cached conversations

**User Journey:**
1. Loads app before flight
2. Switches to airplane mode
3. Scrolls through 100 cached posts
4. Hearts 15 posts
5. Reads messages (cached)
6. Writes replies (queued)
7. Lands, disables airplane mode
8. Auto-sync starts immediately
9. All 15 hearts + replies sync successfully

### Scenario 6: Power User (Lisa)

**Context:** Daily queue management

**Tests:**
- ✅ `04-conflict-resolution.spec.ts` - Batch settings
- ✅ `03-interactions-offline.spec.ts` - Batch sync

**User Journey:**
1. Checks queue status: 23 pending
2. Reviews queued actions
3. Manually triggers sync
4. Sees progress: 23/23 synced
5. Updates settings (multiple fields)
6. All batched into single request
7. Efficient bandwidth usage

### Scenario 7: Edge Cases

**Context:** Complex conflict scenarios

**Tests:**
- ✅ `04-conflict-resolution.spec.ts` - All 4 tests

**User Journey:**
1. Creates post (offline)
2. Deletes it immediately (still offline)
3. Queue intelligently cancels both
4. Hearts post, unhearts, hearts again
5. Queue optimizes to final "hearted" state only
6. Comments on post
7. Post is deleted by author (server-side)
8. Comment mutation fails silently (ZEN)
9. No error shown to user

### Scenario 8: Low Storage

**Context:** Storage limit reached

**Tests:**
- ⏳ `05-cache-persistence.spec.ts` - Cache eviction (TODO)

**User Journey:**
1. Cache reaches 100 posts limit
2. New posts trigger LRU eviction
3. Oldest unviewed posts removed
4. Queue priority prevents message loss
5. User sees most relevant content
6. No manual cleanup needed

---

## Implementation Roadmap

### Session 1: Red Phase ✅ COMPLETE

**Goal:** Write all tests, validate infrastructure

**Completed:**
- [x] Test helpers (13 functions)
- [x] 19 comprehensive tests across 5 specs
- [x] User scenarios documented (8 scenarios)
- [x] Architecture decisions finalized
- [x] Test execution validated (all fail as expected)

**Result:**
```bash
Running 19 tests using 3 workers
✘ 19/19 tests failed (38 including retries)
Status: ✅ Expected (TDD Red Phase)
```

### Session 2: Queue Infrastructure

**Goal:** Implement offline queue, watch some tests pass

**Tasks:**
- [ ] `lib/offline/mutationQueue.ts` - IndexedDB queue
- [ ] `lib/offline/queueProcessor.ts` - Process with priority
- [ ] `hooks/useNetworkState.ts` - Network monitoring
- [ ] Run tests: Expect queue-related tests to pass

**Expected Results:**
```bash
Running 19 tests using 3 workers
✅ 4-6 tests passing (queue operations)
✘ 13-15 tests failing (need service worker + cache)
```

### Session 3: Service Worker & Caching

**Goal:** Add service worker, cache posts/conversations

**Tasks:**
- [ ] `vite.config.ts` - vite-plugin-pwa setup
- [ ] Service worker with Workbox
- [ ] React Query persistence layer
- [ ] Run tests: Expect cache tests to pass

**Expected Results:**
```bash
Running 19 tests using 3 workers
✅ 10-12 tests passing (queue + cache)
✘ 7-9 tests failing (need mutation wrappers)
```

### Session 4: Mutation Wrappers

**Goal:** Wrap all mutations with offline support

**Tasks:**
- [ ] Update `useHeartPost` with offline queue
- [ ] Update `useCreateComment` with offline queue
- [ ] Update `useSendMessage` with offline queue
- [ ] Add optimistic UI updates
- [ ] Run tests: Expect interaction tests to pass

**Expected Results:**
```bash
Running 19 tests using 3 workers
✅ 16-17 tests passing (most features working)
✘ 2-3 tests failing (edge cases)
```

### Session 5: Polish & Conflict Resolution

**Goal:** Handle edge cases, make all tests pass

**Tasks:**
- [ ] Smart cancellation (create→delete = no-op)
- [ ] Toggle optimization (heart→unheart→heart = final state)
- [ ] Silent failures for deleted posts
- [ ] Offline banner component
- [ ] Run tests: All should pass!

**Expected Results:**
```bash
Running 19 tests using 3 workers
✅ 18-19 tests passing (all features working!)
⏳ 0-1 tests TODO (cache eviction - complex)
```

### Session 6: Refactor & Document

**Goal:** Optimize code, write documentation

**Tasks:**
- [ ] Code cleanup and optimization
- [ ] Performance profiling
- [ ] Create PHASE-5.2-SUMMARY.md
- [ ] Create OFFLINE-TESTING-GUIDE.md
- [ ] Update main README
- [ ] Final test run: All green!

**Expected Results:**
```bash
Running 19 tests using 3 workers
✅ 19/19 tests passing
Status: Phase 5.2 Complete! 🎉
```

---

## Running Tests During Development

### Prerequisites

```bash
# Install Playwright browsers (if not already done)
cd libs/e2e-testing
npx playwright install chromium
```

### Start Development Server

```bash
# Terminal 1: Start frontend
cd apps/web-v2
npm run dev
# Should run on http://localhost:5173
```

### Run All Offline Tests

```bash
# Terminal 2: Run tests
cd libs/e2e-testing
npx playwright test tests/offline --reporter=list
```

### Run Specific Test File

```bash
# Post creation tests only
npx playwright test tests/offline/01-post-creation-offline.spec.ts

# Message tests only
npx playwright test tests/offline/02-message-sending-offline.spec.ts

# Interactions tests only
npx playwright test tests/offline/03-interactions-offline.spec.ts

# Conflict resolution tests only
npx playwright test tests/offline/04-conflict-resolution.spec.ts

# Cache persistence tests only
npx playwright test tests/offline/05-cache-persistence.spec.ts
```

### Run Single Test

```bash
# Run specific test by name
npx playwright test tests/offline --grep "should queue post with image"
```

### Watch Mode

```bash
# Re-run tests on file changes
npx playwright test tests/offline --watch
```

### Debug Mode

```bash
# Run with Playwright Inspector
npx playwright test tests/offline --debug
```

### See Test Report

```bash
# Generate HTML report
npx playwright test tests/offline --reporter=html

# Open report
npx playwright show-report
```

---

## Success Metrics

### Test Coverage

| Area | Tests | Coverage |
|------|-------|----------|
| Post Creation | 3 | Image compression, S3 upload, queue |
| Messaging | 3 | Optimistic UI, cache, ordering |
| Interactions | 5 | Hearts, comments, batch sync, toggles |
| Conflicts | 4 | Cancellation, optimization, deletion |
| Persistence | 5 | Reload, queue, hydration, eviction |
| **Total** | **19** | **Comprehensive** |

### Implementation Progress

**Current State:**
- ✅ Red Phase: 19 tests written and failing (TDD spec complete)
- 🚧 Green Phase: Not started (0% implementation)
- ⏳ Refactor Phase: Pending

**Target State:**
- ✅ Red Phase: Complete
- ✅ Green Phase: 19/19 tests passing
- ✅ Refactor Phase: Optimized and documented

### Quality Gates

**Before Moving to Next Session:**
- [ ] All session tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Performance acceptable (< 100ms mutations)
- [ ] Memory usage reasonable (< 100MB IndexedDB)

---

## Benefits Realized

### Development Speed
- No manual testing of offline scenarios
- Instant feedback on implementation correctness
- Confidence to refactor without breaking things

### Code Quality
- Tests force good architecture (dependency injection, pure functions)
- Edge cases documented and handled
- No untested code paths

### Documentation
- Tests serve as living examples
- User scenarios validated by tests
- Clear expectations for behavior

### Maintenance
- Regression testing automatic
- Safe to add features without breaking existing
- Onboarding easier (read tests to understand behavior)

---

## Resources

### Documentation
- [Phase 5.2 Implementation Plan](./PHASE-5.2-IMPLEMENTATION-PLAN.md)
- [Session 1 Summary](./PHASE-5.2-SESSION-1-SUMMARY.md)
- [Scenario 1 Analysis](./SCENARIO-1-TDD-ANALYSIS.md)
- [Offline Mode Strategy](./REBUILD-OFFLINE-MODE-STRATEGY.md)

### Test Files
- `libs/e2e-testing/tests/offline/helpers.ts` - Test utilities
- `libs/e2e-testing/tests/offline/*.spec.ts` - Test specifications

### External Resources
- [Playwright Documentation](https://playwright.dev/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox](https://developer.chrome.com/docs/workbox/)

---

**TDD Red Phase Complete!** ✅

Ready to implement features and watch tests turn green. Each passing test represents a user scenario working correctly.

**Next:** Session 2 - Implement queue infrastructure
