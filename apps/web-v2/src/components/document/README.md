# Document Utilities

Reusable utilities and components for creating long-form document pages with smooth scrolling table of contents navigation.

## Components

### BackToTOCButton

A floating button that appears after scrolling past the table of contents, allowing users to quickly return to the TOC.

```tsx
import { BackToTOCButton } from '@/components/document';
import { useScrollPastElement } from '@/utils/documentScroll';

function MyDocumentPage() {
  const [showBackToTOC] = useScrollPastElement('[data-toc]');

  return (
    <div>
      {/* Your content */}
      <BackToTOCButton show={showBackToTOC} />
    </div>
  );
}
```

**Props:**
- `show` (boolean, required) - Whether to show the button
- `tocSelector` (string, optional) - CSS selector for TOC element (default: '[data-toc]')
- `offset` (number, optional) - Offset from top in pixels (default: 80)
- `duration` (number, optional) - Scroll animation duration in ms (default: 1000)
- `className` (string, optional) - Additional CSS classes

### TOCLink

A clickable table of contents link with smooth scrolling to the target section.

```tsx
import { TOCLink } from '@/components/document';

<TOCLink sectionId="section-1">
  Go to Section 1
</TOCLink>
```

**Props:**
- `sectionId` (string, required) - ID of the target section
- `children` (ReactNode, required) - Link text/content
- `offset` (number, optional) - Offset from top in pixels (default: 80)
- `duration` (number, optional) - Scroll animation duration in ms (default: 1000)
- `className` (string, optional) - Custom CSS classes

## Utilities

### smoothScrollTo

Smoothly scrolls to a target position with easing animation.

```tsx
import { smoothScrollTo } from '@/utils/documentScroll';

// Scroll to position 500px with 1 second animation
smoothScrollTo(500, 1000);
```

### scrollToElement

Scrolls to an element by ID with offset for fixed navigation bars.

```tsx
import { scrollToElement } from '@/utils/documentScroll';

// Scroll to element with ID 'section-1'
scrollToElement('section-1', 80, 1000, true);
```

**Parameters:**
- `elementId` (string) - The ID of the element
- `offset` (number, default: 80) - Offset from top in pixels
- `duration` (number, default: 1000) - Animation duration in ms
- `updateUrl` (boolean, default: true) - Whether to update URL hash

**Returns:** `boolean` - true if element was found and scrolled to

### handleTOCClick

Handle click event for table of contents links.

```tsx
import { handleTOCClick } from '@/utils/documentScroll';

<a href="#section-1" onClick={(e) => handleTOCClick(e, 'section-1')}>
  Section 1
</a>
```

### useScrollPastElement

Hook to track whether user has scrolled past an element.

```tsx
import { useScrollPastElement } from '@/utils/documentScroll';

function MyComponent() {
  const [hasScrolledPast] = useScrollPastElement('[data-toc]');
  
  return <div>{hasScrolledPast && <BackButton />}</div>;
}
```

**Returns:** `[boolean, () => void]` - Current state and manual check function

### useInitialHashScroll

Hook to handle initial hash navigation on page load.

```tsx
import { useInitialHashScroll } from '@/utils/documentScroll';

function MyDocumentPage() {
  // Scrolls to hash target on page load
  useInitialHashScroll(80, 1000, 100);
  
  return <div>{/* content */}</div>;
}
```

**Parameters:**
- `offset` (number, default: 80) - Offset from top in pixels
- `duration` (number, default: 1000) - Animation duration in ms
- `delay` (number, default: 100) - Delay before scrolling to ensure DOM is ready

## Complete Example

```tsx
import { BackToTOCButton, TOCLink } from '@/components/document';
import { useInitialHashScroll, useScrollPastElement, handleTOCClick } from '@/utils/documentScroll';

function DocumentPage() {
  const [showBackToTOC] = useScrollPastElement('[data-toc]');
  useInitialHashScroll();

  return (
    <div>
      {/* Table of Contents */}
      <section data-toc className="space-y-3">
        <h2>Table of Contents</h2>
        <ol>
          <li>
            <TOCLink sectionId="section-1">Section 1</TOCLink>
          </li>
          <li>
            <TOCLink sectionId="section-2">Section 2</TOCLink>
          </li>
        </ol>
      </section>

      {/* Content Sections */}
      <section id="section-1">
        <h2>Section 1</h2>
        <p>Content...</p>
      </section>

      <section id="section-2">
        <h2>Section 2</h2>
        <p>Content...</p>
        {/* Inline link to another section */}
        <p>
          See the{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleTOCClick(e, 'section-1');
            }}
            className="text-brand-600 hover:underline"
          >
            previous section
          </button>
          {' '}for details.
        </p>
      </section>

      {/* Floating back button */}
      <BackToTOCButton show={showBackToTOC} />
    </div>
  );
}
```

## Design Principles

- **Smooth animations** - 1 second duration with ease-in-out cubic easing
- **Navigation offset** - Default 80px offset to account for fixed navigation bars
- **URL management** - Updates URL hash for shareable links
- **Accessibility** - Proper ARIA labels and semantic HTML
- **Reusability** - Clean API for easy implementation in any document page
