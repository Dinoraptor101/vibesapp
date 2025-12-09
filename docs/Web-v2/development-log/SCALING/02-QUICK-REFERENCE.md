# Quick Reference: Scaling Decision Tree

## Am I Hitting Scaling Limits?

### Check These Metrics First

```bash
# Heroku: Check dyno health
heroku logs --app vibesapp-api --tail

# Look for:
- "Response time" > 500ms (RED FLAG)
- "Connection pool exhausted" (RED FLAG)
- CPU usage > 80% sustained (WARNING)
- Memory > 70% sustained (WARNING)
```

### Warning Signs by User Count

| Users | Performance Symptom | Action |
|-------|---------------------|--------|
| 1k-3k | Normal | Monitor only |
| 3k-5k | Occasional slow messaging | Check database indexes |
| 5k-8k | Consistent 200-300ms delays | Reduce polling or scale dyno |
| 8k-12k | 300-500ms delays, timeouts | Must upgrade (polling + dyno + SSE) |
| 12k+ | Frequent timeouts, 503 errors | WebSocket migration required |

---

## Decision Tree: What to Do Now

```
START: How many DAU do you have?

├─ < 3,000 DAU
│  └─ ✅ Do nothing. Monitor baseline metrics.
│
├─ 3,000 - 5,000 DAU
│  └─ Monitor API response times
│     ├─ If p95 < 200ms: ✅ You're good
│     └─ If p95 > 300ms: 
│        └─ Add database indexes on:
│           - Conversation queries (userId, createdAt)
│           - Activity queries (userId, type)
│
├─ 5,000 - 8,000 DAU
│  └─ MUST TAKE ACTION:
│     ├─ Option A (Quick, cost-free):
│     │  └─ Reduce active conversation polling: 5s → 10s
│     │     (Implementation: 1 line change in useMessagingPolling.ts)
│     │
│     ├─ Option B (Cost: +$50/mo, no code change):
│     │  └─ Upgrade to Standard 2x dyno
│     │
│     └─ Option C (Best long-term):
│        └─ Start SSE implementation (2-3 week project)
│
├─ 8,000 - 12,000 DAU
│  └─ SCALE OR LOSE USERS:
│     ├─ If not done polling reduction:
│     │  └─ DO IT NOW (immediate relief)
│     │
│     └─ Then pick ONE:
│        ├─ Multi-dyno (2-3x Standard, $100-150/mo)
│        └─ SSE implementation (same cost, better capacity)
│
└─ 12,000+ DAU
   └─ ⚠️ Polling architecture at ceiling
      └─ Must implement Server-Sent Events
         or WebSockets within 30 days
         or lose users to timeouts
```

---

## Quick Fixes (In Priority Order)

### Fix #1: Reduce Polling Interval (5 minutes, FREE)

**File:** `apps/web-v2/src/features/messaging/hooks/useMessagingPolling.ts`

**Change:**
```typescript
// Line 57 - BEFORE
refetchInterval: isVisible ? 5000 : 30000,

// Line 57 - AFTER
refetchInterval: isVisible ? 10000 : 30000,  // 5s → 10s still feels real-time
```

**Impact:**
- Reduces peak load by 50%
- DAU capacity: 5,000 → 8,000
- User experience: Negligible (10s vs 5s is imperceptible)

---

### Fix #2: Add Database Indexes (10 minutes, FREE)

**Run in MongoDB:**
```javascript
// Conversations collection - called 2x/min per user
db.conversations.createIndex({ userId: 1, createdAt: -1 })

// Activities collection - called 2x/min per user  
db.activities.createIndex({ userId: 1, createdAt: -1 })

// Posts collection - pagination
db.posts.createIndex({ userId: 1, createdAt: -1 })
```

**Impact:**
- Reduces response time by 60-80%
- Most impactful per-minute improvement
- Query time: 200ms → 30-50ms

---

### Fix #3: Implement Redis Caching (2-3 hours)

**Add to backend (`apps/api/src/routes/activity.js`):**
```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache activities for 10 seconds
app.get('/api/activities/:userId', async (req, res) => {
  const cacheKey = `activities:${req.params.userId}`;
  
  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  // Fetch from DB if not cached
  const activities = await Activity.find({ userId: req.params.userId });
  await client.setEx(cacheKey, 10, JSON.stringify(activities));
  
  res.json(activities);
});
```

**Impact:**
- Reduces database queries by 70%
- DAU capacity: 5,000 → 10,000 (without polling changes)
- Cost: Redis add-on ~$15/mo

---

## When to Call Your DevOps Person

Contact when:

- ❌ p95 response time > 300ms sustained
- ❌ Database connection pool warnings
- ❌ Heroku alerts about dyno overload
- ❌ > 10,000 DAU predicted in next 30 days

**Budget for:** 2-4 weeks of engineering for SSE implementation

---

## Cost Breakdown by Scale

| Phase | Messaging Interval | Infrastructure | Monthly Cost | Notes |
|-------|-------------------|-----------------|--------------|-------|
| Current | 5s | Standard 1x | $50 | Peak: 514 req/sec |
| Optimized | 10s | Standard 1x | $50 | +Redis: $65 |
| Scaled | 10s | Standard 2x | $100 | Or 2x Standard 1x |
| Enterprise | Real-time | SSE + Redis | $50-100 | 20k-40k DAU capable |

---

## Testing Your Current Capacity

### Load Test Before You Need It

```bash
# Install loadtest
npm install -g loadtest

# Simulate 100 concurrent users hitting /api/activities every 30s
loadtest -c 100 -r 100 \
  https://api.vibesapp.com/api/activities/USER_ID

# Watch Heroku metrics in real-time
heroku metrics --app vibesapp-api --watch
```

### Expected Results at Current DAU

| Current DAU | Expected p95 Response | Expected Error Rate |
|-------------|---------------------|---------------------|
| < 2,000 | < 50ms | 0% |
| 2k-5k | 50-150ms | < 0.1% |
| 5k-8k | 150-300ms | 0.1-0.5% |
| > 8k | > 300ms | > 1% |

---

## Recommended Reading

1. **React Query Best Practices:** docs/Web-v2/05-testing-strategy.md
2. **API Integration Deep Dive:** docs/Web-V1/06-api-integration.md
3. **Heroku Scaling Guide:** https://devcenter.heroku.com/articles/scaling-dynos
4. **MongoDB Performance:** https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/

---

## Emergency Contacts

If you're getting 503 errors and losing users:

1. Immediately reduce polling: 5s → 30s (temporary)
2. Scale to 2x dyno (if budget allows)
3. Call DevOps for emergency SSE sprint
4. Prepare migration plan to WebSockets

DO NOT launch major features until scaling is resolved.
