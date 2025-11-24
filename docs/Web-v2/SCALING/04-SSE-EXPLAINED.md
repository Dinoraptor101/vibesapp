# Server-Sent Events (SSE) Explained: From Polling to Push

## The Problem: Why Polling Sucks at Scale

### Current Polling Architecture (What You Have Now)

```
Timeline: User is viewing messages
Time 0:00  Client: "Server, give me new messages"
           Server: "No new messages"
           
Time 0:30  Client: "Server, give me new messages"
           Server: "No new messages"
           
Time 1:00  Client: "Server, give me new messages"
           Server: "No new messages"
           
Time 1:30  Client: "Server, give me new messages"
           Server: "No new messages"
           
Time 2:00  Client: "Server, give me new messages"
           Server: "No new messages"
           
Time 2:30  Friend sends a message!
           Client: "Server, give me new messages"
           Server: "New message from friend!" ← Client sees it now

Total requests: 6 requests
Actual data sent: 5 empty responses + 1 with data = 95% wasted traffic
```

**The waste:** You're asking the server "anything new?" every 30 seconds whether or not anything actually changed.

---

## The Solution: Server-Sent Events (SSE)

### How SSE Works

```
Timeline: User connects with SSE
Time 0:00  Client: "I'm listening for updates" [connection stays open]
           Server: [acknowledges connection]
           
Time 0:30  [nothing happens - no network activity]
Time 1:00  [nothing happens - no network activity]
Time 1:30  [nothing happens - no network activity]
Time 2:00  [nothing happens - no network activity]
Time 2:30  Friend sends a message!
           Server: [immediately pushes message] ← Instant!
           Client: Receives message instantly

Total requests: 1 connection (stays open)
Actual data sent: 1 message when it happens
Waste: 0% - only data that matters is sent
```

---

## The Mental Model: Think of It Like a Newspaper Subscription

### Polling = Going to the Store Every Day
```
You: "Do you have today's newspaper?"
Shopkeeper: "No"

You: (next day) "Do you have today's newspaper?"
Shopkeeper: "No"

You: (next day) "Do you have today's newspaper?"
Shopkeeper: "No"

You: (next day) "Do you have today's newspaper?"
Shopkeeper: "Yes! Here it is."
```
**Cost:** Gas for 4 trips to find 1 newspaper

### SSE = Newspaper Delivered to Your Door
```
You: "Subscribe me to newspaper delivery"
Shopkeeper: "Done. I'll deliver when ready"

[Shopkeeper delivers newspaper next day]
[Then delivers newspaper the next day]
[Then delivers newspaper the next day]
```
**Cost:** One delivery person handles 1000 subscriptions

---

## How SSE Actually Works in Code

### What Happens in the Browser (Frontend)

```javascript
// Step 1: Create a connection to the server
const eventSource = new EventSource('/api/sse/connect');

// Step 2: Listen for updates from the server
eventSource.addEventListener('new-message', (event) => {
  const message = JSON.parse(event.data);
  console.log('Got new message:', message);
  // Update UI with new message
});

// Step 3: Server can send updates anytime
// The browser automatically receives them
```

**That's it.** The browser keeps one connection open and the server can push data through it whenever it wants.

### What Happens on the Server (Backend)

```javascript
// Step 1: User connects to SSE endpoint
app.get('/api/sse/connect', authenticate, (req, res) => {
  const userId = req.user._id;
  
  // Set special headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  
  // Store this connection so we can send to it later
  activeConnections.set(userId, res);
  
  console.log(`User ${userId} connected via SSE`);
  
  // Tell the client: "I'm ready"
  res.write('event: connected\ndata: {"status":"ready"}\n\n');
});

// Step 2: Later, when something happens (friend sends message)
app.post('/api/messages', authenticate, async (req, res) => {
  const message = await Message.create(req.body);
  
  // Get the recipient's SSE connection
  const recipientConnection = activeConnections.get(message.recipientId);
  
  if (recipientConnection) {
    // PUSH the message to them immediately
    recipientConnection.write(
      `event: new-message\ndata: ${JSON.stringify(message)}\n\n`
    );
  }
  
  res.json({ success: true });
});
```

