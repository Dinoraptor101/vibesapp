# SSE Implementation Plan for Web-V2

## Executive Summary

This document identifies all polling locations in the VibesApp Web-V2 frontend and provides a detailed implementation roadmap for transitioning from polling to Server-Sent Events (SSE).

**Scope:** Reduce API polling by 80-90% and enable real-time updates with minimal latency.

---

## Current Polling Architecture Analysis

### Phase 1: Polling Discovery

All polling in Web-V2 is centralized in React Query hooks with `refetchInterval` parameters.

### Polling Locations Identified

#### 1. **Messaging Feature** (`apps/web-v2/src/features/messaging/`)

**Critical Files:**
- `hooks/useMessagingPolling.ts` (Unified polling manager)
- `hooks/useConversations.ts` 
- `hooks/useConversation.ts`
- `hooks/useDMRequests.ts`
- `hooks/useAutoMarkAsRead.ts` (Mark-as-read logic)

**Current Polling Strategy:**

| Hook | Endpoint | Interval | Frequency | Priority |
|------|----------|----------|-----------|----------|
| `useMessagingPolling()` | `/api/conversations` | 30s | 2/min | Medium |
| `useMessagingPolling()` | `/api/conversation/:id` | 30s | 2/min | **HIGH** |
| `useConversations()` | `/api/conversations` | 30s | 2/min | Medium |
| `useConversation()` | `/api/conversation/:id` | 30s | 2/min | **HIGH** |
| `useDMRequests()` | `/api/dm-requests` | 30s | 2/min | Low |
| `useAutoMarkAsRead()` | Poll + mutation | On trigger | On-demand | Medium |

**Entry Points (Components Using These):**
- `ConversationView.tsx` - Main messaging interface
- `MessagingPage.tsx` - Messages list page
- `TopNav.tsx` - Unread badge display

**Data Models:**
```typescript
Conversation: {
  _id: string
  user1Id: string
  user2Id: string
  messages: Message[]
  lastMessage: Message
  createdAt: Date
}

Message: {
  _id: string
  conversationId: string
  senderId: string
  text: string
  isRead: boolean
  createdAt: Date
}
```

---

#### 2. **Activity Feed Feature** (`apps/web-v2/src/features/activity/`)

**Critical Files:**
- `hooks/useActivities.ts` - Main activities hook
- `hooks/useActivities.ts::useUnreadCounts()` - Badge display
- `hooks/useActivities.ts::useHasUnread()` - Boolean check
- `hooks/useActivities.ts::useMarkAsRead()` - Mark read mutation

**Current Polling Strategy:**

| Hook | Endpoint | Interval | Frequency | Priority |
|------|----------|----------|-----------|----------|
| `useActivities()` | `/api/activities` | 30s | 2/min | **HIGH** |
| `useUnreadCounts()` | `/api/activities/counts` | 30s | 2/min | **HIGH** |
| `useHasUnread()` | `/api/activities/has-unread` | 30s | 2/min | Medium |

**Entry Points (Components Using These):**
- `ActivityPage.tsx` - Full activity feed
- `TopNav.tsx` - Unread activity badge
- Various components - Activity notifications

**Data Models:**
```typescript
Activity: {
  _id: string
  userId: string
  type: 'like' | 'comment' | 'follow' | 'message' | 'post'
  relatedId: string (postId, userId, etc.)
  isRead: boolean
  readAt?: Date
  createdAt: Date
}

ActivityCount: {
  all: number
  messages: number
  social: number
  me: number
}
```

---

#### 3. **Other Features** (Low Priority, No Active Polling)

| Feature | Polling? | Notes |
|---------|----------|-------|
| Posts Feed | ❌ No | Infinite scroll, on-demand fetching |
| Profile | ❌ No | Cached for 15 minutes, refetch on focus |
| Search | ❌ No | Triggered by user input, debounced |
| Settings | ❌ No | Batch updates every 300ms |

---

## Load Distribution: Pre-SSE

### Current Load Breakdown

```
Total Polling Requests (5,000 DAU peak):

Messaging:
├─ Conversations list (30s): 2 req/min × 5,000 users = 10,000 req/min
└─ Active conversation (30s): 2 req/min × 3,200 active = 6,400 req/min
   Subtotal: 16,400 req/min (55% of total load)

Activities:
├─ Activities list (30s): 2 req/min × 4,000 users = 8,000 req/min
├─ Unread counts (30s): 2 req/min × 5,000 users = 10,000 req/min
└─ Has unread (30s): 2 req/min × 2,000 users = 4,000 req/min
   Subtotal: 22,000 req/min (74% of total load)

Profile/Other: 1,600 req/min (5% of total load)

TOTAL: 40,000 req/min = 667 req/sec
```

