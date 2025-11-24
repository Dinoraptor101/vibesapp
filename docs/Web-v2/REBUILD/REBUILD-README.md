# Frontend Rebuild Documentation - Table of Contents

**Created:** November 3, 2025  
**Branch:** `rebuilding-front-end`  
**Status:** ✅ Complete - All Features Implemented  
**Last Updated:** November 24, 2025

---

## ⚠️ Important: Linting & Formatting

**Different projects use different tools!**

- **apps/web** (V1): Biome ONLY (linting + formatting)
- **apps/web-v2** (V2 Rebuild): ESLint (linting) + Biome (formatting)
- **apps/api**: ESLint (linting)

📖 **See:** [LINTING-QUICK-REFERENCE.md](./LINTING-QUICK-REFERENCE.md) for complete guide

❌ **DO NOT** add ESLint to apps/web - it uses Biome exclusively!

---

## ⚡ Quick Reference - Confirmed Decisions (Updated Nov 5, 2025)

### ZEN Design Philosophy 🧘
- **Auto-Save Pattern:** NO "Save" buttons - blur to save, silent errors
- **One Action, One Way:** No duplicate paths to same goal (Dieter Rams principles)
- **Mobile-First:** 95% mobile usage - optimize for touch and small screens
- **Loading Rules:** < 1 second = no spinner, > 1 second = show spinner
- **Offline-Ready:** Silent queueing, seamless sync, small grey wifi icon in header
- **Character Limits:** Show counter only when approaching limit (e.g., 180/200 chars)

### Navigation Structure
**Main Nav:** Posts | Messages | Activities | Settings | Theme Toggle (icon)
- "Home" → Changed to "Posts"
- "Profile" removed from nav → Accessed by clicking usernames
- Theme toggle stays in nav (frequent action, NOT in Settings)

### Settings Page (NEW)
**Route:** `/settings/account` and `/settings/preferences`
**Tabs:** Account | Preferences | Support
- **Account:** Profile editing, Pigeon ID copy, Logout
- **Preferences:** Proximity range (50/100/150km default)
- **Support:** Feedback (Telegram), TOS, Privacy Policy

### Profile vs Account (CRITICAL Distinction)
- **Profile:** Read-only public view (click usernames) - shows username, age, bio, MBTI, polarity, location (as distance)
- **Account:** Editable settings (Settings → Account tab) - edit avatar, bio, MBTI, location, polarity

### Feature Confirmations
- **Yin/Yang Polarity:** User profile field for masculinity/femininity (identity, NOT score) - **Toggle switch in Account settings**
- **Vibes System:** Like, Dislike/Report (dual purpose)
- **Auto-Hide Threshold:** 3 unique dislikes
- **Proximity Range:** Default 100km, adjustable 50-150km in Preferences (hidden from posts grid)
- **Activity Cleanup:** Read after 7 days, unread capped at 100k+
- **DM Cooldown:** 2 days if declined
- **Search Scope:** Global (not location-filtered)
- **@Mentions:** Comments and captions
- **Ban User:** Easy toggle, no confirmation, reversible, soft delete
- **Age Display:** Calculated from birth date, shown on profile (NOT editable), format: "Age: 28"
- **Username:** Set at signup, permanent (NOT editable, NOT shown in Account settings)
- **TODO (Post-MVP):** Age-based content filtering for child protection

### Admin Panel Features
- Delete post (single + bulk)
- Delete user (soft delete)
- Delete orphaned S3 images
- Easy ban/unban toggle

---

## 📚 Documentation Overview

This comprehensive documentation package provides everything needed to rebuild the VibesApp frontend from the ground up. Each document serves a specific purpose in the planning and execution process.

---

## 📄 Documents

### 1. [REBUILD-PLAN.md](./REBUILD-PLAN.md)
**The Master Plan**

