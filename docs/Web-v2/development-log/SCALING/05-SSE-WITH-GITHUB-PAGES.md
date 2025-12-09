# SSE with GitHub Pages: Complete Compatibility Guide

## The Short Answer

✅ **YES, SSE works perfectly with GitHub Pages static hosting.**

GitHub Pages hosts static files (HTML, JS, CSS). Your frontend is a Single Page Application (SPA) that:
1. Loads once from GitHub Pages
2. Runs entirely in the browser
3. Makes API calls to your backend (completely separate from hosting)

**SSE is just an API call like any other** — it connects your browser to your backend server, not to GitHub Pages.

---

## Why This Works: Architecture Overview

### Current Architecture (Polling)

```
┌─────────────────┐
│  GitHub Pages   │
│   (Static)      │
│  Serves: HTML   │
│         JS      │
│         CSS     │
└────────┬────────┘
         │
         │ Browser loads once
         │
┌────────▼─────────────────────────────┐
│      Browser (Running SPA)           │
│  React + React Query                 │
└────────┬────────────────────────────┘
         │
         │ Every 30s: "Any new messages?"
         │ (HTTP requests)
         │
┌────────▼─────────────────────────────┐
│    Backend API (Heroku)              │
│  Node.js + Express                   │
│  MongoDB                             │
└──────────────────────────────────────┘
```

**GitHub Pages role:** Only serves the initial HTML/JS bundle. That's it.

### With SSE (Server Push)

```
┌─────────────────┐
│  GitHub Pages   │
│   (Static)      │
│  Serves: HTML   │
│         JS      │
│         CSS     │
└────────┬────────┘
         │
         │ Browser loads once
         │
┌────────▼─────────────────────────────┐
│      Browser (Running SPA)           │
│  React + React Query                 │
└────────┬────────────────────────────┘
         │
         │ One-time SSE connection
         │ [Connection stays open]
         │ Server pushes updates
         │
┌────────▼─────────────────────────────┐
│    Backend API (Heroku)              │
│  Node.js + Express + SSE handlers    │
│  MongoDB                             │
└──────────────────────────────────────┘
```

**GitHub Pages role:** Still just serves the initial HTML/JS. The SSE connection is client-side code calling your backend API.

---

## How SSE Works from GitHub Pages

### Step 1: Browser Downloads React App from GitHub Pages

```
1. User visits: https://vibesapp.net
   ↓
   DNS resolves to GitHub Pages
   ↓
   GitHub Pages returns: index.html + React bundle
   ↓
   Browser runs React app
```

### Step 2: React App Creates SSE Connection

```javascript
// apps/web-v2/src/hooks/useSSE.ts
export function useSSE() {
  useEffect(() => {
    // THIS CALL goes to YOUR BACKEND, not GitHub Pages!
    const eventSource = new EventSource(
      'https://api.vibesapp.com/api/sse/connect'  // ← Your Heroku backend
    );

    eventSource.addEventListener('new-message', (event) => {
      const message = JSON.parse(event.data);
      // Update UI
    });

    return () => eventSource.close();
  }, []);
}
```

**The key:** `https://api.vibesapp.com/api/sse/connect`
- This is YOUR backend, not GitHub Pages
- The frontend was served by GitHub Pages
- But ALL API calls (including SSE) go to your backend

### Step 3: SSE Connection Works Like Any Other API Call

```
GitHub Pages:       Backend API:
┌──────────┐        ┌──────────────┐
│          │        │              │
│ React    │──────→ │ POST /login  │
│ app      │◄────── │              │
│          │        └──────────────┘
│          │
│          │        ┌──────────────────┐
│          │        │ GET /api/sse     │
│          │───────→│ [connection]     │
│          │        │ [stays open]     │
│          │◄───────│ [receives push]  │
│          │        └──────────────────┘
└──────────┘
```

---

## Code Example: Same as Non-Static Hosting

SSE code doesn't care WHERE your frontend is hosted:

```typescript
// apps/web-v2/src/hooks/useSSE.ts
// This works identically on:
// - GitHub Pages
// - Netlify
// - Vercel
// - Your own server
// - Anywhere that can host static files

export function useSSE() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?._id) return;

    // Connect to backend API
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/sse/connect`,
      { withCredentials: true } // Include auth cookies
    );

    // Listen for server pushes
    eventSource.addEventListener('new-message', (event) => {
      const { conversationId, message } = JSON.parse(event.data);
      queryClient.invalidateQueries(['conversation', conversationId]);
    });

    // Cleanup
    return () => eventSource.close();
  }, [user?._id, queryClient]);
}
```

The only thing that matters is `VITE_API_URL` pointing to your backend:

```env
# .env (GitHub Pages build)
VITE_API_URL=https://api.vibesapp.com

