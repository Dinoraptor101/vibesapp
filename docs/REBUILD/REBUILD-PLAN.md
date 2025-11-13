# VibesApp Frontend Rebuild Plan

**Date:** November 3, 2025 (Updated: November 5, 2025)  
**Branch:** `rebuilding-front-end`  
**Current Version:** 0.20.1  
**Goal:** Modernize and optimize the frontend architecture with improved developer experience and user experience, following ZEN design principles

## Executive Summary

This document outlines the comprehensive plan to rebuild the VibesApp frontend from the ground up, leveraging modern tools and best practices while preserving the core functionality and user experience that makes VibesApp unique.

## Current State Analysis

### What We Have
- **Framework:** React 18 with TypeScript
- **Styling:** Custom CSS with CSS Variables (theme.css)
- **State Management:** React Context + React Query
- **Routing:** React Router v6
- **Build Tool:** Create React App + Webpack
- **Components:** 25+ feature components in custom architecture
- **PWA Support:** Service Worker, offline capabilities
- **Real-time:** Socket.IO integration for messaging

### Current Pain Points
1. **Styling Inconsistency:** Custom CSS spread across components without a design system
2. **Component Complexity:** Large monolithic components mixing concerns
3. **Build Performance:** CRA overhead and slow build times
4. **Developer Experience:** Manual className management, no autocomplete for styles
5. **Theme Management:** Manual CSS variable management without type safety
6. **Accessibility:** Inconsistent ARIA labels and keyboard navigation
7. **Mobile Responsiveness:** Media queries scattered throughout codebase
8. **Code Duplication:** Repeated patterns across components

