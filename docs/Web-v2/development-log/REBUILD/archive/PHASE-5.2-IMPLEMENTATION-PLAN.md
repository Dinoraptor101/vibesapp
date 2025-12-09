# Phase 5.2: Offline Support & PWA Implementation Plan

**Created:** November 18, 2025  
**Status:** 🚧 In Progress  
**Timeline:** Week 11 (Phase 5)

---

## Overview

Implement comprehensive offline support and Progressive Web App (PWA) capabilities to enable seamless user experience when network connectivity is unreliable or unavailable. The app will cache data locally, queue changes for later sync, and provide visual feedback about connection status.

---

## Implementation Strategy

### Approach: Test-Driven Development (TDD)

We're using TDD for Phase 5.2 - writing comprehensive E2E tests **first**, then implementing features to make them pass.

**Benefits:**
- Tests define the specification
- Immediate feedback on implementation correctness
- Prevents regression
- Documents expected behavior

### Phase Breakdown

#### **Part 0: Test Suite (Session 1) ✅ COMPLETE**
- ✅ Test infrastructure with helpers (`goOffline`, `goOnline`, `getQueuedMutations`, etc.)
- ✅ 19 comprehensive E2E tests across 5 spec files:
  - `01-post-creation-offline.spec.ts` (3 tests)
  - `02-message-sending-offline.spec.ts` (3 tests)
  - `03-interactions-offline.spec.ts` (5 tests)
  - `04-conflict-resolution.spec.ts` (4 tests)
  - `05-cache-persistence.spec.ts` (5 tests)
- ✅ All tests validated and failing as expected (TDD Red phase)

#### **Part 1: Queue Infrastructure (Session 2)**
- Offline mutation queue with IndexedDB
- Priority system (Messages > Posts > Comments > Likes)
- Retry logic with exponential backoff
- Conflict detection and smart cancellation

#### **Part 2: Service Worker & Caching (Session 3)**
- Service worker with Workbox
- App shell caching
- CDN image caching
- Offline routing

#### **Part 3: React Query Persistence (Session 4)**
- Posts cache (100 posts, 7-day expiry, LRU)
- Conversations cache (50 conversations)
- Cache hydration on startup
- Automatic eviction

#### **Part 4: Network & Mutations (Session 5)**
- Network state monitoring (/api/health polling)
- Wrap mutations with offline queue
- Optimistic UI updates
- Offline banner component

#### **Part 5: Testing & Polish (Session 6)**
- Run E2E tests and fix failures iteratively
- Queue status page for manual control
- Documentation updates
- Performance optimization

---

## Technical Architecture

### 1. Service Worker (Vite PWA Plugin)

**Package:** `vite-plugin-pwa`

```typescript
// vite.config.ts additions
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'icons/*.png'],
      manifest: {
        name: 'VibesApp',
        short_name: 'Vibes',
        description: 'A picture-based social network',
        theme_color: '#10B981',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.vibesapp\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.cloudfront\.net\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### 2. IndexedDB Queue System

**Package:** `idb` (already available via dependencies)

```typescript
// src/lib/offline/queue.ts
import { openDB, type IDBPDatabase } from 'idb';

interface QueueItem {
  id?: number;
  action: string;
  data: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'processing' | 'failed';
}

class OfflineQueue {
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = 'vibesapp-queue';
  private readonly STORE_NAME = 'actions';
  private readonly VERSION = 1;

