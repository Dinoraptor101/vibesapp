# Design System

## Overview

The VibesApp Web-v2 design system provides a comprehensive set of reusable components, patterns, and guidelines for consistent, accessible user interfaces. Built with Tailwind CSS and Radix UI primitives.

## Color Palette

### Brand Colors
```css
--brand-50: #f0f9ff;
--brand-500: #3b82f6;
--brand-600: #2563eb;
--brand-700: #1d4ed8;
```

### Vibes Colors
```css
--vibe-positive: #10b981;  /* Green for likes/hearts */
--vibe-negative: #ef4444;  /* Red for dislikes/reports */
--vibe-positive-hover: #059669;
--vibe-negative-hover: #dc2626;
```

### Theme Colors
- **Light Theme**: Clean, high-contrast backgrounds
- **Dim Theme**: Reduced contrast for eye comfort
- **Dark Theme**: Full dark mode with proper contrast

### Semantic Colors
- **Text**: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- **Background**: `bg-background-primary`, `bg-background-secondary`
- **Border**: `border-border-primary`, `border-border-secondary`
- **Interactive**: `hover:bg-hover-primary`, `focus:ring-focus-primary`

## Typography

### Font Scale
```css
--text-xs: 0.75rem;   /* 12px - Labels */
--text-sm: 0.875rem;  /* 14px - Metadata */
--text-base: 1rem;    /* 16px - Body text */
--text-lg: 1.125rem;  /* 18px - Large body */
--text-xl: 1.25rem;   /* 20px - Small headings */
--text-2xl: 1.5rem;   /* 24px - Headings */
--text-3xl: 1.875rem; /* 30px - Large headings */
```

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasis
- **Semibold**: 600 - Headings
- **Bold**: 700 - Strong emphasis

### Line Heights
- **Tight**: 1.25 - Compact text
- **Normal**: 1.5 - Standard readability
- **Relaxed**: 1.625 - Improved readability

## Spacing System

### Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Usage Guidelines
- **Component Padding**: Use space-3, space-4, space-6
- **Layout Margins**: Use space-4, space-6, space-8
- **Section Spacing**: Use space-8, space-12, space-16

## Component Patterns

### Button Variants
```tsx
// Primary - Brand color, high emphasis
<Button variant="primary">Primary Action</Button>

// Secondary - Muted, medium emphasis
<Button variant="secondary">Secondary Action</Button>

// Ghost - Minimal, low emphasis
<Button variant="ghost">Ghost Action</Button>

// Destructive - Red, dangerous actions
<Button variant="destructive">Delete</Button>
```

### Input Patterns
```tsx
// Standard input with label
<div>
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <input
    id="email"
    type="email"
    className="w-full px-3 py-2 border border-border-primary rounded-lg"
  />
</div>
```

### Card Patterns
```tsx
// Content card
<div className="bg-background-primary border border-border-primary rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-text-secondary">Card content</p>
</div>

// Interactive card
<div className="bg-background-primary border border-border-primary rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
  {/* Card content */}
</div>
```

## Layout Patterns

### Layout Components

VibesApp uses two layout components to handle different page types:

#### AppLayout (Standard)
Used for most pages. Provides consistent spacing and width.

```tsx
import { AppLayout } from '@/components/layout';

// Standard page - layout handles all spacing
export function MyPage() {
  return (
    <AppLayout>
      <div>
        {/* Raw content - no padding needed */}
      </div>
    </AppLayout>
  );
}
```

**What AppLayout provides:**
- `pt-8` top padding (breathing room for mobile notch + desktop aesthetics)
- `px-4` side padding
- `max-w-2xl` centered content

#### ImmersiveLayout (Full-bleed)
Used for immersive experiences like chat, media viewers.

```tsx
import { ImmersiveLayout } from '@/components/layout';

// Immersive page - no padding, full control
export function ChatPage() {
  return (
    <ImmersiveLayout>
      <div className="h-dvh">
        {/* Full-bleed content */}
      </div>
    </ImmersiveLayout>
  );
}

// Hide nav entirely for media viewers
<ImmersiveLayout hideNav>
  {/* Full-screen content */}
</ImmersiveLayout>
```

### App Shell
```
┌─────────────────────────────────────┐
│ Header (fixed) - Desktop only       │
│ ┌─────────────────────────────────┐ │
│ │ Navigation                     │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Main Content (scrollable)           │
│ ┌─────────────────────────────────┐ │
│ │ Page Content (max-w-2xl)       │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Footer Nav (fixed) - Mobile only    │
└─────────────────────────────────────┘
```

### Page Content Guidelines

**DO:**
- Let AppLayout handle spacing
- Use raw `<div>` containers in page content
- Focus on content structure, not layout

**DON'T:**
- Add `px-4`, `py-8`, `max-w-2xl` to page content
- Use `container mx-auto` in pages
- Duplicate layout concerns

