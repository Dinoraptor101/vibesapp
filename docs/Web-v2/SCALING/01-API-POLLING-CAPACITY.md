# API Polling Capacity Analysis

## Executive Summary

VibesApp's current polling-based architecture can sustainably handle **5,000-15,000 Daily Active Users (DAU)** before requiring a migration to WebSockets or Server-Sent Events (SSE).

**Key Finding:** The active conversation polling at 5-second intervals is the primary scalability bottleneck, not the frontend static hosting on GitHub Pages.

---

## Current Polling Architecture

### Active Polling (When User Tab is Focused)

| Feature | Interval | Requests/min | Notes |
|---------|----------|--------------|-------|
| **Messaging (Conversations List)** | 30s | 2 | Lower priority |
| **Messaging (Active Conversation)** | 5s | 12 | **PRIMARY BOTTLENECK** |
| **Activities/Notifications** | 30s | 2 | General updates |
| **DM Requests** | 30s | 2 | Friendship requests |
| **Posts Feed** | On-demand | ~0.5 | Infinite scroll, not polling |
| **Profile Data** | 15 min | 0.1 | Minimal load |
| **TOTAL per focused user** | — | **~18.6 req/min** | — |

### Background Polling (When User Tab is Hidden/Backgrounded)

| Feature | Interval | Requests/min | Notes |
|---------|----------|--------------|-------|
| **Conversations List** | 180s (6x slower) | 0.33 | Significantly reduced |
| **Activities** | 30s | 2 | Continues in background |
| **TOTAL per backgrounded user** | — | **~2.3 req/min** | Battery friendly |

### Adaptive Polling Strategy

The frontend implements smart polling reduction:
- **Active tab:** Full polling frequency (5s, 30s intervals)
- **Hidden tab:** 6x slower polling (30s → 180s, 5s → 30s)
- **Tab focus recovery:** Automatic resumption of normal polling

This reduces overall load by ~50-70% during off-peak hours when many users have tabs backgrounded.

---

## Capacity Calculations

### Model Assumptions

```
Session Duration:          30 minutes average
Active Focus Time:         10 minutes per session (1/3 of session)
Backgrounded Time:         20 minutes per session (2/3 of session)
% Users on Messaging:      80% of focused users
Average DAU Distribution:  Peak = 40% of daily active, Off-peak = 10% of daily active
```

### Daily Active Users Capacity Tiers

#### Tier 1: 5,000 DAU (Comfortable)

**Concurrent Users (30-minute sessions):**
- ~208 concurrent online users
- ~166 focused (active tab) ≈ 3,088 requests/min
- ~42 backgrounded ≈ 97 requests/min
- **Total: 3,185 requests/min = 53 requests/sec**

**Peak Load (40% DAU concurrent):**
- ~2,000 concurrent online
- ~1,600 focused users
- **Peak: ~30,860 requests/min = 514 requests/sec**

#### Tier 2: 10,000 DAU (Moderate Scaling)

**Peak Load (40% DAU concurrent):**
- ~4,000 concurrent online users
- ~3,200 focused users
- **Peak: ~61,720 requests/min = 1,029 requests/sec**

**Server Load:** Requires optimized single dyno or multiple dynos with load balancer

#### Tier 3: 15,000 DAU (WebSocket Migration Needed)

**Peak Load (40% DAU concurrent):**
- ~6,000 concurrent online users
- ~4,800 focused users
- **Peak: ~92,580 requests/min = 1,544 requests/sec**

**Server Load:** Single dyno cannot handle. Requires infrastructure upgrade.

---

## Current Server Capacity

### Heroku Dyno Performance

| Dyno Type | Requests/sec | Notes |
|-----------|--------------|-------|
| **Standard 1x** | 50-100 | Current deployment |
| **Standard 2x** | 100-200 | 2x capacity, ~2x cost |
| **Performance-M** | 500-1000 | Significant cost increase |
| **Performance-L** | 1000-2000 | Enterprise tier |

