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

### App Shell
```
┌─────────────────────────────────────┐
│ Header (fixed)                      │
│ ┌─────────────────────────────────┐ │
│ │ Navigation                     │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Main Content (scrollable)           │
│ ┌─────────────────────────────────┐ │
│ │ Page Content                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Page Layouts
```tsx
// Centered content
<div className="min-h-screen flex items-center justify-center">
  <div className="max-w-md w-full p-6">
    {/* Content */}
  </div>
</div>

// Sidebar layout
<div className="flex min-h-screen">
  <aside className="w-64 border-r border-border-primary">
    {/* Sidebar content */}
  </aside>
  <main className="flex-1 p-6">
    {/* Main content */}
  </main>
</div>
```

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