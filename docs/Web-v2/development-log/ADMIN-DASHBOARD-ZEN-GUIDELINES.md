# Admin Dashboard - ZEN Design Guidelines

> Reference document for applying ZEN Principles to the Admin Dashboard experience.

## Overview

The Admin Dashboard is a separate administrative interface for managing VibesApp. It should follow the same ZEN Principles documented in `/docs/Web-v2/06-ux-design.md` to maintain consistency with the main product experience.

---

## Admin Dashboard Structure

### Pages

| Page | Path | Purpose |
|------|------|---------|
| **AdminLoginPage** | `/admin/login` | Password-only authentication |
| **AdminDashboardPage** | `/admin/dashboard` | Metrics overview, urgent actions, activity chart |
| **FlaggedPostsPage** | `/admin/flagged` | Review reported/auto-hidden posts |
| **FlaggedPostDetailPage** | `/admin/flagged/:id` | Individual flagged post details |
| **UsersPage** | `/admin/users` | User management, search, ban/unban |
| **UserDetailPage** | `/admin/users/:id` | Individual user profile & actions |
| **UserPostsPage** | `/admin/users/:id/posts` | User's post history |
| **AdminSettingsPage** | `/admin/settings` | Admin preferences, moderation rules |

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AdminLayout` | `components/AdminLayout.tsx` | Header, navigation, footer wrapper |
| `MetricCard` | `components/MetricCard.tsx` | Dashboard stat cards with trends |
| `ActivityChart` | `components/ActivityChart.tsx` | 7-day activity bar chart |
| `FlaggedPostCard` | `components/FlaggedPostCard.tsx` | Flagged post list item |
| `UserCard` | `components/UserCard.tsx` | User list item with actions |
| `PostDetailModal` | `components/PostDetailModal.tsx` | Full post view modal |
| `RegeneratePasswordModal` | `components/RegeneratePasswordModal.tsx` | Password reset for users |
| `ProtectedAdminRoute` | `components/ProtectedAdminRoute.tsx` | Auth guard for admin routes |

### Hooks

| Hook | Purpose |
|------|---------|
| `useAdminAuth` | Admin authentication state & methods |
| `useUsers` | User list fetching with pagination |
| `useUserFilters` | Search, filter, sort state management |
| `useUserActions` | Ban, unban, delete user mutations |

---

## ZEN Principles Applied

### 1. Auto-Save Pattern
**Philosophy**: No "Save" buttons - blur to save, silent errors

**Apply to AdminSettingsPage**:
- ❌ Remove explicit "Save Settings" button
- ✅ Each field saves on blur
- ✅ Show subtle success indicator (checkmark that fades)
- ✅ Silent error recovery with console logging
- ✅ Disable fields when offline

```tsx
// Pattern
const handleBlur = async (field: string, value: string) => {
  if (!isOnline) return;
  try {
    await api.put('/admin/settings', { [field]: value });
    // Subtle success feedback
  } catch {
    // Silent recovery, revert state
  }
};
```

### 2. One Action, One Way
**Philosophy**: No duplicate paths to same goal (Dieter Rams)

**Examples**:
- View post details: Click thumbnail OR "View Full Post" button → Pick ONE
- Ban user: Single "Ban User" button (not multiple locations)
- Delete post: Single destructive action button

### 3. Mobile-First, Touch-Optimized
**Philosophy**: 44px minimum touch targets

**Apply to**:
- Navigation links in `AdminLayout`: Ensure `h-11 min-h-[44px]`
- Action buttons in cards: `size="md"` or larger
- Checkboxes: `h-5 w-5` with adequate spacing
- Filter dropdowns: Full touch-friendly height

### 4. Smart Loading Rules
**Philosophy**: Duration-based loading indicators

| Duration | Indicator |
|----------|-----------|
| < 1 second | None (too fast to notice) |
| 1-3 seconds | Spinner |
| > 3 seconds | Skeleton screens |

**Apply to AdminDashboardPage**:
```tsx
// Replace simple "Loading dashboard..." with skeleton
{isLoading && <DashboardSkeleton />}

