# Component Designs - Vibes App V2

**Updated:** November 4, 2025  
**Status:** Finalized based on requirements discussion

---

## Design Philosophy

- 🚫 **Anti-Algorithm:** No AI/ML content manipulation
- 🤝 **Human Connection:** Genuine interactions over engagement metrics
- 📸 **Photography-First:** Every post requires a photo
- ⚖️ **Yin/Yang Balance:** Vibes represent polarity, not popularity
- 🛡️ **Community Moderation:** Dislikes flag content + affect polarity
- 🔐 **Privacy-First:** DM requests require approval

---

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
│  │ 12 Yang vibes on "Sunset photo"        2h  │ │
│  │ [Thumbnail] Yang: 12 • Yin: 2               │ │
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
│  │ ✓ 8 Yang vibes on "Coffee shop"       1d   │ │
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
3. **Group Chat Mentions** - @username in group
4. **Group Chat Messages** - Unread in groups

#### Medium Priority (🟡 Social Tab - Unread Only)
5. **New Followers** - Someone started following you
6. **New Posts from Following** - Friend posted
7. **Nearby Posts** - Someone posted nearby (if enabled)

#### Low Priority (🔵 Me Tab - Unread Only)
8. **Yang Vibes** - Likes on your posts (grouped: "12 people liked your post")
9. **Yin Vibes** - Dislikes on your posts (affects polarity)
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
3. **Group Chat Mentions** - @username in group
4. **Group Chat Messages** - Unread in groups

#### Medium Priority (🟡 Social Tab)
5. **New Followers** - Someone started following you
6. **New Posts from Following** - Friend posted
7. **Nearby Posts** - Someone posted nearby (if enabled)

#### Low Priority (🔵 Me Tab)
8. **Yang Vibes** - Likes on your posts
9. **Yin Vibes** - Dislikes on your posts (affects polarity)
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
  | 'post_yang'
  | 'post_yin'
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
  id: 'group_post_123_yang',
  type: 'post_yang',
  category: 'me',
  isRead: false,
  groupKey: 'post:123:yang',
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

## 2. Vibes System (Dual Purpose) - CONFIRMED Nov 4, 2025