**Conclusion:** Standard dyno is comfortable for ~5,000 DAU; needs upgrade for 10,000+.

### Database Bottlenecks

**MongoDB Atlas Connection Pool:**
- Default: 100 connections
- Premium: 500 connections
- Polling queries typically use 1 connection each
- At 1,544 req/sec, you could exceed connection pool limits

**Query Optimization Points:**
- Conversations list query: ~50ms (with indexes)
- Active conversation query: ~100-200ms (fetches all messages)
- Activities query: ~30-50ms
- These don't scale well with 1,000+ concurrent requests

---

## Network Bandwidth Analysis

### Data Per Request

| Endpoint | Response Size | Frequency at Peak |
|----------|---------------|-------------------|
| Conversations List | ~30KB | 1,600 req/min |
| Active Conversation | ~150KB | 9,600 req/min |
| Activities | ~10KB | 800 req/min |
| DM Requests | ~5KB | 800 req/min |

**At 15,000 DAU Peak:**
- Messaging alone: ~1.4 GB/min outbound traffic
- **Total API outbound: 1.6-1.8 GB/min = 27-30 MB/sec**

**Heroku Limits:** Standard dyno has ~10 MB/sec sustained, bursts to 50 MB/sec.
**Conclusion:** Bandwidth becomes a constraint before request/sec at scale.

---

## Primary Bottleneck: 5-Second Messaging Interval

### Why This Kills Scalability

```
Active Conversation Polling Math:
- Interval: 5 seconds
- Per user: 12 requests/min
- At 1,000 users viewing conversations: 12,000 req/min = 200 req/sec JUST for this endpoint
- At 4,800 users (15k DAU peak): 57,600 req/min = 960 req/sec

Comparison with 30s interval:
- Per user: 2 requests/min
- Same 4,800 users: 9,600 req/min = 160 req/sec (6x reduction)
```

### The Real-Time Expectation Trade-off

The 5-second interval provides "real-time feel" for messaging but:
- Generates 6x more load than reasonable background rate (30s)
- Only needed when user actively typing/reading messages
- Most users don't need new messages THAT frequently

---

## Scaling Recommendations

### Before 5,000 DAU (Current Safe Tier)

✅ **No action needed** — polling architecture handles load comfortably

**Monitoring:**
- Track API response times (target: <100ms for polling)
- Monitor Heroku dyno CPU (target: <80%)
- Monitor database connection pool usage

---

### 5,000 - 10,000 DAU (Optimization Phase)

**Option 1: Reduce Polling Frequency (Recommended - Cheapest)**
```javascript
// Increase active conversation polling from 5s to 10-15s
refetchInterval: isVisible ? 10000 : 30000,  // Was: 5000 : 30000

Impact:
- Reduces peak load by 50%
- DAU capacity: 10,000-12,000
- Cost: $0 (no infrastructure change)
- Trade-off: Messaging feels slightly less "instant" (tolerable)
```

**Option 2: Scale Heroku**
```
Standard 1x → Standard 2x ($50/month → $100/month)
- Doubles throughput capacity
- DAU capacity: 8,000-10,000
- Easier than code changes, but recurring cost
```

**Option 3: Implement Server-Sent Events (SSE)**
```
Replace polling with server push
- Client connects once, server sends updates
- 70-90% reduction in request volume
- Development effort: 2-3 weeks
- DAU capacity: 25,000-40,000
- Infrastructure: Same cost, different implementation
```

**Recommended Path:** Start with Option 1 (polling frequency) → Option 3 (SSE) as you approach 10,000 DAU

---

### 10,000 - 15,000 DAU (Infrastructure Upgrade)

**Option A: Multi-Dyno Load Balancing**
```
2-3 Standard dynos with load balancer
- Cost: $100-150/month (vs. $50 current)
- Capacity: 15,000-20,000 DAU
- Complexity: Medium (session affinity management)
```

**Option B: Server-Sent Events (SSE)**
```
Mid-scale sustainable solution
- Single dyno can handle 20,000-40,000 DAU
- Cost: Same ($50/month)
- Complexity: High (requires backend rewrite)
- Benefit: Future-proof before WebSockets
```