# This same React app works with:
# - SSE connections to https://api.vibesapp.com/api/sse/connect
# - REST API calls to https://api.vibesapp.com/api/*
# - All from GitHub Pages hosting
```

---

## CORS: The One Thing You Need to Configure

**IMPORTANT:** Your backend MUST allow CORS from GitHub Pages domain.

### Why CORS Matters

```
Browser makes request from:    https://vibesapp.net (GitHub Pages)
To backend at:                 https://api.vibesapp.com

Backend must explicitly allow this cross-origin request
```

### Backend CORS Configuration (Already Needed for Polling)

```javascript
// apps/api/src/index.js
const cors = require('cors');

app.use(cors({
  origin: ['https://vibesapp.net', 'http://localhost:5173'], // Allow frontend domains
  credentials: true, // Allow cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// SSE endpoint
app.get('/api/sse/connect', authenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'https://vibesapp.net',
  });
  // ... rest of SSE handler
});
```

**Note:** You probably already have CORS configured for your current polling! SSE just needs the same setup.

---

## Real-Time Capability: NOT Limited by Static Hosting

### What GitHub Pages CAN'T Do

```
❌ Can't receive requests (static files only)
❌ Can't run server-side code
❌ Can't execute Node.js
❌ Can't access databases
```

### What GitHub Pages CAN Do (+ SSE)

```
✅ Serve HTML/JS/CSS (done)
✅ Browser runs React app (done)
✅ React app connects to backend API (done)
✅ Backend sends real-time updates via SSE (done)
✅ Browser receives and displays updates instantly (done)
```

**GitHub Pages limitation:** Only affects backend, not frontend hosting.
**Your setup:** Backend is on Heroku, so no problem!

---

## Network Diagram: Full Flow with GitHub Pages + SSE

```
User navigates to https://vibesapp.net
│
├─ Step 1: Browser requests index.html
│  │
│  └─ GitHub Pages responds with HTML/JS bundle
│     (This is a ONE-TIME request, ~1MB, cached)
│
├─ Step 2: React app loads and initializes
│  │
│  └─ Runs in browser memory
│
├─ Step 3: User authenticates
│  │
│  └─ Browser: POST https://api.vibesapp.com/login
│     Backend: Returns JWT token
│
├─ Step 4: User opens messages
│  │
│  └─ Browser: GET https://api.vibesapp.com/api/conversations
│     Backend: Returns existing conversations
│
├─ Step 5: SSE Connection Established
│  │
│  └─ Browser: GET https://api.vibesapp.com/api/sse/connect
│     Backend: Opens stream, keeps connection alive
│     [Connection stays open indefinitely]
│
├─ Step 6: Friend sends message
│  │
│  └─ Friend's device: POST https://api.vibesapp.com/api/messages
│     Backend: Saves to DB
│     Backend: PUSHES to your device via SSE
│     Your browser: Receives message instantly
│
└─ Step 7: User closes app
   │
   └─ Browser: Closes SSE connection
      Backend: Removes connection from manager
```

**GitHub Pages involvement:** Only Step 1 (initial load)

---

## Performance: SSE Over Static + API Backend

### Bandwidth Usage

```
Polling from GitHub Pages:
- Initial: 1MB (React bundle)
- Every 30s: 50KB per request (even if no new data)
- 5,000 users × 2 requests/min = 10,000 requests/min
- Total: 1MB initial + 500 MB/min = Network killer

SSE from GitHub Pages:
- Initial: 1MB (React bundle)
- Continuous: 1 persistent connection per user
- New message: Push ~5KB when it happens
- 5,000 users × ~1 message/min = 5,000 pushes/min
- Total: 1MB initial + 25 MB/min = Much better
```

### Latency

```
Polling from GitHub Pages:
- Browser loads from Pages: ~200ms
- Browser polls backend: 200ms latency average
- Message delivery: ~15 seconds (worst case: up to 30s)

