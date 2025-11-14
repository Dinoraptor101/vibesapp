# Frontend Rebuild - Action Plan & Checklist

**Status:** Planning Phase  
**Start Date:** November 3, 2025  
**Estimated Duration:** 8-10 weeks  
**Team Size:** 1-2 developers

---

## Quick Start Guide

### Immediate Next Steps (This Week)

1. **✅ DONE - Create Planning Documentation**
   - [x] REBUILD-PLAN.md
   - [x] REBUILD-COMPONENT-AUDIT.md
   - [x] REBUILD-UI-PATTERNS.md
   - [x] REBUILD-LEARNINGS.md
   - [x] REBUILD-ACTION-PLAN.md

2. **📋 Review & Approve Plan**
   - [X] Review all documentation
   - [X] Approve technology choices
   - [X] Set timeline expectations
   - [X] Assign responsibilities

3. **🚀 Setup New Project**
   - [ ] Create `apps/web-v2` directory
   - [ ] Initialize Vite + React + TypeScript
   - [ ] Configure Tailwind CSS
   - [ ] Set up basic folder structure
   - [ ] Configure ESLint/Biome for new project

---

## ✅ Finalized Feature Set (Updated Nov 7, 2025)

### Core Features (MVP - Week 1-6)
1. **Authentication:** Pigeon ID system (password-only, non-regeneratable by users)
2. **Posts:** Photo required + optional caption + location required
3. **Community Moderation System (Vibes System Redesign):**
   - **DESIGN CHANGE (Nov 7, 2025):** Replaced like/dislike with heart/report system
   - Hearts for positive reactions (no vibe score calculation)
   - Report button with reasons (Pornographic, Spam, Hate Speech)
   - Geographic community moderation (50-mile radius)
   - Auto-hide at 3 reports from unique users within 50 miles
   - Strike system: 3 strikes (24h cooldowns each), 4th strike = permanent ban
   - 30-day strike decay (sliding window)
   - Transparent rules (no hidden algorithms)
   - User polarity is Yin/Yang balance (separate profile field for masculinity/femininity identity, NOT related to moderation)
4. **Feed Types:**
   - Nearby (location-based, **default 100km radius**, adjustable 50-150km in settings)
   - Following (posts from people you follow)
   - No algorithmic "For You" - anti-algorithm philosophy
   - **Sort Options:** Recent, Nearby (Popular removed due to no vibe score)
5. **Comments/Replies:** Threaded discussions on posts
6. **Following System:** Users can follow each other, see follower/following counts
7. **Direct Messaging:** Request-based DM (requires approval before messaging)
8. **User Mentions:** @username in comments and captions
9. **Search:** Search posts by caption content and username
11. **MBTI:** Personality type selection (required during signup, changeable in settings)
12. **Activity Feed:** Categorized notifications (Messages, Social, Your Posts)
13. **Online Presence:** Real-time online/offline indicators
14. **User Profiles:** Username, avatar, bio, MBTI, polarity, age (calculated), posts grid
15. **Settings Page:** Account tab (profile editing), Preferences tab (proximity range), Support tab (feedback, help)
16. **Moderation:** Report system + Admin panel with review queue
17. **Admin Panel:** Content moderation, user management, analytics, strike management

### Removed/Replaced Features
- ❌ Like/Dislike system with vibe score calculation → Heart/Report system
- ❌ "Popular" sort option → No longer relevant without vibe scores
- ❌ Algorithmic recommendations based on vibes
- ❌ Complex recommendation algorithms
- ❌ Email-based authentication
- ❌ User-regeneratable passwords

### Key Principles
- 🚫 **Anti-algorithm:** No AI/ML manipulation of content
- 🤝 **Human connection:** Focus on genuine interactions
- 🔐 **Simple auth:** Pigeon ID system (password only)
- 📸 **Photography-first:** Every post requires a photo
- 🌍 **Location-aware:** Discover nearby content and people (default 100km, adjustable 50-150km)
- 🛡️ **Community moderation:** Transparent geographic-based moderation (50-mile radius)
- 🔒 **Privacy-first:** DM requests require approval
- 🧘 **ZEN Design:** Auto-save on blur, no "Save" buttons, silent error handling, one action per intent (Dieter Rams principles)
- 📱 **Mobile-First:** 95% mobile usage, optimize for mobile experience
- 🔌 **Offline-Ready:** Seamless offline mode with silent queueing and sync

---

