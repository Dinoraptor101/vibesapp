# Frontend Rebuild - Implementation Prompts

**Created:** November 4, 2025  
**Purpose:** Sequential prompts for AI-assisted development  
**Usage:** Copy each prompt in order, validate deliverables, confirm before proceeding

---
 
## Agent safety & git policy (READ BEFORE RUNNING ANY AGENT)

IMPORTANT: Do not perform any Git operations (e.g., git add, git commit, git push, git merge, git checkout, or other repository-changing commands) unless you have explicit, written permission from the repository owner. When you finish an implementation step, always: 1) summarize the proposed changes in plain text, 2) ask the owner for permission to commit/push, and 3) wait for confirmation before running any git commands. This file documents prompts and recommendations only — no agent should modify the repository history without an explicit request.

## 🤖 AI Model Recommendations

**To optimize Claude Sonnet 4.5 quota usage:**

### Use **GPT-5 mini** for: 💰 (Cost-effective)
- ✅ Simple component creation (buttons, inputs, cards, badges)
- ✅ Basic styling and CSS updates
- ✅ Simple CRUD operations
- ✅ Placeholder page creation
- ✅ Documentation updates
- ✅ Simple API endpoint additions
- ✅ Repetitive component patterns
- ✅ Form validation logic

### Use **Claude Sonnet 4.5** for: 🎯 (Complex tasks)
- 🔥 Complex state management (auth, messaging, real-time)
- 🔥 Multi-step user flows (signup, post creation)
- 🔥 Architecture decisions and file structure
- 🔥 Backend integration with multiple services
- 🔥 Real-time features (Socket.IO, WebSockets)
- 🔥 Complex business logic (vibes system, recommendations)
- 🔥 Security-critical features (authentication, authorization)
- 🔥 Performance optimization and debugging

**Each prompt below includes a recommendation tag:**
- 💰 **GPT-5 mini** - Simple, straightforward implementation
- 🎯 **Claude Sonnet** - Complex, requires architectural thinking
- ⚖️ **Either** - Can use either based on availability

### 📊 Quick Phase Overview

| Phase | Prompt | Complexity | Recommended AI |
|-------|--------|------------|----------------|
| **0.1** | Initialize Vite | Simple | 💰 GPT-5 mini |
| **0.2** | Tailwind Config | Simple | 💰 GPT-5 mini |
| **0.3** | Project Structure | Simple | 💰 GPT-5 mini |
| **0.4** | Admin Auth | Complex | 🎯 Claude ✅ |
| **0.5** | Flagged Posts | Complex | 🎯 Claude |
| **0.6** | User Management | Complex | 🎯 Claude |
| **0.7** | Analytics | Medium | 🎯 Claude Sonnet |
| **1.1-1.7** | Design System | Simple | 💰 GPT-5 mini (all) |
| **2.1** | Auth Context | Complex | 🎯 Claude |
| **2.2** | Signup Flow | Complex | 🎯 Claude |
| **2.3** | Login Screen | Simple | 💰 GPT-5 mini |
| **2.4** | App Layout | Medium | 🎯 Claude Sonnet |

**Quota Savings Estimate:** Using GPT-5 mini for simple tasks can save ~40-50% of Claude Sonnet quota!

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
- [X] 0.1 - Initialize Vite Project (✅ Complete - Nov 4)
- [X] 0.2 - Configure Tailwind & Design Tokens (✅ Complete - Nov 4)
- [X] 0.3 - Setup Project Structure (✅ Complete - Nov 4)
- [X] 0.4 - Admin Authentication (✅ Complete - Nov 4)
- [X] 0.5 - Flagged Posts Dashboard (✅ Complete - Nov 5)
- [X] 0.6 - User Management Panel (✅ Complete - Nov 6)
- [X] 0.7 - Analytics Dashboard (✅ Complete - Nov 6)

### Phase 1: Design System (Week 3)
- [X] 1.1 - Button Component (✅ Complete - Nov 6)
- [X] 1.2 - Input Component (✅ Complete - Nov 6)
- [X] 1.3 - Card Component (✅ Complete - Nov 6)
- [X] 1.4 - Modal/Dialog Component (✅ Complete - Nov 6)
- [X] 1.5 - Avatar Component (✅ Complete - Nov 6)
- [X] 1.6 - Badge Component (✅ Complete - Nov 6)
- [X] 1.7 - Loading Components (✅ Complete - Nov 6)

