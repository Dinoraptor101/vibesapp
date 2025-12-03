# Content Design Standards

## Overview

This document outlines the design standards for displaying long-form content pages (legal documents, terms of service, privacy policies, help documentation, etc.) within VibesApp. These standards ensure content is readable, accessible, and consistent across all theme modes (light, dim, dark).

## Core Principles

### 1. Full-Page Navigation (ZEN Philosophy)
- **Rule**: Use full-page routes for substantial content, never modals
- **Why**: Modals violate ZEN principles - they interrupt the flow and reduce readability for long content
- **Implementation**: Content pages use `react-router-dom` with overlay routes
- **Pattern**: Navigate with `useNavigate('/path')`, return with back button

### 2. Theme Consistency
Content pages must support all three theme modes with proper contrast:
- **Light Theme**: High contrast, clean backgrounds
- **Dim Theme**: Reduced brightness for eye comfort, darker backgrounds
- **Dark Theme**: Full dark mode with maximum contrast

### 3. Mobile-First Design
- **Responsive**: Content must render correctly on mobile (95% usage), tablet, and desktop
- **Touch Targets**: All interactive elements minimum 44px
- **Padding**: Use consistent spacing (`px-4`) for mobile margins
- **Max Width**: Wrap content in `max-w-4xl mx-auto` for readability

## Typography & Text Styling

### Headings
```tsx
// Main page title
<h1 className="text-2xl font-bold text-gray-900 dim:text-gray-100 dark:text-gray-100">
  Page Title
</h1>

// Section headings (H2)
<h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
  Section Title
</h2>

// Subsection headings (H3)
<h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
  Subsection Title
</h3>
```

### Body Text
```tsx
// Standard paragraph
<p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
  Body text content...
</p>

// Metadata/secondary text
<p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
  Secondary information...
</p>
```

### Emphasis & Importance
```tsx
// Bold text for emphasis
<strong>Important phrase</strong>

// All-caps for legal sections
<p className="uppercase text-sm font-semibold">
  IMPORTANT LEGAL SECTION
</p>
```

## Container Styles

### Standard Info/Notice Blocks
Use for general information, important notices, contact information:

```tsx
<div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 border-l-4 border-brand-600 dim:border-brand-500 dark:border-brand-400 p-4">
  <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
    Title
  </p>
  <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
    Content...
  </p>
</div>
```

**Contrast Values**:
- Background: `bg-gray-100` (light) → `dim:bg-gray-800` (dim) → `dark:bg-gray-900` (dark)
- Border Left: `border-brand-600` (light) → `dim:border-brand-500` (dim) → `dark:border-brand-400` (dark)
- Text: `text-gray-700` (light) → `dim:text-gray-300` (dim) → `dark:text-gray-300` (dark)

### Warning/Alert Blocks
Use for critical warnings, liability disclaimers:

```tsx
<div className="bg-yellow-100 dim:bg-yellow-900 dark:bg-yellow-900 border-l-4 border-yellow-600 dim:border-yellow-500 dark:border-yellow-400 p-4 space-y-2">
  <p className="text-gray-900 dim:text-yellow-100 dark:text-yellow-100 font-semibold">
    IMPORTANT: Title
  </p>
  <ul className="ml-4 space-y-2">
    {items.map((item) => (
      <li className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3">
        <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
</div>
```

**Contrast Values**:
- Background: `bg-yellow-100` (light) → `dim:bg-yellow-900` (dim) → `dark:bg-yellow-900` (dark)
- Border Left: `border-yellow-600` (light) → `dim:border-yellow-500` (dim) → `dark:border-yellow-400` (dark)
- Title Text: `text-gray-900 dim:text-yellow-100 dark:text-yellow-100`
- List Text: `text-gray-700 dim:text-gray-300 dark:text-gray-300`

## Lists & Bullets

### Unordered Lists
```tsx
<ul className="ml-4 space-y-2">
  {items.map((item) => (
    <li key={item} className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3">
      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">•</span>
      <span>{item}</span>
    </li>
  ))}
</ul>
```

**Spacing**: `ml-4` (left margin) + `space-y-2` (vertical spacing between items)
**Bullet**: Brand color with gap for readability

### Nested Lists
```tsx
<div className="ml-4 space-y-3">
  <div>
    <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
      Category
    </h3>
    <ul className="ml-4 space-y-2">
      {/* bullet items */}
    </ul>
  </div>
</div>
```

## Layout Spacing

### Page Structure
```tsx
<AppLayout>
  <div className="max-w-4xl mx-auto px-4">
    {/* Header with back button */}
    <div className="flex items-center gap-3 mb-8">
      <Button
        onClick={() => navigate('/previous-page')}
        variant="ghost"
        size="sm"
        className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Back</span>
      </Button>
      <h1>Title</h1>
    </div>

    {/* Content sections */}
    <div className="space-y-6 pb-8">
      {/* Each section is a <section> with space-y-3 */}
    </div>
  </div>
</AppLayout>
```