---

## Implementation Roadmap: SSE Migration

### Phase 1: Backend Foundation (Week 1-2)

**Goal:** Create SSE infrastructure that can accept client connections and broadcast events.

#### 1.1 Create SSE Connection Manager
**File:** `apps/api/src/handlers/sseManager.js` (NEW)

```
Purpose: Manage all active SSE connections
Responsibilities:
- addClient(userId, response)
- removeClient(userId)
- broadcast(userId, eventType, data)
- isConnected(userId)
- broadcastToMultiple(userIds, eventType, data)

Size Estimate: 150-200 lines
Complexity: Low
Dependencies: None (pure connection management)
```

#### 1.2 Create SSE Endpoint
**File:** `apps/api/src/routes/sse.js` (NEW)

```
Purpose: Accept SSE connections from frontend
Routes:
- GET /api/sse/connect (establish connection)
- Optional: GET /api/sse/status (check connection health)

Size Estimate: 100-150 lines
Complexity: Low
Dependencies: authenticate middleware, sseManager
```

#### 1.3 Hook Existing API Endpoints
**Files to Modify:**
- `apps/api/src/routes/message.js` 
  - When message created: broadcast to recipient
  - Load: ~50 lines added
  
- `apps/api/src/routes/activity.js` (NEW or existing)
  - When activity created: broadcast to user
  - Load: ~80 lines added
  
- `apps/api/src/routes/dm-requests.js`
  - When DM request status changes: broadcast
  - Load: ~40 lines added

**Broadcast Locations:**
```
Event: new-message
Trigger: POST /api/messages/:conversationId
Data: { conversationId, message }
Recipients: Both conversation users

Event: activity-update
Trigger: Any activity creation
Data: { type, activity }
Recipients: Activity owner

Event: dm-request-update
Trigger: DM request status change
Data: { requestId, status }
Recipients: Both users

Event: read-status
Trigger: Message marked as read
Data: { conversationId, readAt }
Recipients: Other conversation user
```

---

### Phase 2: Frontend Hook Creation (Week 2-3)

**Goal:** Create SSE listening infrastructure on frontend without removing polling yet.

#### 2.1 Create Core SSE Hook
**File:** `apps/web-v2/src/hooks/useSSE.ts` (NEW)

```typescript
Purpose: Establish and manage SSE connection lifecycle
Responsibilities:
- Connect to SSE endpoint on mount
- Route incoming events to appropriate handlers
- Reconnect on network failure
- Close connection on unmount

Size Estimate: 150-200 lines
Complexity: Medium
Dependencies: useAuth, useQueryClient, queryClient
Key Feature: Integrates with React Query cache for automatic UI updates
```

#### 2.2 Create Feature-Specific SSE Adapters

**Messaging SSE Adapter**
- File: `apps/web-v2/src/features/messaging/hooks/useMessagingSSE.ts` (NEW)
- Purpose: Listen to message and conversation events
- Update: React Query cache with new messages
- Size: 100-120 lines

**Activity SSE Adapter**
- File: `apps/web-v2/src/features/activity/hooks/useActivitySSE.ts` (NEW)
- Purpose: Listen to activity and unread count events
- Update: React Query cache with activities
- Size: 100-120 lines

**DM Requests SSE Adapter**
- File: `apps/web-v2/src/features/messaging/hooks/useDMRequestsSSE.ts` (NEW)
- Purpose: Listen to DM request status changes
- Update: React Query cache with request status
- Size: 80-100 lines

---

### Phase 3: Hybrid Operation (Week 3-4)

**Goal:** Run polling + SSE in parallel, allowing gradual migration and fallback.

#### 3.1 Update Query Hooks (No-Op Changes for Fallback)

**Modify Files:**
- `apps/web-v2/src/features/messaging/hooks/useMessagingPolling.ts`
  - Add flag: `if (USE_SSE) { disable refetchInterval }`
  - Change: 10 lines added
  
- `apps/web-v2/src/features/activity/hooks/useActivities.ts`
  - Add flag: `if (USE_SSE) { disable refetchInterval }`
  - Change: 10 lines added

**Configuration:**
```env
# .env
REACT_APP_USE_SSE=false  # Toggle SSE on/off per environment
```

#### 3.2 Update Components to Use SSE Hooks

**Messaging Component Updates:**
```
ConversationView.tsx:
- ADD: useMessagingSSE() call
- KEEP: useMessagingPolling() (fallback)
- Logic: If SSE connected, use it; else polling takes over

MessagingPage.tsx:
- ADD: useMessagingSSE() call
- KEEP: useConversations() (fallback)
```

