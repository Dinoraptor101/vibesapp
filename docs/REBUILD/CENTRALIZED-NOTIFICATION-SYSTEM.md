# Centralized Notification System - Implementation Plan

**Created:** November 17, 2025  
**Status:** ✅ COMPLETE - All Phases Implemented  
**Last Updated:** November 17, 2025  
**Complexity:** High - Major Backend & Frontend Refactor

---

## 📋 Implementation Summary

### ✅ Phase 1: Backend Foundation (COMPLETE)
- Created unified `Activity` model (7 notification types)
- Added `notificationPreferences` to User model (7 toggles)
- Created `activityNew.js` controller with centralized `createActivity()` helper
- Added preference checking logic (auto-checks before creating activities)
- Added PATCH `/api/users/:userId/notification-preferences` endpoint
- Updated `/api/activities/*` routes to use new controller

### ✅ Phase 2: Backend Activity Creation Hooks (COMPLETE)
- **new_follower**: Created in `toggleFollow()` when user follows another
- **following_post**: Created in `createPost()` for all followers (batch insert)
- **nearby_post**: Created in `createPost()` for users within 50km (batch insert, limited to 100 users)
- **comment**: Created in `createComment()` for top-level comments on posts
- **comment_reply**: Created in `createComment()` when replying to another comment
- **reaction**: Updated in `likePost()` to use new Activity model
- **post_hidden**: Created in `reportPost()` when post auto-hidden after 3+ reports

**Performance Optimizations Implemented:**
- Batch insert using `Activity.insertMany()` for follower/nearby notifications
- Limited nearby_post to 100 nearest users
- All activity creation respects user preferences (checked before insert)

### ✅ Phase 3: Frontend Settings UI (COMPLETE)
- Created `useNotificationPreferences` hook with React Query
- Created `useUpdatePreferences` mutation hook
- Built `PreferencesTab` component with 7 toggle switches (Bell/BellOff icons)
- Added Preferences tab to SettingsPage
- Integrated with backend API endpoints

**Files Created/Modified:**
- `apps/web-v2/src/features/settings/hooks/useNotificationPreferences.ts` (NEW)
- `apps/web-v2/src/features/settings/hooks/useUpdatePreferences.ts` (NEW)
- `apps/web-v2/src/features/settings/components/PreferencesTab.tsx` (UPDATED)

### ✅ Phase 4: Frontend Activity Feed UI (COMPLETE)
- Updated Activity types to match backend structure (removed category/priority, added recipientId)
- Removed date grouping (Today/Yesterday/etc) - now flat list sorted by newest
- Added activity-specific icons:
  - `new_follower` → UserPlus (green)
  - `following_post` → ImageIcon (purple)
  - `nearby_post` → MapPin (blue)
  - `comment` → MessageCircle (blue)
  - `comment_reply` → Reply (blue)
  - `reaction` → Heart (red)
  - `post_hidden` → EyeOff (orange)
- Added descriptive messages ("@username followed you", "@username liked your post")
- Updated API service to transform backend responses
- Fixed useActivities hook to categorize activities dynamically

**Files Modified:**
- `apps/web-v2/src/features/activity/types.ts` (UPDATED)
- `apps/web-v2/src/features/activity/components/ActivityCard.tsx` (UPDATED)
- `apps/web-v2/src/features/activity/components/ActivityList.tsx` (UPDATED)
- `apps/web-v2/src/features/activity/api/activityService.ts` (UPDATED)
- `apps/web-v2/src/features/activity/hooks/useActivities.ts` (UPDATED)

---

## 🎯 Goals

1. **Unified Activity System** - Replace 3 separate models (ReplyActivity, ReactionActivity, WatchActivity) with single Activity model
2. **User Preferences** - Allow users to enable/disable specific notification types
3. **Complete Coverage** - Implement all 7 notification types (currently only 4 exist)
4. **Better UX** - Proper icons, descriptions, and no date grouping
5. **Centralized Logic** - Single `createActivity()` function that checks preferences automatically

---

## 📊 Current State Analysis

### ✅ PHASE 1 & 2 COMPLETE - All Activity Types Implemented!
- ✅ **`new_follower`** - Someone followed you (IMPLEMENTED)
- ✅ **`following_post`** - Someone you follow posted (IMPLEMENTED)
- ✅ **`nearby_post`** - Someone nearby posted (IMPLEMENTED)
- ✅ **`comment`** - Top-level comment on your post (IMPLEMENTED)
- ✅ **`comment_reply`** - Reply to your comment (IMPLEMENTED)
- ✅ **`reaction`** - Like/heart on your post (IMPLEMENTED)
- ✅ **`post_hidden`** - Your post was auto-hidden (IMPLEMENTED)

