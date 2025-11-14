# Component Designs - Vibes App V2

**Updated:** November 5, 2025  
**Status:** Finalized - Settings Page & Profile Page Added

---

## Design Philosophy

- 🚫 **Anti-Algorithm:** No AI/ML content manipulation
- 🤝 **Human Connection:** Genuine interactions over engagement metrics
- 📸 **Photography-First:** Every post requires a photo
- 👍 **Likes/Dislikes:** Vibes score represents content quality (thumbs up/down)
- 🛡️ **Community Moderation:** Dislikes flag content + affect vibes score
- ⚖️ **User Polarity:** YIN/YANG is a user profile field (masculinity/femininity identity)
- 🔐 **Privacy-First:** DM requests require approval
- ZEN Data Viewing Principles: 
    - Loading: Wait 1 second before showing spinner (avoid flashing)
    - Empty data: Show nothing (pure transparency)
    - Errors: Console.log only, NEVER show to user


## 1. Activity Feed (Zen Mode - Unread First)

### Desktop Layout

```
┌────────────────────────────────────────────────────┐
│  Activity                                     [⚙️] │
├────────────────────────────────────────────────────┤
│  [All (12)] [Messages (2)] [Social (5)] [Me (5)] [Read] │ ← Tabs (unread counts)
├────────────────────────────────────────────────────┤
│  💡 Showing unread only • [Show all]               │ ← Zen mode indicator
├────────────────────────────────────────────────────┤
│                                                    │
│  📬 Messages (2 unread)             [Mark all ✓]  │
│  ┌──────────────────────────────────────────────┐ │
│  │ 🟢 @sarah                               2m   │ │
│  │    "Hey! Want to grab coffee sometime?"     │ │
│  │    [View Message] [Accept Request]          │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ 🟢 @mike mentioned you in Tech Group    5m  │ │
│  │    "@you Check out this article!"           │ │
│  │    [View Chat]                               │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  👥 Social (5)                      [Mark all ✓]  │
│  ┌──────────────────────────────────────────────┐ │
│  │ @alex started following you            15m  │ │
│  │ 📍 Chicago, IL • INFJ                       │ │
│  │ [View Profile] [Follow Back]                 │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ @jenny posted a new photo               1h  │ │
│  │ [Thumbnail] "Sunset at the pier"            │ │
│  │ 📍 Chicago                                   │ │
│  │ [View Post]                                  │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ @chris posted nearby                    2h  │ │
│  │ [Thumbnail] "Coffee shop vibes"             │ │
│  │ 📍 2.3 km away                               │ │
│  │ [View Post]                                  │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  📸 Your Posts (5)                  [Mark all ✓]  │
│  ┌──────────────────────────────────────────────┐ │
│  │ 12 people liked "Sunset photo"         2h  │ │
│  │ [Thumbnail] 👍 12 • 👎 2                    │ │
│  │ [View Post]                                  │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ @emma commented on your post            3h  │ │
│  │ [Thumbnail] "Love this shot! 📷"            │ │
│  │ [View Comment] [Reply]                       │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ @ryan replied to your comment           4h  │ │
│  │ "Thanks! Used my new lens"                  │ │
│  │ [View Thread]                                │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [Load more...]                                   │
└────────────────────────────────────────────────────┘
```

### Read Tab (Separate Category)

```
┌────────────────────────────────────────────────────┐
│  Activity > Read                              [⚙️] │
├────────────────────────────────────────────────────┤
│  [All (12)] [Messages (2)] [Social (5)] [Me (5)] [Read] │
├────────────────────────────────────────────────────┤
│  📖 Showing read notifications                     │
│  [Clear All Read] [Filter ▼]                      │
├────────────────────────────────────────────────────┤
│                                                    │
│  Earlier Today                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ ✓ @alex started following you          2h   │ │
│  │ 📍 Chicago, IL • INFJ                       │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  Yesterday                                         │
│  ┌──────────────────────────────────────────────┐ │
│  │ ✓ 8 people liked "Coffee shop"        1d   │ │
│  │ [Thumbnail]                                 │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ ✓ @emma commented on your post         1d   │ │
│  │ "Great shot!"                               │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [Load more...]                                   │
│                                                    │
│  Auto-clear read after: [7 days ▼]               │
└────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────────────────────┐
│  Activity               [⚙️ 12] │ ← Unread badge only
├─────────────────────────────────┤
│ [All 12] [💬 2] [👥 5] [📸 5] [✓] │ ← Read tab (no count)
### Activity States & Behavior

#### Unread (Default View - Zen Mode)
- **Clean Interface:** Only shows unread/new notifications
- **No Clutter:** Read notifications automatically moved to "Read" tab
- **Badge Counts:** Each tab shows unread count only
- **Auto-Mark Read:** Mark as read when:
  - User clicks on notification
  - User views the linked content (post, message, profile)
  - User clicks "Mark all as read" in category
- **Smart Grouping:** Similar notifications grouped (e.g., "5 people liked your post")

#### Read Tab (Archive)
- **Separate Tab:** Keeps unread view clean
- **Time-based Organization:** Today, Yesterday, This Week, Older
- **Auto-cleanup:** Delete read notifications after 7 days (configurable)
- **Search & Filter:** Find old notifications
- **Restore to Unread:** Option to mark as unread

### Activity Types & Priority

#### High Priority (🔴 Messages Tab - Unread Only)
1. **DM Requests** - Requires user action (always stays until acted upon)
2. **New DM Messages** - Unread messages

#### Medium Priority (🟡 Social Tab - Unread Only)
5. **New Followers** - Someone started following you
6. **New Posts from Following** - Friend posted
7. **Nearby Posts** - Someone posted nearby (if enabled)

#### Low Priority (🔵 Me Tab - Unread Only)
8. **Likes** - Likes on your posts (grouped: "12 people liked your post") 👍
9. **Dislikes** - Dislikes on your posts (affects vibes score) 👎
10. **Comments** - Someone commented
11. **Replies** - Someone replied to your comment
12. **Auto-Hidden Post** - Your post was hidden (3+ dislikes, stays unread until dismissed)
│                                 │
│  ┌─────────────────────────┐   │
│  │ @alex followed you      │   │
│  │ INFJ • Chicago     15m  │   │
│  │ [Profile] [Follow Back] │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [@] @jenny posted       │   │
│  │ Sunset at pier     1h   │   │
│  │ [View Post]             │   │
│  └─────────────────────────┘   │
│                                 │
│  [Load more...]                │
└─────────────────────────────────┘
```

