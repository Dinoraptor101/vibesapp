# Offline Mode Strategy

**Created:** November 5, 2025  
**Updated:** November 18, 2025  
**Status:** 🚧 In Progress - Test-Driven Development  
**Approach:** TDD with Comprehensive E2E Test Suite

---

## 🧪 Test-Driven Development Approach

### Why TDD for Offline Features?

Offline functionality is complex with many edge cases. We're using **Test-Driven Development** to:
- ✅ Define clear specifications via tests
- ✅ Get immediate feedback during implementation
- ✅ Prevent regressions
- ✅ Document expected behavior
- ✅ Validate complex state management

### TDD Progress

**✅ Red Phase Complete (November 18, 2025)**
- 19 comprehensive E2E tests written with Playwright
- All tests failing as expected (no features implemented yet)
- Tests define complete specification

**🚧 Green Phase (In Progress)**
- Implementing features to make tests pass
- Iterative development with test feedback
- Watch tests progressively turn green

**⏳ Refactor Phase (Upcoming)**
- Optimize code while tests stay green
- Polish UI and performance
- Final documentation

### Test Suite Overview

**19 Tests Across 5 Specification Files:**

| Spec File | Tests | Coverage |
|-----------|-------|----------|
| `01-post-creation-offline.spec.ts` | 3 | Post creation, image compression, S3 upload queue |
| `02-message-sending-offline.spec.ts` | 3 | Messaging, conversation cache, queue ordering |
| `03-interactions-offline.spec.ts` | 5 | Hearts, comments, batch sync, toggle optimization |
| `04-conflict-resolution.spec.ts` | 4 | Smart cancellation, batching, silent failures |
| `05-cache-persistence.spec.ts` | 5 | Reload persistence, hydration, eviction |

**Test Helpers:** `libs/e2e-testing/tests/offline/helpers.ts`
- 13 utility functions for offline simulation, queue inspection, cache management

**Documentation:**
- See [PHASE-5.2-TDD-APPROACH.md](./PHASE-5.2-TDD-APPROACH.md) for complete TDD strategy
- See [PHASE-5.2-SESSION-1-SUMMARY.md](./PHASE-5.2-SESSION-1-SUMMARY.md) for test suite details

---

## Philosophy

**Goal:** Seamless offline experience - user shouldn't know they're offline for cached actions.

### Core Principles
1. **Silent Queueing:** No "you're offline" toasts - just queue and sync later
2. **Optimistic UI:** Update UI immediately, sync in background
3. **Visual Indicator:** Small grey wifi icon in header (non-clickable, subtle)
4. **Auto-Sync:** Silently sync when connection restored
5. **Conflict Resolution:** Last write wins (simple, predictable)

---

## Visual Indicators

### Offline Indicator
**Location:** Header (top-right, next to theme toggle)  
**Appearance:** Small grey wifi-off icon  
**Behavior:** Non-clickable, appears only when offline

```tsx
// OfflineIndicator component
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div 
      className="text-gray-400"
      title="You're offline. Changes will sync when reconnected."
    >
      <WifiOff className="w-4 h-4" />
    </div>
  );
}
```

### No Toasts for Offline Actions
❌ **Don't show:** "You're offline" or "Action queued for sync"  
✅ **Do show:** Brief success toast when action completes after sync

---

## Implementation Approach

### Updated Implementation Strategy (TDD)

#### ✅ Session 1: Test Suite (Red Phase) - COMPLETE
**Date:** November 18, 2025

- Created 19 E2E tests with Playwright
- Test infrastructure and helpers
- User scenarios documented (8 scenarios)
- Architecture decisions finalized
- All tests validated and failing (TDD Red phase)

#### 🚧 Session 2: Queue Infrastructure (Green Phase)
**Target:** Make queue-related tests pass

1. **Offline Queue System**
   - IndexedDB queue with priority support
   - Conflict detection and smart cancellation
   - Toggle optimization logic
   - Dependency tracking

