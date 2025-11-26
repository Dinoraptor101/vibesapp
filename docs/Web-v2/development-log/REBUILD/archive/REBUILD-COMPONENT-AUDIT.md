# Component Audit - Current Frontend

**Purpose:** Comprehensive analysis of existing components to inform rebuild decisions

## Component Inventory

### Layout Components

#### 1. AppWrapper
**Location:** `src/components/AppWrapper/`  
**Purpose:** Main application container with global providers  
**Complexity:** ⭐⭐⭐⭐ High  
**Lines of Code:** ~200

**Current Features:**
- Theme context provider
- User authentication state
- Location services integration
- Service worker registration
- Error boundary

**Dependencies:**
- React Context
- localStorage for theme
- Cookie utilities
- Location services

**Rebuild Priority:** 🔥 Critical - First component to migrate  
**Estimated Effort:** 2 days

**Migration Notes:**
- Can be simplified with better context structure
- Split into smaller providers (ThemeProvider, AuthProvider, LocationProvider)
- Use React Query for auth state
- Consider Zustand for global state

---

#### 2. NavigationAware
**Location:** `src/components/NavigationAware/`  
**Purpose:** Triggers actions on route changes  
**Complexity:** ⭐⭐ Medium  
**Lines of Code:** ~50

**Current Features:**
- Monitors route changes
- Triggers unread status checks
- Scroll restoration

**Rebuild Priority:** 🟡 Medium  
**Estimated Effort:** 0.5 days

**Migration Notes:**
- Can use React Router's useLocation hook
- Consider moving to layout level
- Add route transition animations

---

### Content Display Components

#### 3. Post
**Location:** `src/components/Post/`  
**Purpose:** Display individual posts with all interactions  
**Complexity:** ⭐⭐⭐⭐⭐ Very High  
**Lines of Code:** ~500+

**Current Features:**
- Post content rendering (text + image)
- User info display
- Vibes (like/dislike) interaction
- Reply functionality
- Delete/Edit actions
- Original post display (for replies)
- Image lazy loading
- Time formatting
- User MBTI display

**Current CSS Classes:**
```
.post-container
.post-stack
.post-card
.post-header
.post-user-info
.post-date
.post-content
.post-image
.detail-post-image
.grid-post-image
.post-buttons
.post-button
.vibe-count
.original-post-card
```

**Sub-components Needed:**
- PostHeader (user info, date, actions)
- PostContent (text rendering with mentions/hashtags)
- PostImage (with lazy loading, skeleton)
- PostActions (vibes, reply, delete buttons)
- PostStats (vibe counts, reply count)
- OriginalPostPreview (for reply context)

**Dependencies:**
- apiService (vibes, delete)
- date-fns or similar for time formatting
- Link component for navigation
- FontAwesome icons

**Rebuild Priority:** 🔥 Critical  
**Estimated Effort:** 5 days

**Migration Notes:**
- **MUST BREAK INTO SMALLER COMPONENTS**
- Use composition pattern
- Extract business logic to custom hooks (usePostActions, usePostData)
- Optimize image loading with modern techniques
- Add skeleton loading states
- Improve accessibility (ARIA labels, keyboard nav)

**Tailwind Conversion Example:**
```tsx
// Before
<div className="post-card">
  <div className="post-header">
    ...
  </div>
</div>

// After
<Card className="overflow-hidden">
  <CardHeader className="flex items-center justify-between p-4">
    ...
  </CardHeader>
</Card>
```

---

#### 4. PostsGrid
**Location:** `src/components/PostsGrid/`  
**Purpose:** Grid layout for post feed  
**Complexity:** ⭐⭐⭐ Medium-High  
**Lines of Code:** ~300

**Current Features:**
- Infinite scroll
- Post filtering (nearby, following, all)
- Loading states
- Empty states
- Error handling

**Current CSS Classes:**
```
.posts-grid
.posts-grid-item
.posts-grid-empty
.posts-grid-loading
```

**Rebuild Priority:** 🔥 Critical  
**Estimated Effort:** 3 days

**Migration Notes:**
- Consider using virtualization for performance (react-window)
- Implement proper intersection observer for infinite scroll
- Add skeleton loaders
- Optimize with React.memo
- Better empty states with illustrations

---

### Interaction Components

#### 5. CreatePost
**Location:** `src/components/CreatePost/`  
**Purpose:** Post creation form with image upload  
**Complexity:** ⭐⭐⭐⭐ High  
**Lines of Code:** ~400

**Current Features:**
- Rich text editor (Quill)
- Image upload with preview
- Location tagging (optional)
- Character count
- Form validation
- Progress indicators

**Current CSS Classes:**
```
.create-post-container
.create-post-form
.create-post-input
.create-post-textarea
.image-preview
.upload-button
.character-count
```