---

## Understanding SSE Message Format

### The Format (Server → Client)

```
event: event-name
data: {"key":"value"}

```

**Example 1: New message**
```
event: new-message
data: {"conversationId":"123","text":"Hey!","senderId":"user-456"}

```

**Example 2: Notification**
```
event: activity-update
data: {"type":"like","postId":"789","count":42}

```

**Example 3: User came online**
```
event: user-online
data: {"userId":"user-123","status":"active"}

```

**Why the blank line at the end?** It signals to the browser "this message is complete, process it now."

### How the Browser Receives It

```javascript
// You can listen for specific event types
eventSource.addEventListener('new-message', (event) => {
  console.log(event.data); // Raw string: '{"conversationId":"123"...}'
  const data = JSON.parse(event.data); // Parse to object
});

eventSource.addEventListener('activity-update', (event) => {
  const data = JSON.parse(event.data);
});

// Or catch all events
eventSource.onmessage = (event) => {
  console.log('Got update:', event.data);
};

// Handle errors
eventSource.onerror = (event) => {
  console.error('SSE connection error');
  eventSource.close(); // Close the connection
};
```

---

## Practical Example: Messaging with SSE

### Step 1: User Opens Messaging Page

**Browser code:**
```typescript
// apps/web-v2/src/hooks/useSSE.ts
export function useSSE() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?._id) return;

    // Step 1: Create connection
    const eventSource = new EventSource(
      `${API_URL}/api/sse/connect`,
      { withCredentials: true } // Include cookies for auth
    );

    // Step 2: Handle new messages
    eventSource.addEventListener('new-message', (event) => {
      const { conversationId, message } = JSON.parse(event.data);
      
      // Update React Query cache so component re-renders
      queryClient.setQueryData(
        ['conversation', conversationId],
        (oldData) => ({
          ...oldData,
          messages: [...oldData.messages, message]
        })
      );
    });

    // Step 3: Clean up when component unmounts
    return () => eventSource.close();
  }, [user?._id]);
}
```

**Component that uses it:**
```typescript
export function MessagingPage() {
  useSSE(); // Set up SSE connection
  
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/api/conversations'),
    // NOTE: No refetchInterval! SSE provides updates
  });

  return (
    <div>
      {conversations.map(conv => (
        <Conversation key={conv.id} data={conv} />
      ))}
    </div>
  );
}
```

### Step 2: Friend Sends a Message

**Backend code:**
```javascript
// apps/api/src/routes/message.js
app.post('/:conversationId/messages', authenticate, async (req, res) => {
  const { text } = req.body;
  const userId = req.user._id;
  const conversationId = req.params.conversationId;

  // Step 1: Save message to database
  const message = await Message.create({
    conversationId,
    senderId: userId,
    text,
    createdAt: new Date(),
  });

  // Step 2: Find conversation
  const conversation = await Conversation.findById(conversationId);
  
  // Step 3: Push message to BOTH users via SSE
  const sseManager = require('../handlers/sseManager');
  
  sseManager.broadcast(conversation.user1Id, 'new-message', {
    conversationId,
    message: {
      id: message._id,
      text: message.text,
      senderId: userId,
      createdAt: message.createdAt,
    }
  });

  sseManager.broadcast(conversation.user2Id, 'new-message', {
    conversationId,
    message: {
      id: message._id,
      text: message.text,
      senderId: userId,
      createdAt: message.createdAt,
    }
  });

  res.json({ success: true, message });
});
```

**What the user sees:**
- Message appears instantly (no 30-second wait)
- Other tabs also get the update automatically
- Server only sent data once, not 6+ times per minute

---

## SSE vs Polling vs WebSockets: Side-by-Side Comparison

### Polling (Current)

```javascript
// Browser asks every 30 seconds
setInterval(async () => {
  const messages = await fetch('/api/conversations');
  // Update UI
}, 30000);
```