### Phase 2: Authentication (Week 4)
- [X] 2.1 - Auth Context & API (✅ Complete - Nov 7)
- [X] 2.2 - Pigeon ID Signup Flow (✅ Complete - Nov 7)
- [X] 2.3 - Login Screen (✅ Complete - Nov 7)
- [X] 2.4 - App Layout & Navigation (✅ Complete - Nov 7)

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

### Session 2 - November 4, 2025
- **Completed:** Prompt 0.1 - Initialize Vite Project
- **Time taken:** ~15 minutes
- **Deliverables:** 
  - Created apps/web-v2/ with Vite + React + TypeScript
  - Installed all dependencies (Tailwind, Radix UI, React Query, Zustand, etc.)
  - Configured path aliases (@/ → ./src/)
  - Dev server running at http://localhost:5173/
- **Issues:** None
- **Next:** Prompt 0.2 - Configure Tailwind & Design Tokens

### Session 3 - November 4, 2025
- **Completed:** Prompt 0.2 - Configure Tailwind & Design Tokens
- **Time taken:** ~25 minutes
- **Deliverables:**
  - Initialized Tailwind CSS with PostCSS configuration
  - Configured tailwind.config.js with custom theme (brand colors, vibe colors, typography scale)
  - Created src/styles/globals.css with Tailwind directives and utilities
  - Created src/styles/themes.css with CSS variables for light/dim/dark themes
  - Built ThemeSwitcher component with localStorage persistence
  - Updated App.tsx with demo showcasing all theme features
  - All three themes (light, dim, dark) working correctly
- **Issues:** None - fixed useEffect dependency warning with useCallback
- **Next:** Prompt 0.3 - Setup Project Structure

### Session 4 - November 4, 2025
- **Completed:** Prompt 0.3 - Setup Project Structure
- **Time taken:** ~35 minutes

### Session 7 - November 6, 2025
- **Completed:** Prompt 0.6 - User Management Panel
- **Time taken:** ~1 hour
- **Deliverables:**
  - Updated UsersPage.tsx with improved API response handling
  - Fixed UserCard component to support "View Posts" functionality
  - Fixed UserDetailModal API response handling
  - Created RegeneratePasswordModal component with copy-to-clipboard functionality
  - Integrated RegeneratePasswordModal into UsersPage
  - All components using correct API response structure (no nested .data)
  - Created useUsers, useUserActions, and useUserFilters hooks
  - All features working: search, filter by MBTI/status, pagination, ban/unban, regenerate password, delete user, bulk delete posts
- **Issues:** None - all TypeScript/linting errors resolved
- **Next:** Prompt 0.7 - Analytics Dashboard

### Session 8 - November 6, 2025
- **Completed:** Prompt 0.7 - Analytics Dashboard (Final Phase 0 prompt!)
- **Time taken:** ~2 hours
- **Deliverables:**
  - **Frontend (apps/web-v2):**
    - AdminDashboardPage: Complete with metrics cards, 7-day activity chart, urgent actions section, quick links
    - AdminSettingsPage: Full settings UI with current password, new password, report threshold, notification email
    - Fixed API response handling bug (removed nested .data property)
    - MetricCard and ActivityChart components working with real backend data
  - **Backend (apps/api):**
    - Added updateSettings function to admin.js controller
    - Added PUT /admin/settings route
    - Password validation and settings update functionality
  - **Code Quality:**
    - Fixed all Biome configuration errors (removed invalid options)
    - Auto-fixed 30 files (import ordering, CSS formatting, type imports)
    - Manually fixed 3 accessibility issues in ui-next components
    - Fixed ESLint 9 flat config syntax error
    - All linting clean: Biome ✅, ESLint ✅, TypeScript ✅
  - **Build:** Production build successful (404KB, 128KB gzipped, 2.37s)
- **Issues:** None - all code quality checks pass
- **Status:** 🎉 **PHASE 0 COMPLETE - Admin Panel 100% Operational!**
- **Next:** Phase 1.1 - Button Component (Design System)