### What Works Well
1. **Type Safety:** Strong TypeScript integration
2. **API Layer:** Clean separation with apiService
3. **Shared Libraries:** Monorepo structure with @vibesapp/* packages
4. **User Flows:** Well-defined journeys and interactions
5. **Feature Set:** Comprehensive social networking capabilities
6. **Documentation:** Extensive docs covering architecture and patterns
7. **Testing:** Playwright E2E tests provide safety net

## Design Philosophy (Updated Nov 5, 2025)

### ZEN Design Principles (Dieter Rams Inspired)
1. **One Action, One Way:** No duplicate paths to achieve the same goal
2. **Auto-Save Everything:** No "Save" buttons - blur to save, silent errors
3. **Mobile-First:** 95% mobile usage - optimize for touch and small screens
4. **Loading Rules:** < 1 second = no spinner, > 1 second = show spinner
5. **Offline-Ready:** Silent queueing, seamless sync, no "offline mode" UI
6. **Character Limits:** Show counter only when approaching limit
7. **Minimal Feedback:** Silent success, brief toasts only when helpful
8. **Profile vs Account:**
   - **Profile** = Read-only public view (click usernames)
   - **Account** = Editable settings (Settings → Account tab)

### Navigation Structure (Updated Nov 5, 2025)
**Main Nav:** Posts | Messages | Activities | Settings | Theme Toggle (icon)

**Removed from Nav:**
- "Home" → Changed to "Posts"
- "Profile" → Accessed by clicking usernames (read-only view)

**Settings Structure:**
- Account tab: Profile editing, Pigeon ID, Logout
- Preferences tab: Proximity range (50/100/150km)
- Support tab: Feedback, TOS, Privacy Policy

## Rebuild Strategy

### Phase 0: Planning & Documentation (Current Phase)
**Timeline:** 1 week  
**Status:** In Progress

- [x] Create rebuild documentation structure
- [ ] Audit all existing components and features
- [ ] Document UI/UX patterns and design tokens
- [ ] Extract reusable logic into hooks documentation
- [ ] Define new component architecture
- [ ] Create migration checklist

### Phase 1: Foundation Setup
**Timeline:** 1-2 weeks

1. **Choose Modern Stack**
   - **Build Tool:** Vite (faster than CRA/Webpack)
   - **Styling:** Tailwind CSS with custom theme configuration
   - **UI Components:** Headless UI or Radix UI primitives
   - **Icons:** Lucide React (modern, tree-shakeable)
   - **Animations:** Framer Motion for smooth transitions
   - **Linting:** ESLint + TypeScript ESLint
   - **Formatting:** Biome (fast Rust-based formatter)
   - **Note:** ⚠️ apps/web-v2 uses ESLint (unlike apps/web which uses Biome for both linting and formatting)

2. **Setup New Project Structure**
   ```
   apps/web-v2/
   ├── src/
   │   ├── app/              # App-level components and providers
   │   ├── features/         # Feature-based organization
   │   │   ├── posts/
   │   │   ├── messaging/
   │   │   ├── profile/
   │   │   └── auth/
   │   ├── components/       # Shared UI components
   │   │   ├── ui/          # Base components (Button, Input, etc.)
   │   │   └── layout/      # Layout components
   │   ├── hooks/           # Custom React hooks
   │   ├── lib/             # Utilities and helpers
   │   ├── styles/          # Global styles and Tailwind config
   │   └── types/           # TypeScript types
   ```

3. **Design System Foundation**
   - Define color palette in Tailwind config
   - Create spacing/typography scale
   - Establish component variants system
   - Document design tokens

### Phase 2: Core Components Migration
**Timeline:** 2-3 weeks

**Priority Order:**
1. Design System Components (Button, Input, Card, etc.)
2. Layout Components (AppWrapper, Navigation)
3. Authentication Flow (WelcomeForm)
4. Post Display (Post, PostsGrid)
5. Post Creation (CreatePost)
6. User Profile (UserProfile, PublicProfile)
7. Messaging (DirectMessage, GroupChat)
8. Activity & Notifications

**Migration Pattern for Each Component:**
1. Create new component with Tailwind
2. Port logic and hooks
3. Add Storybook story (optional but recommended)
4. Write unit tests
5. Test in isolation
6. Integrate with existing routes
7. Mark old component as deprecated

### Phase 3: Advanced Features
**Timeline:** 2 weeks

- Real-time messaging with optimistic updates
- Advanced animations and transitions
- Image optimization and lazy loading
- Virtualized lists for performance
- Offline-first PWA enhancements
- Enhanced accessibility features

### Phase 4: Testing & Polish
**Timeline:** 1-2 weeks

- Update all E2E tests
- Add visual regression tests
- Performance optimization
- Bundle size optimization
- Cross-browser testing
- Mobile device testing

### Phase 5: Deployment & Rollout
**Timeline:** 1 week

- Gradual feature flag rollout
- Monitor performance metrics
- Collect user feedback
- Bug fixes and adjustments
- Full migration cutover

## Technology Choices

### Why Vite?
- ⚡ **50x faster** HMR than Webpack
- 🎯 **Native ESM** - no bundling in dev
- 🔧 **Better DX** - faster builds, smaller bundles
- 🔌 **Plugin ecosystem** - Easy React, TypeScript, PWA support
- 📦 **Optimized builds** - Rollup-based production builds

### Why Tailwind CSS?
- 🎨 **Utility-first** - Rapid development without context switching
- 📱 **Responsive design** - Built-in breakpoint system
- 🌙 **Dark mode** - First-class dark mode support
- 🔧 **Customizable** - Full control over design system
- 📦 **Tree-shakeable** - Only ship CSS you use
- 💪 **Type-safe** - With tailwind-variants or CVA
- ⚡ **No CSS-in-JS runtime** - Better performance

### Why Headless UI / Radix UI?
- ♿ **Accessibility** - WAI-ARIA compliant out of the box
- 🎨 **Unstyled** - Full styling control with Tailwind
- ⌨️ **Keyboard navigation** - Proper focus management
- 📱 **Mobile-friendly** - Touch and gesture support
- 🧩 **Composable** - Build complex components easily

### Alternative Considerations
- **Styling:** Could use Vanilla Extract, Panda CSS, or CSS Modules
- **Component Library:** Could use shadcn/ui (Radix + Tailwind prebuilt)
- **Animation:** Could use CSS animations or React Spring
- **Build Tool:** Could use Turbopack (Next.js) if we migrate to Next

## Design System

### Color Palette (From Current Theme)
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Light theme
        light: {
          bg: '#f8f8f8',
          card: '#ffffff',
          text: '#000000',
          note: 'rgba(0, 0, 0, 0.6)',
          border: '#e0e0e0',
        },
        // Dim theme (default)
        dim: {
          bg: '#333333',
          card: '#424242',
          text: '#ffffff',
          note: 'rgba(255, 255, 255, 0.7)',
          border: '#555555',
        },
        // Dark theme
        dark: {
          bg: '#000000',
          card: '#1a1a1a',
          text: '#ffffff',
          note: 'rgba(255, 255, 255, 0.6)',
          border: '#333333',
        },
        // Brand colors
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#21a1f1', // Main brand color
          600: '#1890ff',
          700: '#096dd9',
          800: '#0050b3',
          900: '#003a8c',
        },
        // Vibes colors
        vibe: {
          positive: '#4caf50',
          negative: '#ab1c1c',
        },
      },
    },
  },
};
```

### Typography Scale
```js
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
}
```

### Component Variants Pattern
```tsx
// Using class-variance-authority (CVA)
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'bg-dim-card text-dim-text hover:bg-dim-border',
        ghost: 'hover:bg-dim-card/50',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

## Migration Checklist

### Components to Migrate
- [ ] Button
- [ ] Input
- [ ] Card
- [ ] Modal/Dialog
- [ ] Dropdown Menu
- [ ] Avatar
- [ ] Badge
- [ ] Spinner/Loading
- [ ] Navigation
- [ ] Post
- [ ] PostsGrid
- [ ] CreatePost
- [ ] UserProfile
- [ ] PublicProfile
- [ ] DirectMessage
- [ ] GroupChat
- [ ] ActivityList
- [ ] Notification
- [ ] WelcomeForm

### Features to Preserve & Enhance (Updated Nov 5, 2025)
- [x] Theme switching (light/dim/dark) - **Keep in nav as icon button**
- [ ] User authentication state (Pigeon ID system)
- [ ] Post creation with image upload
- [ ] Post vibes (like/dislike)
- [ ] Reply system
- [ ] Real-time messaging (request-based DM)
- [ ] Location-based features (**default 100km, adjustable 50-150km in Settings**)
- [ ] MBTI integration (changeable in Settings)
- [ ] Notification system (categorized activity feed)
- [ ] Activity tracking
- [ ] **Settings Page (NEW):** Account/Preferences/Support tabs
  - [ ] Auto-save pattern (no "Save" buttons)
  - [ ] Profile editing (bio, MBTI, location, polarity)
  - [ ] Pigeon ID copy button
  - [ ] Proximity range selector
  - [ ] Feedback link (Telegram)
  - [ ] Logout button
- [ ] **Profile Page:** Read-only public view with age display
- [ ] PWA capabilities
- [ ] **Offline support (ENHANCED):** Silent queueing and sync

### Quality Checkers
- [ ] All E2E tests passing
- [ ] Unit test coverage >80%
- [ ] Lighthouse score >90
- [ ] Bundle size <500KB (gzipped)
- [ ] First Contentful Paint <1.5s
- [ ] Accessibility score 100
- [ ] No console errors/warnings
- [ ] Mobile responsive on all screens
- [ ] Cross-browser compatible (Chrome, Firefox, Safari)

## Success Metrics

### Performance
- **Build Time:** <5s (down from ~30s)
- **HMR:** <100ms (down from ~2s)
- **Bundle Size:** <500KB gzipped (down from ~800KB)
- **First Load:** <1.5s (down from ~3s)
- **Time to Interactive:** <2s (down from ~4s)

### Developer Experience
- **Component Creation Time:** 50% faster
- **Styling Time:** 70% faster with Tailwind
- **Debug Time:** Improved with better dev tools
- **New Developer Onboarding:** <1 day (clear patterns)

### User Experience
- **Perceived Performance:** Instant interactions
- **Accessibility Score:** 100/100
- **Mobile Experience:** Native-like with smooth animations
- **Theme Switching:** Instant with no flash

## Risk Mitigation

### Risks & Mitigation Strategies
1. **Breaking Changes**
   - Mitigation: Feature flags, gradual rollout, parallel old/new implementations

2. **Timeline Slippage**
   - Mitigation: Phased approach, MVP features first, nice-to-haves later

3. **User Experience Disruption**
   - Mitigation: Maintain feature parity, beta testing, user feedback loops

4. **Team Learning Curve**
   - Mitigation: Documentation, examples, pair programming

5. **Technical Debt**
   - Mitigation: Code reviews, linting rules, architectural guidelines

## Key Decisions (Confirmed Nov 4, 2025)

### Feature Confirmations
1. **Yin/Yang Polarity:** User profile fields indicating masculinity/femininity (identity characteristic, NOT a score from likes/dislikes)
2. **Vibes System:** Like, Dislike/Report (affects post visibility + poster's vibes score)
3. **Auto-Hide Threshold:** 3 unique Yin vibes triggers post auto-hide + admin notification
4. **Activity Cleanup:** Read notifications deleted after 7 days, unread persist forever (capped at 100k+)
5. **DM Request Cooldown:** 2 days if request declined
6. **Search Scope:** Global search (all posts and users, not location-filtered)
7. **@Mentions Scope:** Comments and captions
8. **Ban User:** Easy and quick (no confirmation required), reversible, doesn't delete data (soft delete)

### Admin Panel Additions
1. **Delete Post:** Single delete + bulk delete capability
2. **Delete User:** Soft delete (hides all user data, doesn't remove from DB)
3. **Delete Orphaned S3 Images:** Scan and delete images not attached to posts
4. **Ban/Unban:** Easy toggle with no confirmation, fully reversible

## Next Steps

1. ✅ **Review this plan** with team/stakeholders (DONE Nov 4, 2025)
2. ✅ **Create detailed component audit** (see REBUILD-COMPONENT-AUDIT.md)
3. ✅ **Extract UI/UX patterns** (see REBUILD-UI-PATTERNS.md)
4. **Setup new Vite project** with Tailwind
5. **Start with design system components**

## Questions to Answer
- [ ] Do we want to use shadcn/ui or build from scratch?
- [ ] Should we consider Next.js for better SSR/SEO?
- [ ] Do we want Storybook for component development?
- [ ] Should we add visual regression testing?
- [ ] What's our browser support matrix?
- [ ] Do we need IE11 support? (hopefully not!)

---

**Let's build something amazing! 🚀**