**Pros:**
- Simple to implement
- Works everywhere
- Can run on static servers (GitHub Pages sends requests to backend)

**Cons:**
- Wasteful (empty responses)
- High latency (30s delay for updates)
- High server load at scale
- 500+ req/sec for 5k users

---

### SSE (Middleground)

```javascript
// Browser connects once, server pushes updates
const sse = new EventSource('/api/sse/connect');
sse.addEventListener('new-message', (event) => {
  // Instant update from server
});
```

**Pros:**
- Simple to implement (easier than WebSockets)
- Instant updates (no delay)
- Low bandwidth (only data that matters)
- Server can handle 20k-40k users on same infrastructure
- Works with HTTP/1.1 and HTTP/2
- Great for "server → client" only (notifications, feed updates)

**Cons:**
- One-way communication (server → client only)
- Doesn't work in older browsers (IE)
- Requires keeping connections open

---

### WebSockets (Full Power)

```javascript
// Bi-directional communication
const ws = new WebSocket('wss://api.example.com/socket');

ws.onmessage = (event) => {
  // Server sends to client
};

ws.send(JSON.stringify({ /* client sends to server */ }));
```

**Pros:**
- Bi-directional (client ↔ server instantly)
- Lowest latency and bandwidth
- Can handle 50k+ users
- Full real-time protocol

**Cons:**
- Complex to implement correctly
- Requires different backend (Socket.IO, etc.)
- More DevOps infrastructure
- Overkill if you only need server → client

---

## Real Numbers: Load Comparison

### Scenario: 5,000 Active Users, 30-minute average session

| Metric | Polling (30s) | SSE | WebSocket |
|--------|--------------|-----|-----------|
| **Total connections** | 0 (stateless) | 5,000 | 5,000 |
| **Requests/sec** | 640 | ~10 | ~10 |
| **Bandwidth/sec** | 27 MB/sec | 2 MB/sec | 2 MB/sec |
| **Server CPU** | 80% | 15% | 12% |
| **Heroku dyno capacity** | 5-8k DAU | 20-40k DAU | 50k+ DAU |
| **Message latency** | 15s average | <100ms | <50ms |
| **Backend complexity** | Low | Medium | High |
| **Implementation time** | Done | 2-3 weeks | 4-6 weeks |

---

## How to Know When You Need SSE

### Warning Signs:

1. **Response times > 300ms** at peak hours
2. **Heroku dyno CPU > 80%** sustained
3. **User complaints about delayed messages** (30s behind)
4. **Database connection pool warnings**
5. **Approaching 8,000-10,000 DAU**

### Decision Tree:

```
Current DAU?
├─ < 5,000
│  └─ Don't implement SSE yet, stick with polling
│
├─ 5,000 - 10,000
│  ├─ Response times < 200ms?
│  │  └─ Optimize polling first (increase intervals)
│  │
│  └─ Response times > 300ms?
│     └─ Start SSE implementation (2-3 week project)
│
└─ > 10,000
   └─ SSE is mandatory
      (Polling won't handle the load)
```

---

## Common SSE Gotchas and How to Avoid Them

### Gotcha 1: Connection Limits

**Problem:** Operating systems limit open connections (~1,000 per process)

**Solution:** 
```javascript
// Run multiple Node.js processes behind load balancer
// Each process handles ~1,000 connections
// 3 processes = ~3,000 connections capacity
```

### Gotcha 2: Network Interruptions

**Problem:** WiFi drops, user closes laptop, connection dies

**Solution:**
```javascript
eventSource.onerror = () => {
  // Browser automatically tries to reconnect
  // After 1s, 2s, 4s, 8s (exponential backoff)
  // No manual code needed!
};
```

### Gotcha 3: Memory Leaks

**Problem:** Forgetting to close connections wastes memory

**Solution:**
```javascript
useEffect(() => {
  const sse = new EventSource('/api/sse/connect');
  
  return () => sse.close(); // Clean up on unmount
}, []);
```

### Gotcha 4: Scaling Across Multiple Servers

