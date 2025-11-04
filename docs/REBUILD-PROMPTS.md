# Frontend Rebuild - Implementation Prompts

**Created:** November 4, 2025  
**Purpose:** Sequential prompts for AI-assisted development  
**Usage:** Copy each prompt in order, validate deliverables, confirm before proceeding

---

## 📋 How to Use This File

1. **Copy prompt exactly** - Use the "PROMPT TO COPY" section verbatim
2. **Wait for completion** - Agent will implement and test
3. **Validate deliverables** - Check all items in checklist
4. **Run validation commands** - Ensure everything works
5. **Mark as complete** - Update the prompt's `**Completed:** [X] Yes` field
6. **Update progress tracker** - Check the box in the Progress Tracker section
7. **Update session log** - Add entry with date, what was completed, any issues
8. **Confirm before proceeding** - Only move to next prompt when current phase is complete
9. **Stop points** - Agent will STOP and ask for confirmation between major phases

### 📝 How to Mark Progress (Important!)

When a prompt is completed:

1. **In the prompt section**, change:
   ```markdown
   **Completed:** [ ] No
   ```
   to:
   ```markdown
   **Completed:** [X] Yes - November 4, 2025
   ```

2. **In Progress Tracker**, change:
   ```markdown
   - [ ] 0.1 - Initialize Vite Project (⏸️ Not started)
   ```
   to:
   ```markdown
   - [X] 0.1 - Initialize Vite Project (✅ Complete - Nov 4)
   ```

3. **In Session Log**, add entry:
   ```markdown
   ### Session 2 - November 4, 2025
   - **Completed:** Prompt 0.1 (Vite setup)
   - **Time taken:** 45 minutes
   - **Issues:** None
   - **Next:** Prompt 0.2
   ```

This ensures AI agents can pick up exactly where you left off!

---

## 🎯 Progress Tracker

**Last Updated:** November 4, 2025  
**Current Phase:** 0 (Foundation)  
**Status:** Ready to start

> ✅ = Complete | ⏸️ = Not started | 🚧 = In progress | ⚠️ = Blocked

### Phase 0: Foundation (Week 1-2) - Admin Panel Priority
- [ ] 0.1 - Initialize Vite Project (⏸️ Not started)
- [ ] 0.2 - Configure Tailwind & Design Tokens (⏸️ Not started)
- [ ] 0.3 - Setup Project Structure (⏸️ Not started)
- [ ] 0.4 - Admin Authentication (⏸️ Not started)
- [ ] 0.5 - Flagged Posts Dashboard (⏸️ Not started)
- [ ] 0.6 - User Management Panel (⏸️ Not started)
- [ ] 0.7 - Analytics Dashboard (⏸️ Not started)

### Phase 1: Design System (Week 3)
- [ ] 1.1 - Button Component (⏸️ Not started)
- [ ] 1.2 - Input Component (⏸️ Not started)
- [ ] 1.3 - Card Component (⏸️ Not started)
- [ ] 1.4 - Modal/Dialog Component (⏸️ Not started)
- [ ] 1.5 - Avatar Component (⏸️ Not started)
- [ ] 1.6 - Badge Component (⏸️ Not started)
- [ ] 1.7 - Loading Components (⏸️ Not started)

### Phase 2: Authentication (Week 4)
- [ ] 2.1 - Auth Context & API (⏸️ Not started)
- [ ] 2.2 - Pigeon ID Signup Flow (⏸️ Not started)
- [ ] 2.3 - Login Screen (⏸️ Not started)
- [ ] 2.4 - App Layout & Navigation (⏸️ Not started)

### Phase 3: Posts (Week 5-6)
- [ ] 3.1 - Post Components (⏸️ Not started)
- [ ] 3.2 - Posts Feed (⏸️ Not started)
- [ ] 3.3 - Create Post (⏸️ Not started)
- [ ] 3.4 - Vibes System (⏸️ Not started)
- [ ] 3.5 - Comments System (⏸️ Not started)

### Phase 4: Social (Week 7-9)
- [ ] 4.1 - User Profiles (⏸️ Not started)
- [ ] 4.2 - Following System (⏸️ Not started)
- [ ] 4.3 - DM Request System (⏸️ Not started)
- [ ] 4.4 - Messaging Interface (⏸️ Not started)
- [ ] 4.5 - Group Chat (⏸️ Not started)
- [ ] 4.6 - Activity Feed (⏸️ Not started)

### Phase 5: Discovery (Week 10-11)
- [ ] 5.1 - Search Interface (⏸️ Not started)
- [ ] 5.2 - Offline Support (⏸️ Not started)
- [ ] 5.3 - Performance Optimization (⏸️ Not started)

### Phase 6: Polish (Week 12-13)
- [ ] 6.1 - Testing Suite (⏸️ Not started)
- [ ] 6.2 - Final Polish (⏸️ Not started)
- [ ] 6.3 - Deployment (⏸️ Not started)

---

## 📊 Session Log

### Session 1 - November 4, 2025
- **Started:** Phase 0 planning
- **Completed:** REBUILD-PROMPTS.md created
- **Next:** Prompt 0.1 - Initialize Vite Project
- **Notes:** All documentation finalized, ready to begin implementation

---