### Grid Systems
```tsx
// Responsive posts grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {posts.map(post => (
    <PostCard key={post.id} post={post} />
  ))}
</div>

// Form grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>{/* Form field */}</div>
  <div>{/* Form field */}</div>
</div>
```

## Animation Patterns

### Transitions
```css
/* Smooth transitions */
transition-all duration-200 ease-in-out

/* Hover effects */
hover:scale-105 transition-transform duration-300

/* Focus states */
focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
```

### Loading States
```tsx
// Skeleton loading
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

// Spinner
<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
```

### Micro-interactions
- **Button press**: Scale down 95% on click
- **Card hover**: Subtle shadow increase
- **Form focus**: Ring border appearance
- **Tab switch**: Smooth underline transition

## Accessibility Patterns

### Focus Management
```tsx
// Visible focus indicators
focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2

// Skip links
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Screen Reader Support
```tsx
// Semantic HTML
<header role="banner">
<nav role="navigation" aria-label="Main navigation">

// ARIA labels
<button aria-label="Close modal">
<img alt="User avatar" aria-hidden="true">
```

### Keyboard Navigation
- **Tab order**: Logical DOM order
- **Enter/Space**: Activate buttons and links
- **Arrow keys**: Navigate menus and lists
- **Escape**: Close modals and dropdowns

## Responsive Design

### Breakpoints
```css
/* Mobile first */
--sm: 640px;   /* Small tablets */
--md: 768px;   /* Tablets */
--lg: 1024px;  /* Laptops */
--xl: 1280px;  /* Desktops */
--2xl: 1536px; /* Large screens */
```

### Mobile Patterns
```tsx
// Touch targets
<button className="min-h-[44px] min-w-[44px]">
  {/* Content */}
</button>

// Swipe gestures
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
```

### Responsive Utilities
```tsx
// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">

// Responsive grids
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## Component Library

### Core Components

#### Button
- Variants: primary, secondary, ghost, destructive
- Sizes: sm, md, lg
- States: loading, disabled
- Accessibility: Proper ARIA labels

#### Input
- Types: text, email, password, search
- States: focus, error, disabled
- Validation: Real-time feedback
- Accessibility: Labels and descriptions

#### Modal
- Sizes: sm, md, lg, xl
- Backdrop: Blur and click-outside close
- Focus: Trapped inside modal
- Animation: Smooth slide-in

#### Dropdown
- Trigger: Button or custom element
- Content: Positioned automatically
- Keyboard: Arrow navigation
- Accessibility: ARIA expanded state

### Composite Components

#### PostCard
```tsx
<div className="relative">
  {/* User overlay */}
  <div className="absolute top-3 right-3">
    <UserBadge user={post.user} />
  </div>

  {/* Image */}
  <img
    src={post.image}
    alt=""
    className="w-full aspect-square object-cover rounded-t-xl"
  />

  {/* Actions */}
  <div className="p-3 border-t border-border-primary">
    <PostActions post={post} />
  </div>
</div>
```

#### UserProfile
```tsx
<div className="space-y-6">
  {/* Avatar */}
  <Avatar user={user} size="xl" />

  {/* Info */}
  <div>
    <h1 className="text-2xl font-bold">{user.username}</h1>
    <p className="text-text-secondary">{user.bio}</p>
  </div>

  {/* Stats */}
  <div className="grid grid-cols-3 gap-4">
    <Stat label="Posts" value={user.postsCount} />
    <Stat label="Hearts" value={user.heartsCount} />
    <Stat label="Following" value={user.followingCount} />
  </div>
</div>
```

## Theme Implementation

### CSS Variables
```css
:root {
  /* Light theme */
  --background-primary: white;
  --text-primary: #111827;
  --border-primary: #e5e7eb;
}

[data-theme="dim"] {
  --background-primary: #f8fafc;
  --text-primary: #1e293b;
  --border-primary: #cbd5e1;
}

[data-theme="dark"] {
  --background-primary: #0f172a;
  --text-primary: #f1f5f9;
  --border-primary: #334155;
}
```

### Theme Switching
```tsx
const themes = ['light', 'dim', 'dark'];

function ThemeSwitcher() {
  const [theme, setTheme] = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="border border-border-primary rounded px-3 py-2"
    >
      {themes.map(t => (
        <option key={t} value={t}>
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </option>
      ))}
    </select>
  );
}
```

## Glass Effect System

The glass effect provides a frosted, translucent appearance for navigation bars, headers, footers, and overlay elements. It uses backdrop-filter blur combined with semi-transparent backgrounds that adapt to each theme.