  async init() {
    if (this.db) return;
    
    this.db = await openDB(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('actions')) {
          const store = db.createObjectStore('actions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('status', 'status');
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  async add(action: string, data: any): Promise<number> {
    await this.init();
    return this.db!.add(this.STORE_NAME, {
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    });
  }

  async getAll(): Promise<QueueItem[]> {
    await this.init();
    return this.db!.getAll(this.STORE_NAME);
  }

  async getPending(): Promise<QueueItem[]> {
    await this.init();
    return this.db!.getAllFromIndex(this.STORE_NAME, 'status', 'pending');
  }

  async update(id: number, updates: Partial<QueueItem>): Promise<void> {
    await this.init();
    const item = await this.db!.get(this.STORE_NAME, id);
    if (item) {
      await this.db!.put(this.STORE_NAME, { ...item, ...updates });
    }
  }

  async remove(id: number): Promise<void> {
    await this.init();
    await this.db!.delete(this.STORE_NAME, id);
  }

  async clear(): Promise<void> {
    await this.init();
    await this.db!.clear(this.STORE_NAME);
  }

  async cleanup(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    await this.init();
    const items = await this.getAll();
    const now = Date.now();
    
    for (const item of items) {
      if (item.id && now - item.timestamp > maxAge) {
        await this.remove(item.id);
      }
    }
  }
}

export const offlineQueue = new OfflineQueue();
```

### 3. Network Status Hook

```typescript
// src/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastOnline: Date | null;
  lastOffline: Date | null;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isConnecting: false,
    lastOnline: navigator.onLine ? new Date() : null,
    lastOffline: !navigator.onLine ? new Date() : null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
        lastOnline: new Date(),
      }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
        lastOffline: new Date(),
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}
```

### 4. Auto-Sync System

```typescript
// src/lib/offline/sync.ts
import { offlineQueue } from './queue';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface SyncResult {
  successful: number;
  failed: number;
  errors: Error[];
}

export async function syncQueue(): Promise<SyncResult> {
  const result: SyncResult = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  const items = await offlineQueue.getPending();
  
  for (const item of items) {
    if (!item.id) continue;

    try {
      await offlineQueue.update(item.id, { status: 'processing' });
      await processQueueItem(item);
      await offlineQueue.remove(item.id);
      result.successful++;
    } catch (error) {
      result.failed++;
      result.errors.push(error as Error);
      
      const newRetries = item.retries + 1;
      
      if (newRetries >= 3) {
        // Give up after 3 retries
        await offlineQueue.remove(item.id);
      } else {
        await offlineQueue.update(item.id, {
          status: 'pending',
          retries: newRetries,
        });
      }
    }
  }

  return result;
}

async function processQueueItem(item: any): Promise<void> {
  switch (item.action) {
    case 'vibe_post':
      await api.vibePost(item.data.postId, item.data.type);
      break;
    case 'create_comment':
      await api.createComment(item.data.postId, item.data.content);
      break;
    case 'send_message':
      await api.sendMessage(item.data.conversationId, item.data.content);
      break;
    case 'update_account':
      await api.updateAccount(item.data);
      break;
    case 'create_post':
      await api.createPost(item.data);
      break;
    default:
      throw new Error(`Unknown action: ${item.action}`);
  }
}

// Hook for auto-sync
export function useAutoSync() {
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) return;

