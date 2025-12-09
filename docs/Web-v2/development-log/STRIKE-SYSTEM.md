# Strike System Documentation

## Overview

The Strike System is VibesApp's graduated content moderation and user accountability system. It provides transparent, escalating consequences for community guideline violations while allowing users to reform over time through automatic strike expiration.

**Core Philosophy:** Transparent rules, clear progression, and reformation opportunity.

---

## Strike Progression

### Strike 1: Post Cooldown (24 hours)
**Restrictions:**
- ❌ Cannot create new posts
- ✅ Can comment on posts
- ✅ Can react (hearts) to content
- ✅ Can browse and use all other features

**User Experience:**
- Modal notification on next app open
- Cooldown timer displayed in profile
- Blocked with clear error message when attempting to post
- Full access restored after 24 hours

---

### Strike 2: Post + Comment Cooldown (24 hours)
**Restrictions:**
- ❌ Cannot create new posts
- ❌ Cannot comment on posts
- ✅ Can react (hearts) to content
- ✅ Can browse and use all other features

**User Experience:**
- Modal notification on next app open
- Escalation clearly communicated
- Warning about approaching read-only mode (Strike 3)
- Cooldown timer displayed in profile

---

### Strike 3: Read-Only Mode (24 hours)
**Restrictions:**
- ❌ Cannot create new posts
- ❌ Cannot comment on posts
- ❌ Cannot react (hearts) to content
- ✅ Can browse content
- ✅ Can view profiles and messages

**User Experience:**
- Prominent modal notification
- Clear warning that next violation = permanent ban
- All interaction buttons disabled with "Read-only mode" tooltip
- Cooldown timer prominently displayed

---

### Strike 4: Permanent Ban
**Restrictions:**
- ❌ All actions blocked
- ❌ Cannot access any content
- Account effectively deactivated

**User Experience:**
- Account banned message on login
- Link to support/appeal (future feature)
- All user's posts soft-deleted (hidden from platform)

---

## Strike Expiration (30-Day Sliding Window)

### How It Works
- Each strike expires **30 days** after it was issued
- Expired strikes no longer count toward the user's active strike count
- Expired strikes remain in the user's history but don't affect restrictions

### Example Timeline
```
Day 0:  User receives Strike 1 (post cooldown)
Day 1:  Cooldown expires, can post again
Day 15: User receives Strike 2 (post + comment cooldown)
Day 16: Cooldown expires, restrictions lifted
Day 31: Strike 1 expires (now only has 1 active strike)
Day 45: Strike 2 expires (back to 0 active strikes)
```

### Progressive Reset
- If all strikes expire, the next violation starts back at Strike 1
- Users can reform by following guidelines for 30+ days
- No manual strike removal (except through admin post restoration)

---

## How Users Receive Strikes

### Automatic Strike Assignment
Strikes are automatically issued when:
1. **3 reports within 50 miles** trigger auto-hide on a post
2. Post is hidden due to community reports
3. Strike is immediately added to post author's account

### Report Flow
```
User reports post → Report added to post
                  → System checks for 3+ reports within 50 miles
                  → If threshold met:
                      • Post is soft-deleted (hidden)
                      • Strike added to author
                      • Author notified on next app open
```

### Manual Admin Actions
Admins can also trigger strikes:
- **Ban User**: Adds Strike 4 (permanent ban)
- **Restore Post**: Removes most recent strike from author

---

## Technical Implementation

### Database Schema

#### User Model Strike Structure
```javascript
{
  strikes: [
    {
      reason: String,          // e.g., "Spam content"
      timestamp: Date,         // When strike was issued
      expiresAt: Date,        // timestamp + 30 days
      relatedPostId: ObjectId // Optional: post that triggered strike
    }
  ],
  isBanned: Boolean,          // Strike 4 flag
  bannedAt: Date              // When ban was issued
}
```

### API Endpoints

#### Check User Restrictions
```javascript
GET /api/user/:userId/strikes

Response:
{
  strikes: Array,            // All strikes (including expired)
  activeStrikes: Number,     // Count of non-expired strikes
  restrictions: {
    canPost: Boolean,
    canComment: Boolean,
    canReact: Boolean,
    isBanned: Boolean,
    strikeCount: Number
  },
  cooldownEndsAt: Date       // When current cooldown expires
}
```