**Activity Component Updates:**
```
ActivityPage.tsx:
- ADD: useActivitySSE() call
- KEEP: useActivities() (fallback)

TopNav.tsx:
- ADD: useActivitySSE() call
- KEEP: useUnreadCounts() (fallback)
```

---

### Phase 4: Testing & Monitoring (Week 4)

#### 4.1 Backend Testing
- Load test SSE with 1,000 concurrent connections
- Broadcast 100 messages/second
- Monitor CPU, memory, connection pool

#### 4.2 Frontend Testing
- Test SSE connection in multiple scenarios:
  - Normal operation
  - Network interrupt (WiFi → 4G)
  - Connection timeout (5+ minutes idle)
  - Multiple browser tabs
- Verify React Query cache updates correctly

#### 4.3 Canary Deployment
```
Day 1: Deploy backend SSE (no frontend changes)
Day 2-3: Enable SSE for 10% of users (REACT_APP_USE_SSE=true)
Day 4-5: Monitor metrics:
  - SSE connection success rate (target: >99%)
  - Message latency (target: <100ms)
  - CPU usage (target: <5% increase)
  - Error rate (target: <0.1%)
Day 6-7: Expand to 50% if metrics healthy
Week 2: Full rollout to 100%
```

---

## Detailed Implementation Checklist

### Backend Implementation (Priority Order)

#### Week 1

- [ ] **1.1.1** Create `apps/api/src/handlers/sseManager.js`
  - [ ] Implement `addClient(userId, response)`
  - [ ] Implement `removeClient(userId)`
  - [ ] Implement `broadcast(userId, eventType, data)`
  - [ ] Add connection validation
  - [ ] Add logging for debugging

- [ ] **1.1.2** Create `apps/api/src/routes/sse.js`
  - [ ] Implement GET `/api/sse/connect` endpoint
  - [ ] Add authentication middleware
  - [ ] Add SSE headers (Content-Type, Cache-Control, etc.)
  - [ ] Handle client disconnect
  - [ ] Send initial "connected" event

- [ ] **1.1.3** Test SSE connection
  - [ ] Manual browser test (DevTools Network tab)
  - [ ] Verify connection stays open
  - [ ] Verify EventSource connection type
  - [ ] Check memory usage doesn't spike

#### Week 2

- [ ] **1.2.1** Hook message endpoint
  - [ ] Find POST `/api/messages` (or `/api/dm/send`)
  - [ ] Add sseManager.broadcast() call after DB save
  - [ ] Verify both conversation users receive push
  - [ ] Add error handling

- [ ] **1.2.2** Hook activity endpoint
  - [ ] Find POST endpoint that creates activities
  - [ ] Add sseManager.broadcast() call
  - [ ] Verify activity user receives push
  - [ ] Add error handling

- [ ] **1.2.3** Hook DM requests endpoint
  - [ ] Find POST/PATCH for DM request status
  - [ ] Add sseManager.broadcast() calls
  - [ ] Test status change push

- [ ] **1.2.4** Hook read/unread endpoints
  - [ ] Find PUT endpoint for marking messages read
  - [ ] Add sseManager.broadcast() to conversation partner
  - [ ] Test broadcast to other user

### Frontend Implementation (Priority Order)

#### Week 2-3

- [ ] **2.1.1** Create core SSE hook
  - [ ] File: `apps/web-v2/src/hooks/useSSE.ts`
  - [ ] Implement connection logic
  - [ ] Implement event routing
  - [ ] Implement error handling + auto-reconnect
  - [ ] Add DevTools logging

- [ ] **2.1.2** Create messaging SSE adapter
  - [ ] File: `apps/web-v2/src/features/messaging/hooks/useMessagingSSE.ts`
  - [ ] Listen to 'new-message' events
  - [ ] Update React Query cache
  - [ ] Trigger UI re-render

- [ ] **2.1.3** Create activity SSE adapter
  - [ ] File: `apps/web-v2/src/features/activity/hooks/useActivitySSE.ts`
  - [ ] Listen to 'activity-update' events
  - [ ] Update React Query cache
  - [ ] Update unread counts

- [ ] **2.1.4** Create DM requests SSE adapter
  - [ ] File: `apps/web-v2/src/features/messaging/hooks/useDMRequestsSSE.ts`
  - [ ] Listen to 'dm-request-update' events
  - [ ] Update cache

#### Week 3

- [ ] **3.1.1** Add SSE toggle to polling hooks
  - [ ] Modify `apps/web-v2/src/features/messaging/hooks/useMessagingPolling.ts`
  - [ ] Add conditional disable: `if (USE_SSE) disable refetchInterval`
  - [ ] Add feature flag: `REACT_APP_USE_SSE`

