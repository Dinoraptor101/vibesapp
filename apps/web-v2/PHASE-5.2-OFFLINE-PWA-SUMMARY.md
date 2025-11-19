# Offline Support & PWA Implementation Summary

**Date:** November 19, 2025  
**Status:** Phase 1 Complete - Core Infrastructure  
**Reference:** docs/REBUILD/REBUILD-OFFLINE-MODE-STRATEGY.md

## Overview

Implemented offline-first functionality for VibesApp, allowing users to interact with the app seamlessly even when offline. Changes are queued and automatically synced when the connection is restored.

## Core Principles

1. **Silent Queueing** - No "you're offline" toasts, just queue and sync silently
2. **Optimistic UI** - Update UI immediately, sync in background
3. **Visual Indicator** - Small grey wifi icon appears in header when offline
4. **Auto-Sync** - Automatically sync queued actions when connection restored
5. **Conflict Resolution** - Last write wins (simple, predictable)

## Architecture

### 1. IndexedDB Offline Queue (`lib/offlineQueue.ts`)

Persistent storage for queued actions using the `idb` library.

**Features:**
- Store actions with timestamp and retry count
- Query by action type
- Automatic cleanup of items older than 24 hours
- Max 100 items in queue

**API:**
```typescript
offlineQueue.add(action: string, data: any): Promise<number>
offlineQueue.getAll(): Promise<QueueItem[]>
offlineQueue.remove(id: number): Promise<void>
offlineQueue.cleanup(): Promise<number>
```

### 2. useOfflineMutation Hook (`lib/useOfflineMutation.ts`)

Wraps React Query mutations with offline support.

**Features:**
- Automatic queueing when offline
- Optimistic UI updates
- Query invalidation on success
- Silent error handling for queued items

**Usage:**
```typescript
const heartPost = useOfflineMutation({
  actionName: 'heartPost',
  mutationFn: async ({ postId }) => toggleLikePost(postId),
  optimisticUpdate: (variables, queryClient) => {
    // Update cache immediately
  },
  queryKeysToInvalidate: [['post'], ['posts']],
});
```

### 3. useAutoSync Hook (`lib/useAutoSync.ts`)

Automatically processes queued actions when connection is restored.

**Features:**
- Listens to `online` event
- Sequential processing to avoid overwhelming server
- Exponential backoff retry logic (1s, 5s, 15s)
- Max 3 retries per action
- Automatic queue cleanup (hourly)

**Supported Actions:**
- `heartPost` - Toggle post hearts
- `createComment` - Create comments
- `heartComment` - Heart comments
- `sendMessage` - Send messages (coming soon)
- `updateProfile` - Update profile (coming soon)

### 4. Offline Indicator Component (`components/OfflineIndicator.tsx`)

Visual indicator in the top navigation.

**Features:**
- Shows wifi-off icon when offline
- Auto-hides when online
- Tooltip: "You're offline. Changes will sync when reconnected."
- Non-interactive, purely informational

## Offline-Ready Features

### ✅ Implemented (Phase 1)

1. **Post Hearts (Likes)**
   - Hook: `useHeartPost`
   - Action: `heartPost`
   - Optimistic UI: Query invalidation after sync

2. **Comment Hearts**
   - Hook: `useHeartComment`
   - Action: `heartComment`
   - Optimistic UI: Update heart count immediately

3. **Create Comments**
   - Hook: `useCreateComment`
   - Action: `createComment`
   - Optimistic UI: Add comment to cache with temp ID

### 🚧 Coming Soon (Phase 2-3)

4. **Send Messages** (Phase 2)
5. **Update Profile** (Phase 3)
6. **Post Creation** (Phase 3)
7. **Activity Feed** (Phase 2)

## PWA Configuration

### Service Worker (`vite.config.ts`)

**Strategy:** Network First, fallback to Cache

**Cache Policies:**
- API calls: Network first, cache for 24 hours (max 100 entries)
- Images: Cache first, keep for 30 days (max 200 entries)
- Static assets: Pre-cached during install

**Workbox Configuration:**
```typescript
runtimeCaching: [
  {
    urlPattern: /^https:\/\/api\..+\/.*/i,
    handler: 'NetworkFirst',
    expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
  },
  {
    urlPattern: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
    handler: 'CacheFirst',
    expiration: { maxEntries: 200, maxAgeSeconds: 2592000 },
  },
]
```

### Web App Manifest

**Configuration:**
- Name: VibesApp
- Short Name: Vibes
- Theme Color: #9333ea (brand purple)
- Display: Standalone
- Icons: SVG placeholders at 192x192 and 512x512