#### Report Post (May Trigger Strike)
```javascript
POST /api/post/report
{
  postId: String,
  userId: String,
  reason: "spam" | "pornographic" | "hate_speech",
  location: { type: "Point", coordinates: [lon, lat] }
}

Response:
{
  success: Boolean,
  reportCount: Number,
  isHidden: Boolean,         // True if auto-hide triggered
  strikeAdded: Boolean       // True if strike was issued
}
```

### Middleware: Strike Enforcement

#### Post Creation Protection
```javascript
// apps/api/src/middleware/strikeEnforcement.js
checkPostingRestrictions(req, res, next)

// Applied to routes:
POST /api/post/create
```

**Logic:**
1. Extract userId from request
2. Fetch user from database
3. Call `user.getCurrentRestrictions()`
4. If `canPost === false`, return 403 with error
5. Otherwise, allow request to proceed

#### Comment Creation Protection
```javascript
checkCommentRestrictions(req, res, next)

// Applied to routes:
POST /api/comment/create
```

#### Model Methods
```javascript
// User.js
UserSchema.methods.getActiveStrikes = function() {
  const now = new Date();
  return this.strikes.filter(strike => strike.expiresAt > now);
}

UserSchema.methods.getCurrentRestrictions = function() {
  const activeStrikes = this.getActiveStrikes();
  const strikeCount = activeStrikes.length;
  
  // Strike 4: Permanent ban
  if (this.isBanned || strikeCount >= 4) {
    return {
      canPost: false,
      canComment: false,
      canReact: false,
      isBanned: true,
      strikeCount
    };
  }
  
  // Strike 1-3: 24-hour cooldowns
  if (strikeCount >= 1) {
    const latestStrike = activeStrikes.sort((a,b) => b.timestamp - a.timestamp)[0];
    const cooldownEnd = new Date(latestStrike.timestamp.getTime() + 24*60*60*1000);
    const inCooldown = new Date() < cooldownEnd;
    
    return {
      canPost: !inCooldown,
      canComment: strikeCount < 2 ? !inCooldown : false,
      canReact: strikeCount < 3,
      isBanned: false,
      strikeCount,
      cooldownEnd: inCooldown ? cooldownEnd : null
    };
  }
  
  // No active strikes
  return {
    canPost: true,
    canComment: true,
    canReact: true,
    isBanned: false,
    strikeCount: 0
  };
}
```

---

## Frontend Integration

### Error Handling
When API returns 403 with strike restrictions:
```javascript
// Response structure:
{
  error: "You cannot post during the cooldown period.",
  restrictions: {
    canPost: false,
    canComment: false,
    canReact: true,
    isBanned: false,
    strikeCount: 1
  },
  cooldownEnd: "2025-12-05T00:12:28.420Z",
  message: "Your posting privileges are temporarily suspended until..."
}
```

### UI Components to Implement

#### Strike Notification Modal
- Triggered on app open if user has new unacknowledged strikes
- Display: strike count, violation reason, current restrictions, cooldown timer
- [Acknowledge] button to dismiss

#### Profile Strike Indicator
- Badge showing active strike count
- Cooldown timer if currently in cooldown period
- Tooltip explaining restrictions

#### Disabled Action Buttons
- Post/Comment/React buttons disabled during restrictions
- Tooltip showing restriction reason and cooldown remaining
- Clear visual indication (grayed out, crossed out, etc.)

#### Admin UI
- Strike badges in user management table
- Strike count in user detail view
- Strike history timeline
- "Restore Post" action removes strikes

---

## Testing Strategy

### Unit Tests
✅ `User.getActiveStrikes()` filters expired strikes correctly
✅ `User.getCurrentRestrictions()` returns correct restrictions for each strike level
✅ Strike expiration logic (30-day window)

### Integration Tests
✅ POST to `/api/post/create` blocked during Strike 1+ cooldown
✅ POST to `/api/comment/create` blocked during Strike 2+ cooldown
✅ POST to `/api/post/vibe` blocked during Strike 3+ cooldown
✅ All actions blocked for Strike 4 (banned users)

### E2E Tests (Playwright)
✅ Strike display in admin user management
✅ Strike removal when post is restored
✅ Ban user adds Strike 4
✅ User restrictions enforced in UI
✅ Strike notification modal displays correctly
✅ Cooldown timer counts down correctly