### Activity Types & Priority

#### High Priority (🔴 Messages Tab)
1. **DM Requests** - Requires user action
2. **New DM Messages** - Unread messages

#### Medium Priority (🟡 Social Tab)
5. **New Followers** - Someone started following you
6. **New Posts from Following** - Friend posted
7. **Nearby Posts** - Someone posted nearby (if enabled)

#### Low Priority (🔵 Me Tab)
8. **Likes** - Likes on your posts 👍
9. **Dislikes** - Dislikes on your posts (affects vibes score) 👎
10. **Comments** - Someone commented
11. **Replies** - Someone replied to your comment
12. **Auto-Hidden Post** - Your post was hidden (3+ dislikes)

### Component Structure

```typescript
interface Activity {
  id: string;
  type: ActivityType;
  category: 'messages' | 'social' | 'me';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  actor: {
    id: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
  target?: {
    type: 'post' | 'comment' | 'conversation';
    id: string;
    thumbnail?: string;
    preview?: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  }[];
  // Grouping support
  groupKey?: string; // e.g., "post:123:yang" to group likes
  groupCount?: number; // e.g., 5 people
  groupActors?: User[]; // First 3 actors shown
}

type ActivityType =
  | 'dm_request'
  | 'dm_message'
  | 'group_mention'
  | 'group_message'
  | 'new_follower'
  | 'post_from_following'
  | 'nearby_post'
  | 'post_like'
  | 'post_dislike'
  | 'post_comment'
  | 'comment_reply'
  | 'post_hidden';

// Activity grouping example
interface GroupedActivity extends Activity {
  groupKey: string;
  groupCount: number;
  groupActors: User[]; // First 3-5 users
  groupPreview: string; // e.g., "@sarah, @mike and 3 others"
}

// Example: Grouped likes
{
  id: 'group_post_123_like',
  type: 'post_like',
  category: 'me',
  isRead: false,
  groupKey: 'post:123:like',
  groupCount: 12,
  groupActors: [sarah, mike, alex],
  groupPreview: '@sarah, @mike, @alex and 9 others',
  target: {
    type: 'post',
    id: '123',
    thumbnail: 'https://...',
    preview: 'Sunset photo'
  }
}
```

### Settings & Configuration

```typescript
interface ActivitySettings {
  // Zen mode (default) - CONFIRMED Nov 4, 2025
  showUnreadOnly: boolean; // default: true
  
  // Auto-cleanup - CONFIRMED Nov 4, 2025
  autoDeleteReadAfterDays: number; // default: 7 days
  maxUnreadNotifications: number; // default: 100000 (cap to prevent DB bloat)
  
  // Grouping
  groupSimilarActivities: boolean; // default: true
  groupingTimeWindow: number; // minutes, default: 60
  
  // Auto-mark read
  markReadOnView: boolean; // default: true
  markReadOnClick: boolean; // default: true
  
  // Notifications
  enablePushNotifications: boolean;
  notifyOnMessages: boolean;
  notifyOnSocial: boolean;
  notifyOnMe: boolean;
}
```

---

## 2. Vibes System (Likes/Dislikes) - CORRECTED Nov 4, 2025

