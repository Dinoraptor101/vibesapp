# Phase 3.4 - Community Moderation System (Vibes System Redesign)

**Status:** Design Complete, Implementation Pending  
**Date:** November 7, 2025  
**Time:** ~2 hours (design discussion, no code changes)

## 🎯 Design Philosophy Change

### Original Design (Rejected)
- Like/Dislike reactions with weighted vibe scoring
- Algorithmic recommendations based on vibe scores
- "Popular" sort based on (likes - dislikes) calculation
- Proximal dislikes tracking for geographic patterns
- Hidden scoring algorithms

**Problem:** Conflicts with VibesApp's core philosophy of transparency and "no hidden algorithms"

### New Design (Approved)
- **Heart/Report System:** Positive reactions separated from moderation
- **Transparent Rules:** Community moderation with stated policies (3 reports within 50 miles = auto-hide)
- **No Hidden Algorithms:** All rules visible and understandable
- **Geographic Community Power:** Local users (50 miles) can trigger auto-hide
- **Strike System:** Graduated punishments with clear progression
- **Reformation Focus:** 30-day strike decay allows users to reform

**Core Principle:** "No hidden algorithms - only stated rules that everyone can see"

---

## 📋 Final Specifications

### Reactions System
- **Hearts Only:** Replace like/dislike with single positive reaction
- **Heart Count:** Display total hearts on each post (no vibe score calculation)
- **Report Button:** Separate from reactions, opens modal for reporting

### Report Flow
1. User clicks report button (🚩 icon next to heart)
2. Modal opens with 3 reason options:
   - Pornographic content
   - Spam
   - Hate speech / harassment