2. **Queue Processor**
   - Priority-based processing
   - Exponential backoff retry (1s, 2s, 4s, 8s, 16s max)
   - Silent failures for 404/410 errors
   - Batch settings updates

3. **Network Monitor**
   - navigator.onLine tracking
   - /api/health polling (30s when offline)
   - Auto queue processing on reconnect

**Expected Test Results:**
```bash
✅ 4-6 tests passing (queue operations)
✘ 13-15 tests failing (need service worker + cache)
```

#### Session 3: Service Worker & Caching
**Target:** Make cache-related tests pass

1. **Service Worker Setup**
   - vite-plugin-pwa configuration
   - Workbox caching strategies
   - App shell caching
   - CDN image caching

2. **React Query Persistence**
   - Posts cache (100 posts, 7-day expiry, LRU)
   - Conversations cache (50 conversations)
   - Cache hydration on startup
   - Automatic eviction

**Expected Test Results:**
```bash
✅ 10-12 tests passing (queue + cache)
✘ 7-9 tests failing (need mutation wrappers)
```

#### Session 4: Mutation Wrappers
**Target:** Make interaction tests pass

1. **Wrap Core Mutations**
   - useHeartPost with offline queue
   - useCreateComment with offline queue
   - useSendMessage with offline queue
   - useCreatePost with image compression

2. **Optimistic UI Updates**
   - Instant feedback for all mutations
   - "syncing..." badges on pending items
   - Smooth transitions after sync

**Expected Test Results:**
```bash
✅ 16-17 tests passing (most features working)
✘ 2-3 tests failing (edge cases)
```

#### Session 5: Polish & Conflict Resolution
**Target:** Make all tests pass

1. **Smart Queue Behavior**
   - Create→Delete cancellation
   - Toggle optimization
   - Silent failures for deleted posts
   - Dependency tracking

2. **UI Components**
   - Offline banner
   - Queue status page
   - Manual sync trigger

**Expected Test Results:**
```bash
✅ 18-19 tests passing (all features working!)
⏳ 0-1 tests TODO (cache eviction - complex)
```

#### Session 6: Refactor & Documentation
**Target:** Optimize and document

1. **Code Quality**
   - Performance optimization
   - Memory profiling
   - Code cleanup

2. **Documentation**
   - PHASE-5.2-SUMMARY.md
   - OFFLINE-TESTING-GUIDE.md
   - Update main README

**Expected Test Results:**
```bash
✅ 19/19 tests passing
Status: Phase 5.2 Complete! 🎉
```

---

## Technical Architecture (Updated for TDD)

### Service Worker
```typescript
// sw.ts
// Cache strategy: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Cache posts, images, static assets
const CACHE_NAME = 'vibesapp-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  // ... etc
];
```

### IndexedDB Queue
```typescript
// offlineQueue.ts
import { openDB } from 'idb';

const DB_NAME = 'vibesapp-offline-queue';
const STORE_NAME = 'actions';

export const offlineQueue = {
  async add(action: string, data: any) {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      },
    });
    
    await db.add(STORE_NAME, {
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
    });
  },
  
  async getAll() {
    const db = await openDB(DB_NAME, 1);
    return db.getAll(STORE_NAME);
  },
  
  async remove(id: number) {
    const db = await openDB(DB_NAME, 1);
    await db.delete(STORE_NAME, id);
  },
  
  async clear() {
    const db = await openDB(DB_NAME, 1);
    await db.clear(STORE_NAME);
  },
};
```

### React Query Offline Mutations
```typescript
// useOfflineMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { offlineQueue } from './offlineQueue';

export function useOfflineMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    optimisticUpdate?: (variables: TVariables) => void;
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (navigator.onLine) {
        return mutationFn(variables);
      } else {
        // Queue for offline sync
        await offlineQueue.add(mutationFn.name, variables);
        throw new Error('offline'); // Will be caught and handled
      }
    },
    
    onMutate: (variables) => {
      // Optimistic update
      options?.optimisticUpdate?.(variables);
    },
    
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    
    onError: (error, variables) => {
      if (error.message === 'offline') {
        // Silent - already queued
        return;
      }
      options?.onError?.(error);
    },
  });
}
```

