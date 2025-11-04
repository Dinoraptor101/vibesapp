# UI/UX Patterns & Design Language

**Purpose:** Document current UI patterns, design decisions, and user experience flows for the rebuild

## Design Philosophy

### Current State
VibesApp currently uses a **minimalist, content-first** design with:
- Clean, uncluttered layouts
- Focus on user-generated content
- Subtle interactions
- Consistent spacing and typography
- Dark mode support (3 themes: light, dim, dark)

### Core Principles for Rebuild
1. **Content First** - Don't let UI overshadow user content
2. **Speed & Fluidity** - Every interaction should feel instant
3. **Accessibility** - Everyone should be able to use the app
4. **Mobile-First** - Optimize for mobile, enhance for desktop
5. **Consistency** - Same patterns across all features
6. **Delight** - Subtle animations and micro-interactions

## Color System

### Current Theme Structure
```typescript
type Theme = 'light' | 'dim' | 'dark';

interface ThemeColors {
  background: string;      // Page background
  card: string;           // Card/panel background
  text: string;           // Primary text
  note: string;           // Secondary text (muted)
  border: string;         // Borders and dividers
  primary: string;        // Brand color (blue)
  success: string;        // Positive actions (green)
  error: string;          // Negative actions (red)
}
```

### Color Semantics

| Color | Usage | Examples |
|-------|-------|----------|
| **Primary Blue** | Brand actions, links, focus states | Follow buttons, links, active nav |
| **Success Green** | Positive vibes, confirmations | Like button, success messages |
| **Error Red** | Negative vibes, errors, destructive actions | Dislike button, delete, errors |
| **Gray Scale** | Text hierarchy, backgrounds, borders | Body text, cards, dividers |

### New Tailwind Color Palette

```javascript
// tailwind.config.js
colors: {
  // Base themes
  light: {
    bg: '#f8f8f8',
    'bg-elevated': '#ffffff',
    text: '#000000',
    'text-muted': 'rgba(0, 0, 0, 0.6)',
    border: '#e0e0e0',
  },
  dim: {
    bg: '#333333',
    'bg-elevated': '#424242',
    text: '#ffffff',
    'text-muted': 'rgba(255, 255, 255, 0.7)',
    border: '#555555',
  },
  dark: {
    bg: '#000000',
    'bg-elevated': '#1a1a1a',
    text: '#ffffff',
    'text-muted': 'rgba(255, 255, 255, 0.6)',
    border: '#333333',
  },
  
  // Semantic colors (theme-adaptive)
  brand: {
    DEFAULT: '#21a1f1',
    50: '#e6f7ff',
    100: '#bae7ff',
    200: '#91d5ff',
    300: '#69c0ff',
    400: '#40a9ff',
    500: '#21a1f1',
    600: '#1890ff',
    700: '#096dd9',
    800: '#0050b3',
    900: '#003a8c',
  },
  
  vibe: {
    positive: '#4caf50',
    'positive-hover': '#45a049',
    negative: '#ab1c1c',
    'negative-hover': '#991818',
  },
}
```

## Typography

