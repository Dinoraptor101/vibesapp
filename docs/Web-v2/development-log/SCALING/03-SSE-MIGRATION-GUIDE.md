# Server-Sent Events (SSE) Migration Guide

## Why SSE Before WebSockets?

| Feature | Polling | SSE | WebSocket |
|---------|---------|-----|-----------|
| **Complexity** | ⭐ Simple | ⭐⭐ Medium | ⭐⭐⭐ Complex |
| **Capacity (DAU)** | 5-15k | 20-40k | 50k+ |
| **Bandwidth** | ❌ High | ✅ 70% less | ✅ 80% less |
| **Backend Effort** | None | 2-3 weeks | 4-6 weeks |
| **Cost** | $50/mo | $50/mo | $50/mo |
| **Deployment Risk** | Low | Medium | High |
| **Backwards Compat** | N/A | ✅ Can run in parallel | ❌ Full rewrite |

**Recommendation:** Use SSE to bridge 5k-40k DAU range. Move to WebSockets when hitting 40k DAU or needing bi-directional messaging.

---

## SSE Architecture Overview

### How It Works

```
POLLING (Current):
Client → [5s poll] → Server
Client → [5s poll] → Server  
Client → [5s poll] → Server
(Many redundant requests, most return "no change")

SSE (Proposed):
Client → [TCP connection established] → Server
                                    ↓
                        [Server pushes update immediately]
                        [Server pushes update immediately]
                        (Only when data actually changes)
```

### Capacity Improvement Math

```
Current (Polling at 5s):
- 5,000 DAU, 3,200 active
- Each user: 12 requests/min
- Total: 38,400 requests/min = 640 requests/sec

With SSE (no polling):
- Same 5,000 DAU
- Average: ~1-2 messages/min per user
- Total: 3,200-6,400 messages/min = 53-107 messages/sec
- Improvement: 6-12x reduction in server load
```

---

## Implementation Roadmap

### Phase 1: Backend Setup (1 week)

**Step 1: Create SSE Connection Manager**

```javascript
// apps/api/src/handlers/sseManager.js

class SSEManager {
  constructor() {
    this.clients = new Map(); // userId -> response
  }

  addClient(userId, response) {
    this.clients.set(userId, response);
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
  }

  removeClient(userId) {
    const response = this.clients.get(userId);
    if (response) {
      response.end();
      this.clients.delete(userId);
    }
  }

  broadcast(userId, event, data) {
    const response = this.clients.get(userId);
    if (response && !response.writableEnded) {
      response.write(`event: ${event}\n`);
      response.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }

  isConnected(userId) {
    return this.clients.has(userId);
  }
}

module.exports = new SSEManager();
```

**Step 2: Create SSE Endpoint**

```javascript
// apps/api/src/routes/sse.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const sseManager = require('../handlers/sseManager');

// Establish SSE connection
router.get('/connect', authenticate, (req, res) => {
  const userId = req.user._id;
  
  console.log(`SSE client connected: ${userId}`);
  
  sseManager.addClient(userId, res);

  // Send initial "connected" message
  res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

  // Send initial state (conversations, activities)
  sendInitialState(userId, res);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`SSE client disconnected: ${userId}`);
    sseManager.removeClient(userId);
  });
});

async function sendInitialState(userId, res) {
  try {
    const conversations = await Conversation.find({ userId });
    const activities = await Activity.find({ userId }).limit(50);
    
    res.write(`event: initial-state\ndata: ${JSON.stringify({
      conversations,
      activities
    })}\n\n`);
  } catch (error) {
    console.error('Error sending initial state:', error);
  }
}

module.exports = router;
```

**Step 3: Hook Up Data Change Events**

```javascript
// apps/api/src/routes/message.js (existing)

const sseManager = require('../handlers/sseManager');

// When message is sent
router.post('/:conversationId', authenticate, async (req, res) => {
  // ... existing message creation logic ...
  
  // NEW: Push to SSE clients
  const conversation = await Conversation.findById(conversationId);
  
  // Notify both participants
  sseManager.broadcast(conversation.user1Id, 'new-message', {
    conversationId,
    message: newMessage
  });
  
  sseManager.broadcast(conversation.user2Id, 'new-message', {
    conversationId,
    message: newMessage
  });
  
  res.json({ success: true });
});
```

### Phase 2: Frontend Setup (1 week)

**Step 1: Create SSE Hook**

```typescript
// apps/web-v2/src/hooks/useSSE.ts

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';

export function useSSE() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    // Connect to SSE endpoint
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/sse/connect`,
      { withCredentials: true }
    );

    // Handle different event types
    eventSource.addEventListener('connected', (event) => {
      console.log('SSE Connected:', event.data);
    });

    eventSource.addEventListener('initial-state', (event) => {
      const data = JSON.parse(event.data);
      // Update React Query cache with initial state
      queryClient.setQueryData(['conversations', user._id], data.conversations);
      queryClient.setQueryData(['activities', user._id], data.activities);
    });

    eventSource.addEventListener('new-message', (event) => {
      const { conversationId, message } = JSON.parse(event.data);
      
      // Update conversation in cache
      queryClient.setQueryData(
        ['conversation', conversationId],
        (old: any) => ({
          ...old,
          messages: [...(old?.messages || []), message]
        })
      );
    });

    eventSource.addEventListener('activity-update', (event) => {
      const activity = JSON.parse(event.data);
      
      // Add activity to cache
      queryClient.setQueryData(
        ['activities', user._id],
        (old: any[]) => [activity, ...(old || [])]
      );
    });

    eventSource.addEventListener('error', (event) => {
      console.error('SSE Error:', event);
      eventSource.close();
      // Fallback to polling after SSE failure
    });

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
    };
  }, [user?._id, queryClient]);
}
```

**Step 2: Replace Polling Hooks**

```typescript
// apps/web-v2/src/features/messaging/hooks/useMessagingSSE.ts