3. User selects reason and confirms
4. Post immediately hidden from reporter's feed
5. Report button disappears (can't report same post twice)
6. Report added to backend with: userId, reason, location, timestamp

### Auto-Hide Mechanism
**Trigger:** 3 reports from unique users within 50 miles of post location

**When triggered:**
1. Post soft-deleted (isDeleted: true, post still in database)
2. Post hidden from all users' feeds
3. Strike added to post author's account
4. Strike notification queued for next app open

**Geographic Rules:**
- Reports from users >50 miles away queue for manual admin review
- Only nearby users (≤50 miles) count toward auto-hide threshold
- Uses post location, not reporter's current location

### Strike System

#### Scenario A: All 24h, Escalating Restrictions (IMPLEMENTED DESIGN)
- **Strike 1:** Can't post (24h cooldown)
- **Strike 2:** Can't post or comment (24h cooldown)
- **Strike 3:** Read-only mode - can't post, comment, or react (24h cooldown)
- **Strike 4:** Permanent ban (account deleted)

**Key Points:**
- Each strike resets to 24h (not cumulative time)
- Restrictions escalate with each strike
- Strike 3 allows browsing but no interactions
- Strike 4 is permanent (no appeal system in MVP)

#### Strike Decay (Sliding Window)
- **Window:** 30 days
- **Mechanism:** Strikes older than 30 days don't count toward progression
- **Example:** 
  - User has Strike 1 from 31 days ago
  - Check active strikes → 0 strikes
  - User can post normally
  - Next strike would be Strike 1 (not Strike 2)

**No Manual Expiration:**
- Strikes don't "expire" or get removed
- Only excluded from active count after 30 days
- Always visible in user's strike history

### Strike Notifications

**Trigger:** User opens app after receiving a strike

**Modal Content:**
- Strike count (e.g., "Strike 2 of 3")
- Violation reason from report
- Cooldown duration (24 hours)
- Current restrictions
- Link to community guidelines
- [Acknowledge] button to close

**Frequency:** Show once per strike (use localStorage flag)

### Admin Review Queue

**Access:** Admin-only route `/admin/reported-posts`

**Features:**
- List of all posts with 1+ reports
- Filter by: All, Auto-hidden, Pending review
- Sort by: Most reports, Recent reports

**Detailed View:**
For each reported post:
- Post thumbnail + caption
- Report breakdown (Porn: 2, Spam: 1, Hate: 0)
- Reporter usernames + locations + distances
- Post author info
- Author's strike history
- Post status (auto-hidden or pending)

**Actions:**
- **Restore Post:** Remove isDeleted flag, remove strike from author
- **Keep Hidden:** Confirm auto-hide was correct
- **Ban User:** Apply Strike 4 (permanent ban), hide all user's posts

---

## 🔧 Technical Implementation

### Backend Schema Changes

#### Post Model Updates
```javascript
// apps/api/src/models/Post.js

// NEW FIELDS:
{
  reports: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, enum: ['pornographic', 'spam', 'hate_speech'] },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    },
    timestamp: { type: Date, default: Date.now }
  }],
  isDeleted: { type: Boolean, default: false },
  hiddenAt: { type: Date },
  hiddenBy: { type: String, enum: ['auto', 'admin'] }
}

// KEEP EXISTING:
reactions: [{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['like'] } // Remove 'dislike' option
}]

// REMOVE:
// proximal_dislikes tracking (no longer needed)
```

#### User Model Updates
```javascript
// apps/api/src/models/User.js

// NEW FIELDS:
{
  strikes: [{
    reason: { type: String },
    timestamp: { type: Date, default: Date.now },
    expiresAt: { type: Date } // timestamp + 30 days
  }],
  
  // Methods:
  getActiveStrikes() {
    const now = new Date();
    return this.strikes.filter(s => s.expiresAt > now);
  },
  
  getCurrentRestrictions() {
    const activeStrikes = this.getActiveStrikes().length;
    return {
      canPost: activeStrikes < 1,
      canComment: activeStrikes < 2,
      canReact: activeStrikes < 3,
      isBanned: activeStrikes >= 4
    };
  }
}
```

### API Endpoints

#### POST /api/post/:postId/report
**Request:**
```json
{
  "reason": "spam",
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  }
}
```

**Logic:**
1. Validate user is authenticated
2. Check if user already reported this post → 403 if true
3. Add report to post.reports array
4. Filter reports within 50 miles of post location
5. If ≥3 nearby reports:
   - Set post.isDeleted = true
   - Set post.hiddenAt = now
   - Set post.hiddenBy = 'auto'
   - Add strike to post author
6. Return result

**Response:**
```json
{
  "success": true,
  "reportCount": 3,
  "isHidden": true
}
```

#### GET /api/user/strikes
**Response:**
```json
{
  "strikes": [
    {
      "reason": "Spam content",
      "timestamp": "2025-11-01T10:00:00Z",
      "expiresAt": "2025-12-01T10:00:00Z"
    }
  ],
  "activeStrikes": 1,
  "restrictions": {
    "canPost": false,
    "canComment": true,
    "canReact": true,
    "isBanned": false
  },
  "cooldownEndsAt": "2025-11-08T10:00:00Z"
}
```

#### GET /api/admin/reported-posts
**Query Params:**
- `filter`: 'all' | 'hidden' | 'pending'
- `sort`: 'reports' | 'recent'
- `page`: number
- `limit`: number

**Response:**
```json
{
  "posts": [
    {
      "postId": "...",
      "imageUrl": "...",
      "caption": "...",
      "author": { "userId": "...", "username": "..." },
      "reports": [
        {
          "userId": "...",
          "username": "...",
          "reason": "spam",
          "location": { "coordinates": [-122.4194, 37.7749] },
          "distance": "3.2 miles",
          "timestamp": "2025-11-07T10:00:00Z"
        }
      ],
      "reportCount": 3,
      "isHidden": true,
      "hiddenAt": "2025-11-07T10:05:00Z",
      "authorStrikes": 2
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalPosts": 47
  }
}
```

#### POST /api/admin/post/:postId/restore
**Logic:**
1. Set post.isDeleted = false
2. Remove post author's most recent strike
3. Clear post.reports array (or keep for history)

#### POST /api/admin/user/:userId/ban
**Logic:**
1. Add Strike 4 to user (permanent ban)
2. Set isDeleted = true on all user's posts
3. Invalidate user's sessions

### Frontend Components

#### Updated Components

##### PostActions.tsx
**Changes:**
- Replace like button with heart button (❤️)
- Remove dislike button
- Add report button (🚩)
- Remove vibe score display
- Show only heart count

**Report Button Logic:**
```typescript
const hasReported = post.reports?.some(r => r.userId === currentUser._id);

{!hasReported && (
  <button onClick={handleReport}>
    <Flag className="w-5 h-5" />
  </button>
)}
```

##### FilterBar.tsx
**Changes:**
- Remove "Popular" sort button
- Keep only: Recent, Nearby

#### New Components

##### ReportModal.tsx
**Props:**
```typescript
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onReportSuccess: () => void;
}
```

**Layout:**
```
┌─────────────────────────────┐
│   Report Post               │
│                             │
│   Why are you reporting?    │
│                             │
│   ( ) Pornographic content  │
│   ( ) Spam                  │
│   ( ) Hate speech           │
│                             │
│   [Cancel]  [Submit Report] │
└─────────────────────────────┘
```

##### StrikeNotificationModal.tsx
**Props:**
```typescript
interface StrikeNotificationModalProps {
  strike: {
    count: number;
    reason: string;
    cooldownEndsAt: string;
  };
  onAcknowledge: () => void;
}
```

**Layout:**
```
┌─────────────────────────────┐
│   ⚠️ Community Guideline    │
│      Violation              │
│                             │
│   Strike 2 of 3             │
│                             │
│   Your post was reported    │
│   for: Spam content         │
│                             │
│   You cannot post or        │
│   comment for 24 hours.     │
│                             │
│   [View Guidelines]         │
│   [I Understand]            │
└─────────────────────────────┘
```

##### AdminReviewQueue (ReportedPostsPage.tsx)
**Location:** `features/admin/pages/ReportedPostsPage.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  Reported Posts                     │
│                                     │
│  [All] [Auto-hidden] [Pending]     │
│  Sort: [Most Reports] [Recent]     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Image]  Caption text...    │   │
│  │          3 reports:         │   │
│  │          • Spam: 2          │   │
│  │          • Porn: 1          │   │
│  │                             │   │
│  │ Author: @username (2 strikes)│  │
│  │ Status: Auto-hidden         │   │
│  │                             │   │
│  │ Reporters:                  │   │
│  │ • @user1 (3.2 miles)       │   │
│  │ • @user2 (5.7 miles)       │   │
│  │ • @user3 (2.1 miles)       │   │
│  │                             │   │
│  │ [Restore] [Keep Hidden] [Ban]│  │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Custom Hooks

#### useReportPost.ts
```typescript
export const useReportPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      reason, 
      location 
    }: ReportPostParams) => {
      const response = await api.post(`/api/post/${postId}/report`, {
        reason,
        location
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Hide post from user's feed
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.filter((p: Post) => p._id !== variables.postId)
          }))
        };
      });
      
      // Show success toast
      toast.success('Post reported');
    }
  });
};
```

#### useUserStrikes.ts
```typescript
export const useUserStrikes = () => {
  return useQuery({
    queryKey: ['userStrikes'],
    queryFn: async () => {
      const response = await api.get('/api/user/strikes');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });
};
```

---

## 🎨 UI/UX Considerations

### User Experience
1. **Report Flow:** 2 clicks (button → reason → submit) - fast but intentional
2. **Immediate Feedback:** Post disappears from feed after reporting (don't see offensive content again)
3. **Strike Notifications:** Non-blocking, can be dismissed, shown once per strike
4. **Cooldown Messages:** Clear explanation when user tries restricted actions

### Visual Design
- **Heart Button:** Purple fill when liked, outlined when not
- **Report Button:** Red/orange warning color
- **Strike Modal:** Yellow warning background with ⚠️ icon
- **Admin Queue:** Color-coded by severity (3+ reports = red, 1-2 = yellow)

---

## ✅ Validation & Testing

### User Flow Tests
1. **Report Flow:**
   - Login as user
   - View a post
   - Click report button → modal opens
   - Select reason → submit
   - Verify: post disappears from feed
   - Verify: report button gone (can't report again)

2. **Auto-Hide:**
   - Create 3 test users within 50 miles
   - All report same post
   - Verify: post hidden from all feeds
   - Verify: post author gets strike
   - Login as author → see strike notification

3. **Strike Enforcement:**
   - User with Strike 1 tries to post → blocked
   - User with Strike 2 tries to comment → blocked
   - User with Strike 3 tries to react → blocked

4. **Strike Decay:**
   - Manually set strike timestamp to 31 days ago
   - Check active strikes → should be 0
   - User can post normally

### Admin Flow Tests
1. **Review Queue:**
   - Login as admin
   - Navigate to /admin/reported-posts
   - See all posts with reports
   - View detailed report information

2. **Restore Post:**
   - Click restore on auto-hidden post
   - Verify: post visible in feeds again
   - Verify: author's strike removed

3. **Ban User:**
   - Click ban on user
   - Verify: all user's posts hidden
   - Verify: user can't login

---

## 🚧 Known Limitations & Future Enhancements

### MVP Limitations
1. **No Appeal System:** Permanent bans have no appeal process
2. **Manual Admin Review:** Reports >50 miles require manual admin action
3. **No Strike History UI:** Users can't see their past strikes (only current)
4. **No Report History:** Users can't see which posts they've reported

### Future Enhancements
1. **Appeal System:** Allow users to appeal strikes/bans
2. **Strike Details:** Show reason and post for each strike
3. **Report Analytics:** Track false reports, malicious reporting
4. **Geographic Zones:** Configurable radius (not hardcoded 50 miles)
5. **Report Categories:** Expand beyond 3 basic reasons
6. **Strike Warnings:** Show warning before taking action that violates policy
7. **Community Guidelines:** In-app guidelines page
8. **Report Review Time:** Track how long posts sit in admin queue

---

## 📝 Documentation References

- **Design Discussion:** Session 23 in REBUILD-PROMPTS.md
- **Implementation Prompt:** Phase 3.4 in REBUILD-PROMPTS.md
- **API Contracts:** To be defined in `@vibesapp/contracts`
- **Backend Models:** apps/api/src/models/Post.js, User.js

---

## 🎯 Next Steps

1. ✅ Update REBUILD-PROMPTS.md with Phase 3.4 prompt (DONE)
2. ✅ Create PHASE-3.4-SUMMARY.md (THIS FILE)
3. ⏳ Begin implementation:
   - Update PostActions component
   - Create ReportModal component
   - Update backend Post/User models
   - Create report endpoint
   - Update FilterBar (remove Popular)
   - Create StrikeNotificationModal
   - Build admin review queue
   - Test end-to-end flow

**Estimated Implementation Time:** 6-8 hours

---

## 💡 Key Learnings

1. **Transparent Design Matters:** Users trust rules they can understand over hidden algorithms
2. **Community Moderation Works:** Local users (50 miles) have stake in content quality
3. **Reformation > Punishment:** 30-day strike decay encourages behavior change
4. **Geographic Context:** Distance from post matters for moderation relevance
5. **Clear Progression:** Users know exactly what happens at each strike level

**Design Philosophy:** "Build systems users can understand, not algorithms users must trust"
