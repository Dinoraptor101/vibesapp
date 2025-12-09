# Test-Driven Development: Scenario 1 - Commuter on Subway

**Date:** November 19, 2025  
**Scenario:** Sarah's 30-minute subway ride with no cell signal

---

## Current Implementation Status

### ✅ What Works Now (Session 1 - Infrastructure)

| Feature | Status | Details |
|---------|--------|---------|
| **Service Worker** | ✅ Built | Caches app shell, assets, and API responses |
| **Offline Detection** | ✅ Built | `useNetworkStatus()` tracks online/offline |
| **Queue System** | ✅ Built | IndexedDB stores pending actions |
| **Auto-Sync** | ✅ Built | Syncs when back online, retry logic |
| **Offline Indicator** | ✅ Built | WiFi icon shows when offline |

### ❌ What Doesn't Work Yet (Needs Session 2+)

| Action | Current Status | What's Missing |
|--------|---------------|----------------|
| **Opens app offline** | ❌ Partial | Service worker caches shell, but not configured for full offline-first |
| **Scrolls cached posts** | ❌ No | Posts feed not cached in IndexedDB, only HTTP cache (5 min TTL) |
| **Hearts 3 posts** | ❌ No | Existing like hooks not using `useOfflineMutation` |
| **Writes comment** | ❌ No | `useCreateComment` not using offline support |
| **"syncing..." badge** | ❌ No | No UI feedback for queued items |
| **Messages offline** | ❌ No | Messages not cached, no offline support |
| **Cached profiles** | ❌ No | User profiles not cached in IndexedDB |
| **Activity tab** | ❌ No | Activities not cached |
| **Sync toast** | ✅ Partial | Toast shows but says "Synced N action(s)" not specific |
| **Silent failure handling** | ❌ No | No error suppression for deleted posts |

---

## Detailed Analysis: Action by Action

### 1. ✅ Opens app while underground (already cached from yesterday)

**Current State:**
- ✅ Service worker caches: HTML, CSS, JS, images
- ⚠️ API responses cached for 5 minutes only (NetworkFirst strategy)

**What Works:**
- App shell loads instantly
- Static assets load from cache

**What Doesn't:**
- Posts feed from yesterday won't be available (5 min cache expired)
- User needs to have visited within last 5 minutes

**Test:**
```typescript
describe('App Launch Offline', () => {
  it('should load app shell from service worker cache', async () => {
    // Set offline
    await page.setOfflineMode(true);
    
    // Navigate to app
    await page.goto('http://localhost:5173');
    
    // Verify app loads
    expect(await page.title()).toBe('VibesApp');
    expect(await page.locator('nav').isVisible()).toBe(true);
  });
});
```

**To Fix:**
- Increase API cache TTL for posts (currently 5 min → 24 hours)
- Add IndexedDB cache for posts feed (persistent storage)

---

### 2. ❌ Scrolls through Nearby feed - sees last 100 cached posts

**Current State:**
- ❌ Posts not cached in IndexedDB
- ⚠️ HTTP cache only (5 min TTL, already expired)

**What Works:**
- Nothing - feed will be empty offline

**What Doesn't:**
- No persistent posts cache
- No IndexedDB storage for posts

**Test:**
```typescript
describe('Cached Posts Feed', () => {
  it('should show cached posts when offline', async () => {
    // Load posts while online
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[data-testid="post-card"]');
    const onlinePostCount = await page.locator('[data-testid="post-card"]').count();
    
    // Go offline
    await page.setOfflineMode(true);
    await page.reload();
    
    // Should still see posts
    const offlinePostCount = await page.locator('[data-testid="post-card"]').count();
    expect(offlinePostCount).toBe(onlinePostCount);
  });
});
```

**To Fix:**
```typescript
// src/features/posts/hooks/useCachedPosts.ts
export function useCachedPosts() {
  return useQuery({
    queryKey: ['posts', 'nearby'],
    queryFn: async () => {
      const posts = await fetchPosts();
      // Cache in IndexedDB
      await cachePostsOffline(posts);
      return posts;
    },
    // Use cached data when offline
    placeholderData: (previousData) => previousData,
  });
}
```

---

### 3. ❌ Hearts 3 posts → queued for sync

**Current State:**
- ❌ Like hooks still use regular `useMutation`
- ❌ No offline queueing
- ❌ No optimistic updates

**What Works:**
- Nothing - will show network error