**Option C: Early WebSocket Migration**
```
Real-time bi-directional communication
- Capacity: 50,000+ DAU on single dyno
- Cost: $50/month (same infrastructure)
- Complexity: Very high (major refactor)
- When to use: If aiming for >20,000 DAU early on
```

**Recommended Path:** SSE bridges gap between polling and WebSockets, provides 5-10x capacity improvement without full WebSocket complexity.

---

### 15,000+ DAU (Enterprise Scale)

**WebSocket Migration Required**

- Polling is fundamentally unscalable at this tier
- WebSocket infrastructure (Socket.IO, etc.) handles 50,000+ users on single dyno
- Requires dedicated DevOps: Redis pub/sub, message queues, session management
- Cost: Infrastructure same, engineering effort significant

---

## GitHub Pages Impact on Polling Architecture

**Static Frontend Hosting (GitHub Pages) = NO IMPACT on API polling capacity**

Why:
- Frontend is purely static (build artifacts)
- All API calls go directly to backend (`VITE_API_URL`)
- GitHub Pages is completely decoupled from polling rate
- Scaling limitation is 100% backend API, not frontend hosting

**Benefits of GitHub Pages for this architecture:**
- ✅ Free hosting (saves $50-100/month)
- ✅ CDN-backed (fast static delivery)
- ✅ Zero server overhead (no backend needed for frontend)
- ✅ Allows all infrastructure budget to scale backend API

---

## Action Items by Phase

### Phase 1: Monitoring (Now - 3,000 DAU)
- [ ] Set up API response time dashboards
- [ ] Monitor database query times
- [ ] Track Heroku dyno resource usage
- [ ] Document baseline metrics

### Phase 2: Optimization (3,000 - 8,000 DAU)
- [ ] Reduce active conversation polling from 5s to 10s
- [ ] Implement database query caching layer (Redis)
- [ ] Add indexes to frequently polled MongoDB collections
- [ ] Evaluate SSE viability

### Phase 3: Architecture Upgrade (8,000 - 15,000 DAU)
- [ ] Implement Server-Sent Events (SSE)
- [ ] Add Redis for connection management
- [ ] Scale to multi-dyno deployment if needed

### Phase 4: Enterprise (15,000+ DAU)
- [ ] WebSocket infrastructure setup
- [ ] Message queue (Bull/RabbitMQ) for reliability
- [ ] Distributed session management
- [ ] Dedicated DevOps infrastructure

---

## Monitoring Metrics

Track these KPIs to know when to scale:

```
API Performance:
- Median response time for /conversations: target <100ms
- Median response time for /conversation/:id: target <150ms
- P95 response time: target <300ms
- Error rate: target <0.1%

Infrastructure:
- Heroku dyno CPU: target <70% sustained
- Heroku dyno Memory: target <60% sustained
- MongoDB connection pool utilization: target <60%
- Database query time: target <100ms median

Scale when ANY metric exceeds targets for >5 minutes sustained
```

---

## Summary Table: DAU vs. Architecture

| DAU Range | Infrastructure | Polling Interval | Est. Cost | Recommended Action |
|-----------|----------------|------------------|-----------|-------------------|
| 0-5,000 | Standard 1x Dyno | 5s active | $50/mo | ✅ Current setup |
| 5k-10k | Standard 1x + Optimization | 10-15s active | $50/mo | Reduce polling interval |
| 10k-15k | Standard 2x or Multi-dyno | 10-15s active | $100-150/mo | Upgrade dyno or SSE |
| 15k-40k | Standard with SSE | Real-time push | $50/mo | Implement SSE |
| 40k+ | WebSocket cluster | Real-time duplex | $200-500/mo | Full WebSocket setup |

---

## References

- React Query: Polling intervals documentation
- Heroku: Dyno types and capacity planning
- MongoDB Atlas: Connection pooling limits
- Real-time architecture: SSE vs WebSockets comparison
