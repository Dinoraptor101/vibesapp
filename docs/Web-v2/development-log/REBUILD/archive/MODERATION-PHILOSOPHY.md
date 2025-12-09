# VibesApp Moderation Philosophy

**Last Updated:** November 22, 2025  
**Status:** Active Design Principle

---

## Core Philosophy: Community-Driven Score System

VibesApp does **NOT** believe in blocking users. Instead, we implement a **progressive score-based moderation system** that gradually restricts privileges for users who violate community standards, with community self-moderation as the primary enforcement mechanism.

### Key Principles

1. **No User Blocking:** Users cannot block other users. We believe in open communities where visibility is transparent.

2. **Community Self-Moderation:** Users flag inappropriate content (posts/comments), and the community's collective judgment determines outcomes.

3. **Score-Based Restrictions:** Rather than outright bans, "naughty users" gradually lose features based on their behavior score.

4. **Transparency:** Users can see their current score/strike status and understand what behaviors led to restrictions.

5. **Redemption Path:** All restrictions are temporary (except permanent bans). Good behavior restores privileges.

---

## Current Implementation (Phase 3.4)

### Community Reporting System

**Report Flow:**
1. User clicks report button (🚩) on post/comment
2. Selects reason: Pornographic content, Spam, or Hate speech/harassment
3. Report is submitted with user location and timestamp
4. Post/comment is immediately hidden from reporter's feed
5. Report button disappears (1 report per user per post/comment)

**Auto-Moderation:**
- **3 Reports within 50 miles** = Content automatically hidden
- Post author receives a **strike**
- Strike added with 30-day expiration

### Strike System (Graduated Restrictions)

**Strike 1 (24-hour cooldown):**
- ❌ Cannot create posts
- ✅ Can still comment, heart, view content

**Strike 2 (24-hour cooldown):**
- ❌ Cannot create posts
- ❌ Cannot comment
- ✅ Can still heart, view content

**Strike 3 (24-hour cooldown):**
- ❌ Full read-only mode
- ❌ Cannot post, comment, or heart
- ✅ Can only view content

**Strike 4:**
- ❌ **Permanent ban** from the platform
- All user posts hidden
- Account disabled

**Strike Decay:**
- Strikes older than **30 days** don't count toward progression
- Sliding window approach - user can "earn back" privileges over time
- Active strikes shown to user in real-time

---

## Future Enhancements (Not Yet Implemented)

### Comment Reporting
- Extend report system to comments (currently only posts)
- Same 3-report threshold within 50 miles
- Reported comments auto-hide and give strikes

### User Reputation Score
- **Positive Actions:** Hearts received, helpful comments, consistent engagement
- **Negative Actions:** Reports received, strikes accumulated
- **Visual Indicator:** Subtle badge/icon showing reputation level (not punitive)
- **Purpose:** Help users identify trusted community members

### Escalating Feature Loss
Beyond strikes, implement gradual feature restrictions:
- **Low Score (Tier 1):** Posting limited to 1 per day
- **Low Score (Tier 2):** Cannot create posts, can only comment
- **Low Score (Tier 3):** Read-only for 7 days
- **Recovery:** Good behavior over 30 days restores full access

### Admin Review Queue
- Human moderators review auto-hidden content
- Can **restore** posts if reports were invalid (removes strike from user)
- Can **confirm hide** if reports were valid
- Can **escalate to permanent ban** for severe violations

---

## What We Don't Support

### ❌ User-to-User Blocking
- **Reason:** We believe in open communities, not echo chambers
- **Alternative:** Report inappropriate content for community review

### ❌ Mute/Hide Features
- **Reason:** Users should engage with diverse perspectives
- **Alternative:** Content hidden only when community reports it

### ❌ Private Profiles
- **Reason:** VibesApp is a public social network
- **Alternative:** Users control what they post, not who can see it

### ❌ Appeal Process (Not Yet Built)
- **Current State:** No way to appeal strikes or permanent bans
- **Future:** Build appeal system where users can contest unfair reports

---

## Technical Implementation

### Database Schema

**Post/Comment Report:**
```javascript
{
  reports: [{
    userId: String,
    reason: 'pornographic' | 'spam' | 'hate_speech',
    location: { lat: Number, lon: Number },
    timestamp: Date
  }],
  isHidden: Boolean,
  hiddenAt: Date,
  hiddenBy: 'auto' | 'admin'
}
```

**User Strikes:**
```javascript
{
  strikes: [{
    reason: String,
    timestamp: Date,
    expiresAt: Date  // 30 days from timestamp
  }],
  isBanned: Boolean,
  bannedAt: Date
}
```

**User Methods:**
```javascript
getActiveStrikes()        // Returns strikes within 30 days
getCurrentRestrictions()  // Returns what user can't do
canPost()                // Check if user can create posts
canComment()             // Check if user can comment
```

### API Endpoints

**Report Content:**
- `POST /api/post/:postId/report`
- `POST /api/comment/:commentId/report` (Future)

**Get User Status:**
- `GET /api/user/strikes` - Returns active strikes and restrictions

**Admin Actions:**
- `GET /api/admin/reported-posts` - Review queue
- `POST /api/admin/post/:postId/restore` - Clear strike, unhide post
- `POST /api/admin/user/:userId/ban` - Permanent ban

---

## Design Rationale

### Why Community Moderation?
- **Scalable:** Doesn't require large moderation team
- **Democratic:** Community decides what's acceptable
- **Local:** 50-mile radius ensures cultural context matters
- **Fast:** Auto-hiding at 3 reports prevents content spread

### Why No Blocking?
- **Echo Chambers:** Blocking creates isolated bubbles
- **Abuse Potential:** Users could block to avoid accountability
- **Transparency:** Everyone sees the same content (unless community-reported)
- **Real Connections:** We want users to engage, not hide

### Why Graduated Restrictions?
- **Educational:** Users learn from temporary limits
- **Fair:** Punishment matches severity and frequency
- **Redemption:** Everyone deserves a second (and third) chance
- **Effective:** Immediate impact without permanent consequences

---

## Open Questions

1. **Comment Reporting Timeline:** When should we implement comment reports? (Current: Posts only)
2. **Appeal System:** Should users be able to contest strikes? How?
3. **Reputation Badges:** How to display user reputation without shaming?
4. **Admin Tools:** What additional admin features are needed for effective moderation?
5. **False Reports:** How to handle users who abuse the report system?
6. **Geographic Exceptions:** Should 50-mile radius vary by region density?

---

## Related Documentation

- `/docs/REBUILD/REBUILD-ACTION-PLAN.md` - Phase 3.4 implementation details
- `/apps/web-v2/PHASE-3.4-SUMMARY.md` - Strike system technical specs
- `/apps/web-v2/PHASE-3.4-IMPLEMENTATION-LOG.md` - Code implementation details
- `/docs/REBUILD/REBUILD-PROMPTS.md` - Community moderation prompts

---

**Note:** This moderation philosophy is a living document. As we learn from community behavior and identify new challenges, we'll iterate on this system to create the healthiest, most engaging social network possible.