    // Sync when coming back online
    syncQueue().then((result) => {
      if (result.successful > 0) {
        toast.success(`Synced ${result.successful} action(s)`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} action(s)`);
      }
    });

    // Periodic sync every 5 minutes while online
    const interval = setInterval(() => {
      syncQueue();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isOnline]);

  // Cleanup old queue items on mount
  useEffect(() => {
    offlineQueue.cleanup();
    
    const cleanupInterval = setInterval(() => {
      offlineQueue.cleanup();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(cleanupInterval);
  }, []);
}
```

### 5. Offline Indicator Component

```tsx
// src/components/shared/OfflineIndicator.tsx
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

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

### 6. Offline Mutation Hook

```typescript
// src/hooks/useOfflineMutation.ts
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { offlineQueue } from '@/lib/offline/queue';
import { useNetworkStatus } from './useNetworkStatus';

interface OfflineMutationOptions<TData, TError, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  mutationKey?: string[];
  action: string;
  optimisticUpdate?: (variables: TVariables) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

export function useOfflineMutation<TData = unknown, TError = Error, TVariables = void>({
  mutationFn,
  mutationKey,
  action,
  optimisticUpdate,
  onSuccess,
  onError,
  onSettled,
}: OfflineMutationOptions<TData, TError, TVariables>) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  return useMutation<TData, TError, TVariables>({
    mutationKey,
    mutationFn: async (variables) => {
      if (isOnline) {
        return mutationFn(variables);
      } else {
        // Queue for offline sync
        await offlineQueue.add(action, variables);
        // Return a mock response for optimistic updates
        return null as TData;
      }
    },
    onMutate: (variables) => {
      // Always apply optimistic update
      optimisticUpdate?.(variables);
    },
    onSuccess: (data, variables, context) => {
      if (isOnline) {
        onSuccess?.(data, variables);
      }
      // For offline, success will happen during sync
    },
    onError: (error, variables, context) => {
      // Only call onError for real network errors, not offline queueing
      if (isOnline) {
        onError?.(error, variables);
      }
    },
    onSettled: (data, error, variables, context) => {
      onSettled?.(data, error, variables);
    },
  });
}
```

---

## Feature Implementation

### 1. Vibes (Like/Dislike)

```typescript
// src/hooks/mutations/useVibePost.ts
import { useOfflineMutation } from '@/hooks/useOfflineMutation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Post } from '@/types';

export function useVibePost() {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    action: 'vibe_post',
    mutationFn: ({ postId, type }: { postId: string; type: 'like' | 'dislike' }) =>
      api.vibePost(postId, type),
    optimisticUpdate: ({ postId, type }) => {
      // Update post in feed
      queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) => {
        if (!old) return old;
        return old.map((post) =>
          post.id === postId
            ? {
                ...post,
                vibes: {
                  ...post.vibes,
                  [type]: post.vibes[type] + 1,
                  userVibe: type,
                },
              }
            : post
        );
      });

      // Update individual post if cached
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          vibes: {
            ...old.vibes,
            [type]: old.vibes[type] + 1,
            userVibe: type,
          },
        };
      });
    },
    onError: (error, { postId }) => {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

export function useUnvibePost() {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    action: 'unvibe_post',
    mutationFn: ({ postId }: { postId: string }) => api.unvibePost(postId),
    optimisticUpdate: ({ postId }) => {
      queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) => {
        if (!old) return old;
        return old.map((post) => {
          if (post.id !== postId) return post;
          
          const currentVibe = post.vibes.userVibe;
          if (!currentVibe) return post;

          return {
            ...post,
            vibes: {
              ...post.vibes,
              [currentVibe]: Math.max(0, post.vibes[currentVibe] - 1),
              userVibe: null,
            },
          };
        });
      });

      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old;
        const currentVibe = old.vibes.userVibe;
        if (!currentVibe) return old;

        return {
          ...old,
          vibes: {
            ...old.vibes,
            [currentVibe]: Math.max(0, old.vibes[currentVibe] - 1),
            userVibe: null,
          },
        };
      });
    },
    onError: (error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}
