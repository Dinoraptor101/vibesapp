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

## ✅ Finalized Feature Set (Updated Nov 4, 2025)

### Core Features (MVP - Week 1-6)
1. **Authentication:** Pigeon ID system (password-only, non-regeneratable by users)
2. **Posts:** Photo required + optional caption + location required
3. **Vibes System:** Likes AND Dislikes
   - Dislikes serve as community moderation (report functionality)
   - User polarity is Yin/Yang balance (separate profile field for masculinity/femininity identity)
4. **Feed Types:**
   - Nearby (location-based)
   - Following (posts from people you follow)
   - No algorithmic "For You" - anti-algorithm philosophy
5. **Comments/Replies:** Threaded discussions on posts
6. **Following System:** Users can follow each other, see follower/following counts
7. **Direct Messaging:** Request-based DM (requires approval before messaging)
8. **Group Chat:** Multi-user conversations with mentions
9. **User Mentions:** @username in comments and group chats
10. **Search:** Search posts by caption content and username
11. **MBTI:** Personality type selection (required during signup)
12. **Activity Feed:** Categorized notifications (Messages, Social, Your Posts)
13. **Online Presence:** Real-time online/offline indicators
14. **User Profiles:** Username, avatar, bio, MBTI, polarity, posts grid
15. **Moderation:** Report system + Admin panel
16. **Admin Panel:** Content moderation, user management, analytics

### Removed/Replaced Features
- ❌ Separate "dislike as report" - Now unified: dislike = report (community moderation)
- ❌ Complex recommendation algorithms
- ❌ Email-based authentication
- ❌ User-regeneratable passwords

### Key Principles
- 🚫 **Anti-algorithm:** No AI/ML manipulation of content
- 🤝 **Human connection:** Focus on genuine interactions
- 🔐 **Simple auth:** Pigeon ID system (password only)
- 📸 **Photography-first:** Every post requires a photo
- 🌍 **Location-aware:** Discover nearby content and people
- 🛡️ **Community moderation:** Dislikes flag content for review
- 🔒 **Privacy-first:** DM requests require approval

---