**What it covers:**
- Executive summary
- Current state analysis (what works, what doesn't)
- Complete rebuild strategy with 5 phases
- Technology choices and rationale
- Design system overview
- Migration checklist
- Success metrics and risk mitigation

**When to use:**
- Getting overview of entire project
- Understanding why we're doing this
- Explaining project to stakeholders
- Reviewing technology decisions

**Key sections:**
- Phase-by-phase timeline (10 weeks)
- Technology stack (Vite, Tailwind, Radix UI)
- Performance targets
- Questions to answer

---

### 2. [REBUILD-COMPONENT-AUDIT.md](./REBUILD-COMPONENT-AUDIT.md)
**Component Inventory & Analysis**

**What it covers:**
- Detailed audit of all 15+ current components
- Complexity ratings (⭐ to ⭐⭐⭐⭐⭐)
- Lines of code analysis
- Migration priority (🔥 Critical, 🟡 Medium, 🟢 Low)
- Estimated effort for each component
- Current CSS to Tailwind conversion map
- Shared patterns to extract

**When to use:**
- Starting to migrate a specific component
- Understanding current component complexity
- Prioritizing what to build first
- Estimating effort for tasks

**Key sections:**
- Component-by-component breakdown
- Complexity analysis (total: 41.5 days)
- Priority matrix
- Shared patterns (Avatar, TimeAgo, EmptyState, etc.)

---

### 3. [REBUILD-UI-PATTERNS.md](./REBUILD-UI-PATTERNS.md)
**Design Language & UI Patterns**

**What it covers:**
- Complete design system documentation
- Color palette with Tailwind config
- Typography scale
- Spacing system
- Component patterns (buttons, inputs, cards, etc.)
- Animation patterns and micro-interactions
- Responsive breakpoints and mobile-first patterns
- Accessibility patterns
- Loading, error, and empty states

**When to use:**
- Building new components
- Ensuring design consistency
- Configuring Tailwind
- Implementing animations
- Making accessibility decisions

**Key sections:**
- Tailwind color palette configuration
- Component variant examples
- Animation/transition patterns
- Accessibility checklist

---

### 4. [REBUILD-LEARNINGS.md](./REBUILD-LEARNINGS.md)
**What Worked, What Didn't, What We Learned**

**What it covers:**
- What went well (TypeScript, monorepo, API layer, etc.)
- What didn't work (CSS management, large components, CRA)
- Lessons learned from current implementation
- Technical debt we're leaving behind
- New patterns we're adopting
- Architecture decisions
- Performance targets

**When to use:**
- Understanding why we're changing things
- Avoiding past mistakes
- Learning from experience
- Justifying decisions to stakeholders

**Key sections:**
- ✅ What went well (5 items)
- ❌ What didn't work (10 problems + solutions)
- Feature-based structure
- Custom hook patterns
- Component composition

---

### 5. [REBUILD-ACTION-PLAN.md](./REBUILD-ACTION-PLAN.md)
**Step-by-Step Implementation Guide**

**What it covers:**
- Week-by-week breakdown (10 weeks)
- Daily checklists
- Specific commands to run
- Code examples for setup
- Definition of done for features
- Risk management
- Success metrics
- Communication plan

**When to use:**
- Daily development work
- Tracking progress
- Understanding what to do next
- Checking off completed tasks

**Key sections:**
- Immediate next steps
- Phase 0: Foundation (Week 1-2)
- Phase 1: Core features (Week 3-5)
- Phase 2: Advanced features (Week 6-7)
- Phase 3: Testing (Week 8-9)
- Phase 4: Deployment (Week 10)

---

### 6. [REBUILD-WEB-V2-TESTING-PLAN.md](./REBUILD-WEB-V2-TESTING-PLAN.md)
**Comprehensive Testing Strategy** (Future Implementation)

**What it covers:**
- Testing pyramid strategy (60% Unit, 30% Component, 10% E2E)
- Complete setup instructions for Playwright + Vitest
- Feature-by-feature test breakdown (110+ test cases)
- Configuration examples and test templates
- 4-week implementation timeline
- CI/CD integration strategy
- Testing best practices and maintenance guidelines

**When to use:**
- Planning testing automation implementation
- Setting up Playwright and Vitest
- Writing unit, component, and E2E tests
- Establishing testing standards and coverage goals
- Configuring CI/CD test pipelines

**Key sections:**
- Testing architecture (Unit/Component/E2E breakdown)
- Setup & configuration (Vitest, Playwright, MSW)
- Feature testing checklists (Auth, Posts, Messaging, etc.)
- Code examples (3 complete test templates)
- 4-week implementation roadmap
- Success metrics (>80% coverage, <5min runtime)

**Status:** 📅 **Planned for future implementation** - Execute after core rebuild features are stable

---

## 🎯 Quick Start

### If you want to...

**Understand the big picture:**
→ Start with `REBUILD-PLAN.md`

**Start coding today:**
→ Jump to `REBUILD-ACTION-PLAN.md` → "Immediate Next Steps"

**Build a specific component:**
→ Check `REBUILD-COMPONENT-AUDIT.md` for that component → Use patterns from `REBUILD-UI-PATTERNS.md`

**Understand design decisions:**
→ Read `REBUILD-LEARNINGS.md`

**Ensure consistency:**
→ Reference `REBUILD-UI-PATTERNS.md`

**Plan testing automation:**
→ Review `REBUILD-WEB-V2-TESTING-PLAN.md` (for future implementation)

---

## 📊 Project Summary

### Technology Stack
- **Build Tool:** Vite (replacing Create React App)
- **Styling:** Tailwind CSS (replacing custom CSS)
- **UI Components:** Radix UI / Headless UI
- **Icons:** Lucide React (replacing FontAwesome)
- **State Management:** React Query + Zustand
- **Type Safety:** TypeScript (keeping)
- **Testing:** Vitest + Testing Library + Playwright

### Timeline
- **Total Duration:** 8-10 weeks
- **Foundation Setup:** 2 weeks
- **Core Features:** 3 weeks
- **Advanced Features:** 2 weeks
- **Testing & Polish:** 2 weeks
- **Deployment:** 1 week

### Success Metrics
- Build time: <5s (from ~30s)
- HMR: <100ms (from ~2s)
- Bundle size: <500KB (from ~800KB)
- Lighthouse: >90 (from ~75)
- Test coverage: >80%

---

## 🏗️ Architecture Overview

```
apps/web-v2/
├── src/
│   ├── app/              # App setup, providers, routing
│   ├── features/         # Feature-based organization
│   │   ├── posts/        # Post-related features
│   │   ├── auth/         # Authentication
│   │   ├── messaging/    # Real-time messaging
│   │   └── profile/      # User profiles
│   ├── components/       # Shared components
│   │   ├── ui/          # Design system (Button, Input, etc.)
│   │   └── layout/      # Layout components
│   ├── hooks/           # Shared custom hooks
│   ├── lib/             # Utilities and helpers
│   ├── styles/          # Global styles, Tailwind config
│   └── types/           # TypeScript types
```

---

## ✅ Current Status

### Completed
- [x] Comprehensive planning documentation
- [x] Component audit (15+ components)
- [x] UI pattern documentation
- [x] Learning documentation
- [x] Detailed action plan
- [x] Testing automation plan (Playwright + Vitest)
- [x] Branch created (`rebuilding-front-end`)
- [x] Full frontend implementation with all planned features
- [x] Authentication system (Pigeon ID)
- [x] Posts feed with grid layout and hearts
- [x] Real-time messaging (DM requests and conversations)
- [x] User profiles with MBTI and polarity
- [x] Settings and preferences
- [x] Admin panel for moderation
- [x] Location-based features with adjustable radius
- [x] Theme system (Light, Dim, Dark)
- [x] Responsive design and accessibility

### Next Steps (Post-Implementation)
1. Implement ReCaptcha V3 for login/signup
2. Deploy to production
3. Monitor and iterate based on user feedback

### Future Steps (Post-Rebuild)
1. Implement testing automation (see REBUILD-WEB-V2-TESTING-PLAN.md)
2. Achieve >80% test coverage
3. Setup CI/CD test pipelines

---

## 🎨 Design System Preview

### Component Priority
1. **Critical (build first):**
   - Button, Input, Card, Modal
   - Post, PostsGrid, CreatePost
   - AppWrapper, WelcomeForm

2. **Medium (build second):**
   - UserProfile, PublicProfile
   - DirectMessage, GroupChat
   - ActivityList

3. **Low (build last or use library):**
   - Notification (use Sonner)
   - Spinner, LoadingScreen
   - ErrorBoundary

---

## 📈 Performance Goals

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Build Time | ~30s | <5s | 83% faster |
| HMR | ~2s | <100ms | 95% faster |
| Bundle Size | ~800KB | <500KB | 37% smaller |
| First Load | ~3s | <1.5s | 50% faster |
| Lighthouse | 75 | >90 | +20% |

---

## 🔗 Related Documentation

### Existing Documentation
- [01-project-overview.md](./01-project-overview.md) - Overall project structure
- [04-frontend-architecture.md](./04-frontend-architecture.md) - Current architecture
- [08-component-guide.md](./08-component-guide.md) - Current component docs
- [07-development-workflow.md](./07-development-workflow.md) - Dev workflow

### New Documentation (This Rebuild)
- [REBUILD-PLAN.md](./REBUILD-PLAN.md) ⭐ **Start here**
- [REBUILD-COMPONENT-AUDIT.md](./REBUILD-COMPONENT-AUDIT.md)
- [REBUILD-UI-PATTERNS.md](./REBUILD-UI-PATTERNS.md)
- [REBUILD-LEARNINGS.md](./REBUILD-LEARNINGS.md)
- [REBUILD-ACTION-PLAN.md](./REBUILD-ACTION-PLAN.md) ⭐ **Daily reference**
- [REBUILD-WEB-V2-TESTING-PLAN.md](./REBUILD-WEB-V2-TESTING-PLAN.md) 📅 **Future implementation**

---

## 💡 Key Principles

1. **Performance First** - Every decision impacts speed
2. **Accessibility First** - Everyone should be able to use the app
3. **Design System** - Build reusable components first
4. **Testing** - Confidence through good test coverage
5. **Documentation** - Future developers will thank us
6. **Iteration** - Ship early, iterate often

---

## 🚀 Let's Build!

**We have a solid plan. Now let's execute.**

1. ✅ Planning done
2. ⏭️ Review & approve
3. ⏭️ Set up project
4. ⏭️ Build design system
5. ⏭️ Migrate features
6. ⏭️ Test & polish
7. ⏭️ Deploy & celebrate! 🎉

---

**Questions? Check the relevant document above or ask the team!**

---

## Document Change Log

| Date | Document | Changes |
|------|----------|---------|
| Nov 3, 2025 | All | Initial creation |
| Nov 18, 2025 | REBUILD-WEB-V2-TESTING-PLAN.md | Added comprehensive testing plan (future implementation) |
| Nov 18, 2025 | REBUILD-README.md | Updated to include testing plan reference |

---

**Next Update:** When Phase 0 (Foundation Setup) is complete