### Current Typography Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 | 32px | 700 | 1.2 | Page titles |
| H2 | 24px | 600 | 1.3 | Section headings |
| H3 | 20px | 600 | 1.4 | Card titles |
| Body | 16px | 400 | 1.5 | Main content |
| Small | 14px | 400 | 1.4 | Metadata, timestamps |
| Tiny | 12px | 400 | 1.3 | Labels, badges |

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica Neue', Arial, sans-serif;
```

### Tailwind Typography Config
```javascript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1.3' }],      // 12px - labels
  sm: ['0.875rem', { lineHeight: '1.4' }],     // 14px - metadata
  base: ['1rem', { lineHeight: '1.5' }],       // 16px - body
  lg: ['1.125rem', { lineHeight: '1.5' }],     // 18px - emphasis
  xl: ['1.25rem', { lineHeight: '1.4' }],      // 20px - h3
  '2xl': ['1.5rem', { lineHeight: '1.3' }],    // 24px - h2
  '3xl': ['2rem', { lineHeight: '1.2' }],      // 32px - h1
},
fontWeight: {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

## Spacing System

### Current Spacing Scale (8px base)
```
4px  (0.25rem) - xs
8px  (0.5rem)  - sm
12px (0.75rem) - md
16px (1rem)    - base
24px (1.5rem)  - lg
32px (2rem)    - xl
48px (3rem)    - 2xl
64px (4rem)    - 3xl
```

### Usage Patterns

| Spacing | Usage |
|---------|-------|
| **4px** | Icon padding, tight spacing |
| **8px** | Component internal padding |
| **12px** | Small gaps between elements |
| **16px** | Standard component padding |
| **24px** | Section spacing |
| **32px** | Large section spacing |
| **48px** | Page-level spacing |

## Layout Patterns

### 1. Page Layout Structure

```tsx
<div className="min-h-screen bg-light-bg dark:bg-dark-bg">
  {/* Navigation */}
  <nav className="fixed top-0 left-0 right-0 h-16 bg-light-bg-elevated dark:bg-dark-bg-elevated border-b border-light-border dark:border-dark-border">
    {/* Nav content */}
  </nav>
  
  {/* Main Content */}
  <main className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
    {/* Page content */}
  </main>
  
  {/* Bottom Navigation (Mobile) */}
  <nav className="fixed bottom-0 left-0 right-0 h-16 bg-light-bg-elevated dark:bg-dark-bg-elevated border-t">
    {/* Bottom nav */}
  </nav>
</div>
```

### 2. Card Pattern

```tsx
<article className="bg-light-bg-elevated dark:bg-dark-bg-elevated rounded-lg border border-light-border dark:border-dark-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
  {/* Card content */}
</article>
```

### 3. Grid Layout (Posts)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

## Component Patterns

### Button Styles

```tsx
// Primary Button
<button className="px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
  Follow
</button>

// Secondary Button
<button className="px-4 py-2 bg-light-bg-elevated dark:bg-dark-bg-elevated border border-light-border dark:border-dark-border rounded-lg font-medium hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors">
  Cancel
</button>

// Ghost Button
<button className="px-4 py-2 rounded-lg font-medium hover:bg-light-border/30 dark:hover:bg-dark-border/30 transition-colors">
  View More
</button>

// Icon Button
<button className="p-2 rounded-full hover:bg-light-border/30 dark:hover:bg-dark-border/30 transition-colors">
  <IconHeart className="w-5 h-5" />
</button>
```

### Input Styles

```tsx
<input
  type="text"
  className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text placeholder:text-light-text-muted dark:placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
  placeholder="What's on your mind?"
/>
```

### Avatar Styles

```tsx
// Small
<img src={user.avatar} className="w-8 h-8 rounded-full object-cover ring-2 ring-light-border dark:ring-dark-border" />

// Medium
<img src={user.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-light-border dark:ring-dark-border" />

// Large
<img src={user.avatar} className="w-20 h-20 rounded-full object-cover ring-2 ring-light-border dark:ring-dark-border" />

// With online indicator
<div className="relative">
  <img src={user.avatar} className="w-12 h-12 rounded-full" />
  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-light-bg-elevated dark:border-dark-bg-elevated rounded-full" />
</div>
```

### Badge Styles

```tsx
// MBTI Badge
<span className="px-2 py-1 text-xs font-semibold bg-brand/10 text-brand rounded-md">
  {user.mbti}
</span>

// Status Badge
<span className="px-2 py-1 text-xs font-semibold bg-green-500/10 text-green-700 dark:text-green-400 rounded-md">
  Online
</span>
```

## Animation Patterns

### Transitions
```css
/* Quick interactions */
transition: all 0.15s ease;

/* Smooth transformations */
transition: transform 0.3s ease, opacity 0.3s ease;

/* Color changes */
transition: background-color 0.2s ease, color 0.2s ease;
```

### Micro-interactions

```tsx
// Button press
<button className="active:scale-95 transition-transform" />

// Hover lift
<div className="hover:-translate-y-1 hover:shadow-lg transition-all" />

// Fade in
<div className="animate-in fade-in duration-300" />

// Slide in from bottom
<div className="animate-in slide-in-from-bottom-4 duration-300" />
```

### Loading States

```tsx
// Pulse animation
<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />

// Spin animation
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />

// Skeleton loader
<div className="space-y-3">
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
</div>
```

## Icon System

### Current: FontAwesome
- Heavy bundle size
- Limited customization
- Not optimized for tree-shaking

### Recommended: Lucide React
- Lightweight (only import what you use)
- Consistent design
- Customizable stroke width
- Better performance

```tsx
// Old (FontAwesome)
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
<FontAwesomeIcon icon={faHeart} />

// New (Lucide)
import { Heart } from 'lucide-react';
<Heart className="w-5 h-5" strokeWidth={2} />
```

### Icon Sizes
```tsx
// Small
<Icon className="w-4 h-4" />

// Medium (default)
<Icon className="w-5 h-5" />

// Large
<Icon className="w-6 h-6" />

// Extra Large
<Icon className="w-8 h-8" />
```

## Responsive Breakpoints

```javascript
// tailwind.config.js
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### Mobile-First Patterns

```tsx
// Stack on mobile, grid on desktop
<div className="flex flex-col md:grid md:grid-cols-2 gap-4">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Show on mobile, hide on desktop
<div className="block md:hidden">

// Different padding on mobile vs desktop
<div className="p-4 md:p-8">

// Full width on mobile, max width on desktop
<div className="w-full md:max-w-2xl md:mx-auto">
```

## Accessibility Patterns

### Focus States
```tsx
// Always include visible focus states
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
```

### ARIA Labels
```tsx
// Buttons with icons only
<button aria-label="Like post">
  <Heart className="w-5 h-5" />
</button>

// Loading states
<div role="status" aria-live="polite">
  <span className="sr-only">Loading...</span>
  <Spinner />
</div>

// Form inputs
<label htmlFor="username" className="block mb-2">
  Username
</label>
<input id="username" aria-required="true" />
```

### Keyboard Navigation
- All interactive elements should be keyboard accessible
- Logical tab order
- Clear focus indicators
- Escape to close modals/menus
- Enter to submit forms
- Arrow keys for lists/menus

## Toast Notification Pattern

```tsx
// Success
toast.success('Post created successfully!', {
  description: 'Your post is now visible to everyone.',
  duration: 3000,
});

// Error
toast.error('Failed to create post', {
  description: 'Please try again later.',
  duration: 5000,
});

// Loading
const toastId = toast.loading('Creating post...');
// ... after completion
toast.success('Post created!', { id: toastId });
```

## Modal/Dialog Pattern

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Delete Post</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this post? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <DialogFooter className="flex gap-2">
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Empty State Pattern

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="w-16 h-16 rounded-full bg-light-border/30 dark:bg-dark-border/30 flex items-center justify-center mb-4">
    <Inbox className="w-8 h-8 text-light-text-muted dark:text-dark-text-muted" />
  </div>
  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
  <p className="text-light-text-muted dark:text-dark-text-muted mb-4 max-w-sm">
    Be the first to share something with the community!
  </p>
  <Button onClick={() => navigate('/create')}>
    <Plus className="w-4 h-4 mr-2" />
    Create Post
  </Button>
</div>
```

## Error State Pattern

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
  </div>
  <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
  <p className="text-light-text-muted dark:text-dark-text-muted mb-4 max-w-sm">
    {error.message || 'We couldn\'t load this content.'}
  </p>
  <Button onClick={retry}>
    <RefreshCw className="w-4 h-4 mr-2" />
    Try Again
  </Button>
</div>
```

## Loading State Pattern

```tsx
// Full page loading
<div className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    <Spinner className="mx-auto mb-4" />
    <p className="text-light-text-muted dark:text-dark-text-muted">
      Loading...
    </p>
  </div>
</div>

// Inline loading
<Button disabled>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Creating...
</Button>

// Skeleton loading
<div className="space-y-4">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

## Form Validation Pattern

```tsx
<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div>
      <label htmlFor="username" className="block mb-2 font-medium">
        Username
      </label>
      <input
        id="username"
        type="text"
        className={cn(
          'w-full px-4 py-2 rounded-lg border transition-colors',
          errors.username
            ? 'border-red-500 focus:ring-red-500'
            : 'border-light-border focus:ring-brand'
        )}
        aria-invalid={!!errors.username}
        aria-describedby={errors.username ? 'username-error' : undefined}
      />
      {errors.username && (
        <p id="username-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors.username}
        </p>
      )}
    </div>
  </div>
</form>
```

## User Feedback Hierarchy

1. **Instant Visual Feedback** (0ms)
   - Button press animation
   - Hover states
   - Focus indicators

2. **Optimistic Updates** (<50ms)
   - Like/unlike immediately
   - Update UI before API confirms
   - Rollback on error

3. **Loading Indicators** (100-300ms)
   - Show spinner/skeleton
   - Disable interactive elements
   - Provide context

4. **Success Confirmation** (300-3000ms)
   - Toast notification
   - Updated state visible
   - Clear action completed

5. **Error Handling** (persistent until dismissed)
   - Clear error message
   - Actionable next steps
   - Retry mechanism

---

## Design Tokens Export

```typescript
// design-tokens.ts
export const designTokens = {
  colors: {
    brand: '#21a1f1',
    success: '#4caf50',
    error: '#ab1c1c',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    base: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
```

---

**This document should be the source of truth for all design decisions during the rebuild.**