### Admin Panel Features (Updated Nov 4, 2025)
- Password-protected route (`/admin`)
- Single admin password (stored hashed in MongoDB)
- Flagged posts management (auto-hide after 3 unique user dislikes)
- **Delete post capability** (single + bulk delete)
- **Delete user capability** (soft delete - hides data, doesn't remove it)
- **Delete orphaned S3 images** (images not attached to any post)
- User management (view, regenerate password, ban/unban)
- **Easy ban/unban** (no confirmation required, reversible, doesn't delete data)
- Email notifications (auto-hide alerts + weekly summary)
- Analytics dashboard (posts/day, users/day, reports/day)

### Key Technical Decisions (Confirmed Nov 4, 2025)
- **Yin/Yang Polarity:** User profile fields indicating masculinity/femininity identity (NOT a score, NOT related to likes/dislikes)
- **Vibes System:** Like + Dislike/Report (community moderation system, NOT related to user polarity)
- **3-Dislike Threshold:** Post auto-hides after 3 unique user dislikes
- **Activity Cleanup:** Read notifications deleted after 7 days, unread persist forever (capped at 100k+)
- **DM Request Cooldown:** 2 days if request declined
- **Search Scope:** Global search (all posts and users)
- **@Mentions Scope:** Comments, Group chat, AND captions
- **Ban User:** Easy and quick (no confirmation), reversible, doesn't delete data (just hides it)
- **Request-Based DM:** Users must approve DM requests before conversations start
- **Photo Required:** No text-only posts allowed
- **Location Required:** From GPS or manual selection (privacy-first)

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
- [ ] Top navigation
- [ ] Bottom navigation (mobile)
- [ ] Theme switcher
- [ ] User menu dropdown
### Week 5: Post Display & Feed
- [ ] Route transitions

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
- [ ] PostsGrid component
- [ ] Infinite scroll logic
- [ ] Loading states (skeleton)
- [ ] Empty states
- [ ] Error states
- [ ] Filter tabs (Nearby, Following)
  - [ ] Nearby: Location-based posts (within 50km radius)
  - [ ] Following: Posts from users you follow
- [ ] Scroll position persistence (sessionStorage)
- [ ] Pull-to-refresh

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

#### Vibes System
- [ ] Like button
- [ ] Dislike button
  - [ ] Counts as report (community moderation)
  - [ ] Auto-hide post at 3 dislikes from unique users
- [ ] Optimistic updates
- [ ] Vibe count display (separate like/dislike counts)
- [ ] User polarity display on profiles (Yin/Yang balance - separate identity field)

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

#### Profile Pages
- [ ] UserProfile component (own profile)
- [ ] PublicProfile component (other users)
- [ ] Profile header
  - [ ] Avatar, username, bio
  - [ ] MBTI badge
  - [ ] Polarity display (Yin/Yang balance)
  - [ ] Location (city, country)
- [ ] Profile stats
  - [ ] Post count
  - [ ] Followers count
  - [ ] Following count
  - [ ] Polarity score
- [ ] Post grid on profile
- [ ] Edit profile modal
  - [ ] Avatar upload with crop
  - [ ] Bio editor
  - [ ] MBTI selector
  - [ ] Location update
- [ ] Privacy settings (future)

#### Following System
### Week 8: Direct Messaging (Request-Based)n
- [ ] Followers list
- [ ] Following list
- [ ] Follow notifications
- [ ] Following feed implementation
- [ ] User search
  - [ ] Search by username
  - [ ] Search filters (location, MBTI)
  - [ ] Recent searches

#### Profile API
- [ ] Profile API service
- [ ] useProfile hook
- [ ] useUpdateProfile hook
- [ ] Profile caching

**Week 6 Deliverable:** User can view and edit profiles

---

### Week 7: Messaging (MVP)

#### DM Request System
- [ ] Request DM button on profiles
- [ ] DM request modal (optional message)
- [ ] Pending requests list
- [ ] Accept/Decline request actions
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

### Week 9: Group Chat & Activity Feed

#### Group Chat
- [ ] Create group modal
  - [ ] Group name input
  - [ ] Member selection (multi-select)
  - [ ] Group avatar (optional)
- [ ] Group chat list
- [ ] Group chat view (similar to DM)
- [ ] @mentions in group chat
  - [ ] Autocomplete usernames
  - [ ] Mention notifications
- [ ] Group settings
  - [ ] Add/remove members
  - [ ] Change group name
  - [ ] Leave group
- [ ] Group chat notifications

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

#### Messaging API
- [ ] Message API service
- [ ] useConversations hook
- [ ] useMessages hook
- [ ] useSendMessage hook

**Week 7 Deliverable:** User can send and receive direct messages

---

## Phase 3: Search & Discovery (Week 10)

### Week 10: Search & Additional Features

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

#### Offline Support
- [ ] Service worker implementation
- [ ] Offline action queue (IndexedDB) - vibes, comments, DMs
- [ ] Auto-sync queue on reconnect (silent, no UI notification)
- [ ] React Query offline mutations with placeholderData
- [ ] Show "not cached" message only when accessing uncached content
- [ ] Seamless offline experience - user shouldn't notice they're offline for cached actions

#### Performance Optimization
- [ ] Code splitting by route
- [ ] Lazy loading images
- [ ] Virtual scrolling for long lists
- [ ] React Query optimization
- [ ] Bundle size analysis
- [ ] Image optimization (compression, CDN)

**Week 11 Deliverable:** App works seamlessly offline - queued actions sync silently, no explicit offline mode UI

---

### Week 12: Testing & Final Polish
- [ ] Settings page
  - [ ] Account settings
  - [ ] Privacy settings
  - [ ] Notification preferences
  - [ ] Location settings
  - [ ] Theme settings
- [ ] About/Help pages
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Contact/Support

**Week 10 Deliverable:** Search and discovery complete

---

## Phase 4: Polish & Testing (Week 11-12)

### Week 11: Performance & Offline Support

---

### Week 9: Testing & Optimization

#### Testing
- [ ] Unit tests for utilities
- [ ] Component tests (Testing Library)
- [ ] Hook tests
- [ ] Integration tests
- [ ] Update E2E tests for new app
- [ ] Cross-browser testing
- [ ] Mobile device testing

#### Performance
- [ ] Lighthouse audit (>90 score)
- [ ] Bundle size analysis (<500KB)
- [ ] Code splitting verification
- [ ] Image optimization
- [ ] Lazy loading verification
**Week 12 Deliverable:** Production-ready application with full test coverage

---

## Phase 5: Deployment (Week 13)

### Deployment Preparation
- [ ] Keyboard navigation test
- [ ] Screen reader test
- [ ] Color contrast audit
- [ ] ARIA labels verification
- [ ] Focus management

#### Polish
- [ ] Loading state animations
- [ ] Transition animations
- [ ] Error messages polish
- [ ] Empty state illustrations
- [ ] Micro-interactions

**Week 9 Deliverable:** Production-ready application

---

## Phase 4: Deployment (Week 10)

### Deployment Preparation
- [ ] Environment variables configured
- [ ] Build optimization
- [ ] Service worker updated
### Full Replacement Deployment
- [ ] Deploy to staging environment
- [ ] Internal testing (all features)
- [ ] Fix critical bugs
- [ ] Load testing
- [ ] Security audit
- [ ] Deploy to production (replaces old app)
- [ ] Monitor metrics
- [ ] Collect user feedback
- [ ] Hot fixes if needed bugs
- [ ] Deploy to production (beta flag)
- [ ] Monitor metrics
- [ ] Collect feedback
- [ ] Full rollout

### Migration Checklist
- [ ] All features from old app ported
- [ ] All E2E tests passing
- [ ] Performance targets met
- [ ] Accessibility audit passed
- [ ] No critical bugs
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
- **Week 9:** Group chat & activity feed
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