### Auto-Sync on Reconnect
```typescript
// useAutoSync.ts
import { useEffect } from 'react';
import { offlineQueue } from './offlineQueue';
import { api } from './api';

export function useAutoSync() {
  useEffect(() => {
    const handleOnline = async () => {
      const queue = await offlineQueue.getAll();
      
      // Process queue silently
      for (const item of queue) {
        try {
          await processQueueItem(item);
          await offlineQueue.remove(item.id);
        } catch (error) {
          // Retry later or skip
          if (item.retries >= 3) {
            await offlineQueue.remove(item.id);
          }
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
}

async function processQueueItem(item: QueueItem) {
  switch (item.action) {
    case 'likePost':
      await api.likePost(item.data.postId);
      break;
    case 'updateAccount':
      await api.updateAccount(item.data);
      break;
    case 'sendMessage':
      await api.sendMessage(item.data);
      break;
    // ... etc
  }
}
```

---

## Feature-Specific Implementation

### 1. Vibes (Like/Dislike) Offline

```tsx
// useVibePost.ts
export function useVibePost() {
  return useOfflineMutation(
    async ({ postId, type }: { postId: string; type: 'like' | 'dislike' }) => {
      return api.vibePost(postId, type);
    },
    {
      optimisticUpdate: ({ postId, type }) => {
        // Update UI immediately
        queryClient.setQueryData(['post', postId], (old: Post) => ({
          ...old,
          vibes: {
            ...old.vibes,
            [type]: old.vibes[type] + 1,
            userVibe: type,
          },
        }));
      },
      
      onError: (error, variables) => {
        // Revert optimistic update
        queryClient.invalidateQueries(['post', variables.postId]);
      },
    }
  );
}

// Usage
const vibePost = useVibePost();

<button onClick={() => vibePost.mutate({ postId, type: 'like' })}>
  <Heart className={cn(
    "w-5 h-5",
    post.vibes.userVibe === 'like' && "fill-brand text-brand"
  )} />
</button>
```

### 2. Account Updates Offline

```tsx
// useUpdateAccount.ts
const accountUpdates = useRef<Partial<AccountData>>({});
const updateTimeout = useRef<NodeJS.Timeout | null>(null);

export function useAccountUpdates() {
  const queueUpdate = (changes: Partial<AccountData>) => {
    // Merge changes
    accountUpdates.current = { ...accountUpdates.current, ...changes };
    
    // Clear existing timeout
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
    
    // Batch update after 300ms
    updateTimeout.current = setTimeout(() => {
      saveUpdates(accountUpdates.current);
      accountUpdates.current = {};
    }, 300);
  };
  
  const saveUpdates = async (updates: Partial<AccountData>) => {
    if (navigator.onLine) {
      try {
        await api.updateAccount(updates);
        // Silent success
      } catch (error) {
        // Queue for retry
        await offlineQueue.add('updateAccount', updates);
      }
    } else {
      // Queue immediately
      await offlineQueue.add('updateAccount', updates);
    }
  };
  
  return { queueUpdate };
}
```

### 3. Messages Offline

```tsx
// useSendMessage.ts
export function useSendMessage() {
  return useOfflineMutation(
    async ({ conversationId, content }: Message) => {
      return api.sendMessage(conversationId, content);
    },
    {
      optimisticUpdate: ({ conversationId, content }) => {
        // Add optimistic message
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          conversationId,
          content,
          senderId: currentUser.id,
          createdAt: new Date(),
          status: 'sending',
        };
        
        queryClient.setQueryData(['messages', conversationId], (old: Message[]) => [
          ...old,
          optimisticMessage,
        ]);
      },
      
      onSuccess: (data, variables) => {
        // Replace optimistic message with real one
        queryClient.setQueryData(['messages', variables.conversationId], (old: Message[]) => 
          old.map(msg => msg.id.startsWith('temp-') ? data : msg)
        );
      },
    }
  );
}
```

