# Button Component Documentation

## Overview

The Button component is a fully-featured, accessible React button with support for multiple variants, sizes, loading states, and icons. Built with TypeScript and Tailwind CSS.

## Location

`apps/web-v2/src/components/ui-next/Button.tsx`

## Features

### ✅ Multiple Variants
- **Primary** - Brand color for main CTAs
- **Secondary** - Elevated background for secondary actions
- **Ghost** - Transparent background for tertiary actions
- **Destructive** - Red color for dangerous actions (delete, remove, etc.)
- **Outline** - Bordered style for secondary emphasis

### ✅ Three Sizes
- **Small (sm)** - Compact 32px height for tight spaces
- **Medium (md)** - Default 40px height for most use cases
- **Large (lg)** - Prominent 48px height for primary actions

### ✅ Loading States
- Built-in spinner using Lucide's `Loader2` icon
- Automatically disables button during loading
- Replaces left icon when loading
- Includes screen reader announcements

### ✅ Icon Support
- **Left Icon** - Icon before text
- **Right Icon** - Icon after text
- **Both Icons** - Icons on both sides
- Auto-sized icons based on button size
- Seamlessly integrates with Lucide React icons

### ✅ Accessibility Features
- Proper ARIA attributes (`aria-busy`, `aria-disabled`)
- Keyboard navigation support
- Visible focus indicators
- Screen reader friendly loading announcements
- Semantic HTML with proper disabled states

### ✅ Additional Features
- **Full Width** - Stretches to fill container
- **Dark Mode** - Full dark mode support
- **Active States** - Press down animation (scale-95)
- **TypeScript** - Fully typed with comprehensive JSDoc

## Usage Examples

### Basic Usage

```tsx
import { Button } from '@/components/ui-next/Button';

function MyComponent() {
  return <Button>Click Me</Button>;
}
```

### With Variants

```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Tertiary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outlined</Button>
```

### With Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### With Loading State

```tsx
import { Button } from '@/components/ui-next/Button';

function SubmitForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    await submitData();
    setIsLoading(false);
  };

  return (
    <Button loading={isLoading} onClick={handleSubmit}>
      Submit Form
    </Button>
  );
}
```

### With Icons

```tsx
import { Button } from '@/components/ui-next/Button';
import { Plus, Save, ChevronRight, Trash2 } from 'lucide-react';

// Left icon only
<Button leftIcon={<Plus />}>Create New</Button>

// Right icon only
<Button rightIcon={<ChevronRight />}>Continue</Button>

// Both icons
<Button leftIcon={<Save />} rightIcon={<ChevronRight />}>
  Save and Continue
</Button>

// Destructive with icon
<Button variant="destructive" leftIcon={<Trash2 />}>
  Delete
</Button>
```

### Loading with Icons

```tsx
import { Button } from '@/components/ui-next/Button';
import { Save } from 'lucide-react';

function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Button 
      leftIcon={<Save />} 
      loading={isSaving}
      onClick={() => setIsSaving(true)}
    >
      Save Changes
    </Button>
  );
}
// When loading, the Save icon is replaced with a spinner
```

### Full Width

```tsx
<Button fullWidth>Full Width Button</Button>
<Button fullWidth variant="secondary">Full Width Secondary</Button>
```

### Disabled State

```tsx
<Button disabled>Disabled Button</Button>
```

### Real World Example - Form Actions

```tsx
import { Button } from '@/components/ui-next/Button';
import { Save } from 'lucide-react';

function UserProfileForm() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveUserProfile();
    setIsSaving(false);
  };

  const handleCancel = () => {
    // Reset form
  };

  return (
    <form>
      {/* Form fields */}
      
      <div className="flex gap-4 mt-6">
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <Button 
          leftIcon={<Save />} 
          loading={isSaving}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
```

## Props API

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant (default: 'primary') */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  
  /** Size of the button (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  
  /** Shows loading spinner and disables button (default: false) */
  loading?: boolean;
  
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
  
  /** Renders as full width block element (default: false) */
  fullWidth?: boolean;
}
```

## Styling Details

### Color System

- Uses Tailwind theme colors defined in `tailwind.config.js`
- Automatic dark mode support via `dark:` variants
- Brand colors: `bg-brand`, `hover:bg-brand-600`
- Error colors: `bg-error`, `hover:bg-red-700`

### Animations

- **Hover**: Background color transition
- **Active**: Scale down to 95% (`active:scale-95`)
- **Focus**: Ring with 2px offset
- **Loading**: Rotating spinner animation
- **Transitions**: All transitions use `transition-all` or `transition-colors`

### Accessibility

- Focus visible rings: 2px ring with 2px offset
- Disabled cursor: `cursor-not-allowed`
- Disabled opacity: 50%
- ARIA attributes automatically set based on state
- Screen reader only text for loading state

## Icon Sizes

Icons automatically scale based on button size:

- **Small button**: 16px (w-4 h-4)
- **Medium button**: 20px (w-5 h-5)
- **Large button**: 20px (w-5 h-5)

## Testing

Visit `/examples/button` to see all variants, sizes, and states in action.

## Best Practices

1. **Use appropriate variants**
   - Primary for main CTAs
   - Secondary for less important actions
   - Ghost for tertiary actions
   - Destructive for dangerous actions

2. **Loading states**
   - Always disable buttons during async operations
   - Use `loading` prop instead of manually disabling

3. **Icons**
   - Use left icons for actions (Save, Upload, Create)
   - Use right icons for navigation (ChevronRight, ArrowRight)
   - Keep icon usage consistent across the app

4. **Accessibility**
   - Always provide descriptive button text
   - Don't rely solely on icons
   - Test keyboard navigation
   - Ensure focus indicators are visible

## Migration from Old Button

If migrating from the old button component:

```tsx
// Old
<button className="btn-primary">Submit</button>

// New
<Button variant="primary">Submit</Button>
```

## Dark Mode

All button variants automatically support dark mode. No additional configuration needed.

## Dependencies

- **React** - Component library
- **Lucide React** - Icon library (Loader2 icon)
- **Tailwind CSS** - Styling

## Future Enhancements

Potential additions (not yet implemented):

- [ ] Icon-only button variant
- [ ] Button group component
- [ ] Custom loading indicator
- [ ] Tooltip support
- [ ] Keyboard shortcuts display