**Key Spacing**:
- Page container: `max-w-4xl mx-auto px-4`
- Header margin bottom: `mb-8`
- Content container: `space-y-6 pb-8`
- Section spacing: `space-y-3`
- Paragraph spacing: `space-y-3` within sections

### Back Button Standards
```tsx
<Button
  onClick={() => navigate('/previous-page')}
  variant="ghost"
  size="sm"
  className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]"
>
  <ChevronLeft className="h-5 w-5" />
  <span className="sr-only">Back to {pageName}</span>
</Button>
```

**Requirements**:
- Variant: `ghost` for minimal styling
- Size: `sm` with explicit `h-10 w-10 p-0`
- Minimum: `min-h-[44px] min-w-[44px]` for touch targets
- Icon: `ChevronLeft` from lucide-react
- Screen reader: `sr-only` with descriptive text

## Color Palette Reference

### Text Colors
| Use Case | Light | Dim | Dark |
|----------|-------|-----|------|
| Primary Text | `text-gray-900` | `dim:text-gray-100` | `dark:text-gray-100` |
| Secondary Text | `text-gray-700` | `dim:text-gray-300` | `dark:text-gray-300` |
| Tertiary Text | `text-gray-500` | `dim:text-gray-450` | `dark:text-gray-400` |
| Accent (Links, Icons) | `text-brand-600` | `dim:text-brand-500` | `dark:text-brand-400` |

### Background Colors
| Use Case | Light | Dim | Dark |
|----------|-------|-----|------|
| Info Blocks | `bg-gray-100` | `dim:bg-gray-800` | `dark:bg-gray-900` |
| Warning Blocks | `bg-yellow-100` | `dim:bg-yellow-900` | `dark:bg-yellow-900` |

### Border Colors
| Use Case | Light | Dim | Dark |
|----------|-------|-----|------|
| Section Dividers | `border-gray-200` | `dim:border-gray-600` | `dark:border-gray-700` |
| Info Block Left | `border-brand-600` | `dim:border-brand-500` | `dark:border-brand-400` |
| Warning Block Left | `border-yellow-600` | `dim:border-yellow-500` | `dark:border-yellow-400` |

## Accessibility Standards

### Screen Readers
- Use `sr-only` class for descriptive text on buttons
- Proper heading hierarchy (h1, h2, h3)
- Semantic HTML (`<section>`, `<ul>`, `<p>`)

### Touch Targets
- All buttons: minimum 44px × 44px
- All clickable elements: minimum 44px × 44px
- Gap between interactive elements: 8px minimum

### Contrast Ratios
- **WCAG AA**: All text must have 4.5:1 contrast ratio minimum
- **Dim Mode**: Extra attention to ensure readability without high contrast

### Focus States
```tsx
className="focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
```

## Common Content Patterns

### Disclaimer Sections
```tsx
<section className="space-y-3">
  <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
    Section Title
  </h2>
  <div className="bg-yellow-100 dim:bg-yellow-900 dark:bg-yellow-900 border-l-4 border-yellow-600 dim:border-yellow-500 dark:border-yellow-400 p-4 space-y-2">
    <p className="text-gray-900 dim:text-yellow-100 dark:text-yellow-100 font-semibold">
      DISCLAIMER:
    </p>
    <ul className="ml-4 space-y-2">
      {disclaimers.map((item) => (
        <li key={item} className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3">
          <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
</section>
```

### Footer/Closing Statement
```tsx
<div className="border-t border-gray-200 dim:border-gray-600 dark:border-gray-700 pt-6 mt-8">
  <p className="text-center text-gray-700 dim:text-gray-300 dark:text-gray-300 font-medium">
    Closing statement or acknowledgement...
  </p>
</div>
```

## Implementation Checklist

When creating a new content page:

- [ ] Use full-page route (no modals)
- [ ] Include back button with `min-h-[44px] min-w-[44px]`
- [ ] Wrap content in `max-w-4xl mx-auto px-4`
- [ ] Use `AppLayout` component
- [ ] Add proper heading hierarchy (h1, h2, h3)
- [ ] Apply theme classes to all text and backgrounds
- [ ] Verify contrast in all three theme modes
- [ ] Test on mobile, tablet, desktop viewports
- [ ] Check 44px minimum touch targets
- [ ] Add screen reader labels for buttons
- [ ] Use semantic HTML (`<section>`, `<ul>`)
- [ ] Apply spacing consistently (`space-y-6`, `mb-8`, `space-y-3`)

## Related Documentation

- [UX Design & ZEN Philosophy](./06-ux-design.md) - Overall design principles
- [Design System](./04-design-system.md) - Color palette and component library
- [Current Architecture](./01-current-architecture.md) - App structure and routing

## Version History

- **3 December 2025**: Created - Based on Terms of Service implementation