**Dependencies:**
- Quill editor
- apiService (S3 presigned URL)
- Image compression library
- Location services

**Rebuild Priority:** 🔥 Critical  
**Estimated Effort:** 4 days

**Migration Notes:**
- Consider replacing Quill with Lexical or Tiptap (more modern)
- Better image compression and preview
- Add drag & drop for images
- Progress bar for upload
- Auto-save to localStorage
- Better validation feedback

---

#### 6. DirectMessage / Messenger
**Location:** `src/components/DirectMessage/`  
**Purpose:** Real-time messaging interface  
**Complexity:** ⭐⭐⭐⭐⭐ Very High  
**Lines of Code:** ~600+

**Current Features:**
- Real-time message display
- Message sending
- Socket.IO integration
- Conversation list
- Unread indicators
- Message timestamps
- Typing indicators
- Message grouping

**Rebuild Priority:** 🟡 Medium (after core features)  
**Estimated Effort:** 5-7 days

**Migration Notes:**
- Virtualize message list for performance
- Better real-time state management
- Optimistic updates
- Message reactions (future feature)
- File sharing (future feature)
- Voice messages (future feature)

---

#### 7. GroupChat
**Location:** `src/components/GroupChat/`  
**Purpose:** Group messaging interface  
**Complexity:** ⭐⭐⭐⭐⭐ Very High  
**Lines of Code:** ~500+

**Current Features:**
- Similar to DirectMessage
- Member management
- Group settings
- Member list display

**Rebuild Priority:** 🟡 Medium  
**Estimated Effort:** 5 days

**Migration Notes:**
- Share components with DirectMessage
- Extract common messaging UI
- Better member management UI

---

### Profile Components

#### 8. UserProfile
**Location:** `src/components/UserProfile/`  
**Purpose:** Current user's profile page  
**Complexity:** ⭐⭐⭐⭐ High  
**Lines of Code:** ~400

**Current Features:**
- Profile editing
- Avatar upload
- Bio editing
- MBTI selection
- Location settings
- Privacy settings
- Post history

**Rebuild Priority:** 🔥 Critical  
**Estimated Effort:** 4 days

**Migration Notes:**
- Better form validation
- Image cropping for avatar
- Progressive disclosure for settings
- Better mobile experience

---

#### 9. PublicProfile
**Location:** `src/components/PublicProfile/`  
**Purpose:** View other users' profiles  
**Complexity:** ⭐⭐⭐ Medium-High  
**Lines of Code:** ~300

**Current Features:**
- User info display
- Post history
- MBTI display
- Follow/unfollow (future)
- Message button

**Rebuild Priority:** 🟡 Medium  
**Estimated Effort:** 2 days

**Migration Notes:**
- Share components with UserProfile
- Better loading states
- Add follow functionality

---

### Auth Components

#### 10. WelcomeForm
**Location:** `src/components/WelcomeForm/`  
**Purpose:** User onboarding and registration  
**Complexity:** ⭐⭐⭐ Medium-High  
**Lines of Code:** ~300

**Current Features:**
- Multi-step form
- Username availability check
- MBTI selection
- Location permission request
- Terms acceptance

**Rebuild Priority:** 🔥 Critical  
**Estimated Effort:** 3 days

**Migration Notes:**
- Better step indicators
- Form validation with Zod
- Better error messages
- Add social auth (future)

---

### Notification Components

#### 11. Notification
**Location:** `src/components/Notification/`  
**Purpose:** Toast notifications  
**Complexity:** ⭐⭐ Medium  
**Lines of Code:** ~100

**Current Features:**
- Success/error messages
- Auto-dismiss
- Manual dismiss
- Stacking

**Rebuild Priority:** 🟢 Low (use library)  
**Estimated Effort:** 1 day

**Migration Notes:**
- Use sonner or react-hot-toast
- Better animations
- Position options

---

#### 12. ActivityList
**Location:** `src/components/ActivityList/`  
**Purpose:** User activity feed  
**Complexity:** ⭐⭐⭐ Medium-High  
**Lines of Code:** ~250

**Current Features:**
- Activity items (vibes, replies, mentions)
- Mark as read
- Activity grouping
- Time formatting

**Rebuild Priority:** 🟡 Medium  
**Estimated Effort:** 2 days

**Migration Notes:**
- Better activity icons
- Group similar activities
- Better empty state

---

### Utility Components

#### 13. Spinner / LoadingScreen
**Location:** `src/components/Spinner/`, `src/components/LoadingScreen/`  
**Purpose:** Loading indicators  
**Complexity:** ⭐ Low  
**Lines of Code:** ~50

**Rebuild Priority:** 🟢 Low  
**Estimated Effort:** 0.5 days