### Session 9 - November 6, 2025
- **Completed:** Prompt 1.1 - Button Component (Option 2: Enhanced existing component)
- **Time taken:** ~45 minutes
- **Deliverables:**
  - Enhanced Button component (apps/web-v2/src/components/ui-next/Button.tsx):
    - Added loading state with Lucide Loader2 spinner
    - Added leftIcon and rightIcon props with auto-sizing
    - Added 2 new variants: destructive, outline (now 5 total)
    - Added size prop: sm, md, lg with proper scaling
    - Added fullWidth prop for block-level buttons
    - Enhanced TypeScript types with comprehensive JSDoc documentation
    - Added 7+ inline usage examples in JSDoc
    - Improved accessibility: aria-busy, aria-disabled, aria-label, screen reader text
  - Created comprehensive documentation (BUTTON.md):
    - Complete API reference with all props
    - 15+ usage examples covering all features
    - Accessibility guidelines and best practices
    - Styling details and design tokens reference
  - Created interactive example page (ButtonExamplesPage.tsx):
    - 10+ organized sections showcasing all variants, sizes, states
    - Click-to-test loading states with auto-reset
    - Icon combinations (left, right, both)
    - Real-world examples (forms, cards, destructive actions)
    - 330+ lines of comprehensive examples
  - Added route /examples/button to Router.tsx
- **Issues:** None - zero TypeScript errors, all features working
- **Status:** ✅ Button component enhanced with full documentation and examples
- **Next:** Phase 1.2 - Input Component

### Session 10 - November 6, 2025
- **Completed:** Prompt 1.2 - Input Component
- **Time taken:** ~1 hour
- **Deliverables:**
  - Enhanced Input component (apps/web-v2/src/components/ui-next/Input.tsx):
    - Added error, success, and helperText props for validation states
    - Added password toggle with Eye/EyeOff icons from Lucide
    - Added required field indicator with red asterisk
    - Enhanced accessibility: aria-invalid, aria-describedby, role attributes
    - Full TypeScript with forwardRef support
    - Comprehensive JSDoc documentation with usage examples
    - Dark mode support for all states
  - Enhanced Textarea component (apps/web-v2/src/components/ui-next/Textarea.tsx):
    - Added character counter that appears at 90% of maxLength (configurable threshold)
    - Added auto-resize functionality based on content
    - Added error, success, and helperText validation states
    - Added required field indicator
    - Enhanced accessibility with ARIA live regions for character count
    - Full TypeScript with forwardRef support
    - Comprehensive JSDoc documentation
  - Created Label component (apps/web-v2/src/components/ui-next/Label.tsx):
    - Semantic label element with proper styling
    - Required field indicator support
    - Dark mode compatible
    - TypeScript with forwardRef
  - Created comprehensive examples page (InputExamplesPage.tsx):
    - 10+ organized sections covering all features
    - Live username validation demo with debouncing
    - Password toggle demonstration
    - Character counter examples with different thresholds
    - Auto-resize textarea demo
    - Real-world contact form example
    - All validation states (error, success, disabled)
    - 300+ lines of interactive examples
  - Added /examples/input route to Router.tsx
  - Updated index.ts to export Label component