// Skeleton component shows content-shaped placeholders
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-surface-2 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-surface-2 rounded-lg" />
    </div>
  );
}
```

### 5. Offline-Ready
**Philosophy**: Graceful degradation - disable/hide, never fail

**Implementation Pattern**:
```tsx
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function AdminComponent() {
  const { isOnline } = useNetworkStatus();

  return (
    <>
      {/* Connection indicator in header */}
      {!isOnline && (
        <div className="flex items-center gap-1.5 text-text-tertiary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">connecting...</span>
        </div>
      )}

      {/* Disable interactive elements */}
      <Button disabled={!isOnline}>Ban User</Button>
      <input disabled={!isOnline} />
    </>
  );
}
```

**Offline Behavior by Feature**:
| Feature | Offline Behavior |
|---------|------------------|
| View dashboard metrics | Show cached/stale data |
| View user list | Show cached data |
| Ban/unban user | Disabled |
| Delete post | Disabled |
| Change settings | Disabled |
| View flagged posts | Show cached data |
| Dismiss reports | Disabled |

### 6. Progressive Character Limits
**Philosophy**: Show counter only at 80% of limit

**Apply to** (if applicable):
- Admin notes fields
- Ban reason input

```tsx
const MAX_LENGTH = 200;
const SHOW_COUNTER_AT = MAX_LENGTH * 0.8; // 160

<div className="relative">
  <textarea value={value} maxLength={MAX_LENGTH} />
  {value.length >= SHOW_COUNTER_AT && (
    <span className="absolute bottom-2 right-2 text-xs text-text-tertiary">
      {value.length}/{MAX_LENGTH}
    </span>
  )}
</div>
```

---

## Design System Tokens

### Colors (Semantic)
```css
/* Use these semantic colors consistently */
--color-positive: #10b981;    /* Success, active users, approved */
--color-negative: #ef4444;    /* Errors, bans, deletions, auto-hidden */
--color-warning: #f59e0b;     /* Reports, flagged, needs attention */
--color-brand: #8b5cf6;       /* Primary actions, brand purple */
--color-neutral: #6b7280;     /* Metadata, secondary text */
```

### Typography
```css
/* Page titles */
.text-2xl.font-bold.text-text-primary

/* Section headers */
.text-lg.font-semibold.text-text-primary

/* Body text */
.text-sm.text-text-secondary

/* Metadata */
.text-xs.text-text-tertiary

/* Metric values */
.text-3xl.font-bold
```

### Spacing
```css
/* Page sections */
.space-y-6

/* Card padding */
.p-6

/* Component gaps */
.gap-4

/* Tight spacing */
.gap-2
```

### Animations
```css
/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}

/* Subtle hover lift */
.hover-lift {
  transition: transform 0.2s ease-out;
}
.hover-lift:hover {
  transform: translateY(-2px);
}

/* Shake on error */
.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
```

---

## Component Patterns

### Error States
```tsx
// ZEN: Helpful, not alarming
<div className="text-center py-12">
  <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-warning-500" />
  <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
  <p className="text-text-secondary mb-4">Unable to load data</p>
  <Button variant="outline" onClick={retry}>Try Again</Button>
</div>
```

### Empty States
```tsx
// ZEN: Helpful, contextual
<div className="text-center py-12">
  <CheckCircle className="mx-auto mb-4 w-12 h-12 text-positive-500" />
  <h3 className="text-lg font-medium mb-2">All clear!</h3>
  <p className="text-text-secondary">No flagged posts to review</p>
</div>
```

### Confirmation Dialogs
```tsx
// ZEN: Clear consequences, not scary
// Use for destructive actions only (ban, delete)
const confirmed = window.confirm(
  `This will permanently delete ${count} post(s). This cannot be undone.`
);
```

### Combined Input + Button (Login Pattern)
```tsx
// ZEN: Single cohesive control
<div className="flex items-center gap-0">
  <input
    className={`flex-1 h-12 rounded-l-lg ${isShaking ? 'animate-shake' : ''}`}
  />
  <Button
    variant={showError ? 'destructive' : 'primary'}
    className="h-12 w-12 rounded-l-none"
  >
    <CornerDownLeft size={20} />
  </Button>
