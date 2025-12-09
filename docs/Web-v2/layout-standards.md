# Layout Standards

## Overview

This document defines the padding and layout standards for VibesApp Web V2 to ensure visual consistency across all pages and components.

## Padding Hierarchy

### 1. **AppLayout** (Base Layer)
**File:** `apps/web-v2/src/components/layout/AppLayout.tsx`

**Responsibilities:**
- Provides page-level padding for all standard pages
- Applied automatically when wrapping content with `<AppLayout>`

**Standard Padding:**
```tsx
<div className="pt-8 px-4 max-w-2xl mx-auto">{children}</div>
```

- `pt-8` - Top padding (breathing room for mobile notch + desktop aesthetics)
- `px-4` - Horizontal side padding (16px on each side)
- `max-w-2xl` - Max width constraint (672px) for optimal reading
- `mx-auto` - Centers content horizontally

**Desktop Additions:**
- `paddingTop: var(--top-nav-height)` - Space for fixed TopNav
- `paddingBottom: var(--bottom-nav-height)` - Space for mobile BottomNav

### 2. **Page Components** (Content Layer)
**Examples:** `HomePage`, `ProfilePage`, `ActivityPage`, `MessagesPage`

**Responsibilities:**
- Structure content sections (headers, tabs, lists)
- Manage vertical spacing between sections
- **DO NOT** add horizontal padding (conflicts with AppLayout)

**Correct Pattern:**
```tsx
export function MyPageContent() {
  return (
    <div>
      {/* Section 1 */}
      <div className="mb-6">...</div>
      
      {/* Section 2 */}
      <div className="space-y-4">...</div>
    </div>
  );
}

export function MyPage() {
  return (
    <AppLayout>
      <MyPageContent />
    </AppLayout>
  );
}
```

**❌ Anti-pattern:**
```tsx
// WRONG - Double padding!
export function MyPageContent() {
  return (
    <div className="px-4"> {/* Conflicts with AppLayout px-4 */}
      <div>...</div>
    </div>
  );
}
```

### 3. **Feature Components** (Internal Layout)
**Examples:** `PostsGrid`, `PostCard`, `FilterBar`, `ActivityList`

**Responsibilities:**
- Internal component layout (flexbox, grid)
- Spacing between items (gap utilities)
- Component-specific visual design

**Correct Pattern:**
```tsx
export function PostsGrid({ posts }: PostsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
```

**Key Points:**
- Use `gap-4` for spacing between grid/flex items
- NO horizontal padding (`px-*`) that affects page width
- Self-contained styling within component boundaries

---

## Special Cases

### Wide Layouts (Two-Column)
**Example:** `PostDetailPage`

When content needs more width than standard `max-w-2xl`:

```tsx
<div className="max-w-7xl mx-auto p-4 md:px-0 md:py-4">
  <div className="flex flex-col md:flex-row md:gap-6">
    <div className="md:flex-[11]">...</div>
    <div className="md:flex-[7]">...</div>
  </div>
</div>
```

### Full-Bleed / Immersive Layouts
**Example:** `ConversationPage`, media viewers

Use `ImmersiveLayout` for pages that need full-screen experience:

```tsx
export function ConversationPage() {
  return <ConversationView />; // No AppLayout wrapper
}
```

**Characteristics:**
- No standard padding (edge-to-edge)
- Custom navigation (back buttons, headers)
- Fixed/absolute positioned elements

### Sticky Headers & Tabs
**Pattern:** Tab navigation that spans full width

```tsx
<div className="sticky top-0 z-10 bg-background">
  <div className="flex border-b border-gray-200">
    <button className="flex-1 px-4 py-3">Tab 1</button>
    <button className="flex-1 px-4 py-3">Tab 2</button>
  </div>
</div>
```

**Key:** Tabs should NOT inherit page padding - they span full container width.

---

## Component Padding Matrix

| Component Type | Horizontal Padding | Vertical Padding | Max Width |
|----------------|-------------------|------------------|-----------|
| **AppLayout** | `px-4` (16px) | `pt-8` (32px) | `max-w-2xl` |
| **Page Content** | None (inherited) | Custom (`mb-6`, `space-y-4`) | Inherited |
| **Feature Components** | None (or internal only) | Internal (`py-2`, `gap-4`) | Auto |
| **PostsGrid** | None | `gap-4` between items | Auto |
| **PostCard** | None | Internal spacing | Auto |
| **FilterBar** | None | `py-4` | Full width |
| **Sticky Tabs** | Internal `px-4` on buttons | `py-3` | Full container |