**Problem:** User connected to Server A, data published on Server B

**Solution:**
```javascript
// Use Redis pub/sub
const redis = require('redis');
const subscriber = redis.createClient();

subscriber.subscribe('messages', (message) => {
  // ANY server can subscribe and push to connected users
  sseManager.broadcast(userId, 'new-message', message);
});
```

---

## Step-by-Step: How You'd Implement It for VibesApp

### Week 1: Backend Setup

**Day 1-2:** Create SSE connection manager
```javascript
class SSEManager {
  constructor() {
    this.clients = new Map(); // userId → response
  }
  
  addClient(userId, response) {
    this.clients.set(userId, response);
  }
  
  broadcast(userId, eventType, data) {
    const response = this.clients.get(userId);
    if (response) {
      response.write(
        `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`
      );
    }
  }
}
```

**Day 3-4:** Create SSE endpoints
```javascript
// /api/sse/connect (establish connection)
// /api/sse/disconnect (cleanup, optional)
```

**Day 5:** Hook up data changes
```javascript
// When message sent: sseManager.broadcast('user-id', 'new-message', message)
// When activity: sseManager.broadcast('user-id', 'activity', activity)
// When like: sseManager.broadcast('user-id', 'post-liked', post)
```

### Week 2: Frontend Setup

**Day 1-3:** Create useSSE hook
```typescript
export function useSSE() {
  useEffect(() => {
    const eventSource = new EventSource('/api/sse/connect');
    // Listen for events
    return () => eventSource.close();
  }, []);
}
```

**Day 4-5:** Replace polling hooks
```typescript
// useMessagingPolling → useSSE + light queries
// useActivities → useSSE + light queries
```

### Week 3: Testing & Deployment

**Day 1-3:** Load testing, bug fixes
**Day 4:** Canary deployment (10% of users)
**Day 5:** Monitor metrics, expand to 100%

---

## Example: Real Implementation for Your Messaging

### Current Code (Polling - Every 30 seconds)

```typescript
// apps/web-v2/src/features/messaging/hooks/useMessagingPolling.ts
export function useMessagingPolling() {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => getConversations(userId),
    refetchInterval: 30000, // Ask every 30 seconds
  });
}
```

### With SSE (Instant Push)

```typescript
// apps/web-v2/src/features/messaging/hooks/useMessagingSSE.ts
export function useMessagingSSE() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const sse = new EventSource('/api/sse/connect');

    sse.addEventListener('new-message', (event) => {
      const message = JSON.parse(event.data);
      
      // Update React Query cache
      queryClient.setQueryData(
        ['conversation', message.conversationId],
        (old) => ({
          ...old,
          messages: [...old.messages, message]
        })
      );
    });

    return () => sse.close();
  }, [queryClient]);

  // Fetch initial data once (no polling)
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => getConversations(userId),
    staleTime: Infinity, // Never refetch, SSE keeps it fresh
  });
}
```

**Difference:**
- Polling: Asks 2x per minute (60 requests/hour per user)
- SSE: Pushes only when data changes (maybe 5-10 requests/hour per user)

---

## The Bottom Line

**SSE is like upgrading from:**
- 📞 Calling the store every 30 seconds to ask "Is my order ready?"

**To:**
- 📱 Getting a text message when your order is ready

**Same outcome, but:**
- ✅ Faster (instant vs 30s delay)
- ✅ Cheaper (fewer "phone calls")
- ✅ Better UX (users see updates instantly)
- ✅ Scales 3-4x better (20k-40k DAU vs 5k-8k DAU)

**When you hit 40k DAU, then upgrade to WebSockets for bi-directional real-time.**

---

## Next Steps

1. Read the [SSE Migration Guide](./03-SSE-MIGRATION-GUIDE.md) for detailed code
2. Understand [Capacity Analysis](./01-API-POLLING-CAPACITY.md) for when to implement
3. Start with backend SSE manager (most complex part)
4. Hook it up to messaging endpoint
5. Test with 100 concurrent connections
6. Roll out to users gradually