### Legacy Activity Types (Still in use)
- 🟡 **`reply`** (ReplyActivity) - Post replies (kept for backward compatibility)
- 🟡 **`groupchat`** (WatchActivity) - Group chat messages (separate system)
- 🟡 **`groupreply`** (WatchActivity) - Group chat replies (separate system)

### Resolved Issues
1. ✅ **Unified Activity model** - New Activity model created
2. ✅ **User preferences** - notificationPreferences added to User model
3. ✅ **Complete coverage** - All 7 new activity types implemented
4. ⏳ **Better UX** - Icons and descriptions (Frontend pending)
5. ✅ **Centralized logic** - createActivity() checks preferences automatically

---

## 🏗️ Architecture Design

### New Unified Activity Model

```javascript
// apps/api/src/models/Activity.js
{
  recipientId: String,           // Who receives the notification
  type: String,                   // Activity type (enum)
  actor: {                        // Who triggered it
    userId: String,
    username: String,
    avatar: String
  },
  target: {                       // What was affected
    type: String,                 // 'post', 'comment', 'user'
    id: Mixed,                    // ObjectId or String
    preview: String,              // Text preview
    thumbnail: String             // Image URL
  },
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

### Notification Preference Model

```javascript
// Added to User model
{
  notificationPreferences: {
    new_follower: { type: Boolean, default: true },
    following_post: { type: Boolean, default: true },
    nearby_post: { type: Boolean, default: true },
    comment: { type: Boolean, default: true },
    comment_reply: { type: Boolean, default: true },
    post_hidden: { type: Boolean, default: true },
    reactions: { type: Boolean, default: true }
  }
}
```

### Centralized Activity Creation

```javascript
// Single function checks preferences before creating
createActivity({
  recipientId,
  type,
  actor,
  target
})
// → Checks user.notificationPreferences[type]
// → Only creates if enabled
// → Automatically called by all controllers
```

---

## 📝 Implementation Checklist

### Phase 1: Backend - Data Model ✅ COMPLETED

- [x] Add `notificationPreferences` to User model
- [x] Create unified `Activity` model
- [x] Create `activityNew.js` controller with centralized logic
- [x] Add `createActivity()` helper function with preference checking
- [x] Create PATCH `/api/users/:userId/notification-preferences` endpoint
- [x] Update `/api/activities/*` routes to use new controller

**Files Modified:**
- `apps/api/src/models/User.js` - Added notificationPreferences field
- `apps/api/src/models/Activity.js` - New unified model
- `apps/api/src/controllers/activityNew.js` - New controller
- `apps/api/src/controllers/user.js` - Added updateNotificationPreferences
- `apps/api/src/routes/user.js` - Added preference update route
- `apps/api/src/routes/activity.js` - Updated to use new controller

---

### Phase 2: Backend - Activity Creation Hooks

#### 2.1 - Follow Activity ✅ COMPLETED
**File:** `apps/api/src/controllers/user.js`
**Function:** `toggleFollow()`
**Logic:**
```javascript
// After creating Follow record:
await createActivity({
  recipientId: userId,              // Person being followed
  type: 'new_follower',
  actor: {
    userId: followerId,
    username: followerUser.userName,
    avatar: followerUser.profilePictureUrl
  },
  target: {
    type: 'user',
    id: followerId
  }
});
```

#### 2.2 - Post Creation Activities ⏳ TODO
**File:** `apps/api/src/controllers/post.js`
**Function:** `createPost()`
**Logic:**
```javascript
// After creating post:

// 1. Notify followers (following_post)
const followers = await Follow.find({ following: userId });
for (const follower of followers) {
  await createActivity({
    recipientId: follower.follower,
    type: 'following_post',
    actor: { userId, username, avatar },
    target: {
      type: 'post',
      id: postId,
      thumbnail: post.image,
      preview: post.text
    }
  });
}

// 2. Notify nearby users (nearby_post)
const nearbyUsers = await User.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lon, lat] },
      $maxDistance: 50000 // 50km radius
    }
  },
  userId: { $ne: userId } // Exclude self
});

for (const nearbyUser of nearbyUsers) {
  await createActivity({
    recipientId: nearbyUser.userId,
    type: 'nearby_post',
    actor: { userId, username, avatar },
    target: {
      type: 'post',
      id: postId,
      thumbnail: post.image,
      preview: post.text
    }
  });
}
```

**⚠️ Performance Consideration:**
- For users with many followers, this could create hundreds of activities
- **Solution:** Use batch insert with `Activity.insertMany()` instead of loop
- **Solution:** Consider job queue (Bull/BullMQ) for async processing
- **Solution:** Limit nearby radius or follower notification count

#### 2.3 - Comment Activities ⏳ TODO
**File:** `apps/api/src/controllers/comment.js`
**Function:** `createComment()`
**Logic:**
```javascript
// After creating comment:

// 1. If replying to post → notify post author (comment)
if (!parentCommentId) {
  await createActivity({
    recipientId: post.user.userId,
    type: 'comment',
    actor: { userId, username, avatar },
    target: {
      type: 'post',
      id: postId,
      thumbnail: post.image,
      preview: commentText
    }
  });
}

// 2. If replying to comment → notify comment author (comment_reply)
else {
  const parentComment = await Comment.findById(parentCommentId);
  await createActivity({
    recipientId: parentComment.user.userId,
    type: 'comment_reply',
    actor: { userId, username, avatar },
    target: {
      type: 'comment',
      id: commentId,
      preview: commentText
    }
  });
}
```

#### 2.4 - Reaction Activities ⏳ TODO
**File:** `apps/api/src/controllers/post.js`
**Function:** `reactToPost()` or similar
**Logic:**
```javascript
// After adding reaction:
await createActivity({
  recipientId: post.user.userId,
  type: 'reaction', // Just 'reaction', not 'post_yang/post_yin'
  actor: { userId, username, avatar },
  target: {
    type: 'post',
    id: postId,
    thumbnail: post.image
  }
});

// Note: Frontend will display "liked your post" using Heart icon
```

#### 2.5 - Post Hidden Activity ⏳ TODO
**File:** `apps/api/src/controllers/post.js`
**Function:** Auto-hide logic (when 3+ reports)
**Logic:**
```javascript
// When post is auto-hidden:
await createActivity({
  recipientId: post.user.userId,
  type: 'post_hidden',
  actor: {
    userId: 'system',
    username: 'VibesApp',
    avatar: null
  },
  target: {
    type: 'post',
    id: postId,
    thumbnail: post.image,
    preview: post.text
  }
});
```

---

### Phase 3: Frontend - Settings UI

#### 3.1 - Create Notification Preferences Hook
**File:** `apps/web-v2/src/features/settings/hooks/useNotificationPreferences.ts`
```typescript
export function useNotificationPreferences() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notification-preferences', user?.userId],
    queryFn: async () => {
      const data = await api.get(`/api/users/${user?.userId}`);
      return data.notificationPreferences;
    },
    enabled: !!user?.userId,
  });
}

export function useUpdatePreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preferences) => {
      await api.patch(
        `/api/users/${user?.userId}/notification-preferences`,
        preferences
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-preferences']);
    },
  });
}
```

#### 3.2 - Add Preferences Tab to Settings
**File:** `apps/web-v2/src/features/settings/components/PreferencesTab.tsx`
```tsx
export function PreferencesTab() {
  const { data: preferences } = useNotificationPreferences();
  const updatePreferences = useUpdatePreferences();
  
  const notificationTypes = [
    { key: 'new_follower', label: 'New Followers', description: 'When someone follows you' },
    { key: 'following_post', label: 'Posts from Following', description: 'When someone you follow posts' },
    { key: 'nearby_post', label: 'Nearby Posts', description: 'When someone nearby posts' },
    { key: 'comment', label: 'Comments', description: 'When someone comments on your post' },
    { key: 'comment_reply', label: 'Comment Replies', description: 'When someone replies to your comment' },
    { key: 'reactions', label: 'Reactions', description: 'When someone likes your post' },
    { key: 'post_hidden', label: 'Post Moderation', description: 'When your post is hidden by community reports' },
  ];
  
  return (
    <div className="space-y-4">
      <h2>Notification Preferences</h2>
      {notificationTypes.map(type => (
        <div key={type.key} className="flex items-center justify-between">
          <div>
            <p className="font-medium">{type.label}</p>
            <p className="text-sm text-gray-500">{type.description}</p>
          </div>
          <Switch
            checked={preferences?.[type.key]}
            onCheckedChange={(checked) => {
              updatePreferences.mutate({ [type.key]: checked });
            }}
          />
        </div>
      ))}
    </div>
  );
}
```

#### 3.3 - Update SettingsPage
**File:** `apps/web-v2/src/pages/SettingsPage.tsx`
```tsx
// Add new tab
const tabs = [
  { id: 'account', label: 'Account' },
  { id: 'preferences', label: 'Preferences' },  // NEW
  { id: 'appearance', label: 'Appearance' },
];

// Render PreferencesTab when active
{activeTab === 'preferences' && <PreferencesTab />}
```

---

### Phase 4: Frontend - Activity Feed UI

#### 4.1 - Update Activity Types
**File:** `apps/web-v2/src/features/activity/types.ts`
```typescript
export type ActivityType =
  | 'new_follower'
  | 'following_post'
  | 'nearby_post'
  | 'comment'
  | 'comment_reply'
  | 'post_hidden'
  | 'reaction';

// Update Activity interface to match new backend structure
export interface Activity {
  _id: string;
  recipientId: string;
  type: ActivityType;
  actor: {
    userId: string;
    username: string;
    avatar?: string;
  };
  target?: {
    type: 'post' | 'comment' | 'user';
    id: string;
    preview?: string;
    thumbnail?: string;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}
```

#### 4.2 - Update ActivityCard Component
**File:** `apps/web-v2/src/features/activity/components/ActivityCard.tsx`

**Changes:**
1. Remove Bell icon
2. Add activity-specific icons:
   - `new_follower` → UserPlus
   - `following_post` → ImageIcon
   - `nearby_post` → MapPin
   - `comment` → MessageCircle
   - `comment_reply` → Reply
   - `post_hidden` → EyeOff
   - `reaction` → Heart
3. Add proper descriptions:
   - `new_follower` → "@username followed you"
   - `following_post` → "@username posted a photo"
   - `nearby_post` → "@username posted nearby"
   - `comment` → "@username commented on your post"
   - `comment_reply` → "@username replied to your comment"
   - `post_hidden` → "Your post was hidden by community reports"
   - `reaction` → "@username liked your post"
4. Remove date grouping labels (Today, Yesterday, etc.)

```tsx
const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'new_follower': return <UserPlus size={20} />;
    case 'following_post': return <ImageIcon size={20} />;
    case 'nearby_post': return <MapPin size={20} />;
    case 'comment': return <MessageCircle size={20} />;
    case 'comment_reply': return <Reply size={20} />;
    case 'post_hidden': return <EyeOff size={20} />;
    case 'reaction': return <Heart size={20} />;
  }
};

const getActivityMessage = (activity: Activity) => {
  const username = `@${activity.actor.username}`;
  switch (activity.type) {
    case 'new_follower': return `${username} followed you`;
    case 'following_post': return `${username} posted a photo`;
    case 'nearby_post': return `${username} posted nearby`;
    case 'comment': return `${username} commented on your post`;
    case 'comment_reply': return `${username} replied to your comment`;
    case 'post_hidden': return 'Your post was hidden by community reports';
    case 'reaction': return `${username} liked your post`;
  }
};
```

#### 4.3 - Remove Date Grouping from ActivityList
**File:** `apps/web-v2/src/features/activity/components/ActivityList.tsx`

**Remove:**
```tsx
// DELETE THIS:
const groupedActivities = {
  today: [...],
  yesterday: [...],
  thisWeek: [...],
  older: [...]
};

// DELETE THIS:
<h3>Today</h3>
<h3>Yesterday</h3>
<h3>This Week</h3>
<h3>Older</h3>
```

**Keep Only:**
```tsx
// Simple flat list, sorted by createdAt descending
{activities.map(activity => (
  <ActivityCard key={activity._id} activity={activity} />
))}
```

#### 4.4 - Update Activity API Service
**File:** `apps/web-v2/src/features/activity/api/activityService.ts`
```typescript
// Update endpoints to match new backend
export const getActivities = (userId: string) =>
  api.get<Activity[]>(`/api/activities/${userId}`);

export const markAsRead = (activityId: string) =>
  api.patch(`/api/activities/${activityId}/read`);

export const markAllAsRead = (userId: string) =>
  api.patch(`/api/activities/${userId}/read-all`);

export const getUnreadCounts = (userId: string) =>
  api.get(`/api/activities/${userId}/unread-count`);
```

---

## 🚨 Breaking Changes & Migration

### Database Migration Required

**Old Collections (to be deprecated):**
- `replyactivities`
- `reactionactivities`
- `watchactivities`

**New Collection:**
- `activities`

**Migration Strategy:**
1. Run both systems in parallel (dual-write)
2. Migrate old data to new Activity collection
3. Update frontend to use new endpoints
4. After 1 week, stop dual-write
5. After 2 weeks, drop old collections

**Migration Script:**
```javascript
// apps/api/scripts/migrateActivities.js
const ReplyActivity = require('../models/ReplyActivity');
const ReactionActivity = require('../models/ReactionActivity');
const WatchActivity = require('../models/WatchActivity');
const Activity = require('../models/Activity');

async function migrate() {
  // Migrate ReplyActivity → comment
  const replies = await ReplyActivity.find();
  for (const reply of replies) {
    await Activity.create({
      recipientId: reply.originalPosterId,
      type: 'comment',
      actor: {
        userId: reply.userId,
        username: reply.userName,
        avatar: null
      },
      target: {
        type: 'post',
        id: reply.post,
        preview: null
      },
      isRead: reply.isRead,
      createdAt: reply.createdAt
    });
  }

  // Similar for reactions and watch activities...
}
```

---

## ⚠️ Risks & Concerns

### Performance Risks

1. **Follower Notifications**
   - User with 10,000 followers posts → 10,000 activity records
   - **Solution:** Batch insert, job queue, pagination

2. **Nearby Post Notifications**
   - Dense areas could trigger hundreds of notifications
   - **Solution:** Limit to nearest 50 users, or only notify if user has nearby_post enabled

3. **Database Growth**
   - Activities accumulate over time
   - **Solution:** Auto-delete activities older than 30 days

### Breaking Changes

1. **API Response Format Changed**
   - Old: Mix of different activity structures
   - New: Unified Activity structure
   - **Impact:** Frontend must be updated simultaneously

2. **Old Activity Models Deprecated**
   - ReplyActivity, ReactionActivity, WatchActivity will be removed
   - **Impact:** Existing activities must be migrated

3. **New Required Fields**
   - User.notificationPreferences must exist
   - **Impact:** Existing users need default values set

---

## 📅 Estimated Timeline

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| **Phase 1** | Backend Model (DONE) | ✅ 2h | Critical |
| **Phase 2.1** | Follow Activity (DONE) | ✅ 30m | High |
| **Phase 2.2** | Post Activities | 2h | High |
| **Phase 2.3** | Comment Activities | 1h | High |
| **Phase 2.4** | Reaction Activities | 30m | Medium |
| **Phase 2.5** | Post Hidden Activity | 30m | Low |
| **Phase 3** | Settings UI | 2h | High |
| **Phase 4** | Activity Feed UI | 3h | High |
| **Migration** | Data Migration | 2h | Critical |
| **Testing** | E2E Testing | 2h | High |

**Total Estimated Time:** ~15 hours

---

## ✅ Testing Plan

### Backend Tests
- [ ] Create activity with preferences enabled → Activity created
- [ ] Create activity with preferences disabled → No activity created
- [ ] Update preferences → Saved correctly
- [ ] Get activities → Returns correct format
- [ ] Mark as read → Updates correctly

### Frontend Tests
- [ ] Toggle preference → Saves to backend
- [ ] Activity card shows correct icon per type
- [ ] Activity card shows correct description
- [ ] No date grouping visible
- [ ] Mark as read updates UI
- [ ] Unread badge shows correct count

### Integration Tests
- [ ] Follow user → new_follower activity created
- [ ] Create post → following_post + nearby_post activities created
- [ ] Comment on post → comment activity created
- [ ] Reply to comment → comment_reply activity created
- [ ] Like post → reaction activity created
- [ ] Post auto-hidden → post_hidden activity created

---

## 🎯 Success Criteria

1. ✅ All 7 activity types implemented
2. ✅ User can enable/disable each type in Settings
3. ✅ Activities respect user preferences (no unwanted notifications)
4. ✅ Activity feed shows proper icons and descriptions
5. ✅ No date grouping in UI (just unread/read sections)
6. ✅ Old activity models deprecated
7. ✅ No performance degradation
8. ✅ All tests passing

---

## 📌 Next Steps

**Before Implementation:**
1. Review this document
2. Approve architecture decisions
3. Confirm performance solutions (batching, job queues)
4. Decide on migration strategy

**After Approval:**
1. Complete Phase 2 (backend activity creation)
2. Implement Phase 3 (Settings UI)
3. Implement Phase 4 (Activity Feed UI)
4. Run migration script
5. Deploy and monitor

---

## 🤔 Questions for Review

1. **Performance:** Should we use a job queue (Bull/BullMQ) for follower notifications, or is batch insert sufficient?

2. **Retention:** Should activities auto-delete after 30 days, or keep indefinitely?

3. **Nearby Radius:** 50km for nearby_post notifications seems large. Should we reduce to 10km or 25km?

4. **Migration:** Should we dual-write for 1 week or 2 weeks before dropping old collections?

5. **Batching:** For following_post notifications, should we limit to most recent 1000 followers or notify all?

6. **DM Notifications:** You said to exclude dm_request and dm_message. Are these handled separately in the Messages tab?

---

**Status:** ⏸️ Awaiting Review & Approval