- [ ] **3.1.2** Add SSE toggle to activity hooks
  - [ ] Modify `apps/web-v2/src/features/activity/hooks/useActivities.ts`
  - [ ] Add conditional disable
  - [ ] Test polling still works if SSE disabled

- [ ] **3.2.1** Update ConversationView component
  - [ ] Add `useMessagingSSE()` call
  - [ ] Keep `useMessagingPolling()` (fallback)
  - [ ] Test both work independently

- [ ] **3.2.2** Update ActivityPage component
  - [ ] Add `useActivitySSE()` call
  - [ ] Keep `useActivities()` (fallback)
  - [ ] Test in TopNav (badge display)

---

## File Organization Overview

```
Backend Addition:
apps/api/src/
├── handlers/
│   └── sseManager.js (NEW)
│
└── routes/
    └── sse.js (NEW)
    
Modified files:
- routes/message.js (add broadcast calls)
- routes/activity.js (add broadcast calls)
- routes/dm-requests.js (add broadcast calls)

Frontend Addition:
apps/web-v2/src/
├── hooks/
│   └── useSSE.ts (NEW - Core SSE manager)
│
└── features/
    ├── messaging/
    │   └── hooks/
    │       ├── useMessagingSSE.ts (NEW)
    │       ├── useDMRequestsSSE.ts (NEW)
    │       └── useMessagingPolling.ts (MODIFIED)
    │
    └── activity/
        └── hooks/
            ├── useActivitySSE.ts (NEW)
            └── useActivities.ts (MODIFIED)
```

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| SSE connection failures | Users miss real-time updates | Auto-fallback to polling, retry logic |
| Memory leak in SSE manager | Server crash at scale | Connection cleanup on client disconnect |
| Browser compatibility | IE users can't connect | Graceful fallback, polling always available |
| Network connection drops | SSE closes unexpectedly | Browser auto-reconnect (built-in) |
| Backward compatibility | Old clients break | Feature flag allows toggle |
| Database connection pool exhaustion | Queries fail under load | Optimize polling + broadcasting queries |

---

## Metrics to Track (Post-Deployment)

### Backend Metrics

```
- SSE active connections (target: matches DAU)
- Connection success rate (target: >99%)
- Average message broadcast latency (target: <50ms)
- Memory usage per connection (target: <5KB)
- CPU usage (target: <5% increase)
- Error rate (target: <0.1%)
```

### Frontend Metrics

```
- SSE connection establishment time (target: <500ms)
- Message latency (target: <100ms)
- Message delivery success rate (target: >99.9%)
- Auto-reconnect attempts (target: <1 per session)
- Fallback to polling rate (target: <1%)
```

---

## Rollback Plan

If SSE causes issues:

```
Immediate (1 minute):
1. Set REACT_APP_USE_SSE=false in build
2. Rebuild and deploy frontend
3. Users automatically fallback to polling
4. No backend changes needed

Short-term (1 day):
1. Disable backend SSE endpoints
2. Remove sseManager from active code paths
3. Verify polling handles all users

Long-term:
1. Post-mortem on what failed
2. Fix issue in branch
3. Re-test locally before re-deploy
```

---

## Success Criteria

- [ ] SSE can handle 5,000+ concurrent connections
- [ ] Message latency reduced from 15s (polling) to <100ms (SSE)
- [ ] Backend CPU usage stays below 80% with same DAU
- [ ] Zero data loss (all events delivered)
- [ ] Graceful degradation if SSE fails (polling fallback)
- [ ] Smooth rollout: 10% → 50% → 100% without incidents
- [ ] User-facing metrics: Instant message delivery, 99.9%+ uptime

---

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Backend** | Week 1-2 | SSE manager, endpoints, integration |
| **Phase 2: Frontend** | Week 2-3 | SSE hooks, adapters, feature flag |
| **Phase 3: Hybrid** | Week 3-4 | Component updates, fallback logic |
| **Phase 4: Testing** | Week 4 | Load testing, canary deployment |
| **Rollout** | Week 5+ | 10% → 50% → 100% gradual release |

**Total Estimated Effort:** 4-6 weeks (2-3 developers)

---

## References

- Existing: `/docs/Web-v2/SCALING/03-SSE-MIGRATION-GUIDE.md` (detailed code examples)
- Existing: `/docs/Web-v2/SCALING/04-SSE-EXPLAINED.md` (concepts & mental models)
- Existing: `/docs/Web-v2/SCALING/05-SSE-WITH-GITHUB-PAGES.md` (architecture validation)

---

## Next Steps

1. **Review this plan** with team for feasibility
2. **Allocate resources:** 2-3 engineers for 4-6 weeks
3. **Start Phase 1** (backend SSE manager)
4. **Set up monitoring** before implementation
5. **Create feature branch** for SSE work
6. **Weekly sync-ups** to track progress