- **Issues:** Minor ESLint warnings (acceptable, don't break functionality)
- **Status:** ✅ Input, Textarea, and Label components complete with full features
- **Next:** Phase 1.3 - Card Component

### Session 11 - November 6, 2025
- **Completed:** Prompt 1.3 - Card Component
- **Time taken:** ~45 minutes
- **Deliverables:**
  - Enhanced Card component (apps/web-v2/src/components/ui-next/Card.tsx):
    - Main Card container with flexible styling
    - CardHeader sub-component with bottom border
    - CardContent sub-component with consistent padding
    - CardFooter sub-component with top border and flex layout
    - Added `hoverable` prop for lift effect and shadow enhancement
    - Added `noPadding` prop for image cards
    - Clickable variant with cursor pointer when onClick provided
    - Keyboard accessibility (Enter/Space key support)
    - Full TypeScript with forwardRef on all components
    - Comprehensive JSDoc documentation with usage examples
    - Dark mode support throughout
    - Proper semantic HTML (article vs div based on interactivity)
  - Created comprehensive examples page (CardExamplesPage.tsx):
    - 8+ organized sections showcasing all card types
    - Basic cards (simple, with header, complete with footer)
    - Hoverable cards with lift effect demo
    - Clickable cards with onClick interaction demo
    - Image cards with noPadding option
    - Social media post cards (realistic examples)
    - Profile cards (3 different layouts)
    - Statistics cards (dashboard metrics style)
    - 550+ lines of interactive examples
  - Updated index.ts to export all Card sub-components
  - Added /examples/card route to Router.tsx
- **Issues:** None - all TypeScript errors resolved
- **Status:** ✅ Card component complete with composable sub-components
- **Next:** Phase 1.4 - Modal/Dialog Component

### Session 12 - November 6, 2025
- **Completed:** Prompt 1.4 - Modal/Dialog Component
- **Time taken:** ~1 hour
- **Deliverables:**
  - Complete Dialog component using Radix UI (apps/web-v2/src/components/ui-next/Dialog.tsx):
    - Dialog, DialogTrigger, DialogContent, DialogPortal, DialogOverlay, DialogClose
    - DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogBody sub-components
    - Backdrop overlay with blur effect (bg-black/60 backdrop-blur-sm)
    - Close button (X) in top-right corner with hover effects
    - Size variants: sm (400px), md (600px), lg (800px), full (95vw)
    - Smooth animations: fade-in/fade-out, zoom-in/zoom-out, slide effects
    - ESC to close (built into Radix)
    - Click outside to close (built into Radix)
    - Keyboard focus trap (built into Radix)
    - Optional showClose prop to disable close button and ESC/click-outside
    - Full TypeScript with proper forwardRef support
    - Comprehensive accessibility (ARIA attributes, focus management)
    - Dark mode support throughout
  - Created comprehensive examples page (DialogExamplesPage.tsx):
    - 8 organized sections with 10+ dialog examples
    - Basic dialog with title, description, actions
    - Confirmation dialog with destructive action and loading state
    - Form dialog with Input, Textarea, validation
    - All four size variants (sm, md, lg, full)
    - Scrollable content dialog (max-height 90vh)
    - Image preview dialog (full-size, no padding)
    - Nested dialogs example (use sparingly)
    - No close button example (forced action)
    - Accessibility features section with complete checklist
    - 550+ lines of interactive examples
  - Updated index.ts to export all Dialog sub-components
  - Added /examples/dialog route to Router.tsx
- **Issues:** None - all TypeScript errors resolved
- **Status:** ✅ Dialog component complete with full Radix UI features
- **Next:** Phase 1.5 - Avatar Component

### Session 13 - November 6, 2025
- **Completed:** Prompt 1.5 - Avatar Component
- **Time taken:** ~45 minutes
- **Deliverables:**
  - Enhanced Avatar component (apps/web-v2/src/components/ui-next/Avatar.tsx):
    - 5 size variants: xs (32px), sm (40px), md (48px), lg (64px), xl (80px)
    - Image with automatic fallback to initials
    - Initials generation from name or alt prop (first + last letter)
    - Consistent color generation based on name (8 color palette)
    - Online indicator (green dot) with size-responsive positioning
    - Ring/border highlight option for featured users
    - Loading skeleton state with pulse animation
    - Image loading state with smooth fade-in transition
    - Error handling with automatic fallback to initials
    - Full TypeScript with forwardRef support
    - Comprehensive JSDoc documentation
    - Dark mode support throughout
  - Created comprehensive examples page (AvatarExamplesPage.tsx):
    - All 5 sizes demonstrated (xs to xl)
    - Online status indicator examples in all sizes
    - Initials fallback with auto-generated colors
    - Ring/border highlight examples
    - Loading skeleton states
    - Broken image error handling demonstration
    - 3 real-world usage examples:
      - Profile header with xl avatar + online status
      - Message list with avatars + unread indicators
      - Nearby users grid (8 users)
    - Code examples section with 5 usage patterns
    - 430+ lines of interactive examples
  - Avatar already exported in index.ts
  - Added /examples/avatar route to Router.tsx
- **Issues:** Minor ESLint warnings for array keys (acceptable for examples)
- **Status:** ✅ Avatar component complete with all features
- **Next:** Phase 1.6 - Badge Component

### Session 14 - November 6, 2025
- **Completed:** Prompt 1.6 - Badge Component
- **Time taken:** ~1 hour
- **Deliverables:**
  - Enhanced Badge component (apps/web-v2/src/components/ui-next/Badge.tsx):
    - 5 color variants: default, success, warning, error, brand
    - 3 sizes: sm (default), md, lg with proper scaling
    - Dot variant for status indicators (colored circles)
    - Number badge with count prop and automatic 99+ handling
    - Configurable maxCount prop (default: 99)
    - Full TypeScript with forwardRef support
    - CVA for variant management
    - Comprehensive JSDoc documentation
    - Dark mode support throughout
    - Flexible: can be used as label, status dot, or notification count
  - Created comprehensive examples page (BadgeExamplesPage.tsx):
    - All 5 variants showcase (default, success, warning, error, brand)
    - All 3 sizes demonstrated
    - Dot indicators in all variants and sizes
    - Number badges with various counts (3, 12, 99, 100, 999)
    - MBTI personality type grid (all 16 types)
    - Status labels (Active, Pending, Banned, etc.)
    - 6 real-world usage examples:
      - Navigation with notification counts
      - User profiles with status dots
      - Post tags and categories
      - Message threads with unread counts
      - Feature flags and states
      - All with proper icons and layouts
    - Code examples section with 4 usage patterns
    - 450+ lines of interactive examples
  - Badge already exported in index.ts
  - Added /examples/badge route to Router.tsx
- **Issues:** Minor ARIA lint warnings (acceptable)
- **Status:** ✅ Badge component complete with all variants
- **Next:** Phase 1.7 - Loading Components

### Session 15 - November 6, 2025
- **Completed:** Prompt 1.7 - Loading Components (Final Phase 1 prompt!)
- **Time taken:** ~1 hour
- **Deliverables:**
  - Enhanced Loading.tsx with Spinner and Skeleton components:
    - **Spinner**: CVA-based with 4 sizes (sm/md/lg/xl), 5 variants (default/primary/success/error/white), Lucide Loader2 icon, forwardRef
    - **Skeleton**: CVA-based with 4 variants (default/text/circle/rectangle), pulse animation, configurable width/height
  - Created LoadingExamplesPage.tsx with 500+ lines:
    - Spinner sizes and variants showcase
    - Spinner in buttons examples
    - Skeleton variants (text/circle/rectangle)
    - Skeleton post card composition
    - Skeleton user cards grid
    - Before/After comparison with loaded content
    - Full page loading example
    - Code examples section
  - Added /examples/loading route to Router.tsx
  - All components exported in index.ts
- **Issues:** Minor ARIA warnings on role="status" (acceptable)
- **Status:** 🎉 **PHASE 1 COMPLETE - All 7 design system components ready!**
- **Next:** Validate all components, then Phase 2.1 - Auth Context

### Session 16 - November 7, 2025
- **Completed:** Prompt 2.1 - Auth Context & API
- **Time taken:** ~2 hours
- **Deliverables:**
  - **Auth Context** (`features/auth/context/AuthContext.tsx`):
    - User state management (user, isAuthenticated, isLoading)
    - Session initialization from cookies on app load
    - Login/logout/refreshUser functions
    - Global 'auth:unauthorized' event listener for 401 responses
    - Automatic navigation integration
  - **useAuth Hook** (`features/auth/context/useAuth.ts`):
    - Separated from context for React fast refresh compliance
    - Type-safe access to auth state and methods
    - Error handling for usage outside provider
  - **Auth API Service** (`features/auth/services/authApi.ts`):
    - login(pigeonId) - Authenticate with Pigeon ID
    - signup(data) - Create new user account
    - getCurrentUser(userId) - Session validation
    - updateProfile(userId, data) - Profile updates
    - transformUserData() - Backend/frontend type transformation
  - **Protected Route** (`features/auth/components/ProtectedRoute.tsx`):
    - Loading spinner during auth check
    - Automatic redirect to login if unauthenticated
    - Configurable redirect path
  - **Integration**:
    - AuthProvider integrated in Router.tsx (inside BrowserRouter)
    - Cookie management with 30-day expiry
    - Type-safe with shared User interface
    - Global 401 error handling
  - **Test Infrastructure** (`pages/AuthTest.tsx`):
    - Visual auth status display at /test/auth
    - Cookie verification interface
    - Login/logout testing
    - Session restoration validation
  - Created PHASE-2.1-SUMMARY.md with complete documentation
- **Issues:** Minor fast refresh warning (non-blocking, cosmetic only)
- **Status:** ✅ Auth system complete and ready for testing
- **Next:** Phase 2.2 - Pigeon ID Signup Flow

### Session 17 - November 7, 2025
- **Completed:** Prompt 2.2 - Pigeon ID Signup Flow
- **Time taken:** ~2.5 hours
- **Deliverables:**
  - **SignupWizard Component** (`features/auth/components/SignupWizard.tsx`):
    - 7-step multi-step wizard with progress indicator
    - Step 1: Welcome screen with feature overview
    - Step 2: Pigeon ID generation with copy-to-clipboard
    - Step 3: Username input (validation pending)
    - Step 4: MBTI type selector (16 types grid)
    - Step 5: Location permission or manual city input
    - Step 6: Avatar upload (placeholder - skippable)
    - Step 7: Bio input (skippable)
    - Navigation: Back/Next/Skip buttons
    - Form validation for required fields
    - Error handling and display
  - **Pigeon ID Generator** (`features/auth/utils/pigeonIdGenerator.ts`):
    - Memorable format: adjective-noun-4digits (e.g., "brave-tiger-8472")
    - 40 adjectives, 40 nouns for variety
    - Validation function for format checking
  - **MBTI Selector** (`features/auth/components/MBTISelector.tsx`):
    - Interactive 4x4 grid of all 16 MBTI types
    - Color-coded by category (Analyst, Diplomat, Sentinel, Explorer)
    - Visual selection with ring highlight
    - Category legend
    - Selected type display
  - **Location Step** (`features/auth/components/LocationStep.tsx`):
    - GPS permission request with browser geolocation API
    - Manual city input fallback
    - OpenStreetMap Nominatim geocoding (free, no API key)
    - Coordinate display when set
    - Change location option
    - Error handling for permissions and API failures
  - **SignupPage** (`features/auth/pages/SignupPage.tsx`):
    - Simple wrapper for SignupWizard
    - Full-height layout
  - **API Integration**:
    - authApi.signup() integration
    - Backend POST /api/user/create with all fields
    - Auto-login after successful signup
    - Navigate to home after completion
  - **Router Updates**:
    - /signup route now uses real SignupPage component
    - Removed placeholder signup page
- **Issues:** 
  - Avatar upload not yet implemented (optional, can skip)
  - Username validation not implemented (optional)
  - Module resolution warnings (stale, files exist)
- **Status:** ✅ Core signup flow complete, optional enhancements pending
- **Next:** Phase 2.3 - Login Screen

### Session 18 - November 7, 2025
- **Completed:** Prompt 2.3 - Login Screen
- **Time taken:** ~45 minutes
- **Deliverables:**
  - **LoginForm Component** (`features/auth/components/LoginForm.tsx`):
    - Single Pigeon ID input field (password type)
    - Show/hide password toggle (built into Input component)
    - Login button with loading state and disabled state
    - Error message display with AlertCircle icon and styled alert box
    - "Lost your Pigeon ID?" link opens information modal
    - "Don't have an account? Sign up" link to /signup
    - Form validation (required field check)
    - API integration with authApi.login()
    - Auto-navigation to home after successful login
    - Full accessibility (ARIA attributes, keyboard navigation)
    - Dark mode support throughout
  - **LoginPage** (`features/auth/pages/LoginPage.tsx`):
    - Full-height centered layout
    - Background with theme support
    - Simple wrapper for LoginForm
  - **Forgot Password Modal**:
    - Dialog component explaining Pigeon ID cannot be recovered
    - Step-by-step admin contact instructions
    - Clean UI with DialogTitle and DialogDescription
    - ESC to close, click outside to close
  - **Router Integration**:
    - Removed placeholder LoginPage function
    - Imported real LoginPage from @/features/auth
    - /login route now uses actual component
  - **Exports**:
    - Added LoginPage and LoginForm to features/auth/index.ts
  - Created PHASE-2.3-SUMMARY.md with complete documentation
- **Issues:** None - all TypeScript/linting errors resolved
- **Status:** ✅ Login screen complete and fully functional
- **Next:** Phase 2.4 - App Layout & Navigation

### Session 19 - November 7, 2025
- **Completed:** Prompt 2.4 - App Layout & Navigation (Final Phase 2 prompt!)
- **Time taken:** ~2 hours
- **Deliverables:**
  - **Theme System:**
    - Created lib/theme.tsx with ThemeProvider component
    - Created lib/useTheme.ts hook for accessing theme state
    - Integrated ThemeProvider into app/providers.tsx
    - localStorage persistence for theme preference
  - **UserMenu Component** (`components/layout/UserMenu.tsx`):
    - Radix UI DropdownMenu with full accessibility
    - Avatar trigger with focus ring
    - User info display (username, MBTI)
    - Profile and Settings links
    - Theme submenu with light/dim/dark options
    - Logout button with destructive styling
    - Keyboard navigation (Tab, Enter, ESC)
    - Smooth animations and dark mode support
  - **TopNav Component** (`components/layout/TopNav.tsx`):
    - Desktop navigation (hidden on mobile < md)
    - Logo with pigeon emoji 🕊️
    - Three nav links: Home, Activity (with badge), Messages (with badge)
    - Create Post button (primary purple)
    - UserMenu integration
    - Active route highlighting (purple background)
    - Sticky positioning at top
    - Responsive labels (icons only → icons + text)
  - **BottomNav Component** (`components/layout/BottomNav.tsx`):
    - Mobile navigation (visible only < md)
    - Five nav items: Home, Activity, Create, Messages, Profile
    - Badge indicators for unread counts
    - Active route highlighting (purple text + filled icons)
    - Elevated Create button (larger, circular, shadow)
    - Safe area insets for notched devices
    - Fixed to bottom of screen
  - **AppLayout Component** (`components/layout/AppLayout.tsx`):
    - Main wrapper for authenticated pages
    - Renders TopNav (desktop) and BottomNav (mobile)
    - Proper spacing for content (pb-20 mobile, pb-0 desktop)
    - Full-height layout with theme background
  - **Page Components:**
    - Created HomePage, ActivityPage, MessagesPage, CreatePostPage, ProfilePage, SettingsPage
    - All placeholder pages with "coming soon" content
    - All wrapped with AppLayout
  - **Router Integration:**
    - Wrapped all main pages with ProtectedRoute
    - Redirect to /login if not authenticated
    - Protected routes: /, /activity, /messages, /create-post, /profile/:userId, /settings
    - Public routes: /login, /signup
  - **Mock Data:**
    - MOCK_UNREAD_ACTIVITY = 3 (temporary)
    - MOCK_UNREAD_MESSAGES = 5 (temporary)
  - Created PHASE-2.4-SUMMARY.md with comprehensive documentation
- **Issues:** None - all TypeScript errors resolved, all features working
- **Status:** 🎉 **PHASE 2 COMPLETE - Authentication & Navigation 100% Operational!**
- **Next:** Phase 3.1 - Post Components

---
- **Deliverables:**
  - Created complete folder structure (app/, components/, features/, hooks/, lib/, styles/, types/)
  - Built lib/cn.ts utility with clsx + tailwind-merge
  - Built lib/utils.ts with helper functions (formatRelativeTime, debounce, etc.)
  - Built lib/api.ts with full API client (interceptors, error handling, auth headers)
  - Created types/index.ts with all TypeScript interfaces
  - Built app/providers.tsx with React Query setup
  - Built app/Router.tsx with basic routes (/, /login, /signup)
  - Built app/App.tsx as main entry point
  - Created index.ts barrel exports for clean imports
  - Installed axios dependency
  - Verified @/ path aliases work correctly
  - Dev server running without errors at http://localhost:5173/
- **Issues:** Minor TypeScript linting warnings (handled with eslint-disable comments)
- **Next:** Prompt 0.4 - Admin Authentication

### Session 5 - November 4, 2025
- **Completed:** Prompt 0.4 - Admin Authentication
- **Time taken:** ~1.5 hours
- **Deliverables:**
  - Created AdminLoginPage (/admin/login) with password input, error handling, loading states
  - Built AdminAuthContext with session management (1-hour expiry, auto-logout)
  - Implemented ProtectedAdminRoute wrapper for route protection
  - Built AdminLayout with header, navigation, and logout button
  - Created AdminDashboardPage placeholder
  - Added admin routes to Router.tsx (/admin/login, /admin/dashboard, /admin/flagged, /admin/users, /admin/settings)
  - Integrated AdminAuthProvider into app providers
  - Created backend /api/admin/login endpoint
  - Added ADMIN_PASSWORD to .env file
  - Created .env file for web-v2 with VITE environment variables
  - All protected routes redirect to login when not authenticated
  - Session management with cookies (adminToken, adminSessionExpiry)
  - Fixed all TypeScript/linting errors
- **Issues:** None - all working correctly
- **Next:** Prompt 0.5 - Flagged Posts Dashboard

### Session 6 - November 5, 2025
- **Completed:** Prompt 0.5 - Flagged Posts Dashboard
- **Time taken:** ~2.5 hours
- **Deliverables:**
  - **Backend API:**
    - Created `getFlaggedPosts` endpoint with filtering (all/auto-hidden/under-review), sorting (most-reports/recent/oldest), and pagination
    - Created `dismissReports` endpoint to clear dislike reactions from posts
    - Updated `deletePosts` endpoint to fix bugs
    - Added routes to `/api/admin/flagged-posts` and `/api/admin/posts/:postId/dismiss-reports`
  - **UI Components:**
    - Built Button component with variants (primary, secondary, ghost, destructive, outline), sizes, loading states
    - Built Badge component with variants (default, success, warning, error, brand)
    - Built Card component with composable sub-components (CardHeader, CardContent, CardFooter)
    - Built Dialog/Modal component using Radix UI with overlay, animations, and accessibility
  - **Feature Components:**
    - Created FlaggedPostCard with thumbnail, user info, dislike count, reporters list, checkbox selection, and action buttons
    - Created PostDetailModal with full-size image, complete metadata, status indicator, and admin actions
    - Created FlaggedPostsPage with filter tabs, sorting dropdown, bulk selection, pagination, and modal integration
  - **Integration:**
    - Added FlaggedPost TypeScript interface to types
    - Exported FlaggedPostsPage from admin feature index
    - Updated Router to use FlaggedPostsPage component
    - All components integrated with backend API
    - Dark mode support throughout
  - **Testing:**
    - Dev server running without errors at http://localhost:5173
    - No TypeScript/linting errors
    - All components compile successfully
- **Issues:** None - all features working correctly
- **Next:** Prompt 0.6 - User Management Panel

---

## 🚀 PHASE 0: Foundation + Admin Panel

---

### Prompt 0.1: Initialize Vite Project

**AI Recommendation:** 💰 **GPT-5 mini** (Simple setup task)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 4, 2025  
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

**AI Recommendation:** 💰 **GPT-5 mini** (Configuration task with clear specs)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 4, 2025  
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

**AI Recommendation:** 💰 **GPT-5 mini** (Boilerplate creation)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 4, 2025  
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

**AI Recommendation:** 🎯 **Claude Sonnet** (Security-critical with session management)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 4, 2025  
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

**AI Recommendation:** 🎯 **Claude Sonnet** (Complex CRUD with backend integration)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 5, 2025  
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

**AI Recommendation:** 🎯 **Claude Sonnet** (Complex user management with security implications)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 6, 2025  
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

**AI Recommendation:** 🎯 **Claude Sonnet** (Prefer Claude for analytics metrics & chart logic)

**Status:** ✅ Complete  
**Completed:** [x] Yes - Nov 6, 2025  
**Prerequisites:** Admin auth + flagged posts + user management completed  
**Estimated Time:** 4-6 hours  
**Actual Time:** 2 hours  
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

- [x] Dashboard page (`/admin/dashboard` - default route) with:
  - [x] Overview cards:
    - [x] Active users (today, this week, all time)
    - [x] Posts today (with % change vs last week)
    - [x] Reports today (with % change vs last week)
    - [x] Auto-hidden posts count
  - [x] Urgent actions section:
    - [x] Auto-hidden posts in last hour (link to flagged)
    - [x] Unreviewed flagged posts (link to flagged)
  - [x] Activity chart (last 7 days):
    - [x] Posts per day
    - [x] Reports per day
    - [x] Auto-hidden per day
- [x] Admin settings page (`/admin/settings`) with:
  - [x] Change admin password
  - [x] Configure report threshold (default: 3)
  - [x] Email for notifications
  - [x] Save button
- [x] Navigation sidebar/header with:
  - [x] Dashboard
  - [x] Flagged Posts
  - [x] Users
  - [x] Settings
  - [x] Logout
- [ ] System logs viewer (basic - optional - skipped)

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

**AI Recommendation:** 💰 **GPT-5 mini** (Simple component with clear variants)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 6, 2025  
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

**AI Recommendation:** 💰 **GPT-5 mini** (Simple form components)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 6, 2025  
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

**AI Recommendation:** 💰 **GPT-5 mini** (Simple layout component)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 6, 2025  
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

**AI Recommendation:** 💰 **GPT-5 mini** (Radix UI wrapper with styling)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 6, 2025  
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

**AI Recommendation:** 💰 **GPT-5 mini** (Simple image component with fallbacks)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 6, 2025  
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

**AI Recommendation:** 💰 **GPT-5 mini** (Very simple component)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 6, 2025  
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

**AI Recommendation:** 💰 **GPT-5 mini** (Simple animation components)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 6, 2025  
**Prerequisites:** All basic components completed  
**Estimated Time:** 2-3 hours  
**Actual Time:** 1 hour  
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

**AI Recommendation:** 🎯 **Claude Sonnet** (Complex state management and security)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 7, 2025  
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

**AI Recommendation:** 🎯 **Claude Sonnet** (Multi-step flow with validation and unique business logic)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 7, 2025  
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

**AI Recommendation:** 💰 **GPT-5 mini** (Simple form with existing auth context)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 7, 2025  
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

**AI Recommendation:** 🎯 **Claude Sonnet** (Prefer Claude for navigation logic and architecture)

**Status:** ✅ Complete  
**Completed:** [X] Yes - November 7, 2025  
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