### Admin Panel Features (Updated Nov 7, 2025)
- Password-protected route (`/admin`)
- Single admin password (stored hashed in MongoDB)
- **Reported posts review queue** (with filters, sort options)
- **Post restore capability** (restore auto-hidden posts, remove strikes)
- **User ban capability** (permanent Strike 4, hides all posts)
- **Delete post capability** (single + bulk delete)
- **Delete user capability** (soft delete - hides data, doesn't remove it)
- **Delete orphaned S3 images** (images not attached to any post)
- User management (view, regenerate password, ban/unban)
- **Easy ban/unban** (no confirmation required, reversible, doesn't delete data)
- Email notifications (auto-hide alerts + weekly summary)
- Analytics dashboard (posts/day, users/day, reports/day)

### Key Technical Decisions (Updated Nov 7, 2025)
- **Yin/Yang Polarity:** User profile field indicating masculinity/femininity identity (NOT a score, NOT related to moderation) - **binary toggle in Account settings (either Yin OR Yang, no middle state)**
- **Community Moderation:** Heart/Report system (geographic-based, transparent rules, NOT related to user polarity)
- **3-Report Threshold:** Post auto-hides after 3 unique user reports within 50 miles
- **Strike System:** Strike 1-3 (24h cooldowns, escalating restrictions), Strike 4 (permanent ban)
- **Strike Decay:** 30-day sliding window (strikes older than 30 days don't count)
- **Geographic Radius:** 50 miles for community moderation
- **Proximity Range:** Default 100km, adjustable 50-150km in Settings → Preferences (hidden from posts grid display)
- **Activity Cleanup:** Read notifications deleted after 7 days, unread persist forever (capped at 100k+)
- **DM Request Cooldown:** 2 days if request declined
- **Search Scope:** Global search (all posts and users)
- **@Mentions Scope:** Comments and captions
- **Ban User:** Easy and quick (no confirmation), reversible, doesn't delete data (just hides it)
- **Request-Based DM:** Users must approve DM requests before conversations start
- **Photo Required:** No text-only posts allowed
- **Location Required:** From GPS or manual selection (privacy-first)
- **Auto-Save Pattern:** All form fields save on blur (unfocus), no "Save" buttons, invalid input silently reverts, offline changes queued
- **Profile vs Account:** Profile = read-only public view (click username), Account = editable settings (Settings → Account tab)
- **Age Calculation:** Calculated from birth month/year (signup), displayed on profile only, non-editable
- **Navigation Structure:** Posts | Messages | Activities | Settings | Theme Toggle (icon)
- **Settings Structure:** Account tab (profile editing + Pigeon ID + logout), Preferences tab (proximity), Support tab (feedback link)
- **Loading Rule:** < 1 second = no spinner, > 1 second = show spinner (global rule)
- **Offline Indicator:** Small grey no-wifi icon in header (non-clickable)
- **TODO (Post-MVP):** Age-based content filtering for child protection

**Reference:** See PHASE-3.4-SUMMARY.md and REBUILD-PROMPTS.md (Prompt 3.4) for complete Phase 3.4 specification

---

## 🧘 ZEN Design Philosophy (Critical)

### Auto-Save Pattern (NO "Save" Buttons)
**Philosophy:** Make actions effortless. Auto-save when user stops editing. Silent, seamless, zen.

**Implementation Rules:**
1. **Auto-save trigger:** User stops editing (field loses focus OR navigates away from page)
2. **Debounced batch:** Group changes within 300ms into single API call
3. **Visual feedback:** Silent (no spinners, no checkmarks on desktop)
4. **Invalid input:** Silently revert to previous value (no error alerts)
5. **Offline handling:** Queue changes, sync when reconnected (no error alerts)
6. **Character limits:** Show counter only when approaching limit (e.g., 180/200 chars)
7. **No "Save" buttons:** Except "Send" (messages) and "Post it" (create post)

**Applies to:**
- Settings → Account tab (all editable fields)
- Settings → Preferences tab (proximity dropdown)
- Bio editing
- Location updates
- Polarity toggle
- MBTI dropdown
- Any form field in the app

**Example:**
```tsx
// Account settings - Bio field
const handleBioBlur = async (e) => {
  const newBio = e.target.value;
  
  // Validation
  if (newBio.length > 200) {
    setBio(previousBio); // Silent revert
    return;
  }
  
  // Queue change (debounced)
  queueAccountUpdate({ bio: newBio });
};

// Debounced batch update (300ms)
const queueAccountUpdate = debounce((changes) => {
  if (navigator.onLine) {
    api.updateAccount(changes); // API call
  } else {
    offlineQueue.add('updateAccount', changes); // Queue for later
  }
}, 300);
```

### Loading Indicator Rule (Global)
- **< 1 second:** No loading indicator (action feels instant)
- **> 1 second:** Show spinner/skeleton with tasteful fade-in (300ms animation)

**Philosophy:** Avoid flickering experiences. Even "slow" actions (image upload, GPS) often complete in < 1s. Only show spinner if action genuinely takes > 1s, and fade it in smoothly.

**Example:** ALL potentially slow actions
- GPS location, image upload, searches → Usually < 1s (no spinner)
- IF action takes > 1s → Show spinner with fade-in animation

### Offline Mode (Seamless)
- **Indicator:** Small grey no-wifi icon in header (non-clickable, subtle)
- **Behavior:** Queue all changes, sync silently when reconnected
- **No alerts:** User shouldn't see "You're offline" toasts
- **Strategy:** Hybrid approach (see OFFLINE-MODE-STRATEGY.md)

---

## Phase 0: Foundation + Admin Panel (Week 1-2)

### Week 1: Project Setup + Admin Panel (PRIORITY)

#### Day 1: Create New Vite Project
```bash
# From monorepo root
cd apps
npm create vite@latest web-v2 -- --template react-ts

# Install dependencies
cd web-v2
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install UI libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Install state management & data fetching
npm install @tanstack/react-query zustand
npm install react-router-dom

# Install dev dependencies
npm install -D @types/node
```

**Checklist:**
- [ ] Vite project created
- [ ] TypeScript configured
- [ ] Tailwind CSS installed and configured
- [ ] All dependencies installed
- [ ] Dev server runs (`npm run dev`)

---

#### Day 2-3: Configure Tailwind & Design Tokens

**File:** `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Your custom colors from REBUILD-UI-PATTERNS.md
        brand: {
          DEFAULT: '#21a1f1',
          50: '#e6f7ff',
          // ... rest of the scale
        },
        // Add all theme colors
      },
      // Add custom spacing, typography, etc.
    },
  },
  plugins: [],
}
```

**Checklist:**
- [ ] Tailwind configured with custom theme
- [ ] Dark mode enabled
- [ ] Design tokens implemented
- [ ] Global CSS file created
- [ ] Theme tested (light/dim/dark)

---

#### Day 4-5: Setup Project Structure

```bash
mkdir -p src/{app,features,components,hooks,lib,styles,types}
mkdir -p src/components/ui
mkdir -p src/features/{posts,auth,messaging,profile}
```

**Create base files:**
```
src/
├── app/
│   ├── App.tsx           # Main app component
│   ├── Router.tsx        # Route configuration
│   └── providers.tsx     # All providers
├── components/
│   ├── ui/              # Design system components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── index.ts
│   └── layout/          # Layout components
│       ├── AppLayout.tsx
│       └── Navigation.tsx
├── features/
│   ├── posts/
│   ├── auth/
│   ├── messaging/
│   └── profile/
├── hooks/               # Shared custom hooks
├── lib/                 # Utilities and helpers
│   ├── api.ts          # API client
│   ├── cn.ts           # Class name utility
│   └── utils.ts
├── styles/
│   ├── globals.css
│   └── themes.css
└── types/
    └── index.ts
```

**Checklist:**
- [ ] Folder structure created
- [ ] Basic files created
- [ ] Import aliases configured (@/ paths)
- [ ] Can import and use files

---

### Week 2: Admin Panel Implementation

#### Day 1-2: Admin Authentication
- [ ] Admin login page (`/admin/login`)
- [ ] Password verification against MongoDB
- [ ] Admin session management (JWT or session cookie)
- [ ] Protected admin routes
- [ ] Logout functionality

#### Day 3-4: Flagged Posts Dashboard
- [ ] Flagged posts list (sorted by dislike count)
- [ ] Post preview with image
- [ ] Dislike count and user list
- [ ] Post details modal
- [ ] **Delete post action** (single delete - soft delete, hides from users)
- [ ] **Bulk delete posts** (checkbox selection + delete all)
- [ ] Dismiss reports action
- [ ] Pagination

#### Day 5-6: User Management
- [ ] User list with search/filter
- [ ] User detail view (profile + posts)
- [ ] Regenerate password action
- [ ] **Ban/Unban user** (easy toggle, no confirmation, reversible, soft delete)
- [ ] **Delete user capability** (soft delete - hides all user data, doesn't remove from DB)
- [ ] Bulk delete user's posts
- [ ] **Delete orphaned S3 images** (scan + delete images not attached to posts)

#### Day 7: Analytics & Settings
- [ ] Dashboard with key metrics
  - Active users (today, this week, all time)
  - Posts per day (chart)
  - Reports per day (chart)
  - Auto-hidden posts count
- [ ] Admin settings
  - Change admin password
  - Configure report threshold (default: 3)
  - Update email for notifications
- [ ] System logs viewer

**Admin Panel Deliverable:** Full moderation toolkit operational by end of Week 2

---

### Week 3: Design System Components

#### Build Core UI Components

**Priority Order:**
1. Button (all variants)
2. Input (text, textarea, etc.)
3. Card
4. Modal/Dialog
5. Avatar
6. Badge
7. Spinner/Loading
8. Skeleton Loader

**For each component:**
```tsx
// Example: src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-600',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

**Checklist for Each Component:**
- [ ] Component created with variants
- [ ] Fully typed with TypeScript
- [ ] Accessible (ARIA, keyboard nav)
- [ ] Responsive
- [ ] Dark mode support
- [ ] Used in example page

**Week 2 Checklist:**
- [ ] Button component
- [ ] Input component
- [ ] Card component
- [ ] Modal/Dialog component
- [ ] Avatar component
- [ ] Badge component
- [ ] Spinner component
- [ ] Skeleton component
- [ ] All components documented
- [ ] Example/playground page created

---

## Phase 1: Core Features (Week 3-6)

### Week 4: Authentication & Layout (Pigeon ID)

#### Pigeon ID Auth Flow
- [ ] Create auth feature folder structure
- [ ] Build signup flow component
  - [ ] Step 1: Generate Pigeon ID (password)
  - [ ] Step 2: Save password warning screen
  - [ ] Step 3: Username selection
  - [ ] Step 4: MBTI selection (required)
  - [ ] Step 5: Location permission
  - [ ] Step 6: Avatar upload (optional)
  - [ ] Step 7: Bio (optional)
- [ ] Build login screen (password input only)
- [ ] Password generation algorithm (secure, memorable)
- [ ] Form validation (Zod)
- [ ] API integration
- [ ] Cookie/token management (pigeonId + userId)
- [ ] Auth context provider
- [ ] Protected routes

#### App Layout
- [ ] AppLayout component
- [ ] Top navigation (desktop)
  - [ ] Logo/Brand
  - [ ] Navigation: Posts | Messages | Activities | Settings
  - [ ] Theme toggle icon (small, right side)
  - [ ] Offline indicator (grey wifi icon when offline)
- [ ] Bottom navigation (mobile)
  - [ ] Posts | Messages | Activities | Settings icons
  - [ ] Active state indicators
- [ ] Theme switcher component (icon button, cycles: light → dim → dark)
- [ ] Route transitions

**Navigation Notes:**
- Remove "Home" - use "Posts" instead
- Remove "Profile" from nav - accessed by clicking usernames
- Settings contains Account and Preferences tabs
- Theme toggle stays in nav (frequent action, not in Settings)

**Week 4 Deliverable:** User can sign up and see empty app shell

**Week 3 Deliverable:** User can sign up and see empty app shell

---

### Week 4: Post Display & Feed

#### Post Components
- [ ] PostCard component (grid view)
- [ ] PostDetail component (full view)
- [ ] PostHeader sub-component
- [ ] PostContent sub-component
- [ ] PostImage sub-component
- [ ] PostActions sub-component
- [ ] PostStats sub-component

#### Post Feed
- [ ] PostsGrid component (mobile-first, responsive)
- [ ] Infinite scroll logic
- [ ] Loading states (skeleton loaders, show if > 1s)
- [ ] Empty states
- [ ] Error states
- [ ] Filter tabs (Nearby, Following)
  - [ ] Nearby: Location-based posts (default 100km radius, adjustable in Settings)
  - [ ] Following: Posts from users you follow
  - [ ] NO proximity indicator on grid (hidden, configured in Settings)
- [ ] Scroll position persistence (sessionStorage)
- [ ] Pull-to-refresh (mobile)

#### API Integration
- [ ] Post API service
- [ ] React Query setup
- [ ] Data fetching hooks (usePost, usePosts)
- [ ] Caching configuration
- [ ] Error handling

**Week 4 Deliverable:** User can view posts feed

---

### Week 6: Post Creation & Vibes System

#### Create Post
- [ ] CreatePost page/modal
- [ ] Text editor component
- [ ] Image upload with preview
- [ ] Image compression
- [ ] S3 presigned URL upload
- [ ] Location tagging (optional)
- [ ] Character count
- [ ] Form validation
- [ ] Loading states
- [ ] Success/error handling

#### Community Moderation System (Vibes System Redesign)
**DESIGN CHANGE (Nov 7, 2025):** Replaced like/dislike with heart/report system

- [X] Heart button (replaces "like")
- [ ] Report button (replaces "dislike")
  - [ ] Report modal with reasons (Pornographic, Spam, Hate Speech)
  - [ ] 1 report per user per post
  - [ ] Auto-hide post at 3 reports from unique users within 50 miles
  - [ ] Soft-delete (post recoverable by admin)
- [ ] Strike system
  - [ ] Strike 1: Can't post (24h)
  - [ ] Strike 2: Can't post or comment (24h)
  - [ ] Strike 3: Read-only mode (24h)
  - [ ] Strike 4: Permanent ban
  - [ ] 30-day strike decay (sliding window)
- [ ] Strike notification modal (on app open after violation)
- [ ] Admin review queue
  - [ ] List reported posts with filters
  - [ ] Detailed view (reports, reporters, author strikes)
  - [ ] Restore/ban actions
- [ ] Optimistic updates
- [ ] Heart count display (no vibe score calculation)
- [ ] User polarity display on profiles (Yin/Yang balance - separate identity field, NOT related to moderation)

**Key Changes:**
- Removed "Popular" sort option (no longer has vibe score)
- Hearts only for positive reactions
- Reports for moderation (transparent rules, no hidden algorithms)
- Geographic community moderation (50-mile radius)

**Reference:** See PHASE-3.4-SUMMARY.md and REBUILD-PROMPTS.md (Prompt 3.4) for full specification

#### Comments & Replies
- [ ] Comment on post
- [ ] Reply to comment (threading)
- [ ] @mentions in comments
- [ ] Comment likes (optional)
- [ ] Delete own comments
- [ ] Comment count display

#### Post Actions
- [ ] Delete post (own posts)
- [ ] Edit caption (own posts, within 5 min)
- [ ] Share post (copy link)

#### Hooks
- [ ] usePostActions hook
- [ ] useCreatePost hook
- [ ] usePostMutations hook

**Week 5 Deliverable:** User can create, like, and delete posts

---

## Phase 2: Social Features (Week 7-9)

### Week 7: User Profiles & Following

#### Profile Pages (Read-Only Public View)
- [X] PublicProfile component (accessed by clicking usernames)
- [X] Profile header
  - [X] Avatar, username (with age next to it: "Age: 25")
  - [X] Bio
  - [X] MBTI badge
  - [X] Polarity display (Yin/Yang balance)
  - [X] Location (displayed as distance from current user, e.g., "2.3 km away")
- [X] Profile stats
  - [X] Post count
  - [X] Followers count
  - [X] Following count
- [X] Post grid on profile
- [X] Follow/Unfollow button
- [ ] DM request button (backend ready, UI pending)

**Important Distinction:**
- **Profile** = Read-only public page (this section)
- **Account** = Editable settings (Settings → Account tab, see Week 10)
- Username NOT editable (set at signup, permanent)
- Age NOT editable (calculated from birth date at signup)

#### Following System (Backend Complete - Nov 10, 2025)
- [X] Backend Follow model and endpoints
- [X] Backend toggleFollow endpoint (POST /api/users/:userId/follow)
- [X] Backend getFollowers/getFollowing endpoints
- [X] Frontend useFollow hook with optimistic updates
- [X] Frontend FollowButton component
- [ ] Followers list page
- [ ] Following list page
- [ ] Follow notifications (Activity Feed - Phase 4.6)
- [ ] Following feed implementation
- [ ] User search
  - [ ] Search by username
  - [ ] Search filters (location, MBTI)
  - [ ] Recent searches

#### Profile API
- [X] Profile API service (getUserProfile endpoint)
- [X] useProfile hook
- [ ] useUpdateProfile hook (Settings → Account tab)
- [X] Profile caching (React Query 5min stale time)

**Week 7 Deliverable:** ✅ User can view profiles, follow/unfollow, see posts grid

---

### Week 8: Direct Messaging (Request-Based)

#### DM Request System (Backend Complete - Nov 10, 2025)
- [X] Backend DMRequest model with cooldown tracking
- [X] Backend sendDMRequest endpoint (POST /api/dm-requests)
- [X] Backend getDMRequests endpoint (GET /api/dm-requests)
- [X] Backend acceptDMRequest endpoint (creates Conversation)
- [X] Backend declineDMRequest endpoint (sets 24h cooldown)
- [X] Backend checkDMRequestStatus endpoint
- [ ] Request DM button on profiles (frontend UI)
- [ ] DM request modal (optional message)
- [ ] Pending requests list UI
- [ ] Accept/Decline request actions UI
- [ ] Request notifications

#### Messaging Components
- [ ] ConversationList component
  - [ ] Approved conversations
  - [ ] Pending requests section
  - [ ] Unread indicators
- [ ] MessengerView component
- [ ] MessageBubble component
- [ ] MessageInput component
- [ ] Typing indicator
#### Messaging API
- [ ] DM request API (send, accept, decline)
- [ ] Message API service
- [ ] useConversations hook
- [ ] useMessages hook
- [ ] useSendMessage hook
- [ ] useDMRequests hook

**Week 8 Deliverable:** Request-based DM system fully functional

---

### Week 9: Activity Feed

#### Activity Feed (Categorized)
- [ ] Activity feed layout with tabs
  - [ ] All tab (everything)
  - [ ] Messages tab (DM requests, new messages, mentions)
  - [ ] Social tab (new followers, new posts from following)
  - [ ] Me tab (likes/dislikes on posts, comments, replies)
- [ ] Activity item components
  - [ ] Message activity
  - [ ] Follow activity
  - [ ] Post activity (from following)
  - [ ] Like/dislike activity
  - [ ] Comment activity
  - [ ] Reply activity
- [ ] Mark as read functionality
- [ ] Clear all notifications
- [ ] Activity badge counts
- [ ] Real-time activity updates (Socket.IO)

**Week 9 Deliverable:** Full social interaction system complete
- [ ] Online status
- [ ] Optimistic message sending
- [ ] Message queueing for offline

#### Phase 2.6: Read/Unread System Optimization 
**PRIORITY:** Fix infinite polling loops and performance issues in messaging system

##### Backend Database Changes
- [ ] Add `readCursors` field to Conversation model
- [ ] Create lazy migration utility `ensureConversationHasCursors()`
- [ ] Update `getConversations()` to use cursor-based unread calculation
- [ ] Update `getConversation()` to include unread count + lazy migration  
- [ ] Update `markMessagesAsRead()` to use O(1) cursor updates (no more array iteration)

##### Frontend Architecture Changes
- [ ] Create `useMessagingPolling()` unified hook
  - [ ] Auto-detect active conversation from URL
  - [ ] 5s polling for active conversation, 30s for list
  - [ ] Tab visibility detection for adaptive polling
- [ ] Create `useAutoMarkAsRead()` with Intersection Observer
  - [ ] Mark as read when messages container 50%+ visible
  - [ ] Handle new messages from polling automatically
  - [ ] Remove all useRef flags and complex effect dependencies
- [ ] Update `ConversationView` to use new visibility-based system
- [ ] Remove infinite loop sources from mark-as-read logic

##### Performance Optimizations
- [ ] Cursor-based read tracking: O(1) vs O(n) operations
- [ ] Adaptive polling: 6x slower when tab hidden
- [ ] Zero downtime lazy migration strategy
- [ ] Preserve all existing conversation history

**Week 9.5 Deliverable:** Messaging system with no infinite loops, 90% faster read tracking, preserved conversation history

#### Messaging API
- [ ] Message API service
- [ ] useConversations hook
- [ ] useMessages hook
- [ ] useSendMessage hook

**Week 7 Deliverable:** User can send and receive direct messages

---

## Phase 3: Search & Discovery (Week 10)

### Week 10: Settings Page & Search

#### Settings Page (Route: `/settings/account` and `/settings/preferences`)
**Tab Structure:** Account | Preferences | Support

##### Account Tab (Editable Profile Fields)
- [ ] Settings page layout (mobile-first, tabbed)
- [ ] Avatar upload section
  - [ ] Current avatar display
  - [ ] Upload button with image cropping
  - [ ] Auto-save on upload completion
- [ ] Bio editor
  - [ ] Textarea (200 char limit)
  - [ ] Character counter (show at 180+ chars)
  - [ ] Auto-save on blur
- [ ] MBTI selector
  - [ ] Dropdown with all 16 types
  - [ ] Auto-save on selection
- [ ] Location updater
  - [ ] Zip code input field
  - [ ] GPS button (📍 icon)
  - [ ] GPS loading state (if > 1s)
  - [ ] Display current location below input
  - [ ] Auto-save on blur or GPS success
- [ ] Polarity toggle
  - [ ] Toggle switch: Yin [○━━] Yang
  - [ ] Visual indication of selected state
  - [ ] Auto-save on toggle
- [ ] Security section
  - [ ] "Copy Pigeon ID" button
  - [ ] Warning message: "[!] Never Share! Anyone with your Pigeon Id can pretend to be you."
  - [ ] Copy feedback (toast: "Copied!")
- [ ] Logout button (bottom of page)

##### Preferences Tab
- [ ] Proximity range selector
  - [ ] Dropdown: 50km | 100km (default) | 150km
  - [ ] Auto-save on selection
  - [ ] Label: "Nearby Posts Radius"
- [ ] Placeholder for future notification settings

##### Support Tab
- [ ] App version display
- [ ] Feedback button (opens https://t.me/Dnegai in new tab)
- [ ] Terms of Service link (placeholder/dead link for now)
- [ ] Privacy Policy link (placeholder/dead link for now)

**Auto-Save Implementation:**
- All fields use onBlur auto-save (no "Save" button)
- Debounced batch updates (300ms)
- Silent on success, silent revert on validation error
- Offline changes queued for sync

#### Search Functionality
- [ ] Search UI component
  - [ ] Search bar in navigation
  - [ ] Search results page
  - [ ] Search filters (Posts, Users)
- [ ] Post search
  - [ ] Search by caption content
  - [ ] Search by username
  - [ ] Search by location
  - [ ] Search results with highlighting
- [ ] User search
  - [ ] Search by username
  - [ ] Filter by location
  - [ ] Filter by MBTI
- [ ] Search history (local storage)
- [ ] Recent searches
- [ ] Clear search history

**Week 10 Deliverable:** Settings page complete with auto-save, search functional

---

## Phase 4: Polish & Testing (Week 11-12)

### Week 11: Performance & Offline Support

---

### Week 11: Offline Support & Performance (Hybrid Approach)

#### Phase 1: Core Features Offline Support
- [ ] Service worker setup
- [ ] IndexedDB for offline queue
- [ ] Offline indicator (grey wifi icon in header)
- [ ] Posts feed caching
  - [ ] Cache viewed posts
  - [ ] Offline viewing of cached posts
  - [ ] Queue new posts for sync
- [ ] Vibes (Like/Dislike) offline
  - [ ] Optimistic UI updates
  - [ ] Queue vibe actions
  - [ ] Sync on reconnect
- [ ] Comments offline
  - [ ] Queue new comments
  - [ ] Optimistic comment display
  - [ ] Sync on reconnect
- [ ] Messages offline
  - [ ] Queue new messages
  - [ ] Optimistic message display
  - [ ] Sync on reconnect
- [ ] Activities offline
  - [ ] Cache recent activities
  - [ ] Mark as read queuing

#### Phase 2: Settings & Profile Offline Support
- [ ] Account updates queuing
  - [ ] Avatar upload queue
  - [ ] Bio changes queue
  - [ ] MBTI changes queue
  - [ ] Location changes queue
  - [ ] Polarity changes queue
- [ ] Debounced batch sync (300ms delay)
- [ ] Conflict resolution (last write wins)

#### Performance Optimization
- [ ] Code splitting by route
- [ ] Lazy loading images with blur placeholder
- [ ] Virtual scrolling for long lists
- [ ] React Query optimization (staleTime, cacheTime)
- [ ] Bundle size analysis (target: < 500KB gzipped)
- [ ] Image optimization (compression, CDN, WebP)
- [ ] Lighthouse audit (target: > 90 score)

**Week 11 Deliverable:** App works seamlessly offline - queued actions sync silently

---

### Week 12: Testing & Polish

#### Testing
- [ ] Unit tests for utilities
- [ ] Component tests (Testing Library)
- [ ] Hook tests (auto-save, offline queue)
- [ ] Integration tests
- [ ] Update E2E tests for new app
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile device testing (iOS, Android)
- [ ] Offline mode testing
- [ ] Auto-save pattern testing

#### Accessibility
- [ ] Keyboard navigation test (all features accessible)
- [ ] Screen reader test (VoiceOver, NVDA)
- [ ] Color contrast audit (WCAG AA)
- [ ] ARIA labels verification
- [ ] Focus management (modals, navigation)

#### Polish
- [ ] Loading state animations (consistent with > 1s rule)
- [ ] Route transition animations
- [ ] Error messages polish (silent where applicable)
- [ ] Empty state illustrations
- [ ] Micro-interactions (hover, focus, active states)
- [ ] Mobile touch gestures (swipe, pull-to-refresh)

**Week 12 Deliverable:** Production-ready application with full test coverage

---

## Phase 5: Deployment (Week 13)

### Deployment Preparation
- [ ] Environment variables configured
- [ ] Build optimization (code splitting, tree shaking)
- [ ] Service worker updated and tested
- [ ] Offline queue tested thoroughly
- [ ] Auto-save pattern verified across all forms

### Full Replacement Deployment
- [ ] Deploy to staging environment
- [ ] Internal testing (all features, offline mode, auto-save)
- [ ] Fix critical bugs
- [ ] Load testing (offline queue sync under load)
- [ ] Security audit
- [ ] Deploy to production (replaces old app)
- [ ] Monitor metrics (performance, error rates, offline usage)
- [ ] Collect user feedback
- [ ] Hot fixes if needed

### Migration Checklist
- [ ] All features from old app ported
- [ ] All E2E tests passing
- [ ] Performance targets met (Lighthouse > 90)
- [ ] Accessibility audit passed (WCAG AA)
- [ ] No critical bugs
- [ ] Offline mode working seamlessly
- [ ] Auto-save pattern implemented everywhere
- [ ] Documentation updated

**Week 13 Deliverable:** New Vibes app live in production as major version! 🎉

---

## Updated Timeline Summary

- **Week 1-2:** Foundation + Admin Panel (moderation tools operational)
- **Week 3:** Design system components
- **Week 4:** Pigeon ID authentication
- **Week 5:** Post display & feeds
- **Week 6:** Post creation & vibes system
- **Week 7:** Profiles & following system
- **Week 8:** Request-based DM system
- **Week 9:** Activity feed
- **Week 10:** Search & discovery
- **Week 11:** Performance & offline support
- **Week 12:** Testing & polish
- **Week 13:** Deployment

**Total: 13 weeks (3 months)**

**Week 10 Deliverable:** New frontend live in production! 🎉

---

## Risk Management

### High Risk Items
| Risk | Mitigation | Owner |
|------|-----------|-------|
| Timeline slippage | Buffer week, MVP-first approach | PM |
| Breaking changes in APIs | API contracts, version pinning | Backend |
| Performance issues | Regular profiling, lazy loading | Frontend |
| Accessibility gaps | Regular audits, Radix UI | Frontend |
| User confusion | Similar UI, gradual rollout | Design |

---

## Success Metrics

### Development Metrics
- [ ] Build time <5s
- [ ] HMR <100ms
- [ ] Tests run in <30s
- [ ] Bundle size <500KB gzipped

### User Metrics
- [ ] Lighthouse score >90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <2s
- [ ] Accessibility score 100

### Business Metrics
- [ ] No increase in error rate
- [ ] No decrease in engagement
- [ ] Positive user feedback
- [ ] Reduced bug reports

---

## Daily Checklist Template

### Developer Daily Checklist
- [ ] Pull latest changes
- [ ] Run tests locally
- [ ] Check TypeScript errors
- [ ] Check accessibility of new features
- [ ] Test in mobile view
- [ ] Test dark mode
- [ ] Commit with clear message
- [ ] Update documentation if needed

---

## Weekly Review Questions

1. Are we on track with the timeline?
2. Have we introduced any new technical debt?
3. Is the code quality meeting our standards?
4. Are tests passing and covering new code?
5. Have we tested on mobile devices?
6. Is performance still good?
7. Do we need to adjust priorities?

---

## Definition of Done (for each feature)

- [ ] Feature implemented according to requirements
- [ ] TypeScript types are complete
- [ ] Component is fully responsive
- [ ] Dark mode is supported
- [ ] Accessibility requirements met (keyboard nav, ARIA)
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Empty states implemented
- [ ] Unit tests written (if applicable)
- [ ] Component tests written
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Tested on mobile device
- [ ] Code reviewed
- [ ] Documentation updated

---

## Tools & Resources

### Development Tools
- **IDE:** VS Code with extensions:
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)
  - ESLint
  - Prettier
  - GitLens

### Documentation References
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- Radix UI: https://www.radix-ui.com
- React Query: https://tanstack.com/query
- Zustand: https://zustand-demo.pmnd.rs

### Design Resources
- Figma (if applicable)
- REBUILD-UI-PATTERNS.md
- Current production app for reference

---

## Communication Plan

### Status Updates
- **Daily:** Brief update in team chat
- **Weekly:** Detailed status report
- **Biweekly:** Demo of progress

### Stakeholder Updates
- Week 2: Design system complete
- Week 5: Core features working
- Week 7: All features complete
- Week 9: Ready for testing
- Week 10: Production deployment

---

## Celebration Milestones 🎉

- [ ] ✅ First component renders!
- [ ] ✅ Design system complete
- [ ] ✅ First feature working end-to-end
- [ ] ✅ All features ported
- [ ] ✅ All tests passing
- [ ] ✅ Lighthouse score >90
- [ ] ✅ Deployed to production
- [ ] ✅ First positive user feedback
- [ ] 🚀 **PROJECT COMPLETE!**

---

## Next Immediate Actions

**Today (Nov 3):**
1. ✅ Create planning documentation (DONE!)
2. Review this plan
3. Get approval to proceed

**Tomorrow (Nov 4):**
1. Create `apps/web-v2` directory
2. Initialize Vite project
3. Install dependencies
4. Configure Tailwind
5. Create basic folder structure

**This Week:**
1. Complete foundation setup
2. Configure all tooling
3. Build first design system component (Button)
4. Create example page to test components

---

**Let's ship this! 🚀**

Remember: **Progress over perfection. Ship early, iterate often.**