**Migration Notes:**
- Use CSS animations
- Consider Framer Motion
- Add skeleton loaders

---

#### 14. ErrorBoundary
**Location:** `src/components/ErrorBoundary/`  
**Purpose:** Catch React errors  
**Complexity:** ⭐⭐ Medium  
**Lines of Code:** ~100

**Rebuild Priority:** 🟢 Low  
**Estimated Effort:** 0.5 days

**Migration Notes:**
- Add error reporting (Sentry)
- Better error UI
- Recovery options

---

#### 15. Document
**Location:** `src/components/Document/`  
**Purpose:** Display markdown/legal documents  
**Complexity:** ⭐⭐ Medium  
**Lines of Code:** ~150

**Rebuild Priority:** 🟢 Low  
**Estimated Effort:** 1 day

**Migration Notes:**
- Use react-markdown
- Better typography
- Add table of contents

---

## Complexity Analysis

### Total Components: 15 major components + sub-components

### Complexity Breakdown:
- **Very High (5⭐):** 3 components (Post, DirectMessage, GroupChat)
- **High (4⭐):** 4 components (AppWrapper, CreatePost, UserProfile)
- **Medium-High (3⭐):** 5 components
- **Medium (2⭐):** 2 components
- **Low (1⭐):** 1 component

### Estimated Total Effort: 41.5 days (8-9 weeks)

## Shared Patterns to Extract

### 1. User Avatar Component
Used in: Post, UserProfile, PublicProfile, Messenger, ActivityList
```tsx
<Avatar
  src={user.profilePicture}
  alt={user.username}
  size="sm" | "md" | "lg"
  badge={user.mbti}
  online={user.isOnline}
/>
```

### 2. Time Display Component
Used in: Post, Messenger, ActivityList
```tsx
<TimeAgo date={timestamp} />
// or
<FormattedDate date={timestamp} format="relative" | "absolute" />
```

### 3. User Link Component
Used in: Post, ActivityList, Messenger
```tsx
<UserLink userId={user.userId} username={user.username}>
  {user.username}
</UserLink>
```

### 4. Empty State Component
Used in: PostsGrid, ActivityList, Messenger
```tsx
<EmptyState
  icon={<IconInbox />}
  title="No posts yet"
  description="Start creating your first post!"
  action={<Button>Create Post</Button>}
/>
```

### 5. Skeleton Loader Component
Used in: Everywhere
```tsx
<Skeleton className="h-20 w-full" />
<SkeletonPost />
<SkeletonProfile />
```

## CSS to Tailwind Conversion Map

### Common Patterns

| Current CSS Class | Tailwind Equivalent |
|------------------|-------------------|
| `.card-background-color` | `bg-white dark:bg-gray-800` |
| `.text-color` | `text-gray-900 dark:text-white` |
| `.note-color` | `text-gray-600 dark:text-gray-400` |
| `.button-background-color` | `bg-primary-500 hover:bg-primary-600` |
| `.card-border-color` | `border border-gray-200 dark:border-gray-700` |

### Layout Patterns

| Current CSS | Tailwind |
|------------|---------|
| `display: flex; justify-content: center; align-items: center;` | `flex items-center justify-center` |
| `display: grid; gap: 1rem;` | `grid gap-4` |
| `margin: 1rem 0;` | `my-4` |
| `padding: 1rem;` | `p-4` |

## Component Priority Matrix

```
High Priority + High Complexity:
├── Post (CRITICAL PATH)
├── CreatePost (CRITICAL PATH)
└── AppWrapper (CRITICAL PATH)

High Priority + Medium Complexity:
├── PostsGrid
├── UserProfile
└── WelcomeForm

Medium Priority + High Complexity:
├── DirectMessage
└── GroupChat

Medium Priority + Medium Complexity:
├── ActivityList
├── PublicProfile
└── NavigationAware

Low Priority:
├── Notification (use library)
├── Spinner (simple)
├── ErrorBoundary (simple)
└── Document (simple)
```

## Recommendations

1. **Start with Design System**
   - Build Button, Input, Card, Modal first
   - These are used everywhere

2. **Follow Critical Path**
   - AppWrapper → WelcomeForm → PostsGrid → Post → CreatePost
   - This enables core user journey

3. **Extract Common Patterns**
   - Avatar, UserLink, TimeAgo, EmptyState
   - Build once, use everywhere

4. **Use Component Libraries**
   - Headless UI for complex interactions
   - Radix UI for accessible primitives
   - Sonner for notifications

5. **Measure Everything**
   - Bundle size impact
   - Performance metrics
   - Accessibility scores

---

**Next:** See REBUILD-UI-PATTERNS.md for detailed UI/UX documentation