## 🚀 PHASE 0: Foundation + Admin Panel

---

### Prompt 0.1: Initialize Vite Project

**Status:** ⏸️ Ready to start  
**Completed:** [ ] No  
**Prerequisites:** None (starting fresh)  
**Estimated Time:** 30 minutes  
**Reference:** REBUILD-ACTION-PLAN.md lines 106-140

#### PROMPT TO COPY:

```
Let's start Phase 0.1 - Initialize Vite Project for VibesApp V2

Create a new Vite + React + TypeScript project in apps/web-v2 with all dependencies.

Requirements:
1. Initialize Vite with React + TypeScript template
2. Install all dependencies from REBUILD-ACTION-PLAN.md Week 1 Day 1
3. Configure path aliases (@/ for src/)
4. Set up basic vite.config.ts
5. Verify dev server works

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Week 1 Day 1)
- /docs/REBUILD-PLAN.md (Technology Stack)
```

#### Expected Deliverables:

- [ ] `apps/web-v2/` directory exists
- [ ] `package.json` with all dependencies:
  - [ ] React 18 + TypeScript
  - [ ] Vite
  - [ ] Tailwind CSS + PostCSS + Autoprefixer
  - [ ] Radix UI primitives (@radix-ui/react-dialog, dropdown-menu, toast)
  - [ ] class-variance-authority, clsx, tailwind-merge
  - [ ] lucide-react
  - [ ] @tanstack/react-query, zustand
  - [ ] react-router-dom
  - [ ] @types/node