> **CRITICAL CLARIFICATION:**
> - **Vibes System:** Like 👍 / Dislike 👎 (affects post visibility + poster's vibes score)
> - **User Polarity (YIN/YANG):** Separate user profile field indicating masculinity/femininity identity
> - **NOT THE SAME:** Polarity (YIN/YANG) is NOT related to likes/dislikes
> - **Icons:** Use thumbs up/down for likes/dislikes, NOT YinYang symbols

### Post Vibes Display

```
┌────────────────────────────────────┐
│  Post Actions                      │
├────────────────────────────────────┤
│                                    │
│  [👍 15] [👎 3] [💬 8]            │
│   ↑ Like  ↑ Dislike  ↑ Reply      │
│                                    │
│  You liked this post               │
│                                    │
└────────────────────────────────────┘
```

### Behavior

```typescript
interface VibeAction {
  postId: string;
  vibeType: 'like' | 'dislike' | null; // null = remove vibe
  effects: {
    // Effect 1: Update post counts
    postLikeCount: number;
    postDislikeCount: number;
    
    // Effect 2: Update poster's vibes score (karma)
    posterVibesScoreDelta: number; // +4 for like, -10 for dislike
    
    // Effect 3: Moderation check (for dislikes only)
    shouldAutoHide: boolean; // true if >= 3 unique dislikes
    shouldNotifyAdmin: boolean; // true if auto-hidden
  };
}

// Dislike = report (auto-hide at 3+ unique dislikes)
const handleDislike = async (postId: string) => {
  // 1. Add dislike to post
  await api.addVibe(postId, 'dislike');
  
  // 2. Decrease poster's vibes score (karma penalty)
  await api.updateUserVibesScore(post.authorId, -10);
  
  // 3. Check if should auto-hide (CONFIRMED: 3+ unique dislikes)
  const dislikeCount = await api.getUniqueDislikeCount(postId);
  if (dislikeCount >= 3) { // THRESHOLD = 3 (Nov 4, 2025)
    await api.hidePost(postId);
    await api.notifyAdmin({
      type: 'auto_hidden',
      postId,
      dislikeCount,
    });
  }
  
  // 4. Update UI optimistically
  queryClient.setQueryData(['post', postId], (old) => ({
    ...old,
    dislikeCount: old.dislikeCount + 1,
    userVibe: 'dislike',
    isHidden: dislikeCount >= 3,
  }));
};
```

### User Profile Display (CORRECTED Nov 4, 2025)

> **Important:** User polarity (YIN/YANG) is a **user-set profile field** indicating masculinity/femininity identity. It is NOT displayed as a score or bar. It's NOT related to likes/dislikes on posts.

```
┌────────────────────────────────────┐
│  @username                   🟢    │
│  John Doe • INFJ                   │
│  Polarity: YANG (Masculine)        │
│                                    │
│  📍 Chicago, IL                    │
│  🎂 Joined Oct 2025                │
│                                    │
│  � Posts: 42                      │
│  👥 Followers: 128                 │
│  ➕ Following: 95                  │
│                                    │
│  Vibes Score: 245 (private)        │
│                                    │
└────────────────────────────────────┘
```

**Polarity Field:**
- User selects: YIN (Feminine) or YANG (Masculine) in profile settings
- Displayed as simple text, not a percentage or bar
- Optional field (user can leave blank)
- Used for personality-based matching/recommendations (like MBTI)

**Vibes Score:**
- Private karma score (195-399 range)
- Affected by likes/dislikes received on posts
- Controls feature access (DMs at 200+, etc.)
- NOT related to polarity field

---

## 3. Request-Based DM System

### DM Request Flow

#### Step 1: Request DM (from profile)

```
┌─────────────────────────────────┐
│  @sarah's Profile               │
│  [... profile info ...]         │
│                                 │
│  [📧 Request DM] [Follow]      │ ← Button
└─────────────────────────────────┘
```

#### Step 2: Request Modal

```
┌─────────────────────────────────┐
│  Request DM with @sarah    [×] │
├─────────────────────────────────┤
│                                 │
│  Send a message to @sarah:     │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Hey! I saw your post    │   │
│  │ about Chicago coffee    │   │
│  │ shops. Want to share    │   │
│  │ recommendations?        │   │
│  └─────────────────────────┘   │
│  0 / 200 characters             │
│                                 │
│  This message will be sent with │
│  your DM request. @sarah can    │
│  accept or decline.             │
│                                 │
├─────────────────────────────────┤
│      [Cancel]  [Send Request]   │
└─────────────────────────────────┘
```

#### Step 3: Pending State (requester's view)

```
┌─────────────────────────────────┐
│  @sarah's Profile               │
│                                 │
│  [📧 DM Requested] [Follow]    │
│        ↑                        │
│   Disabled, pending approval    │
└─────────────────────────────────┘
```

#### Step 4: Request Received (recipient's view)

```
┌─────────────────────────────────┐
│  Activity > Messages            │
├─────────────────────────────────┤
│  📬 DM Requests (1)             │
│                                 │
│  ┌─────────────────────────┐   │
│  │ @john wants to DM you   │   │
│  │ INFJ • Chicago     2m   │   │
│  │                         │   │
│  │ "Hey! I saw your post   │   │
│  │ about Chicago coffee    │   │
│  │ shops..."               │   │
│  │                         │   │
│  │ [Accept] [Decline]      │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

#### Step 5: Accepted - Conversation Created

```
┌─────────────────────────────────┐
│  Messages                       │
├─────────────────────────────────┤
│  ✅ Conversations (1)           │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🟢 @john       Just now │   │
│  │ "Hey! I saw your..."    │   │
│  └─────────────────────────┘   │
│                                 │
│  📬 Requests (0)                │
└─────────────────────────────────┘
```

#### Step 6: Declined - Cooldown Period (CONFIRMED Nov 4, 2025)

```
┌─────────────────────────────────┐
│  @sarah's Profile               │
│                                 │
│  [📧 Request DM] [Follow]      │
│        ↑                        │
│  Disabled for 2 days            │
│                                 │
│  ℹ️ You can request DM again    │
│     in 2 days (Nov 6)           │
└─────────────────────────────────┘
```

> **Updated Request Flow (Nov 13, 2025):**
> - **One Request at a Time:** Only one pending request can exist between any two users (either direction)
> - **No Cooldown on Decline:** When a request is declined, it's simply deleted. The sender can request again immediately
> - **Bi-directional Check:** Before sending, system checks if either user has already sent a request to the other
> - **Auto-Connect on Accept:** When accepted, conversation is immediately created with 'approved' status
> - **Message Button Intelligence:** 
>   - If conversation exists → Navigate to conversation
>   - If they sent you a request → Navigate to DM Requests tab
>   - If you sent a request → Show "Request Pending" message
>   - Otherwise → Show DM Request modal

### Component Structure

```typescript
interface DMRequest {
  _id: string;
  sender: User; // Populated sender user object
  recipient: string; // Recipient userId
  message?: string; // Initial message (max 200 chars)
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

interface Conversation {
  _id: string;
  user1Id: string;
  user2Id: string;
  lastRequesterId?: string;
  messages: Message[];
  status: 'pending' | 'approved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

interface DMRequestStatus {
  canSend: boolean;
  reason?: 'pending' | 'received' | 'connected';
  requestId?: string; // ID of pending request
  conversationId?: string; // ID of existing conversation
  message?: string; // Additional message to display
}
```

---

## 4. @Mention Autocomplete (CONFIRMED Nov 4, 2025)

> **Mention Scope:** @username mentions work in **Comments AND Captions**

```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │ @sa                       │  │ ← User typing
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ [@] @sarah                │  │ ← Suggestions
│  │ [@] @sam                  │  │
│  │ [@] @santiago             │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Usage contexts:**
- Post captions: "@sarah check this out!"
- Comments: "@john great shot!"

---

## 5. Search Interface (CONFIRMED Nov 4, 2025: Global Search)

### Global Search

> **Search Scope:** Global - search across all posts and users (not location-filtered)

```
┌─────────────────────────────────────────────┐
│  🔍 Search Vibes                       [×]  │
├─────────────────────────────────────────────┤
│  [Posts] [Users]                            │ ← Tabs
├─────────────────────────────────────────────┤
│                                             │
│  Recent Searches                            │
│  ┌─────────────────────────────────────┐   │
│  │ chicago sunset              [×] 2h  │   │
│  │ @sarah                      [×] 1d  │   │
│  │ coffee shops                [×] 3d  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Trending                                   │
│  ┌─────────────────────────────────────┐   │
│  │ #ChicagoVibes                       │   │
│  │ @mike                               │   │
│  │ downtown photography                │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Search Results (Posts)

```
┌─────────────────────────────────────────────┐
│  🔍 "chicago sunset"                   [×]  │
├─────────────────────────────────────────────┤
│  [Posts] [Users]                            │
├─────────────────────────────────────────────┤
│  Filters: [Location ▼] [Date ▼] [Vibes ▼]  │
├─────────────────────────────────────────────┤
│                                             │
│  Posts (24 results)                         │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [@] @jenny                     2h   │   │
│  │ [Thumbnail] "Chicago sunset"       │   │
│  │ "Beautiful sunset at the pier      │   │
│  │  today! #Chicago"                  │   │
│  │ 📍 Chicago • 👍 42 👎 3             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [@] @chris                     1d   │   │
│  │ [Thumbnail] "Sunset vibes"         │   │
│  │ "Another gorgeous Chicago sunset"  │   │
│  │ 📍 Chicago • 👍 28 👎 1             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Load more...]                             │
└─────────────────────────────────────────────┘
```

### Search Results (Users)

```
┌─────────────────────────────────────────────┐
│  🔍 "sarah"                            [×]  │
├─────────────────────────────────────────────┤
│  [Posts] [Users]                            │
├─────────────────────────────────────────────┤
│  Filters: [Location ▼] [MBTI ▼]            │
├─────────────────────────────────────────────┤
│                                             │
│  Users (8 results)                          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🟢 [@] @sarah                       │   │
│  │     Sarah Johnson • INFJ            │   │
│  │     📍 Chicago, IL                  │   │
│  │     Polarity: YANG • 42 posts       │   │
│  │     [View Profile] [Request DM]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚫ [@] @sarahM                      │   │
│  │     Sarah Martinez • ENFP           │   │
│  │     📍 Los Angeles, CA              │   │
│  │     Polarity: YIN • 18 posts        │   │
│  │     [View Profile] [Request DM]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Load more...]                             │
└─────────────────────────────────────────────┘
```

---

## 6. Admin Panel Detailed Design

### Admin Login

```
┌─────────────────────────────────┐
│                                 │
│         ☯ Vibes Admin          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Admin Password          │   │
│  │ ●●●●●●●●●●●●            │   │
│  └─────────────────────────┘   │
│                                 │
│        [Login to Admin]         │
│                                 │
│  Session expires in 1 hour      │
│                                 │
└─────────────────────────────────┘
```

### Admin Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  ☯ Vibes Admin                         @admin    [Logout]   │
├──────────────────────────────────────────────────────────────┤
│  [📊 Dashboard] [🚩 Flagged] [👥 Users] [⚙️ Settings]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Overview                                                    │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  │
│  │ Active Users   │ │ Posts Today    │ │ Reports Today  │  │
│  │ 1,234          │ │ 89             │ │ 12             │  │
│  │ +5% vs last wk │ │ +12% vs last wk│ │ -3% vs last wk │  │
│  └────────────────┘ └────────────────┘ └────────────────┘  │
│                                                              │
│  ⚠️ Urgent Actions                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🚩 3 posts auto-hidden in last hour                  │   │
│  │    [View Posts]                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📧 5 unreviewed flagged posts                        │   │
│  │    [Review Now]                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Activity (Last 7 Days)                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Posts         Reports        Auto-Hidden        │   │
│  │ 100 │                                                │   │
│  │  80 │   ███                                          │   │
│  │  60 │ █████                                          │   │
│  │  40 │ ███████                                        │   │
│  │  20 │ █████████                                      │   │
│  │   0 └──────────────────────────────────────────────│   │
│  │      Mon Tue Wed Thu Fri Sat Sun                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Flagged Posts View

```
┌──────────────────────────────────────────────────────────────┐
│  🚩 Flagged Posts                                           │
├──────────────────────────────────────────────────────────────┤
│  [All (12)] [Auto-Hidden (3)] [Under Review (9)]           │
│  Sort: [Most Reports ▼]                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🚨 [Thumbnail]                                        │   │
│  │  [ ] Select                                          │   │
│  │                                                       │   │
│  │ @baduser • 2h ago                                    │   │
│  │ 📍 Chicago                                           │   │
│  │ "Inappropriate content text..."                      │   │
│  │                                                       │   │
│  │ ⚠️ Auto-hidden (5 dislikes 👎 from unique users)     │   │
│  │                                                       │   │
│  │ Reporters: @user1, @user2, @user3, @user4, @user5   │   │
│  │                                                       │   │
│  │ [View Full Post] [Delete Post] [Dismiss Reports]    │   │
│  │ [Ban User (Easy)] [Delete User]                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⚠️ [Thumbnail]                                        │   │
│  │  [ ] Select                                          │   │
│  │                                                       │   │
│  │ @someuser • 5h ago                                   │   │
│  │ 📍 New York                                          │   │
│  │ "Spam content..."                                    │   │
│  │                                                       │   │
│  │ ⚠️ 3 dislikes 👎 from unique users (threshold met)   │   │
│  │                                                       │   │
│  │ Reporters: @user6, @user7, @user8                   │   │
│  │                                                       │   │
│  │ [View Full Post] [Delete Post] [Dismiss Reports]    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [✓ Select All] [Delete Selected Posts (Bulk)]             │
│  [Delete Orphaned S3 Images]                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### User Management

```
┌──────────────────────────────────────────────────────────────┐
│  👥 User Management                                         │
├──────────────────────────────────────────────────────────────┤
│  🔍 Search: [____________]  [Search]                        │
│  Filter: [All Users ▼] [Location ▼] [MBTI ▼]              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Users (1,234 total)                                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🟢 [@] @sarah                                        │   │
│  │     Sarah Johnson • INFJ                             │   │
│  │     📍 Chicago, IL                                   │   │
│  │     Polarity: YANG (Masculine)                       │   │
│  │     Vibes Score: 245 (private)                       │   │
│  │     42 posts • Joined Oct 2025                       │   │
│  │                                                       │   │
│  │     [View Profile] [Regenerate Password]             │   │
│  │     [View Posts] [Ban User] [Delete User]           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⚫ [@] @baduser (BANNED)                             │   │
│  │     Bad Actor • INTJ                                 │   │
│  │     📍 Unknown                                       │   │
│  │     Polarity: YIN (Feminine)                         │   │
│  │     Vibes Score: 45 (low - restricted access)        │   │
│  │     8 posts • Joined Nov 2025                        │   │
│  │     ⚠️ 3 posts auto-hidden                           │   │
│  │                                                       │   │
│  │     [View Profile] [Regenerate Password]             │   │
│  │     [View Posts] [Unban User] [Delete User]         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [Load more...]                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Activity Feed - Zen Mode Features

### Smart Grouping Examples

#### Grouped Likes
```
┌─────────────────────────────────┐
│ 👍 12 people liked your post   │
│ [@][@][@] @sarah, @mike and    │
│            10 others       2h   │
│ [Thumbnail] "Sunset photo"     │
│ [View Post]                     │
└─────────────────────────────────┘
```

#### Grouped New Followers
```
┌─────────────────────────────────┐
│ 👥 5 new followers              │
│ [@][@][@] @alex, @emma and     │
│            3 others      Today  │
│ [View All]                      │
└─────────────────────────────────┘
```

#### Individual Important Actions
```
┌─────────────────────────────────┐
│ 🚨 Your post was auto-hidden    │
│ "Coffee shop vibes" received    │
│ 3 dislikes from community       │
│ [View Post] [Contact Support]   │
└─────────────────────────────────┘
```

### Zen Mode Benefits
✅ **Clean Interface** - Only unread items visible
✅ **Reduced Anxiety** - No overwhelming notification backlog
✅ **Smart Grouping** - Similar items grouped together
✅ **Action-Focused** - Clear next steps for each item
✅ **Optional Archive** - Read tab for reference without clutter

### User Flow: Mark as Read
```typescript
// Auto-mark read on interaction
const handleActivityClick = (activity: Activity) => {
  // 1. Navigate to target
  router.push(activity.target.url);
  
  // 2. Mark as read (API call)
  markActivityRead(activity.id);
  
  // 3. Update UI (optimistic)
  setActivities(prev => prev.filter(a => a.id !== activity.id));
  
  // 4. Move to read tab (background)
  // User sees clean list immediately
};

// Manual mark all as read
const handleMarkAllRead = async (category: Category) => {
  await markCategoryRead(category);
  
  // Show success
  toast.success('All marked as read');
  
  // Clear unread list
  setActivities([]);
};
```

---

## 8. Settings Page (Updated Nov 5, 2025)

**Route:** `/settings/account` and `/settings/preferences`  
**Access:** Via Settings button in navigation  
**Layout:** Full page with tabs (NO modals)  
**Tabs:** Account | Preferences | Support

### Mobile Layout (Primary - 95% Usage)

```
┌─────────────────────────────────┐
│  ← Settings                     │
├─────────────────────────────────┤
│ [Account] [Preferences] [Support]│ ← Tabs
├─────────────────────────────────┤
│                                 │
│  ACCOUNT TAB                    │
│                                 │
│  Profile Photo                  │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │      [@]                │   │
│  │                         │   │
│  │  [Change Photo]         │   │
│  └─────────────────────────┘   │
│                                 │
│  Bio                            │
│  ┌─────────────────────────┐   │
│  │ Coffee lover, INFJ      │   │
│  │ Love photography! 📷    │   │
│  └─────────────────────────┘   │
│  142/200 characters             │ ← Shown at 180+
│                                 │
│  MBTI Type                      │
│  [INFJ ▼]                       │
│                                 │
│  Location (Zip Code)            │
│  [60601____] [📍]               │ ← GPS button
│  📍 Chicago, IL                 │
│                                 │
│  Polarity                       │
│  Yin [━━○] Yang                 │ ← Toggle
│      (Currently: Yang)          │
│                                 │
│  ───────────────────────────    │
│                                 │
│  Security                       │
│  [Copy Pigeon ID]               │
│                                 │
│  [!] Never Share! Anyone with   │
│  your Pigeon Id can pretend     │
│  to be you.                     │
│                                 │
│  ───────────────────────────    │
│                                 │
│  [Logout]                       │ ← Bottom of page
│                                 │
└─────────────────────────────────┘
```

### Preferences Tab

```
┌─────────────────────────────────┐
│  ← Settings                     │
├─────────────────────────────────┤
│ [Account] [Preferences] [Support]│
├─────────────────────────────────┤
│                                 │
│  PREFERENCES TAB                │
│                                 │
│  Nearby Posts Radius            │
│  ┌─────────────────────────┐   │
│  │ [100 kilometers ▼]      │   │
│  │  • 50 kilometers        │   │
│  │  ✓ 100 kilometers       │   │
│  │  • 150 kilometers       │   │
│  └─────────────────────────┘   │
│                                 │
│  Determines the range for posts │
│  shown in your Nearby feed.     │
│                                 │
│  ───────────────────────────    │
│                                 │
│  (Future: Notification Settings)│
│                                 │
└─────────────────────────────────┘
```

### Support Tab

```
┌─────────────────────────────────┐
│  ← Settings                     │
├─────────────────────────────────┤
│ [Account] [Preferences] [Support]│
├─────────────────────────────────┤
│                                 │
│  SUPPORT TAB                    │
│                                 │
│  Help & Feedback                │
│  ┌─────────────────────────┐   │
│  │ [Send Feedback →]       │   │ ← Opens Telegram
│  └─────────────────────────┘   │
│                                 │
│  Legal                          │
│  ┌─────────────────────────┐   │
│  │ [Terms of Service]      │   │ ← Dead link (TBD)
│  │ [Privacy Policy]        │   │ ← Dead link (TBD)
│  └─────────────────────────┘   │
│                                 │
│  ───────────────────────────    │
│                                 │
│  App Version: 2.0.0             │
│                                 │
└─────────────────────────────────┘
```

### Desktop Layout (5% Usage)

```
┌────────────────────────────────────────────────────────┐
│  ← Back          Settings                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │ Account      │  │  Profile Photo                │  │
│  │              │  │  ┌────────────────────────┐   │  │
│  │ Preferences  │  │  │        [@]             │   │  │
│  │              │  │  │    [Change Photo]      │   │  │
│  │ Support      │  │  └────────────────────────┘   │  │
│  │              │  │                               │  │
│  └──────────────┘  │  Bio                          │  │
│                    │  ┌────────────────────────┐   │  │
│                    │  │ Coffee lover, INFJ     │   │  │
│                    │  └────────────────────────┘   │  │
│                    │  142/200 characters           │  │
│                    │                               │  │
│                    │  MBTI Type                    │  │
│                    │  [INFJ ▼]                     │  │
│                    │                               │  │
│                    │  Location (Zip Code)          │  │
│                    │  [60601____] [📍]             │  │
│                    │  📍 Chicago, IL               │  │
│                    │                               │  │
│                    │  Polarity                     │  │
│                    │  Yin [━━○] Yang.              │  │
│                    │                               │  │
│                    │  Security                     │  │
│                    │  [Copy Pigeon ID]             │  │
│                    │  [!] Never Share! Anyone with │  │
│                    │  your Pigeon Id can pretend   │  │
│                    │  to be you.                   │  │
│                    │                               │  │
│                    │  [Logout]                     │  │
│                    └───────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Auto-Save Behavior (ZEN Design - CRITICAL)

**Philosophy:** No "Save" buttons. Auto-save on blur. Silent, seamless.

```tsx
// Bio field
<textarea
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  onBlur={handleBioBlur}  // ← Auto-save trigger
  maxLength={200}
/>
{bio.length >= 180 && (  // ← Show counter only near limit
  <span className="text-sm text-gray-500">
    {bio.length}/200 characters
  </span>
)}

// Auto-save handler
const handleBioBlur = async (e) => {
  const newBio = e.target.value;
  
  // Validation
  if (newBio.length > 200) {
    setBio(previousBio); // Silent revert
    return;
  }
  
  // Queue change (debounced 300ms)
  queueAccountUpdate({ bio: newBio });
};

// Location with GPS
const handleGPSClick = async () => {
  if (navigator.geolocation) {
    setGpsLoading(true); // Show spinner if > 1s
    
    const timeout = setTimeout(() => {
      setShowSpinner(true); // 1s passed, show spinner
    }, 1000);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        setGpsLoading(false);
        setShowSpinner(false);
        
        // Geocode and save
        const { latitude, longitude } = position.coords;
        queueAccountUpdate({ 
          location: { lat: latitude, lng: longitude }
        });
      },
      (error) => {
        clearTimeout(timeout);
        setGpsLoading(false);
        setShowSpinner(false);
        // Silent fail - keep current value
      }
    );
  }
};

// Polarity toggle (single tap - binary: either YIN or YANG, no middle)
const handlePolarityToggle = () => {
  const newPolarity = polarity === 'YIN' ? 'YANG' : 'YIN';
  setPolarity(newPolarity);
  queueAccountUpdate({ polarity: newPolarity });
};

// Copy Pigeon ID
const handleCopyPigeonId = async () => {
  await navigator.clipboard.writeText(pigeonId);
  toast.success('Copied!'); // Brief toast
};
```

### Editable vs Read-Only Fields

**Editable in Account Settings:**
- ✅ Avatar (upload with crop)
- ✅ Bio (textarea, 200 char limit)
- ✅ MBTI (dropdown, can change)
- ✅ Location (zip code or GPS)
- ✅ Polarity (binary toggle: Yin OR Yang - no middle state)

**View-Only in Account Settings:**
- 🔒 Pigeon ID (copy button only)
- 🔒 Username (NOT shown - permanent, set at signup)
- 🔒 Age (NOT shown - calculated from birth date)

**Account vs Profile Distinction:**
- **Account (Settings):** Editable fields for user to update
- **Profile (Public):** Read-only view others see when clicking username

---

## 9. Profile Page (Public Read-Only View) - Updated Nov 5, 2025

**Route:** `/profile/:username`  
**Access:** Click any username throughout the app  
**Purpose:** View someone's public profile (or your own)

### Mobile Layout (Primary)

```
┌─────────────────────────────────┐
│  ← Back                         │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │        [@]              │   │ ← Avatar
│  └─────────────────────────┘   │
│                                 │
│  @johndoe            Age: 28    │ ← Username + Age
│  INFJ • YANG                    │ ← MBTI + Polarity
│  📍 2.3 km away                 │ ← Distance from you
│                                 │
│  Coffee lover, photographer     │ ← Bio
│  Love exploring Chicago! 📷     │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 24    │  156  │   89    │   │
│  │ Posts │ Followers │ Following│   │
│  └─────────────────────────┘   │
│                                 │
│  [Follow] [Message]             │ ← Actions
│                                 │
├─────────────────────────────────┤
│  Posts                          │
├─────────────────────────────────┤
│                                 │
│  ┌───────┐ ┌───────┐ ┌───────┐ │
│  │ IMG   │ │ IMG   │ │ IMG   │ │
│  │       │ │       │ │       │ │
│  └───────┘ └───────┘ └───────┘ │
│                                 │
│  ┌───────┐ ┌───────┐ ┌───────┐ │
│  │ IMG   │ │ IMG   │ │ IMG   │ │
│  │       │ │       │ │       │ │
│  └───────┘ └───────┘ └───────┘ │
│                                 │
│  [Load more...]                │
└─────────────────────────────────┘
```

### Desktop Layout

```
┌────────────────────────────────────────────────────────┐
│  ← Back to Posts                                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────┐  @johndoe                    Age: 28      │
│  │        │  INFJ • YANG                              │
│  │  [@]   │  📍 2.3 km away                           │
│  │        │                                           │
│  └────────┘  Coffee lover, photographer               │
│              Love exploring Chicago! 📷               │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │  24 Posts  │  156 Followers  │  89 Following  │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  [Follow] [Message]                                   │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Posts                                                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │  IMG   │ │  IMG   │ │  IMG   │ │  IMG   │        │
│  │        │ │        │ │        │ │        │        │
│  └────────┘ └────────┘ └────────┘ └────────┘        │
│                                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │  IMG   │ │  IMG   │ │  IMG   │ │  IMG   │        │
│  │        │ │        │ │        │ │        │        │
│  └────────┘ └────────┘ └────────┘ └────────┘        │
│                                                        │
│  [Load more...]                                       │
└────────────────────────────────────────────────────────┘
```

### Profile Display Rules

**Shown on Profile:**
- ✅ Username (permanent, set at signup)
- ✅ Age (calculated from birth month/year, e.g., "Age: 28")
- ✅ Avatar
- ✅ Bio
- ✅ MBTI
- ✅ Polarity (Yin/Yang)
- ✅ Location (as distance from viewer, e.g., "2.3 km away")
- ✅ Stats (posts, followers, following)
- ✅ Post grid

**NOT Shown on Profile:**
- ❌ Pigeon ID (security - only in Account settings)
- ❌ Birth date (privacy - only used for age calculation)
- ❌ Exact coordinates (privacy - only distance shown)

### Age Display Format

```tsx
// Calculate age from birth date
const calculateAge = (birthYear: number, birthMonth: number) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 0-indexed
  
  let age = currentYear - birthYear;
  if (currentMonth < birthMonth) {
    age--; // Birthday hasn't occurred yet this year
  }
  
  return age;
};

// Display in profile header
<div className="flex items-center gap-3">
  <h1 className="text-2xl font-bold">@{username}</h1>
  <span className="text-sm text-gray-500">Age: {age}</span>
</div>
```

### Location Display

```tsx
// Calculate distance from current user
const distance = calculateDistance(
  currentUser.location.lat,
  currentUser.location.lng,
  profileUser.location.lat,
  profileUser.location.lng
);

// Display
<div className="flex items-center gap-1 text-gray-600">
  <MapPin className="w-4 h-4" />
  <span>{distance.toFixed(1)} km away</span>
</div>
```

---

## Summary

**Total Component Count:** 35+ major components

### Week-by-Week Priorities:
1. **Week 1-2:** Admin Panel (8 components)
2. **Week 3:** Design System (8 base components)
3. **Week 4-6:** Posts & Auth (10 components)
4. **Week 7:** Profiles (public read-only view)
5. **Week 8-9:** Social Features (15 components)
   - **Activity Feed with Zen Mode** (unread focus + read tab)
6. **Week 10:** Settings Page (3 tabs) + Search
7. **Week 11-13:** Offline Support, Testing, Deployment

### Key Features (Updated Nov 5, 2025):
✅ **Settings Page** - Account/Preferences/Support tabs (no modals!)
✅ **Auto-Save Pattern** - No "Save" buttons, blur to save, silent errors (ZEN design)
✅ **Profile Page** - Read-only public view with age display
✅ **Polarity Toggle** - Single tap to switch Yin ↔ Yang
✅ **Proximity Range** - 50/100/150km dropdown (hidden from grid, in Preferences)
✅ **Pigeon ID Copy** - Simple copy button with security warning
✅ **Location Picker** - Zip code + GPS button (spinner if > 1s)
✅ **Activity Feed Zen Mode** - Unread only, separate Read tab
✅ **Mobile-First** - 95% mobile usage, optimize accordingly
✅ **Offline Indicator** - Small grey wifi icon in header
✅ **Character Counter** - Show only near limit (e.g., 180/200)

All designs are **finalized** and ready for implementation! 🎉

---

**Next Step:** Start building! Ready to create the first Vite project? 🚀