</div>
```

---

## Completed Changes

### ✅ AdminLoginPage (Completed)
- [x] Removed redundant "Enter admin password to continue" subheader
- [x] Removed "Admin Password" label (placeholder suffices)
- [x] Combined input + button pattern (matches main app login)
- [x] Shake-on-error animation with icon morph
- [x] Changed input type from `text` to `password`
- [x] Cleaner deterrent footer: "IP address and location logged. Report fraud"
- [x] Link to FBI IC3 (Internet Crime Complaint Center)
- [x] Reduced max-width from `md` to `sm`

### ✅ AdminDashboardPage (Completed)
- [x] Moved urgent actions to top priority position (always expanded)
- [x] Added skeleton loading screens (replaces spinner)
- [x] Reduced page spacing from `space-y-6` to `space-y-4` (iPad-optimized)
- [x] Reduced header size from `text-3xl` to `text-2xl`
- [x] Compact metric grid with responsive breakpoints: 1→2→4 columns
- [x] Changed grid gaps from `gap-6` to `gap-4`
- [x] Shortened subtitle text in urgent actions for compactness

### ✅ MetricCard (Completed)
- [x] Reduced padding from `p-6` to `p-4`
- [x] Reduced metric value from `text-3xl` to `text-2xl`
- [x] Reduced title from `text-sm` to `text-xs`
- [x] Reduced subtitle from `text-sm` to `text-xs`
- [x] Reduced icon from `text-3xl` to `text-2xl` with lower opacity (40%)
- [x] Added `hover-lift` animation class
- [x] Added `min-w-0` and `truncate` for better text overflow
- [x] Added `gap-3` between content and icon
- [x] Overall card height reduced from ~120px to ~88px

### ✅ ActivityChart (Completed)
- [x] Removed CardHeader wrapper (more compact)
- [x] Reduced header size from `text-lg` to `text-base`
- [x] Reduced legend text from `text-sm` to `text-xs`
- [x] Reduced legend dots from `h-3 w-3` to `h-2.5 w-2.5`
- [x] Reduced legend gap from `gap-4` to `gap-3`
- [x] Reduced chart height from `h-64` (256px) to `h-44` (176px)
- [x] Reduced summary stats spacing: `mt-6` to `mt-4`, `gap-4` to `gap-3`, `pt-4` to `pt-3`
- [x] Reduced summary badge size from `size="md"` to `size="sm"`
- [x] Changed from CardContent wrapper to direct p-4 padding

### ✅ Global Styles (Completed)
- [x] Added `.hover-lift` utility class with transition
- [x] Added `prefers-reduced-motion` support for hover-lift
- [x] Respects accessibility preferences

---

## Dashboard Redesign Summary (Option C)

**Final Layout**:
```
┌─────────────────────────────────────────┐
│ 🚨 [Urgent messages]        [Review]    │ ← Compact single row (p-3)
├─────────────────────────────────────────┤
│ [Metric] [Metric] [Metric] [Metric]     │ ← Single row, no wrapping (grid-cols-4)
├─────────────────────────────────────────┤
│ Activity Chart (176px height)           │ ← Compact chart with legend
└─────────────────────────────────────────┘
```

**Space Savings Achieved**:
- Header: 24px saved (text + margin reduction)
- Page spacing: 32px saved (space-y-6 → space-y-4, 4 sections × 8px)
- Urgent actions: 40px saved (removed title, single row, p-4 → p-3)
- Metric cards: 32px saved per card × 4 = 128px
- Metrics grid: No wrapping (always 4 columns)
- Activity chart: 80px saved (h-64 → h-44)
- Summary stats: 20px saved (margins + padding)

**Total vertical space saved: ~324px** (from ~1200px to ~876px on desktop)

**iPad Optimization**: Dashboard now fits in ~876px height with minimal scrolling

**Responsive Behavior**: 
- Metrics: Fixed 4-column grid (no responsive breakpoints)
- Urgent actions: Horizontal layout with flex wrapping if needed
- Activity chart: Scales proportionally

**Key Design Decisions**:
- Urgent actions always visible at top (user preference: always expanded)
- All 4 metrics equally important (single row)
- Activity chart critical (compact but fully functional)
- Balanced density (Web-v2 style with breathing room)

---

## Pending Changes

### 🔲 AdminLayout
- [ ] Add offline connection indicator to header
- [ ] Ensure 44px touch targets on navigation
- [ ] Add `prefers-reduced-motion` support for transitions

### ✅ AdminDashboardPage (Completed)
- [x] Replace loading text with skeleton screens
- [x] Move urgent actions to top
- [x] Reduce spacing for iPad optimization (space-y-6 → space-y-4)
- [x] Simplify urgent actions panel (removed title, single row, p-3 padding)
- [x] Add descriptive text under urgent messages
- [x] Position Review button on the right for consistency
- [x] Make metrics grid single row (grid-cols-4, no responsive breakpoints)
- [x] Reduce header from text-3xl to text-2xl
- [x] Add offline indicator for stale data (pending - needs hook integration)

### ✅ MetricCard (Completed)
- [x] Add subtle hover animation (lift effect)
- [x] Reduce padding and font sizes
- [x] Ensure accessible color contrast

### ✅ ActivityChart (Completed)
- [x] Reduce chart height from 256px to 176px
- [x] Compact legend and summary stats
- [x] Maintain readability on iPad

### 🔲 AdminSettingsPage
- [ ] Convert to auto-save pattern (blur to save)
- [ ] Remove "Save Settings" button
- [ ] Add per-field success indicators
- [ ] Disable fields when offline

### 🔲 FlaggedPostsPage
- [ ] Skeleton loading states
- [ ] Disable actions when offline
- [ ] Improve empty state ("All clear!")

### 🔲 UsersPage
- [ ] Skeleton loading states
- [ ] Disable ban/actions when offline
- [ ] Improve search input (debounce, clear button)

### 🔲 FlaggedPostCard
- [ ] Simplify to one way to view details
- [ ] Ensure touch-friendly action buttons

### 🔲 UserCard
- [ ] Ensure touch-friendly action buttons
- [ ] Add hover lift animation

---

## File Locations

```
apps/web-v2/src/features/admin/
├── index.ts
├── components/
│   ├── AdminLayout.tsx
│   ├── MetricCard.tsx
│   ├── ActivityChart.tsx
│   ├── FlaggedPostCard.tsx
│   ├── UserCard.tsx
│   ├── PostDetailModal.tsx
│   ├── RegeneratePasswordModal.tsx
│   └── ProtectedAdminRoute.tsx
├── context/
│   └── AdminAuthContext.tsx
├── hooks/
│   ├── useAdminAuth.ts
│   ├── useUsers.ts
│   ├── useUserFilters.ts
│   └── useUserActions.ts
└── pages/
    ├── AdminLoginPage.tsx        ✅ Updated
    ├── AdminDashboardPage.tsx
    ├── FlaggedPostsPage.tsx
    ├── FlaggedPostDetailPage.tsx
    ├── UsersPage.tsx
    ├── UserDetailPage.tsx
    ├── UserPostsPage.tsx
    └── AdminSettingsPage.tsx
```

---

## Related Documentation

- **ZEN Principles**: `/docs/Web-v2/06-ux-design.md`
- **Design System**: `/docs/Web-v2/04-design-system.md`
- **Component Guide**: `/docs/Web-V1/08-component-guide.md`
- **Testing Strategy**: `/docs/Web-v2/05-testing-strategy.md`

---

## Notes for Implementers

1. **Always import shake animation** when using error feedback:
   ```tsx
   import '../../auth/components/LoginForm.css';
   ```

2. **Use the existing `useNetworkStatus` hook** for offline handling:
   ```tsx
   import { useNetworkStatus } from '@/hooks/useNetworkStatus';
   ```

3. **Prefer `@/components/ui-next` Button** for consistency:
   ```tsx
   import { Button } from '@/components/ui-next';
   ```

4. **Test with keyboard navigation** - all interactive elements must be focusable

5. **Test with reduced motion** - use `prefers-reduced-motion` media query

6. **Keep admin actions logged** - all mutations should have server-side audit trails