```

### 2. Comments

```typescript
// src/hooks/mutations/useCreateComment.ts
import { useOfflineMutation } from '@/hooks/useOfflineMutation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Comment } from '@/types';

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    action: 'create_comment',
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      api.createComment(postId, content),
    optimisticUpdate: ({ postId, content }) => {
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        postId,
        content,
        userId: '', // Will be filled from current user
        createdAt: new Date().toISOString(),
        status: 'sending',
      };

      queryClient.setQueryData<Comment[]>(['comments', postId], (old) => {
        if (!old) return [optimisticComment];
        return [...old, optimisticComment];
      });

      // Update comment count on post
      queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) => {
        if (!old) return old;
        return old.map((post) =>
          post.id === postId
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        );
      });
    },
    onSuccess: (data, { postId }) => {
      // Replace optimistic comment with real one
      queryClient.setQueryData<Comment[]>(['comments', postId], (old) => {
        if (!old) return [data];
        return old.map((comment) =>
          comment.id.startsWith('temp-') ? data : comment
        );
      });
    },
    onError: (error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

### 3. Messages

```typescript
// src/hooks/mutations/useSendMessage.ts
import { useOfflineMutation } from '@/hooks/useOfflineMutation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Message } from '@/types';

export function useSendMessage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  return useOfflineMutation({
    action: 'send_message',
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      api.sendMessage(conversationId, content),
    optimisticUpdate: ({ conversationId, content }) => {
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        content,
        senderId: currentUser?.id || '',
        createdAt: new Date().toISOString(),
        status: 'sending',
      };

      queryClient.setQueryData<Message[]>(['messages', conversationId], (old) => {
        if (!old) return [optimisticMessage];
        return [...old, optimisticMessage];
      });

      // Update conversation last message
      queryClient.setQueriesData<any[]>({ queryKey: ['conversations'] }, (old) => {
        if (!old) return old;
        return old.map((conv) =>
          conv.id === conversationId
            ? { ...conv, lastMessage: optimisticMessage, updatedAt: new Date().toISOString() }
            : conv
        );
      });
    },
    onSuccess: (data, { conversationId }) => {
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old) => {
        if (!old) return [data];
        return old.map((msg) => (msg.id.startsWith('temp-') ? data : msg));
      });
    },
    onError: (error, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
```

---

## Dependencies to Install

```bash
npm install --save-dev vite-plugin-pwa workbox-window
npm install idb
```

---

## Testing Strategy

### Manual Testing Checklist

#### Offline Mode
- [ ] Toggle offline in DevTools Network tab
- [ ] Verify offline indicator appears
- [ ] Like a post while offline → UI updates immediately
- [ ] Comment on post while offline → Comment appears
- [ ] Send message while offline → Message appears
- [ ] Go back online → Verify auto-sync
- [ ] Check all queued actions completed successfully

#### Service Worker
- [ ] Build production app: `npm run build`
- [ ] Serve: `npm run preview`
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker registered
- [ ] Check cache storage populated
- [ ] Toggle offline and navigate app

#### Queue Management
- [ ] Add 10+ actions while offline
- [ ] Verify all queued in IndexedDB
- [ ] Go online and verify sync
- [ ] Check cleanup removes old items (24hr+)

---

## Success Criteria

### Must Have
- ✅ Service worker installed and caching assets
- ✅ Offline indicator visible when offline
- ✅ Vibes work offline with optimistic UI
- ✅ Comments work offline with optimistic UI
- ✅ Messages work offline with optimistic UI
- ✅ Auto-sync on reconnect
- ✅ Queue cleanup (24hr expiry)

### Nice to Have
- ⭐ Background sync API integration
- ⭐ Manual "Sync Now" button
- ⭐ Retry with exponential backoff
- ⭐ Queue size monitoring

---

## Implementation Sessions

### Session 1: Foundation ✅
- Install dependencies
- PWA manifest setup
- Service worker configuration
- IndexedDB queue infrastructure
- Network status hook
- Offline indicator component
- Update header to include indicator

### Session 2: Core Mutations
- useOfflineMutation hook
- Vibes offline support
- Comments offline support
- Update existing mutation hooks

### Session 3: Data & Sync
- Auto-sync system
- Messages offline support
- Posts feed caching
- Activities caching

### Session 4: Settings & Profile
- Account updates with debouncing
- Avatar upload queueing
- Preferences offline support

### Session 5: Polish & Testing
- Queue cleanup logic
- Retry with backoff
- Comprehensive testing
- Documentation updates

---

## Next Steps

1. Start with Session 1: Foundation
2. Install required dependencies
3. Configure PWA plugin in Vite
4. Implement queue system and hooks
5. Add offline indicator to header
6. Test basic offline functionality

---

**Reference Documents:**
- `REBUILD-OFFLINE-MODE-STRATEGY.md` - Detailed offline strategy
- `REBUILD-PROMPTS.md` - Overall project timeline