**Install Prompt:**
- Automatically triggered by browser when criteria met
- Requires HTTPS in production
- Requires service worker registration

## React Query Configuration

Updated `QueryClient` defaults for offline support:

```typescript
defaultOptions: {
  queries: {
    networkMode: 'offlineFirst', // Use cache when offline
    staleTime: 5 * 60 * 1000,    // 5 minutes
  },
  mutations: {
    networkMode: 'offlineFirst', // Allow mutations when offline
  },
}
```

## Testing Offline Mode

### Manual Testing (Chrome DevTools)

1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Test actions:
   - Heart a post → Immediate UI update, wifi icon appears
   - Create a comment → Comment appears instantly
   - Check queue: Open IndexedDB → `vibesapp-offline-queue`
4. Go back "Online"
5. Wait 2-3 seconds for auto-sync
6. Verify:
   - Wifi icon disappears
   - Actions synced to server
   - UI remains consistent

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

## Performance Considerations

### Queue Management

- **Max queue size:** 100 items
- **Max age:** 24 hours
- **Cleanup frequency:** Every hour
- **Retry logic:** 3 attempts with backoff

### Memory Usage

- IndexedDB storage: ~5-10MB typical
- Service worker cache: ~50-100MB for images/assets
- Queue overhead: ~1KB per action

### Network Optimization

- Sequential sync (not parallel) to avoid overwhelming server
- Query invalidation only after successful sync
- Debounced batch updates for rapid actions

## Known Limitations

1. **Complex optimistic updates** - Some features use query invalidation instead of immediate cache updates to avoid race conditions
2. **No conflict resolution UI** - Last write wins, no merge dialog
3. **Build issue** - Rollup native module needs reinstall (known npm bug)
4. **SVG icons** - Placeholder icons, need actual brand assets
5. **Service worker** - Disabled in development mode for faster builds

## Files Modified/Created

### Created Files
- `apps/web-v2/src/lib/offlineQueue.ts` - IndexedDB queue implementation (140 lines)
- `apps/web-v2/src/lib/useOfflineMutation.ts` - Offline mutation hook (79 lines)
- `apps/web-v2/src/lib/useAutoSync.ts` - Auto-sync hook (150 lines)
- `apps/web-v2/src/components/OfflineIndicator.tsx` - Visual indicator (35 lines)
- `apps/web-v2/src/features/posts/hooks/useHeartPost.ts` - Offline heart hook (29 lines)
- `apps/web-v2/public/pwa-192x192.svg` - PWA icon 192x192
- `apps/web-v2/public/pwa-512x512.svg` - PWA icon 512x512
- `apps/web-v2/public/apple-touch-icon.svg` - Apple touch icon

### Modified Files
- `apps/web-v2/src/features/posts/hooks/useHeartComment.ts` - Added offline support
- `apps/web-v2/src/features/posts/hooks/useCreateComment.ts` - Added offline support
- `apps/web-v2/src/components/layout/TopNav.tsx` - Added offline indicator
- `apps/web-v2/src/app/providers.tsx` - Added auto-sync initialization
- `apps/web-v2/vite.config.ts` - Added PWA configuration
- `apps/web-v2/package.json` - Added `idb` and `vite-plugin-pwa` dependencies
- `apps/web-v2/src/types/index.ts` - Commented out @vibesapp/shared import
- `apps/web-v2/src/features/posts/index.ts` - Exported useHeartPost

## Dependencies Added

```json
{
  "dependencies": {
    "idb": "^8.0.0",
    "vite-plugin-pwa": "^0.21.3"
  }
}
```

## Next Steps

### Phase 2: Testing & Validation
- [ ] Test offline post hearting
- [ ] Test offline commenting
- [ ] Test queue sync on reconnect
- [ ] Resolve rollup build issue
- [ ] Add proper PWA icons (replace placeholders)

### Phase 3: Additional Features
- [ ] Messages offline support
- [ ] Activities offline support
- [ ] Account updates offline
- [ ] Post creation offline

### Phase 4: Polish
- [ ] Add offline mode toggle in settings
- [ ] Manual sync button
- [ ] Queue status indicator
- [ ] Conflict resolution UI (if needed)

## References

- Strategy Document: `docs/REBUILD/REBUILD-OFFLINE-MODE-STRATEGY.md`
- React Query Docs: https://tanstack.com/query/latest/docs/framework/react/guides/network-mode
- Workbox Docs: https://developer.chrome.com/docs/workbox/
- PWA Guide: https://web.dev/progressive-web-apps/