SSE from GitHub Pages:
- Browser loads from Pages: ~200ms
- Browser connects to backend: ~100ms
- Message delivery: ~50ms (instant)
```

---

## Comparison Table: GitHub Pages + Different Real-Time Solutions

| Feature | Polling | SSE | WebSocket |
|---------|---------|-----|-----------|
| **Works with GitHub Pages?** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Implementation** | Trivial | Simple | Complex |
| **Browser support** | IE 6+ | IE 10+ | IE 10+ |
| **One-way (server→client)** | N/A | ✅ Perfect | ✅ Works |
| **Two-way (client↔server)** | N/A | ❌ Not ideal | ✅ Perfect |
| **Capacity (users)** | 5-8k | 20-40k | 50k+ |
| **Latency** | 15s | <100ms | <50ms |

---

## Setup Checklist: SSE with GitHub Pages

### Frontend (GitHub Pages)

- [ ] Create `useSSE()` hook (connects to backend)
- [ ] Replace polling hooks with SSE listeners
- [ ] Update environment: `VITE_API_URL=https://api.vibesapp.com`
- [ ] Test in browser DevTools (Network tab shows SSE connection)

### Backend (Heroku)

- [ ] Create SSE manager class
- [ ] Create `/api/sse/connect` endpoint
- [ ] Add SSE headers (Content-Type, etc.)
- [ ] Hook data changes to broadcast messages
- [ ] Configure CORS to allow GitHub Pages domain

### Testing

- [ ] Open DevTools → Network tab
- [ ] Navigate to messages
- [ ] See `api/sse/connect` request with `200 OK`
- [ ] Watch connection stay open (no close)
- [ ] Send message from another browser
- [ ] See instant update in first browser

---

## Common Misconception Cleared Up

**WRONG:** "SSE won't work with GitHub Pages because it's static"

**RIGHT:** GitHub Pages is just your frontend host. SSE is a backend feature. They're completely separate layers.

Think of it like:
- GitHub Pages = Restaurant location (just a place where food is displayed)
- Backend API = Kitchen (where the food is actually made)
- SSE = Delivery service (kitchen sends updates to customer)

The location doesn't affect how delivery works!

---

## Migration Path: Polling → SSE on GitHub Pages

### Current Setup
```
GitHub Pages ←── serves static files
         ↓
      React app
         ↓
      Polls Heroku backend every 30s
```

### After SSE
```
GitHub Pages ←── serves static files (same)
         ↓
      React app
         ↓
      SSE connection to Heroku (replaces polling)
```

**What changes:**
1. Frontend code (remove polling, add SSE)
2. Backend code (add SSE handlers)

**What DOESN'T change:**
- GitHub Pages (still hosts static files)
- Domain (vibesapp.net still resolves to GitHub Pages)
- DNS (same as before)

---

## Actual Flow on Your Architecture

### Today (Polling)

```
┌──────────────┐        ┌──────────────┐
│ GitHub Pages │        │   Heroku     │
│  (static)    │        │  (backend)   │
└──────┬───────┘        └──────▲───────┘
       │                       │
       │ 1. Load app           │
       ├──────────────────────→│
       │                       │
       │ 2. Poll every 30s     │
       ├─ "Any updates?" ─────→│
       │←─ "No" ───────────────┤
       │                       │
       │ 3. Poll again         │
       ├─ "Any updates?" ─────→│
       │←─ "Yes! New message" ─┤
       │                       │
       │ 4. Show message       │
       │                       │
```

### Tomorrow (SSE)

```
┌──────────────┐        ┌──────────────┐
│ GitHub Pages │        │   Heroku     │
│  (static)    │        │  (backend)   │
└──────┬───────┘        └──────▲───────┘
       │                       │
       │ 1. Load app           │
       ├──────────────────────→│
       │                       │
       │ 2. Open SSE connection (stays open)
       ├──────────────────────→│
       │◄──────────────────────┤ [listening...]
       │                       │
       │ 3. (No activity)      │
       │◄──────────────────────┤ [listening...]
       │                       │
       │ 4. Friend sends msg   │
       │                       ├─ [broadcasts to all]
       │◄─ [PUSH] New message ─┤
       │                       │
       │ 5. Show message       │
       │                       │
```

**Same frontend host, just smarter real-time.**

---

## Bottom Line

✅ **SSE works perfectly with GitHub Pages**

Because:
1. GitHub Pages is just file hosting
2. Your frontend is a React SPA
3. SSE is a backend API feature
4. They're completely independent layers

The fact that your frontend is on GitHub Pages has **zero impact** on your ability to use SSE.

**Next Steps:**
1. Implement SSE backend handlers (2-3 weeks)
2. Update frontend hooks (remove polling, add SSE)
3. Deploy both
4. Same GitHub Pages frontend still works, just with real-time updates now

No DNS changes, no domain changes, no frontend hosting changes needed.