> **Key Clarification:**
> - **Vibes System:** Like, Dislike/Report (affects post visibility + poster's vibes score)
> - **User Polarity:** Yin/Yang fields on user profile indicating masculinity/femininity
> - **NOT THE SAME:** Polarity is identity (like gender), NOT a score from likes/dislikes

### Post Vibes Display

```
┌────────────────────────────────────┐
│  Post Actions                      │
├────────────────────────────────────┤
│                                    │
│  [☯ 15 Yang] [☯ 3 Yin] [💬 8]    │
│   ↑ Like       ↑ Dislike  ↑ Reply │
│                                    │
│  Your vibe: Yang (can change)     │
│                                    │
└────────────────────────────────────┘
```

### Behavior

```typescript
interface VibeAction {
  postId: string;
  vibeType: 'yang' | 'yin' | null; // null = remove vibe
  effects: {
    // Effect 1: Update post vibe counts
    postYangCount: number;
    postYinCount: number;
    
    // Effect 2: Update poster's polarity
    posterPolarityDelta: number; // +1 for yang, -1 for yin
    
    // Effect 3: Moderation check (for yin only)
    shouldAutoHide: boolean; // true if >= 3 unique yin vibes
    shouldNotifyAdmin: boolean; // true if auto-hidden
  };
}

// Yin vibe = dislike + report
const handleYinVibe = async (postId: string) => {
  // 1. Add yin vibe to post
  await api.addVibe(postId, 'yin');
  
  // 2. Decrease poster's polarity
  await api.updateUserPolarity(post.authorId, -1);
  
  // 3. Check if should auto-hide (CONFIRMED: 3+ unique yin vibes)
  const yinCount = await api.getUniqueYinCount(postId);
  if (yinCount >= 3) { // THRESHOLD = 3 (Nov 4, 2025)
    await api.hidePost(postId);
    await api.notifyAdmin({
      type: 'auto_hidden',
      postId,
      yinCount,
    });
  }
  
  // 4. Update UI optimistically
  queryClient.setQueryData(['post', postId], (old) => ({
    ...old,
    yinCount: old.yinCount + 1,
    userVibe: 'yin',
    isHidden: yinCount >= 3,
  }));
};
```

### User Polarity Display on Profile (CONFIRMED Nov 4, 2025)

> **Important:** User polarity (Yin/Yang balance) is a **profile field indicating masculinity/femininity** - it is NOT calculated from post likes/dislikes. It's an identity characteristic (similar to gender), not a score system.

```
┌────────────────────────────────────┐
│  @username                   🟢    │
│  John Doe • INFJ                   │
│                                    │
│  ☯ Polarity: 65% Yang (Masculine)  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░              │
│  ← Yin (Feminine)   Yang (Masculine) → │
│                                    │
│  Identity characteristic           │
│  (not based on likes/dislikes)     │
│                                    │
│  📍 Chicago, IL                    │
│  🎂 Joined Oct 2025                │
│                                    │
│  📸 Posts: 42                      │
│  👥 Followers: 128                 │
│  ➕ Following: 95                  │
└────────────────────────────────────┘
```

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

> **Cooldown Rule:** If DM request is declined, requester cannot send another request to the same user for **2 days**.

### Component Structure

```typescript
interface DMRequest {
  id: string;
  from: User;
  to: User;
  message: string; // Initial message (max 200 chars)
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  respondedAt?: Date;
  cooldownUntil?: Date; // Set to +2 days if declined (CONFIRMED Nov 4, 2025)
}

interface Conversation {
  id: string;
  participants: User[];
  type: 'dm' | 'group';
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  isArchived: boolean;
}
```

---

## 4. Group Chat with Mentions

### Create Group Flow

```
┌─────────────────────────────────┐
│  Create Group Chat         [×]  │
├─────────────────────────────────┤
│                                 │
│  Group Name                     │
│  ┌─────────────────────────┐   │
│  │ Chicago Coffee Lovers   │   │
│  └─────────────────────────┘   │
│                                 │
│  Add Members (2-50)             │
│  ┌─────────────────────────┐   │
│  │ 🔍 Search users...      │   │
│  └─────────────────────────┘   │
│                                 │
│  Selected (3):                  │
│  ┌─────────────────────────┐   │
│  │ [@] @sarah          [×] │   │
│  │ [@] @mike           [×] │   │
│  │ [@] @alex           [×] │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│      [Cancel]  [Create Group]   │
└─────────────────────────────────┘
```

### Group Chat with Mentions

```
┌─────────────────────────────────┐
│  ← Chicago Coffee Lovers  [⋮]  │
│     @you, @sarah, @mike +2     │
├─────────────────────────────────┤
│                                 │
│         Yesterday               │
│                                 │
│  @sarah                   3:45 │
│  ┌───────────────────────────┐ │
│  │ Hey everyone! Who's up    │ │
│  │ for coffee tomorrow?      │ │
│  └───────────────────────────┘ │
│                                 │
│  @mike                    3:47 │
│  ┌───────────────────────────┐ │
│  │ @sarah I'm in! Where?     │ │
│  └───────────────────────────┘ │
│                                 │
│  @you                     3:50 │
│               ┌───────────────┐│
│               │ @sarah @mike  ││ ← Mentions
│               │ How about The ││
│               │ Brew Lab at 2?││
│               └───────────────┘│
│                                 │
│         Today                   │
│                                 │
│  @alex                    Just │
│  ┌───────────────────────────┐ │
│  │ @you Sounds perfect!      │ │
│  │ See you there 👍          │ │
│  └───────────────────────────┘ │
│                                 │
│  @mike is typing...             │
│                                 │
├─────────────────────────────────┤
│  [@] ┌───────────────────┐ [📤]│
│      │ Type a message... │     │
│      └───────────────────┘     │
│                                 │
│  💡 Type @ to mention someone   │
└─────────────────────────────────┘
```

### @Mention Autocomplete (CONFIRMED Nov 4, 2025)

> **Mention Scope:** @username mentions work in **Comments, Group chat, AND Captions**

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
- Group chat: "@everyone meeting at 3pm"

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
│  │ 📍 Chicago • ☯ 42 Yang, 3 Yin      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [@] @chris                     1d   │   │
│  │ [Thumbnail] "Sunset vibes"         │   │
│  │ "Another gorgeous Chicago sunset"  │   │
│  │ 📍 Chicago • ☯ 28 Yang, 1 Yin      │   │
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
│  │     ☯ +15 (Yang) • 42 posts         │   │
│  │     [View Profile] [Request DM]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚫ [@] @sarahM                      │   │
│  │     Sarah Martinez • ENFP           │   │
│  │     📍 Los Angeles, CA              │   │
│  │     ☯ +8 (Yang) • 18 posts          │   │
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
│  │ ⚠️ Auto-hidden (5 Yin vibes from unique users)       │   │
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
│  │ ⚠️ 3 Yin vibes from unique users (threshold met)     │   │
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
│  │     ☯ Polarity: 65% Yang (Masculine)                │   │
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
│  │     ☯ Polarity: 20% Yang (Yin-dominant)             │   │
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

#### Grouped Likes (Yang Vibes)
```
┌─────────────────────────────────┐
│ ☯ 12 people liked your post    │
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
│ 3 Yin vibes from community      │
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

## Summary

**Total Component Count:** 30+ major components

### Week-by-Week Priorities:
1. **Week 1-2:** Admin Panel (8 components)
2. **Week 3:** Design System (8 base components)
3. **Week 4-6:** Posts & Auth (10 components)
4. **Week 7-9:** Social Features (15 components)
   - **Activity Feed with Zen Mode** (unread focus + read tab)
5. **Week 10-12:** Search, Polish, Testing

### Key Activity Feed Features:
✅ **Zen Mode** - Unread only by default
✅ **Separate Read Tab** - Archive without clutter
✅ **Smart Grouping** - Similar notifications grouped
✅ **Auto-cleanup** - Read items deleted after 7 days
✅ **Categorized Tabs** - Messages, Social, Me
✅ **Badge Counts** - Unread counts only

All designs are **finalized** and ready for implementation! 🎉

---

**Next Step:** Start building! Ready to create the first Vite project? 🚀