**See:** `libs/e2e-testing/tests/admin/strike-system.spec.ts`

---

## Admin Dashboard Features

### User Management
- **Strike Badge**: Shows active strike count on each user row
- **Banned Badge**: Highlights users with Strike 4
- **Filter by Status**: View all/active/banned users
- **User Details**: Full strike history with timestamps

### Flagged Posts Management
- **Author Strike Count**: Displayed on each flagged post
- **Restore Post**: Removes most recent strike from author
- **Ban User**: Issues Strike 4 (permanent ban)
- **Strike Context**: See which report triggered the strike

### Moderation Actions

#### Restore Post
```javascript
POST /api/admin/post/:postId/restore

Effect:
1. Sets post.isDeleted = false
2. Removes author's most recent strike
3. Post reappears in feeds
```

#### Ban User
```javascript
POST /api/admin/user/:userId/ban

Effect:
1. Adds Strike 4 to user.strikes
2. Sets user.isBanned = true
3. Soft-deletes all user's posts
4. User cannot access platform
```

---

## Strike System Flowchart

```
User posts content
       ↓
Content receives reports
       ↓
≥3 reports within 50 miles?
       ↓ Yes
Post auto-hidden + Strike added to author
       ↓
Check author's active strikes:
       ↓
┌──────┴──────┬──────────┬───────────┐
│   Strike 1  │ Strike 2 │ Strike 3  │ Strike 4
│   (24h)     │  (24h)   │   (24h)   │ (Permanent)
│             │          │           │
│ No posts    │ No posts │ Read-only │ BANNED
│             │ No       │ No posts  │ All actions
│             │ comments │ No        │ blocked
│             │          │ comments  │
│             │          │ No hearts │
└─────────────┴──────────┴───────────┘
       ↓
Wait 24 hours OR 30 days for expiration
       ↓
Restrictions lifted
```

---

## Future Enhancements

### Planned Features
- [ ] Appeal system for strikes
- [ ] Detailed violation context in notifications
- [ ] Strike history view in user settings
- [ ] Admin analytics dashboard (strikes over time)
- [ ] Warning system before auto-hide threshold

### Considerations
- **Strike Appeals**: Users can contest strikes (admin review required)
- **Graduated Expiration**: Different expiration times per strike level
- **Warning Strikes**: Non-restrictive warnings before enforcement
- **Custom Strike Reasons**: More specific violation categories

---

## Monitoring and Metrics

### Key Metrics to Track
- Total strikes issued (per day/week/month)
- Strike distribution by level (1, 2, 3, 4)
- Average time to strike expiration
- Ban rate (Strike 4 percentage)
- Strike-to-reformation rate (users who avoid further strikes)

### Alerts
- Spike in Strike 4 bans (possible abuse wave)
- High strike rate on specific content types
- Users repeatedly approaching Strike 3 (potential problem users)

---

## FAQ

### Q: Can strikes be manually removed?
**A:** Only through admin post restoration. When an admin restores a flagged post, the most recent strike is removed from the author.

### Q: What happens after 24 hours of a Strike 1-3 cooldown?
**A:** Restrictions are immediately lifted. User can post/comment/react again.

### Q: Do expired strikes show in the user's history?
**A:** Yes, but they don't count toward active restrictions. Users can see their full strike history.

### Q: Can admins see all strikes, including expired ones?
**A:** Yes, admin dashboard shows full strike history with timestamps and expiration dates.

### Q: What if a user's post is wrongly flagged?
**A:** Admins can restore the post, which removes the strike. Future: appeal system for users.

### Q: Does Strike 4 delete the user's account?
**A:** No, it's a soft ban. Account data remains but user cannot access platform. All posts are hidden.

---

## Related Documentation
- [Phase 3.4 Implementation Summary](./PHASE-3.4-SUMMARY.md)
- [Phase 3.4 Implementation Log](./PHASE-3.4-IMPLEMENTATION-LOG.md)
- [Admin Dashboard Documentation](../../Web-V2/02-implemented-features.md#admin-dashboard)
- [Content Moderation System](../../Web-V1/02-vibes-system.md#content-moderation-integration)

---

**Last Updated:** December 3, 2025  
**Version:** 1.0  
**Status:** Implemented (Backend + Middleware), Partial (Frontend UI)