- [ ] `vite.config.ts` configured with path aliases
- [ ] `tsconfig.json` with path mapping (@/* → ./src/*)
- [ ] Dev server runs successfully

#### Validation Commands:

```bash
cd apps/web-v2
npm run dev
# Should see: "Local: http://localhost:5173/"
```

#### Success Criteria:

- Can run `npm run dev` without errors
- Can access http://localhost:5173
- See default Vite + React page
- No TypeScript errors in console

**✋ STOP HERE - Confirm before Prompt 0.2**

---

### Prompt 0.2: Configure Tailwind & Design Tokens

**Status:** ⏸️ Waiting for 0.1  
**Completed:** [ ] No  
**Prerequisites:** Prompt 0.1 completed  
**Estimated Time:** 1 hour  
**Reference:** REBUILD-UI-PATTERNS.md, REBUILD-ACTION-PLAN.md lines 142-173

#### PROMPT TO COPY:

```
Let's build Phase 0.2 - Configure Tailwind CSS with VibesApp design tokens

Set up Tailwind CSS with our custom theme including all colors, typography, and dark mode support.

Requirements:
1. Configure tailwind.config.js with custom theme from REBUILD-UI-PATTERNS.md
2. Set up dark mode with class strategy (support light/dim/dark themes)
3. Create globals.css with Tailwind directives
4. Create themes.css with theme variables
5. Test theme switching works

Reference files:
- /docs/REBUILD-UI-PATTERNS.md (Color System, Typography)
- /docs/REBUILD-ACTION-PLAN.md (Week 1 Day 2-3)
- apps/web/src/theme.css (current theme for reference)
```

#### Expected Deliverables:

- [ ] `tailwind.config.js` with:
  - [ ] Custom color palette (brand, vibe-positive, vibe-negative, light/dim/dark themes)
  - [ ] Typography scale (xs to 3xl)
  - [ ] Spacing system
  - [ ] darkMode: 'class' enabled
- [ ] `src/styles/globals.css` with Tailwind directives
- [ ] `src/styles/themes.css` with CSS variables for themes
- [ ] Theme switcher component (basic)
- [ ] All three themes (light, dim, dark) working

#### Validation Commands:

```bash
npm run dev
# Inspect with browser DevTools
# Toggle theme classes on <html>: class="light" / class="dark"
# Verify colors change
```

#### Success Criteria:

- Tailwind classes work in components
- Can switch between light/dim/dark themes
- Theme colors match REBUILD-UI-PATTERNS.md specifications
- No CSS compilation errors

**✋ STOP HERE - Confirm before Prompt 0.3**

---

### Prompt 0.3: Setup Project Structure

**Status:** ⏸️ Waiting for 0.2  
**Completed:** [ ] No  
**Prerequisites:** Prompts 0.1 & 0.2 completed  
**Estimated Time:** 1 hour  
**Reference:** REBUILD-ACTION-PLAN.md lines 175-227

#### PROMPT TO COPY:

```
Let's build Phase 0.3 - Create complete project folder structure

Set up the feature-based folder structure with all necessary base files and utilities.

Requirements:
1. Create complete folder structure from REBUILD-ACTION-PLAN.md
2. Add base files: App.tsx, Router.tsx, providers.tsx
3. Add utility files: cn.ts (className utility), api.ts (API client stub)
4. Configure path aliases in tsconfig and vite.config
5. Create index.ts files for clean imports

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Week 1 Day 4-5)
- /docs/REBUILD-PLAN.md (Project Structure)
- apps/web/src/services/apiService.ts (reference for API client)
```

#### Expected Deliverables:

- [ ] Complete folder structure:
  ```
  src/
  ├── app/
  │   ├── App.tsx
  │   ├── Router.tsx
  │   └── providers.tsx
  ├── components/
  │   ├── ui/
  │   │   └── index.ts
  │   └── layout/
  ├── features/
  │   ├── posts/
  │   ├── auth/
  │   ├── messaging/
  │   └── profile/
  ├── hooks/
  ├── lib/
  │   ├── api.ts
  │   ├── cn.ts
  │   └── utils.ts
  ├── styles/
  │   ├── globals.css
  │   └── themes.css
  └── types/
      └── index.ts
  ```
- [ ] Working cn() utility (clsx + tailwind-merge)
- [ ] API client with base URL and error handling
- [ ] React Query provider setup
- [ ] React Router setup with basic routes
- [ ] Theme provider

#### Validation Commands:

```bash
npm run dev
# Check imports work:
# import { cn } from '@/lib/cn'
# import { Button } from '@/components/ui'
```

#### Success Criteria:

- All folders exist
- Can import from @/ aliases
- App renders without errors
- Routing works (even if empty)

**✋ STOP HERE - Confirm before Prompt 0.4**

---

### Prompt 0.4: Admin Authentication

**Status:** ⏸️ Waiting for 0.3  
**Completed:** [ ] No  
**Prerequisites:** Phase 0.1-0.3 completed  
**Estimated Time:** 3-4 hours  
**Reference:** REBUILD-ACTION-PLAN.md lines 234-242

#### PROMPT TO COPY:

```
Let's build Phase 0.4 - Admin Panel Authentication

Create the admin login system with password verification and protected routes.

Requirements:
1. Admin login page at /admin/login with password input
2. Admin password verification API integration
3. Admin session management (JWT or session cookie)
4. Protected admin route wrapper
5. Admin layout with logout button

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Week 2 Day 1-2)
- /docs/REBUILD-COMPONENT-DESIGNS.md (Admin Login section)
- apps/api/src/routes/ (existing admin routes)

Key Technical Decisions:
- Single admin password (no username)
- Session expires in 1 hour
- Redirect to /admin/dashboard after login
```

#### Expected Deliverables:

- [ ] Admin login page (`/admin/login`) with:
  - [ ] Password input field
  - [ ] Login button
  - [ ] Error message display
  - [ ] Loading state
- [ ] Admin API integration:
  - [ ] POST /api/admin/login
  - [ ] JWT/session handling
- [ ] Protected route component:
  - [ ] Checks admin auth
  - [ ] Redirects to login if not authenticated
- [ ] Admin layout with:
  - [ ] Header with "Vibes Admin" title
  - [ ] Logout button
  - [ ] Navigation placeholder
- [ ] Session expiry handling (1 hour)

#### Validation Commands:

```bash
# Test flow:
1. Navigate to /admin/login
2. Enter admin password
3. Should redirect to /admin/dashboard
4. Try accessing /admin without login → redirects to login
```

#### Success Criteria:

- Can log in with admin password
- Protected routes require authentication
- Can log out successfully
- Session expires after 1 hour
- Error messages display correctly

**✋ STOP HERE - Confirm before Prompt 0.5**

---

### Prompt 0.5: Flagged Posts Dashboard

**Status:** ⏸️ Waiting for 0.4  
**Completed:** [ ] No  
**Prerequisites:** Admin auth completed  
**Estimated Time:** 6-8 hours  
**Reference:** REBUILD-ACTION-PLAN.md lines 244-254, REBUILD-COMPONENT-DESIGNS.md

#### PROMPT TO COPY:

```
Let's build Phase 0.5 - Flagged Posts Management Dashboard

Create the admin dashboard for reviewing and managing flagged posts.

Requirements:
1. Flagged posts list with sorting by dislike count
2. Post preview cards with thumbnails
3. Post details modal
4. Delete post action (single + bulk)
5. Dismiss reports action
6. Pagination (20 posts per page)

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Week 2 Day 3-4)
- /docs/REBUILD-COMPONENT-DESIGNS.md (Flagged Posts View section)
- apps/api/src/controllers/admin.js (existing admin API)

Key Features:
- Auto-hidden posts highlighted (≥3 dislikes)
- Show reporters list
- Bulk selection with checkboxes
- Delete orphaned S3 images button
```

#### Expected Deliverables:

- [ ] Flagged posts list page (`/admin/flagged`) with:
  - [ ] Post cards showing thumbnail, username, caption
  - [ ] Dislike count badge
  - [ ] Auto-hidden indicator (≥3 dislikes)
  - [ ] Reporters list
  - [ ] Timestamp
- [ ] Filter tabs:
  - [ ] All flagged posts
  - [ ] Auto-hidden only
  - [ ] Under review
- [ ] Sorting dropdown (Most reports, Recent, Oldest)
- [ ] Actions:
  - [ ] View full post (modal)
  - [ ] Delete single post
  - [ ] Dismiss reports
  - [ ] Bulk select + delete
- [ ] Post detail modal with:
  - [ ] Full-size image
  - [ ] Complete caption
  - [ ] Reporter details
  - [ ] Action buttons
- [ ] Pagination controls
- [ ] "Delete orphaned S3 images" button

#### Validation Commands:

```bash
# Test with mock data or API:
1. Login as admin
2. Navigate to /admin/flagged
3. View list of flagged posts
4. Click post to see modal
5. Test delete action
6. Test bulk delete
```

#### Success Criteria:

- List displays flagged posts correctly
- Can view post details in modal
- Can delete posts (single + bulk)
- Can dismiss reports
- Pagination works
- Auto-hidden posts clearly indicated
- Loading states for all actions

**✋ STOP HERE - Confirm before Prompt 0.6**

---

### Prompt 0.6: User Management Panel

**Status:** ⏸️ Waiting for 0.5  
**Completed:** [ ] No  
**Prerequisites:** Flagged posts dashboard completed  
**Estimated Time:** 6-8 hours  
**Reference:** REBUILD-ACTION-PLAN.md lines 256-265, REBUILD-COMPONENT-DESIGNS.md

#### PROMPT TO COPY:

```
Let's build Phase 0.6 - User Management Panel

Create the admin interface for managing users, banning, and regenerating passwords.

Requirements:
1. User list with search and filters
2. User detail view with profile and posts
3. Regenerate password action
4. Easy ban/unban toggle (no confirmation)
5. Delete user capability (soft delete)
6. Bulk delete user's posts

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Week 2 Day 5-6)
- /docs/REBUILD-COMPONENT-DESIGNS.md (User Management section)

Key Technical Decisions (Nov 4, 2025):
- Ban is easy toggle, no confirmation, reversible
- Delete user is soft delete (hides data, doesn't remove)
- Show user polarity (Yin/Yang %) - separate from vibes system
```

#### Expected Deliverables:

- [ ] User list page (`/admin/users`) with:
  - [ ] User cards showing avatar, username, MBTI, location
  - [ ] Polarity display (e.g., "65% Yang (Masculine)")
  - [ ] Post count, join date
  - [ ] Flagged posts count (if any)
  - [ ] Online/offline indicator
- [ ] Search bar (search by username)
- [ ] Filters:
  - [ ] All users
  - [ ] By location
  - [ ] By MBTI
  - [ ] Banned users
- [ ] Actions per user:
  - [ ] View profile (modal or new page)
  - [ ] View posts
  - [ ] Regenerate password (generates new, shows to admin)
  - [ ] Ban/Unban toggle (easy, no confirmation)
  - [ ] Delete user button (soft delete)
  - [ ] Bulk delete all user's posts
- [ ] User detail view showing:
  - [ ] Complete profile info
  - [ ] All posts (grid)
  - [ ] Activity history
  - [ ] Ban status
- [ ] Pagination (50 users per page)

#### Validation Commands:

```bash
# Test flow:
1. Navigate to /admin/users
2. Search for user
3. View user profile
4. Test ban/unban (should be instant)
5. Test regenerate password
6. Test delete user
```

#### Success Criteria:

- User list loads and displays correctly
- Search works
- Filters work
- Ban/unban is instant (no confirmation)
- Can regenerate password (shows new password)
- Can delete user (soft delete)
- Can bulk delete user's posts
- Loading states for all actions

**✋ STOP HERE - Confirm before Prompt 0.7**

---

### Prompt 0.7: Analytics Dashboard

**Status:** ⏸️ Waiting for 0.6  
**Completed:** [ ] No  
**Prerequisites:** Admin auth + flagged posts + user management completed  
**Estimated Time:** 4-6 hours  
**Reference:** REBUILD-ACTION-PLAN.md lines 267-281

#### PROMPT TO COPY:

```
Let's build Phase 0.7 - Admin Analytics Dashboard

Create the main admin dashboard with metrics, charts, and system settings.

Requirements:
1. Overview cards with key metrics
2. Activity charts (7-day view)
3. Urgent actions section
4. Admin settings panel
5. System logs viewer (optional)

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Week 2 Day 7)
- /docs/REBUILD-COMPONENT-DESIGNS.md (Admin Dashboard section)
- apps/api/src/controllers/admin.js (metrics endpoints)
```

#### Expected Deliverables:

- [ ] Dashboard page (`/admin/dashboard` - default route) with:
  - [ ] Overview cards:
    - [ ] Active users (today, this week, all time)
    - [ ] Posts today (with % change vs last week)
    - [ ] Reports today (with % change vs last week)
    - [ ] Auto-hidden posts count
  - [ ] Urgent actions section:
    - [ ] Auto-hidden posts in last hour (link to flagged)
    - [ ] Unreviewed flagged posts (link to flagged)
  - [ ] Activity chart (last 7 days):
    - [ ] Posts per day
    - [ ] Reports per day
    - [ ] Auto-hidden per day
- [ ] Admin settings page (`/admin/settings`) with:
  - [ ] Change admin password
  - [ ] Configure report threshold (default: 3)
  - [ ] Email for notifications
  - [ ] Save button
- [ ] Navigation sidebar/header with:
  - [ ] Dashboard
  - [ ] Flagged Posts
  - [ ] Users
  - [ ] Settings
  - [ ] Logout
- [ ] System logs viewer (basic - optional)

#### Validation Commands:

```bash
# Test flow:
1. Login as admin → should land on /admin/dashboard
2. View metrics and charts
3. Click urgent action links
4. Navigate to settings
5. Change admin password
```

#### Success Criteria:

- Dashboard displays all metrics correctly
- Charts render (can use placeholder data)
- Navigation works between all admin pages
- Can change admin password
- Can update report threshold
- Settings save successfully
- All links work

**🎉 PHASE 0 COMPLETE - Admin Panel Fully Operational!**

**✋ MAJOR STOP - Confirm Admin Panel is production-ready before Phase 1**

---

## 🎨 PHASE 1: Design System Components

---

### Prompt 1.1: Button Component

**Status:** ⏸️ Waiting for Phase 0 completion  
**Completed:** [ ] No  
**Prerequisites:** Foundation setup complete  
**Estimated Time:** 2-3 hours  
**Reference:** REBUILD-ACTION-PLAN.md lines 296-352, REBUILD-UI-PATTERNS.md

#### PROMPT TO COPY:

```
Let's build Phase 1.1 - Button Component with all variants

Create a fully-featured Button component using CVA with all variants, sizes, and states.

Requirements:
1. Button component with CVA for variants
2. All variants: primary, secondary, ghost, destructive
3. All sizes: sm, md, lg
4. All states: default, hover, active, disabled, loading
5. Accessible (ARIA, keyboard nav)
6. TypeScript fully typed

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Week 3 - Button example)
- /docs/REBUILD-UI-PATTERNS.md (Button Styles section)
- /docs/REBUILD-COMPONENT-DESIGNS.md (button usage examples)
```

#### Expected Deliverables:

- [ ] `src/components/ui/button.tsx` with:
  - [ ] CVA variant definitions
  - [ ] All variants (primary, secondary, ghost, destructive)
  - [ ] All sizes (sm, md, lg)
  - [ ] Loading state with spinner
  - [ ] Disabled state
  - [ ] Icon support (left/right)
  - [ ] Full TypeScript types
  - [ ] Proper ARIA attributes
- [ ] `src/components/ui/index.ts` exporting Button
- [ ] Example/test page showing all variants
- [ ] Dark mode support for all variants

#### Validation Commands:

```bash
npm run dev
# Navigate to /examples/button (or wherever you put example page)
# Test all variants, sizes, states
# Toggle dark mode - verify all variants work
```

#### Success Criteria:

- All button variants render correctly
- Hover/active/disabled states work
- Loading state shows spinner
- Dark mode works for all variants
- TypeScript has no errors
- Keyboard focus visible
- Screen reader accessible

**✋ STOP HERE - Confirm before Prompt 1.2**

---

### Prompt 1.2: Input Component

**Status:** ⏸️ Waiting for 1.1  
**Completed:** [ ] No  
**Prerequisites:** Button component completed  
**Estimated Time:** 2-3 hours  
**Reference:** REBUILD-UI-PATTERNS.md, REBUILD-COMPONENT-DESIGNS.md

#### PROMPT TO COPY:

```
Let's build Phase 1.2 - Input Component with validation states

Create Input, Textarea, and Label components with error/success states.

Requirements:
1. Input component with variants
2. Textarea component
3. Label component
4. Error/success states
5. Disabled state
6. Password toggle (for type="password")
7. Character count (optional)

Reference files:
- /docs/REBUILD-UI-PATTERNS.md (Input Styles)
- /docs/REBUILD-COMPONENT-DESIGNS.md (form examples)
```

#### Expected Deliverables:

- [ ] `src/components/ui/input.tsx` with:
  - [ ] Base input styles
  - [ ] Error state (red border, error text)
  - [ ] Success state (green border)
  - [ ] Disabled state
  - [ ] Focus ring
  - [ ] TypeScript types
- [ ] `src/components/ui/textarea.tsx` with:
  - [ ] Same states as Input
  - [ ] Auto-resize option
  - [ ] Character counter
- [ ] `src/components/ui/label.tsx`
- [ ] Password input with show/hide toggle
- [ ] Dark mode support
- [ ] Example page with all states

#### Success Criteria:

- Input renders with all states
- Textarea supports auto-resize
- Password toggle works
- Error/success states display correctly
- Dark mode works
- Accessible (labels, ARIA)

**✋ STOP HERE - Confirm before Prompt 1.3**

---

### Prompt 1.3: Card Component

**Status:** ⏸️ Waiting for 1.2  
**Completed:** [ ] No  
**Prerequisites:** Button & Input completed  
**Estimated Time:** 1-2 hours  
**Reference:** REBUILD-UI-PATTERNS.md

#### PROMPT TO COPY:

```
Let's build Phase 1.3 - Card Component with composition pattern

Create a composable Card component with Header, Content, Footer sections.

Requirements:
1. Card container with elevation/border
2. CardHeader, CardContent, CardFooter sub-components
3. Hover state (optional lift effect)
4. Clickable variant
5. Dark mode support

Reference files:
- /docs/REBUILD-UI-PATTERNS.md (Card Pattern section)
- /docs/REBUILD-COMPONENT-DESIGNS.md (Post cards, Profile cards)
```

#### Expected Deliverables:

- [ ] `src/components/ui/card.tsx` with:
  - [ ] Card container
  - [ ] CardHeader sub-component
  - [ ] CardContent sub-component
  - [ ] CardFooter sub-component
  - [ ] Optional hover lift effect
  - [ ] Clickable variant (onClick handler)
- [ ] Example page showing different card layouts
- [ ] Dark mode support

#### Success Criteria:

- Card displays with proper spacing
- Sub-components compose well
- Hover effect works (if enabled)
- Dark mode styles correct
- Clickable variant shows pointer cursor

**✋ STOP HERE - Confirm before Prompt 1.4**

---

### Prompt 1.4: Modal/Dialog Component

**Status:** ⏸️ Waiting for 1.3  
**Completed:** [ ] No  
**Prerequisites:** Card component completed  
**Estimated Time:** 3-4 hours  
**Reference:** Radix UI Dialog docs, REBUILD-COMPONENT-DESIGNS.md

#### PROMPT TO COPY:

```
Let's build Phase 1.4 - Modal/Dialog Component using Radix UI

Create an accessible modal/dialog component using Radix UI primitives.

Requirements:
1. Use @radix-ui/react-dialog
2. Overlay with backdrop blur
3. Close button (X in corner)
4. ESC to close
5. Click outside to close
6. Keyboard focus trap
7. Sizes: sm, md, lg, full

Reference files:
- Radix UI Dialog docs: https://www.radix-ui.com/docs/primitives/components/dialog
- /docs/REBUILD-COMPONENT-DESIGNS.md (modal examples in DM Request, Post Detail, etc.)
```

#### Expected Deliverables:

- [ ] `src/components/ui/dialog.tsx` with:
  - [ ] Dialog wrapper using Radix
  - [ ] DialogTrigger (optional)
  - [ ] DialogContent with overlay
  - [ ] DialogHeader, DialogFooter sub-components
  - [ ] Close button (X)
  - [ ] Size variants (sm, md, lg, full)
  - [ ] Smooth open/close animations
- [ ] Example page with different modal types
- [ ] Dark mode support

#### Success Criteria:

- Modal opens/closes smoothly
- ESC key closes modal
- Click outside closes modal
- Focus trapped inside modal
- Accessible (ARIA, keyboard nav)
- All sizes work
- Animations smooth

**✋ STOP HERE - Confirm before Prompt 1.5**

---

### Prompt 1.5: Avatar Component

**Status:** ⏸️ Waiting for 1.4  
**Completed:** [ ] No  
**Prerequisites:** Basic components completed  
**Estimated Time:** 2 hours  
**Reference:** REBUILD-UI-PATTERNS.md

#### PROMPT TO COPY:

```
Let's build Phase 1.5 - Avatar Component with online indicator

Create Avatar component with sizes and online status indicator.

Requirements:
1. Avatar with image fallback
2. Sizes: xs, sm, md, lg, xl
3. Online indicator (green dot)
4. Fallback to initials if no image
5. Ring/border option

Reference files:
- /docs/REBUILD-UI-PATTERNS.md (Avatar Styles section)
- /docs/REBUILD-COMPONENT-DESIGNS.md (avatar usage throughout)
```

#### Expected Deliverables:

- [ ] `src/components/ui/avatar.tsx` with:
  - [ ] Image with rounded-full
  - [ ] Sizes (xs: 32px to xl: 80px)
  - [ ] Fallback to initials
  - [ ] Online indicator (optional green dot)
  - [ ] Ring/border option
  - [ ] Loading skeleton state
- [ ] Example page with all sizes
- [ ] Dark mode support

#### Success Criteria:

- Avatar displays image correctly
- Initials fallback works
- Online indicator positioning correct
- All sizes render properly
- Ring/border option works

**✋ STOP HERE - Confirm before Prompt 1.6**

---

### Prompt 1.6: Badge Component

**Status:** ⏸️ Waiting for 1.5  
**Completed:** [ ] No  
**Prerequisites:** Avatar completed  
**Estimated Time:** 1 hour  
**Reference:** REBUILD-UI-PATTERNS.md

#### PROMPT TO COPY:

```
Let's build Phase 1.6 - Badge Component with variants

Create Badge component for MBTI, status indicators, counts, etc.

Requirements:
1. Badge with variants (default, success, warning, error)
2. Sizes (sm, md, lg)
3. Dot variant (small colored circle)
4. Number badge (for counts)

Reference files:
- /docs/REBUILD-UI-PATTERNS.md (Badge Styles section)
- /docs/REBUILD-COMPONENT-DESIGNS.md (MBTI badges, unread counts, etc.)
```

#### Expected Deliverables:

- [ ] `src/components/ui/badge.tsx` with:
  - [ ] Badge with CVA variants
  - [ ] Color variants (default, success, warning, error, brand)
  - [ ] Sizes (sm, md, lg)
  - [ ] Dot variant
  - [ ] Number badge variant
- [ ] Example page showing all badge types
- [ ] Dark mode support

#### Success Criteria:

- All badge variants render
- Colors correct for light/dark mode
- Number badge handles large numbers (99+)
- Dot variant displays correctly

**✋ STOP HERE - Confirm before Prompt 1.7**

---

### Prompt 1.7: Loading Components

**Status:** ⏸️ Waiting for 1.6  
**Completed:** [ ] No  
**Prerequisites:** All basic components completed  
**Estimated Time:** 2-3 hours  
**Reference:** REBUILD-UI-PATTERNS.md

#### PROMPT TO COPY:

```
Let's build Phase 1.7 - Loading Components (Spinner, Skeleton, Progress)

Create loading state components for different use cases.

Requirements:
1. Spinner component (circular, sizes)
2. Skeleton loader (for cards, text, images)
3. Progress bar (optional)
4. Loading overlay

Reference files:
- /docs/REBUILD-UI-PATTERNS.md (Loading States section)
- /docs/REBUILD-COMPONENT-DESIGNS.md (skeleton examples)
```

#### Expected Deliverables:

- [ ] `src/components/ui/spinner.tsx` with:
  - [ ] Circular spinner animation
  - [ ] Sizes (sm, md, lg)
  - [ ] Color variants
- [ ] `src/components/ui/skeleton.tsx` with:
  - [ ] Pulse animation
  - [ ] Variants: text, circle, rectangle
  - [ ] Configurable width/height
- [ ] Example page with:
  - [ ] Skeleton for post card
  - [ ] Skeleton for text lines
  - [ ] Spinner examples
- [ ] Dark mode support

#### Success Criteria:

- Spinner animates smoothly
- Skeleton pulse animation works
- All variants render correctly
- Dark mode shows appropriate colors
- Easy to compose skeleton layouts

**🎉 PHASE 1 COMPLETE - Design System Ready!**

**✋ MAJOR STOP - Validate all components work together before Phase 2**

---

## 🔐 PHASE 2: Authentication & Layout

---

### Prompt 2.1: Auth Context & API

**Status:** ⏸️ Waiting for Phase 1 completion  
**Completed:** [ ] No  
**Prerequisites:** Design system components complete  
**Estimated Time:** 3-4 hours  
**Reference:** REBUILD-ACTION-PLAN.md Week 4

#### PROMPT TO COPY:

```
Let's build Phase 2.1 - Authentication Context & API Layer

Set up authentication context, API integration, and protected routes.

Requirements:
1. Auth context with user state
2. API service for auth endpoints
3. Cookie management for tokens
4. Protected route wrapper
5. Login/logout functions

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Week 4 Auth section)
- apps/web/src/services/apiService.ts (current implementation)
- apps/api/src/routes/ (auth endpoints)

Key Technical Details:
- Pigeon ID system (password-only)
- Cookie: pigeonId + userId
- No email, no username in auth
```

#### Expected Deliverables:

- [ ] `src/features/auth/context/AuthContext.tsx` with:
  - [ ] User state (user object or null)
  - [ ] Loading state
  - [ ] Login function
  - [ ] Logout function
  - [ ] useAuth hook
- [ ] `src/lib/api.ts` enhanced with:
  - [ ] Auth endpoints (POST /api/auth/login, /api/auth/signup, /api/auth/logout)
  - [ ] Token interceptor
  - [ ] Auto-refresh logic (optional)
- [ ] `src/components/ProtectedRoute.tsx`:
  - [ ] Checks auth state
  - [ ] Redirects to login if not authenticated
- [ ] Cookie utility functions
- [ ] Types for User, AuthState

#### Success Criteria:

- Auth context provides user state
- Can check if user is authenticated
- Protected routes redirect correctly
- Cookies persist across refreshes

**✋ STOP HERE - Confirm before Prompt 2.2**

---

### Prompt 2.2: Pigeon ID Signup Flow

**Status:** ⏸️ Waiting for 2.1  
**Completed:** [ ] No  
**Prerequisites:** Auth context setup  
**Estimated Time:** 6-8 hours  
**Reference:** REBUILD-ACTION-PLAN.md lines 329-346

#### PROMPT TO COPY:

```
Let's build Phase 2.2 - Pigeon ID Multi-Step Signup Flow

Create the complete signup flow with password generation, username, MBTI, location, avatar.

Requirements:
1. Multi-step signup wizard (7 steps)
2. Pigeon ID (password) generation
3. Username selection with validation
4. MBTI selection (16 types)
5. Location permission + manual fallback
6. Avatar upload (optional)
7. Bio input (optional)

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Pigeon ID Auth Flow)
- /docs/REBUILD-COMPONENT-DESIGNS.md (signup flow mockups if any)
- apps/web/src/components/WelcomeForm/ (current implementation)

Key Features:
- Password is system-generated, user must save it
- No email required
- MBTI required
- Location required (GPS or manual city selection)
```

#### Expected Deliverables:

- [ ] `src/features/auth/components/SignupWizard.tsx` with:
  - [ ] Step 1: Welcome + Generate Pigeon ID button
  - [ ] Step 2: Display generated password with "Save this!" warning
  - [ ] Step 3: Username input with real-time validation
  - [ ] Step 4: MBTI selector (16 types grid)
  - [ ] Step 5: Location permission (GPS) or manual city input
  - [ ] Step 6: Avatar upload with crop (optional - can skip)
  - [ ] Step 7: Bio textarea (optional - can skip)
  - [ ] Progress indicator (steps 1-7)
  - [ ] Next/Back buttons
  - [ ] Submit button (final step)
- [ ] Password generation function:
  - [ ] Secure random generation
  - [ ] Memorable format (words + numbers)
- [ ] Username validation:
  - [ ] Check availability (API call)
  - [ ] Show real-time feedback
- [ ] MBTI grid selector (interactive)
- [ ] Location permission handler
- [ ] Avatar upload with preview
- [ ] Form validation with Zod

#### Success Criteria:

- All 7 steps flow smoothly
- Password generates correctly
- Username validation works
- MBTI selection works
- Location permission works (or manual input)
- Avatar upload works (optional)
- Can skip optional steps
- Form submits and creates account

**✋ STOP HERE - Confirm before Prompt 2.3**

---

### Prompt 2.3: Login Screen

**Status:** ⏸️ Waiting for 2.2  
**Completed:** [ ] No  
**Prerequisites:** Signup flow completed  
**Estimated Time:** 2-3 hours  
**Reference:** REBUILD-ACTION-PLAN.md

#### PROMPT TO COPY:

```
Let's build Phase 2.3 - Login Screen (Password Only)

Create the login screen for Pigeon ID authentication.

Requirements:
1. Password input field (no username/email)
2. Login button
3. Error message display
4. Loading state
5. Link to signup
6. "Forgot password?" → shows info (contact admin)

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (Authentication section)
- /docs/REBUILD-COMPONENT-DESIGNS.md (login mockups if any)
```

#### Expected Deliverables:

- [ ] `src/features/auth/components/LoginForm.tsx` with:
  - [ ] Single password input field
  - [ ] Show/hide password toggle
  - [ ] Login button
  - [ ] Error message display
  - [ ] Loading state (disabled input + spinner)
  - [ ] "Don't have an account? Sign up" link
  - [ ] "Lost password?" info (shows modal: "Contact admin to regenerate")
- [ ] Login page route (`/login`)
- [ ] Form validation
- [ ] API integration
- [ ] Redirect to home after successful login

#### Success Criteria:

- Can log in with valid password
- Error shows for invalid password
- Loading state displays during request
- Redirects after successful login
- "Lost password" info displays correctly

**✋ STOP HERE - Confirm before Prompt 2.4**

---

### Prompt 2.4: App Layout & Navigation

**Status:** ⏸️ Waiting for 2.3  
**Completed:** [ ] No  
**Prerequisites:** Auth flow completed  
**Estimated Time:** 4-6 hours  
**Reference:** REBUILD-ACTION-PLAN.md

#### PROMPT TO COPY:

```
Let's build Phase 2.4 - App Layout with Navigation

Create the main app layout with top navigation and bottom mobile nav.

Requirements:
1. AppLayout wrapper component
2. Top navigation (desktop)
3. Bottom navigation (mobile)
4. Theme switcher
5. User menu dropdown
6. Route transitions

Reference files:
- /docs/REBUILD-ACTION-PLAN.md (App Layout section)
- /docs/REBUILD-COMPONENT-DESIGNS.md (navigation mockups)
- apps/web/src/components/NavigationAware/ (current nav)

Navigation Items:
- Home (feed icon)
- Activity (bell icon with badge)
- Create Post (plus icon)
- Messages (message icon with badge)
- Profile (avatar)
```

#### Expected Deliverables:

- [ ] `src/components/layout/AppLayout.tsx` with:
  - [ ] Header (top nav for desktop)
  - [ ] Main content area
  - [ ] Bottom nav (mobile only)
  - [ ] Theme switcher in header
- [ ] `src/components/layout/TopNav.tsx` with:
  - [ ] Logo
  - [ ] Nav links (Home, Activity, Messages)
  - [ ] Create Post button
  - [ ] Theme switcher
  - [ ] User menu dropdown (Avatar → Profile, Settings, Logout)
- [ ] `src/components/layout/BottomNav.tsx` (mobile) with:
  - [ ] 5 nav items (Home, Activity, Create, Messages, Profile)
  - [ ] Badge indicators for unread
  - [ ] Active state highlighting
- [ ] User menu dropdown using Radix DropdownMenu
- [ ] Theme switcher (light/dim/dark)
- [ ] Responsive (mobile-first)

#### Success Criteria:

- Navigation renders on all pages
- Mobile bottom nav appears on small screens
- Desktop top nav appears on large screens
- Theme switcher works
- User menu opens/closes
- Active route highlighted
- Badge counts display (mocked for now)
- Responsive breakpoints work

**🎉 PHASE 2 COMPLETE - Auth & Navigation Ready!**

**✋ MAJOR STOP - Validate auth flow end-to-end before Phase 3**

---

## 📸 PHASE 3: Posts & Feed

*[Continue with Phases 3-6 following same pattern...]*

---

## 📝 Notes & Best Practices

### For Each Prompt:
1. **Read references first** - Check docs before coding
2. **Implement incrementally** - Build, test, commit
3. **Test dark mode** - Always test theme switching
4. **Check accessibility** - Keyboard nav, ARIA labels
5. **Validate deliverables** - Don't skip checklist items

### Common Issues & Solutions:
- **Import errors:** Check tsconfig path aliases
- **Tailwind not working:** Verify globals.css imported in main.tsx
- **TypeScript errors:** Ensure types are properly imported
- **Dark mode not working:** Check class="dark" on html element

### When to Stop & Ask:
- Unclear requirements
- Missing API endpoint information
- Design ambiguity
- Technical blocker

---

**Ready to build! Start with Prompt 0.1 when you're ready. 🚀**