**What Doesn't:**
- `useHeartPost` not using `useOfflineMutation`
- No optimistic UI update (heart doesn't fill immediately)
- No queueing

**Test:**
```typescript
describe('Like Post Offline', () => {
  it('should queue like and show optimistic update', async () => {
    await page.setOfflineMode(true);
    
    const heartButton = page.locator('[data-testid="heart-button"]').first();
    const initialState = await heartButton.getAttribute('data-liked');
    
    await heartButton.click();
    
    // Should update immediately (optimistic)
    expect(await heartButton.getAttribute('data-liked')).toBe('true');
    
    // Should be queued in IndexedDB
    const queue = await page.evaluate(() => {
      return indexedDB.open('vibesapp-queue');
    });
    // ... check queue has item
  });
  
  it('should sync queued likes when back online', async () => {
    // Go back online
    await page.setOfflineMode(false);
    
    // Wait for sync
    await page.waitForSelector('.sonner-toast:has-text("Synced")');
    
    // Verify queue is empty
    // ... check IndexedDB queue is empty
  });
});
```

**To Fix:**
```typescript
// src/features/posts/hooks/useHeartPost.ts
export function useHeartPost() {
  const queryClient = useQueryClient();
  
  return useOfflineMutation({
    action: 'toggle_like',
    mutationFn: ({ postId }: { postId: string }) => toggleLikePost(postId),
    optimisticUpdate: ({ postId }) => {
      // Update UI immediately
      queryClient.setQueriesData(['posts'], (old: Post[]) => {
        return old.map(post => 
          post.id === postId 
            ? { ...post, isLiked: !post.isLiked, likeCount: post.likeCount + 1 }
            : post
        );
      });
    },
  });
}
```

---

### 4. ❌ Writes a comment: "Love this! 😍" → comment appears immediately with "syncing..." badge

**Current State:**
- ❌ `useCreateComment` uses regular `useMutation`
- ❌ No offline support
- ❌ No "syncing..." badge

**What Works:**
- Nothing - will fail with network error

**What Doesn't:**
- No optimistic comment rendering
- No queue badge/indicator
- Comment won't appear until online

**Test:**
```typescript
describe('Create Comment Offline', () => {
  it('should show comment immediately with syncing badge', async () => {
    await page.setOfflineMode(true);
    
    const commentInput = page.locator('[data-testid="comment-input"]');
    await commentInput.fill('Love this! 😍');
    await page.locator('[data-testid="post-comment"]').click();
    
    // Should appear immediately
    const comment = page.locator('[data-testid="comment"]').last();
    expect(await comment.textContent()).toContain('Love this! 😍');
    
    // Should show syncing badge
    expect(await comment.locator('[data-testid="syncing-badge"]').isVisible()).toBe(true);
  });
  
  it('should remove syncing badge after sync', async () => {
    await page.setOfflineMode(false);
    await page.waitForTimeout(1000); // Wait for sync
    
    const comment = page.locator('[data-testid="comment"]').last();
    expect(await comment.locator('[data-testid="syncing-badge"]').isVisible()).toBe(false);
  });
});
```

**To Fix:**
```typescript
// Comment type needs status field
interface Comment {
  id: string;
  text: string;
  status?: 'sending' | 'sent' | 'failed';
  // ... other fields
}

// Hook
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useOfflineMutation({
    action: 'create_comment',
    mutationFn: (payload: CreateCommentPayload) => createComment(payload),
    optimisticUpdate: ({ text }) => {
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        text,
        userId: user?.id,
        status: 'sending',
        createdAt: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['comments', postId], (old: Comment[]) => {
        return [...old, tempComment];
      });
    },
    onSuccess: (realComment) => {
      // Replace temp with real
      queryClient.setQueryData(['comments', postId], (old: Comment[]) => {
        return old.map(c => c.id.startsWith('temp-') ? realComment : c);
      });
    },
  });
}

// UI Component
function Comment({ comment }: { comment: Comment }) {
  return (
    <div data-testid="comment">
      <p>{comment.text}</p>
      {comment.status === 'sending' && (
        <Badge data-testid="syncing-badge" variant="secondary">
          Syncing...
        </Badge>
      )}
    </div>
  );
}
```

---

### 5. ❌ Opens Messages → sees last 50 conversations with all messages

**Current State:**
- ❌ Messages not cached
- ❌ No offline support

**What Works:**
- Nothing - will show empty state or error

**Test:**
```typescript
describe('Messages Offline', () => {
  it('should show cached conversations', async () => {
    // Load messages while online
    await page.goto('http://localhost:5173/messages');
    const onlineConvCount = await page.locator('[data-testid="conversation"]').count();
    
    // Go offline
    await page.setOfflineMode(true);
    await page.reload();
    
    // Should still see conversations
    const offlineConvCount = await page.locator('[data-testid="conversation"]').count();
    expect(offlineConvCount).toBe(onlineConvCount);
  });
});
```

**To Fix:**
- Cache conversations in IndexedDB
- Cache messages per conversation

---

### 6. ✅ Emerges from subway → automatic sync begins

**Current State:**
- ✅ Auto-sync on 'online' event
- ✅ Processes queue items
- ✅ Toast notification

**What Works:**
- Sync triggers automatically
- Queue processed in order
- Toast shows success

**What Doesn't:**
- Toast isn't specific ("Synced 5 action(s)" vs "Synced 3 hearts, 1 comment, 1 message")
- No per-item timing info

**Test:**
```typescript
describe('Auto-Sync on Reconnect', () => {
  it('should sync all queued actions', async () => {
    // Queue some actions offline
    await page.setOfflineMode(true);
    await heartPost(page, 'post1');
    await heartPost(page, 'post2');
    await createComment(page, 'Nice!');
    
    // Go online
    await page.setOfflineMode(false);
    
    // Should see sync toast
    await page.waitForSelector('.sonner-toast:has-text("Synced 3 action")');
    
    // Queue should be empty
    // ... verify IndexedDB is empty
  });
});
```

**To Fix (Enhancement):**
```typescript
// Improved toast messages
if (result.successful > 0) {
  const breakdown = getSyncBreakdown(result.actions);
  toast.success(`Synced: ${breakdown.join(', ')}`);
  // e.g., "Synced: 3 likes, 1 comment, 1 message"
}
```

---

### 7. ❌ Edge Case: Post deleted by author, heart mutation fails silently

**Current State:**
- ❌ No silent failure handling
- ❌ Will show error toast

**What Works:**
- Nothing

**What Doesn't:**
- Errors are shown to user
- No graceful degradation

**Test:**
```typescript
describe('Silent Failure Handling', () => {
  it('should silently ignore heart on deleted post', async () => {
    // Queue a heart offline
    await page.setOfflineMode(true);
    await heartPost(page, 'post-will-be-deleted');
    
    // Delete post on server (simulate)
    await deletePostOnServer('post-will-be-deleted');
    
    // Go online
    await page.setOfflineMode(false);
    
    // Should NOT show error toast
    await expect(page.locator('.sonner-toast:has-text("Failed")')).not.toBeVisible();
    
    // Should show partial success
    await page.waitForSelector('.sonner-toast:has-text("Synced")');
  });
});
```

**To Fix:**
```typescript
// src/lib/offline/sync.ts
async function processQueueItem(item: QueueItem): Promise<void> {
  try {
    switch (item.action) {
      case 'toggle_like':
        await toggleLikePost((item.data as { postId: string }).postId);
        break;
      // ... other cases
    }
  } catch (error) {
    // Silent failure for certain errors
    if (isExpectedError(error)) {
      console.log('Silently ignoring expected error:', error);
      return; // Don't throw, just skip
    }
    throw error; // Re-throw unexpected errors
  }
}

function isExpectedError(error: any): boolean {
  return (
    error.status === 404 || // Post deleted
    error.status === 403    // No longer have access
  );
}
```

---

## Summary: What Needs to Be Built

### Session 2: Core Mutations (PRIORITY)
1. ✅ Modify `useHeartPost` to use `useOfflineMutation`
2. ✅ Modify `useCreateComment` to use `useOfflineMutation`
3. ✅ Add optimistic updates for both
4. ✅ Add "syncing..." badge to comments

### Session 3: Data Caching
1. ❌ Cache posts feed in IndexedDB (100 posts, 24hr TTL)
2. ❌ Cache messages/conversations in IndexedDB
3. ❌ Cache user profiles in IndexedDB
4. ❌ Cache activities in IndexedDB

### Session 4: Polish
1. ❌ Improve sync toast messages (specific breakdown)
2. ❌ Silent failure handling for expected errors
3. ❌ Sync status indicator in UI

---

## Immediate Next Steps

**Do you want me to:**
1. **Implement Session 2** (Core mutations) - Gets likes and comments working offline?
2. **Write the actual Playwright tests** for this scenario?
3. **Both** - Write tests then implement?

Which approach do you prefer?