---

## Golden Rules

### ✅ DO:
1. **Trust AppLayout** - It provides consistent horizontal padding
2. **Use gap utilities** - For spacing between items (`gap-4`, `space-y-4`)
3. **Vertical spacing** - Pages control section spacing (`mb-6`, `py-4`)
4. **Test responsive** - Verify mobile (375px) and desktop (1024px+)
5. **Match references** - ProfilePage and ActivityPage are good examples

### ❌ DON'T:
1. **Add px-4 inside pages** - Causes double padding
2. **Assume screen width** - Always work within layout constraints
3. **Mix padding systems** - Stick to the hierarchy
4. **Override without reason** - Follow the standard unless justified
5. **Add horizontal scroll** - Content should never require horizontal scrolling

---

## Testing Checklist

When implementing or reviewing layouts:

### Visual Consistency
- [ ] Mobile (375px): Content has 16px side margins
- [ ] Tablet (768px): Content is centered with max-width
- [ ] Desktop (1024px+): Content respects `max-w-2xl` (672px)
- [ ] No content touching screen edges (except full-bleed designs)

### Cross-Page Comparison
- [ ] HomePage feed width matches ProfilePage posts grid
- [ ] Messages list aligns with other page content
- [ ] Search results have same padding as home feed
- [ ] Settings sections align with other pages

### Component Integrity
- [ ] PostsGrid spacing consistent everywhere it's used
- [ ] FilterBar doesn't break page width
- [ ] Sticky elements positioned correctly
- [ ] No horizontal scroll on any viewport

### Responsive Behavior
- [ ] Navigation doesn't overlap content
- [ ] Padding scales appropriately
- [ ] Max-width constraints work on large screens
- [ ] Mobile notch doesn't cut off content

---

## Implementation Examples

### Standard Page Pattern
```tsx
/**
 * MyPage - Description
 */

import { AppLayout } from '@/components/layout';
import { MyFeatureComponent } from '@/features/my-feature';

/**
 * Page content without layout wrapper (for persistent pages)
 */
export function MyPageContent() {
  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Page</h1>
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        <MyFeatureComponent />
      </div>
    </div>
  );
}

/**
 * Full page with layout wrapper (for standalone routing)
 */
export function MyPage() {
  return (
    <AppLayout>
      <MyPageContent />
    </AppLayout>
  );
}
```

### Grid Component Pattern
```tsx
/**
 * MyGrid - Reusable grid component
 */

interface MyGridProps {
  items: Item[];
}

export function MyGrid({ items }: MyGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <MyCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Centered Empty State Pattern
```tsx
/**
 * Empty state - Centered content within page padding
 */

<div className="flex flex-col items-center justify-center py-12">
  <div className="text-6xl mb-4">🕊️</div>
  <h2 className="text-xl font-semibold mb-2">No items yet</h2>
  <p className="text-text-secondary text-center">
    Get started by creating your first item
  </p>
</div>
```

---

## Migration Notes

### Recent Fixes (December 2025)
1. **PostsFeed** - Removed redundant `p-4` wrappers around `PostsGrid`
2. **MessagesPage** - Removed `px-4` from tab content wrapper
3. **Empty States** - Removed `px-4` from centered content (AppLayout handles it)

### Before/After Examples

**PostsFeed (Before):**
```tsx
<div className="p-4">
  <PostsGrid posts={posts} />
</div>
```

**PostsFeed (After):**
```tsx
<PostsGrid posts={posts} />
```

**MessagesPage (Before):**
```tsx
<div className="px-4 pt-4">
  <ConversationList />
</div>
```

**MessagesPage (After):**
```tsx
<div className="pt-4">
  <ConversationList />
</div>
```

---

## Key Principle

> **"AppLayout owns horizontal padding. Features own internal spacing."**

This simple rule ensures:
- Consistent visual alignment across all pages
- No double-padding bugs
- Easier maintenance and refactoring
- Clear responsibility boundaries

When in doubt, check **ProfilePage** or **ActivityPage** - they demonstrate the correct pattern.

---

## Related Documentation

- [Current Architecture](./01-current-architecture.md) - Overall app structure
- [Design System](./04-design-system.md) - Colors, typography, spacing tokens
- [Component Guide](../Web-V1/08-component-guide.md) - Component patterns
- [UX Design](./06-ux-design.md) - User experience principles

---

**Last Updated:** December 7, 2025  
**Maintained By:** Frontend Team  
**Status:** ✅ Active Standard