### CSS Variables
```css
/* Light theme - subtle white tint */
--glass-bg: rgba(255, 255, 255, 0.70);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

/* Dim theme - medium gray tint */
--glass-bg: rgba(66, 66, 66, 0.75);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Dark theme - dark tint */
--glass-bg: rgba(26, 26, 26, 0.80);
--glass-border: rgba(255, 255, 255, 0.05);
--glass-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
```

### Glass Utility Class
```css
@layer utilities {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: var(--glass-shadow);
  }
}
```

### Usage
```tsx
// Navigation bars
<nav className="glass border-b border-border fixed top-0 left-0 right-0 z-40">
  {/* Nav content */}
</nav>

// Floating headers/footers
<header className="glass fixed top-0 left-0 right-0 z-10">
  {/* Header content */}
</header>

// Dropdown menus
<div className="glass rounded-lg p-2">
  {/* Menu content */}
</div>
```

### Implementation Notes
- **Fixed Positioning**: Glass elements should use `fixed` positioning so content scrolls behind them, revealing the blur effect
- **Z-Index**: Use appropriate z-index values (z-10 for page-level, z-40 for global nav)
- **Content Padding**: Add corresponding padding to content areas to account for fixed elements
- **Safari Support**: Always include `-webkit-backdrop-filter` for Safari compatibility

### Components Using Glass Effect
- `TopNav` - Desktop navigation bar (fixed)
- `BottomNav` - Mobile navigation bar (fixed)
- `ConversationView` - Chat header and footer (fixed)
- `PostDetailPage` - Comment input area
- `UserMenu` - Profile dropdown
- `AdminLayout` - Admin navigation

## Navigation Design Language

### Core Principles

Navigation elements must communicate two distinct concepts through separate visual channels:

1. **Selection State** → **Color**
2. **Unread/Notification Count** → **Badge**

These channels should NEVER be conflated.

### Selection State (Color)

- **Active/Selected**: `text-brand-purple` - The user is currently on this page
- **Inactive**: `text-text-secondary` - The user is not on this page

```tsx
// ✅ CORRECT: Color only indicates selection
className={isActive('/activity') ? 'text-brand-purple' : 'text-text-secondary'}

// ❌ WRONG: Color indicates both selection AND unread
className={isActive('/activity') ? 'text-brand-purple' : unreadCount > 0 ? 'text-brand-purple' : 'text-text-secondary'}
```

### Unread/Notification Counts (Badge)

- Display count via a **badge** positioned on the icon
- Badge is always visible when count > 0, regardless of selection state
- Badge styling: small, bold number, positioned top-right of icon

```tsx
// Badge example
{unreadCount > 0 && (
  <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold">
    {unreadCount > 99 ? '99+' : unreadCount}
  </span>
)}
```

### Bottom Navigation Structure

All navigation items must have identical dimensions:

```
┌─────────────────────────────────────────────────────┐
│  [Icon]    [Icon]    [Icon]    [Icon]    [Icon]    │
│   24px      24px      24px      24px      24px     │
│  [Label]   [Label]   [Label]   [Label]   [Label]   │
│   12px      12px      12px      12px      12px     │
└─────────────────────────────────────────────────────┘

- Grid: 5 equal columns (grid-cols-5)
- Icon size: w-6 h-6 (24px)
- Label: text-xs font-medium (12px)
- Gap between icon and label: gap-1
```

### Why This Matters

- **Cognitive clarity**: Users learn "purple = I'm here" and "badge = something new"
- **Consistency**: Same visual language across all nav items
- **Accessibility**: Clear distinction helps users with color perception differences
- **Scalability**: Pattern works for any number of notification types

## Implementation Guidelines

### Component Creation
1. **Start with design system**: Use established patterns
2. **Accessibility first**: Include ARIA labels and keyboard support
3. **Responsive design**: Mobile-first approach
4. **TypeScript**: Full type safety
5. **Testing**: Unit and integration tests

### Code Organization
- **Component files**: `.tsx` with styles
- **Utility functions**: Separate `.ts` files
- **Types**: Colocated `types.ts` files
- **Tests**: `__tests__` directories

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: camelCase (`userProfile.ts`)
- **CSS classes**: kebab-case (`user-profile`)
- **TypeScript**: PascalCase for types/interfaces

### Performance Considerations
- **Memoization**: `React.memo` for expensive components
- **Lazy loading**: `React.lazy` for route components
- **Image optimization**: Proper sizing and formats
- **Bundle splitting**: Code splitting strategies

## Maintenance

### Versioning
- **Major**: Breaking API changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes and improvements

### Documentation
- **Storybook**: Component documentation
- **Design tokens**: Centralized in CSS variables
- **Usage examples**: Code examples for each component
- **Migration guides**: Breaking change documentation

### Quality Assurance
- **Visual regression**: Automated screenshot testing
- **Accessibility audit**: Regular WCAG compliance checks
- **Performance monitoring**: Bundle size and runtime metrics
- **Cross-browser testing**: Consistent behavior across browsers