### 4. Posts Feed Caching

```tsx
// usePostsFeed.ts
export function usePostsFeed() {
  return useQuery({
    queryKey: ['posts', 'nearby'],
    queryFn: async () => {
      const posts = await api.getNearbyPosts();
      
      // Cache posts in IndexedDB for offline viewing
      await cachePostsOffline(posts);
      
      return posts;
    },
    
    // React Query offline config
    networkMode: 'offlineFirst', // Use cache when offline
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

async function cachePostsOffline(posts: Post[]) {
  const db = await openDB('vibesapp-posts', 1, {
    upgrade(db) {
      db.createObjectStore('posts', { keyPath: 'id' });
    },
  });
  
  for (const post of posts) {
    await db.put('posts', post);
  }
}
```

---

## Conflict Resolution

### Strategy: Last Write Wins

**Philosophy:** Simple and predictable. Most recent change overwrites previous.

```typescript
// Server-side conflict resolution
async function updateAccount(userId: string, updates: Partial<AccountData>) {
  // Always accept the latest update
  await db.users.updateOne(
    { _id: userId },
    { 
      $set: {
        ...updates,
        updatedAt: new Date(), // Timestamp for tracking
      }
    }
  );
}
```

### Edge Case: Concurrent Edits on Multiple Devices

**Scenario:** User edits bio on phone (offline), then edits on desktop (online)

**Resolution:**
1. Desktop edit saves immediately (online)
2. Phone reconnects and syncs queued edit
3. Phone's edit (with later timestamp) overwrites desktop edit
4. User sees phone's version (last write wins)

**Rationale:** This is expected behavior. Most recent change wins. We don't show merge conflicts or complex UI.

---

## Queue Management

### Queue Size Limits
- **Max queue items:** 100
- **Max age:** 24 hours
- **Auto-cleanup:** Remove items older than 24 hours

```typescript
// Queue cleanup
export async function cleanupQueue() {
  const queue = await offlineQueue.getAll();
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const item of queue) {
    if (now - item.timestamp > maxAge) {
      await offlineQueue.remove(item.id);
    }
  }
}

// Run cleanup on app start and periodically
useEffect(() => {
  cleanupQueue();
  const interval = setInterval(cleanupQueue, 60 * 60 * 1000); // Every hour
  return () => clearInterval(interval);
}, []);
```

### Retry Logic
- **Max retries:** 3 attempts
- **Backoff:** 1s, 5s, 15s
- **Failure:** Remove from queue after 3 failed attempts

```typescript
async function processQueueItem(item: QueueItem) {
  try {
    await executeQueuedAction(item);
    await offlineQueue.remove(item.id);
  } catch (error) {
    item.retries = (item.retries || 0) + 1;
    
    if (item.retries >= 3) {
      // Give up
      await offlineQueue.remove(item.id);
      console.error('Queue item failed after 3 retries:', item);
    } else {
      // Update retry count
      await offlineQueue.update(item.id, { retries: item.retries });
      
      // Retry with backoff
      const delay = [1000, 5000, 15000][item.retries - 1];
      setTimeout(() => processQueueItem(item), delay);
    }
  }
}
```

---

## Testing Offline Mode

### Chrome DevTools
1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Test actions (like, comment, update profile)
4. Verify:
   - UI updates immediately (optimistic)
   - Grey wifi icon appears in header
   - No error toasts
5. Go back "Online"
6. Verify:
   - Actions sync automatically
   - UI remains consistent
   - Brief success toast (optional)

### Service Worker Testing
```bash
# Build with service worker
npm run build

# Serve production build
npm run preview

# Open DevTools → Application → Service Workers
# Click "Offline" checkbox
# Test offline functionality
```