import { useQuery } from '@tanstack/react-query';
import { useSSE } from '@/hooks/useSSE';
import { getConversations, getConversation } from '../api/dmService';

export function useMessagingSSE() {
  const { user } = useAuth();
  
  // Initialize SSE connection
  useSSE();

  // Light queries (no polling, SSE provides updates)
  const conversationsQuery = useQuery({
    queryKey: ['conversations', user?._id],
    queryFn: () => getConversations(user!._id),
    enabled: !!user?._id,
    staleTime: Infinity, // SSE handles freshness
    refetchInterval: false, // No polling needed
  });

  return {
    conversations: conversationsQuery.data ?? [],
    isLoading: conversationsQuery.isLoading,
    error: conversationsQuery.error,
  };
}
```

### Phase 3: Parallel Rollout (1 week)

Run both polling and SSE simultaneously:

```typescript
// apps/web-v2/src/app/providers.tsx

const USE_SSE = process.env.REACT_APP_USE_SSE === 'true';

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {USE_SSE ? <SSEProvider /> : null}
      {children}
    </QueryClientProvider>
  );
}
```

**Rollout:**
1. Deploy SSE backend to single dyno (no change to production)
2. Enable SSE for 10% of users (canary release)
3. Monitor metrics: response times, error rates, user reports
4. Expand to 50% after 1 week
5. Full rollout after 2 weeks if stable

**Rollback:** If issues arise, set `REACT_APP_USE_SSE=false` and users fall back to polling

---

## Expected Results

### Performance Improvements

```
BEFORE (Polling):
- Peak requests/sec: 514 (at 5k DAU)
- Avg response time: 150ms
- P95 response time: 300ms
- Bandwidth: 27 MB/sec outbound

AFTER (SSE):
- Peak requests/sec: 80 (same 5k DAU)
- Avg response time: 50ms
- P95 response time: 100ms
- Bandwidth: 3 MB/sec outbound

Improvement:
- 6-8x fewer requests
- 75% less bandwidth
- 3x faster responses
- Single Standard dyno can handle 30k-40k DAU
```

### User Experience Impact

- Messages appear instantly (< 50ms vs 5s polling delay)
- Activities update in real-time
- Less battery drain on mobile
- More responsive UI

---

## Monitoring SSE Health

```javascript
// apps/api/src/middleware/sseMetrics.js

const prometheus = require('prom-client');

const sseConnections = new prometheus.Gauge({
  name: 'sse_active_connections',
  help: 'Number of active SSE connections'
});

const sseMessagesPerSecond = new prometheus.Counter({
  name: 'sse_messages_total',
  help: 'Total SSE messages sent'
});

// Monitor SSE manager
setInterval(() => {
  sseConnections.set(sseManager.clients.size);
}, 5000);
```

**Alert thresholds:**
- Active connections > 3000: Consider load balancing
- Message latency > 1000ms: Check network/database
- Client disconnect rate > 5%: Investigate stability

---

## Cost-Benefit Analysis

### Development Cost
- Backend: 40-50 hours (~$2k-4k)
- Frontend: 30-40 hours (~$1.5k-3k)
- Testing/DevOps: 20 hours (~$1k)
- **Total: 3-4 weeks, $4.5k-8k**

### Operational Cost
- No infrastructure change
- Same $50/month Heroku cost
- Optional Redis: +$15-30/mo for connection management

### Capacity Gained
- Current: 5-15k DAU
- After SSE: 20-40k DAU
- **Value: 25k more users for $0 infrastructure cost**

### ROI
- If each user worth $1/month → $25k potential monthly revenue at capacity
- Engineering cost: One-time $5k investment
- Payoff: Reached at 5,000+ additional DAU

---

## Fallback Strategy

If SSE causes issues:

```typescript
// Automatic fallback
if (sseManager.errorCount > threshold) {
  // Disable SSE, fall back to polling
  localStorage.setItem('disable_sse', 'true');
  window.location.reload();
}
```

**Will not cause data loss** — polling still works as before.

---

## Next Steps

1. **Start:** Create SSE backend handlers (Phase 1, Week 1)
2. **Test:** Load test SSE with 1k concurrent connections
3. **Pilot:** Deploy to staging, test with internal team
4. **Rollout:** Canary release to 10% of users
5. **Monitor:** Track metrics for 2 weeks before full deployment
6. **Optimize:** Tune connection limits, message frequency, heartbeat interval

**Timeline: 3-4 weeks to full production deployment**

---

## Resources

- MDN: Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- Node.js SSE: https://github.com/EventSource/eventsource
- Socket.IO Comparison: https://socket.io/docs/v4/socket-io-vs-alternatives/
- Performance Testing: https://github.com/loadimpact/k6