---

## Performance Considerations

### IndexedDB Optimization
- **Batch writes:** Combine multiple queue additions
- **Index strategy:** Index by action type for fast queries
- **Cleanup:** Regular cleanup of old items

### React Query Optimization
```typescript
// Optimize for offline
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 3,
    },
  },
});
```

---

## Success Criteria

### Offline Experience Goals
- ✅ User doesn't notice they're offline (for cached content)
- ✅ Actions complete instantly (optimistic UI)
- ✅ No error toasts for offline actions
- ✅ Silent sync when reconnected
- ✅ Consistent state across devices

### Metrics
- **Queue processing time:** < 5s after reconnect
- **UI update latency:** < 50ms (optimistic)
- **Cache hit rate:** > 90% for viewed posts
- **Sync success rate:** > 95%

---

## Future Enhancements (Post-MVP)

### Advanced Features
1. **Smarter conflict resolution:** Merge non-conflicting changes
2. **Priority queue:** Critical actions sync first
3. **Background sync:** Use Background Sync API for better reliability
4. **Offline indicators per action:** Show pending status on individual items
5. **Manual sync trigger:** "Sync now" button in settings
6. **Offline mode toggle:** Let users enable/disable offline features

---

## Implementation Checklist (Updated for TDD)

### ✅ Session 1: Test Suite (Red Phase) - COMPLETE
- [x] Create 19 comprehensive E2E tests
- [x] Test infrastructure and helpers
- [x] Document user scenarios (8 scenarios)
- [x] Finalize architecture decisions
- [x] Validate test execution (all failing as expected)

### 🚧 Session 2: Queue Infrastructure (Green Phase) - IN PROGRESS
- [ ] IndexedDB queue with priority system
- [ ] Queue processor with retry logic
- [ ] Network state monitoring
- [ ] Conflict detection and resolution
- [ ] Run tests: Expect 4-6 tests passing

### Session 3: Service Worker & Caching
- [ ] vite-plugin-pwa setup
- [ ] Workbox caching strategies
- [ ] React Query persistence
- [ ] Posts feed caching (100 posts, LRU)
- [ ] Conversations cache (50 conversations)
- [ ] Run tests: Expect 10-12 tests passing

### Session 4: Mutation Wrappers
- [ ] Wrap useHeartPost with offline queue
- [ ] Wrap useCreateComment with offline queue
- [ ] Wrap useSendMessage with offline queue
- [ ] Optimistic UI updates for all
- [ ] "syncing..." badges
- [ ] Run tests: Expect 16-17 tests passing

### Session 5: Polish & Conflict Resolution
- [ ] Smart cancellation (create→delete)
- [ ] Toggle optimization
- [ ] Silent failures for deleted posts
- [ ] Offline banner component
- [ ] Queue status page
- [ ] Run tests: Expect 18-19 tests passing

### Session 6: Refactor & Documentation
- [ ] Performance optimization
- [ ] Code cleanup
- [ ] PHASE-5.2-SUMMARY.md
- [ ] OFFLINE-TESTING-GUIDE.md
- [ ] Update main README
- [ ] Final test run: All green!

---

**Current Status:** Session 1 Complete (Red Phase) - Ready for Session 2 (Green Phase)

**Next Step:** Implement Queue Infrastructure and watch tests start turning green!

**Documentation Reference:**
- **TDD Overview:** `PHASE-5.2-TDD-APPROACH.md` - Complete TDD methodology and test suite overview
- **Test Suite:** `PHASE-5.2-SESSION-1-SUMMARY.md` - Test creation session details
- **Implementation Plan:** `PHASE-5.2-IMPLEMENTATION-PLAN.md` - Updated plan with TDD approach
- **Scenario Analysis:** `SCENARIO-1-TDD-ANALYSIS.md` - Detailed commuter scenario breakdown
- **Timeline:** `REBUILD-ACTION-PLAN.md` - Week 11 integration with overall project
