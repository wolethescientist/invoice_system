# Enhanced UI System Guide

## Overview

The Hikey application now features a modern, polished UI system with enhanced components, animations, and design patterns. This guide covers all the improvements and how to use them.

## 🎨 Design Improvements

### Visual Enhancements
- **Gradient Backgrounds**: Subtle gradient from neutral to brand colors
- **Glass Morphism**: Frosted glass effects on sidebar and header
- **Enhanced Shadows**: Soft, medium, and large shadow variants
- **Smooth Animations**: Framer Motion animations throughout
- **Better Typography**: Gradient text effects and improved hierarchy
- **Modern Color Palette**: Extended with success, warning, and error colors

### Layout Improvements
- **Animated Sidebar**: Smooth slide animations with spring physics
- **Quick Search**: Command palette (⌘K / Ctrl+K) for navigation
- **Active State Indicators**: Animated highlight for current page
- **Notification Badge**: Visual indicator for alerts
- **Responsive Design**: Optimized for all screen sizes

## 🧩 New Components

### Button Component
Enhanced with multiple variants, sizes, and states:

```tsx
import { Button } from '@/components'

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="outline">Outline</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With Icons
<Button leftIcon="🚀">Launch</Button>
<Button rightIcon="→">Next</Button>

// Loading State
<Button isLoading>Processing...</Button>
```

### Card Components
Multiple card variants for different use cases:

```tsx
import { Card, StatCard } from '@/components'

// Basic Card
<Card>Content here</Card>

// Hover Effect
<Card hover>Lifts on hover</Card>

// Gradient Background
<Card gradient>Subtle gradient</Card>

// Glass Effect
<Card glass>Frosted glass</Card>

// Stat Card
<StatCard
  title="Total Revenue"
  value="$45,231"
  change={12.5}
  trend="up"
  icon="💰"
  color="brand"
/>
```

### Badge Component
Status indicators with multiple variants:

```tsx
import { Badge } from '@/components'

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">New</Badge>
<Badge variant="neutral">Draft</Badge>

// With Dot Indicator
<Badge variant="success" dot>Online</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### Input Components
Enhanced form inputs with validation:

```tsx
import { Input, TextArea } from '@/components'

// Basic Input
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
/>

// With Icons
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search..."
/>

// With Error
<Input
  label="Username"
  error="Username is required"
/>

// With Helper Text
<Input
  label="Password"
  helperText="Must be at least 8 characters"
/>

// Text Area
<TextArea
  label="Description"
  rows={4}
  placeholder="Enter description..."
/>
```

### Modal Components
Flexible modal dialogs:

```tsx
import { Modal, ConfirmModal } from '@/components'

// Basic Modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  footer={
    <>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button onClick={onSave}>Save</Button>
    </>
  }
>
  <p>Modal content here</p>
</Modal>

// Confirm Dialog
<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  title="Delete Item?"
  message="This action cannot be undone."
  variant="danger"
  confirmText="Yes, delete"
  cancelText="Cancel"
/>
```

### Toast Notifications
Global toast system for feedback:

```tsx
import { useToast } from '@/components'

function MyComponent() {
  const { showToast } = useToast()

  const handleSuccess = () => {
    showToast('success', 'Operation completed!')
  }

  const handleError = () => {
    showToast('error', 'Something went wrong')
  }

  const handleWarning = () => {
    showToast('warning', 'Please review your changes')
  }

  const handleInfo = () => {
    showToast('info', 'New update available')
  }
}
```

### Tooltip Component
Contextual help on hover:

```tsx
import { Tooltip } from '@/components'

<Tooltip content="Click to edit" position="top">
  <Button>Edit</Button>
</Tooltip>

// Positions: top, bottom, left, right
```

### Loading Components
Various loading states:

```tsx
import { LoadingSpinner, LoadingPage, LoadingSkeleton } from '@/components'

// Spinner
<LoadingSpinner size="md" color="brand" />

// Full Page Loading
<LoadingPage />

// Skeleton Loader
<LoadingSkeleton className="h-20 w-full rounded-xl" />
```

### Empty State Component
Placeholder for empty data:

```tsx
import { EmptyState } from '@/components'

<EmptyState
  icon="📭"
  title="No items found"
  description="Get started by creating your first item"
  action={{
    label: 'Create Item',
    onClick: handleCreate
  }}
/>
```

## 🎭 Utility Classes

### Custom CSS Classes

```css
/* Card styles */
.card - Basic card with shadow and border
.card-hover - Card with hover effect
.glass - Glass morphism effect

/* Input styles */
.input - Styled input field

/* Badge styles */
.badge - Base badge
.badge-success - Success badge
.badge-warning - Warning badge
.badge-error - Error badge
.badge-info - Info badge

/* Text effects */
.gradient-text - Gradient text effect

/* Stat card */
.stat-card - Card with top border accent

/* Scrollbar */
.scrollbar-thin - Thin custom scrollbar

/* Focus */
.focus-ring - Accessible focus ring

/* Loading */
.skeleton - Animated skeleton loader
```

## 🎨 Color System

### Brand Colors
- `brand-50` to `brand-900` - Primary blue palette

### Neutral Colors
- `neutral-50` to `neutral-900` - Gray scale

### Status Colors
- `success-50` to `success-700` - Green for success
- `warning-50` to `warning-700` - Amber for warnings
- `error-50` to `error-700` - Red for errors

## 🎬 Animations

### Built-in Animations
- `animate-fade-in` - Fade in effect
- `animate-slide-up` - Slide up from bottom
- `animate-slide-down` - Slide down from top
- `animate-scale-in` - Scale in effect
- `animate-shimmer` - Shimmer loading effect

### Framer Motion
All interactive components use Framer Motion for smooth animations:
- Hover effects with scale
- Tap feedback
- Page transitions
- Modal animations
- Toast notifications

## 📱 Responsive Design

All components are fully responsive with breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## ♿ Accessibility

- Keyboard navigation support
- Focus indicators on all interactive elements
- ARIA labels where needed
- Proper color contrast ratios
- Screen reader friendly

## 🚀 Getting Started

### Import Components

```tsx
// Import individual components
import { Button, Card, Badge } from '@/components'

// Or import from specific files
import { Button } from '@/components/Button'
```

### Use in Pages

```tsx
'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, Button, useToast } from '@/components'

export default function MyPage() {
  const { showToast } = useToast()

  return (
    <DashboardLayout>
      <Card>
        <h1 className="text-2xl font-bold mb-4">My Page</h1>
        <Button onClick={() => showToast('success', 'Hello!')}>
          Click Me
        </Button>
      </Card>
    </DashboardLayout>
  )
}
```

## 🎨 UI Showcase

Visit `/ui-showcase` to see all components in action with interactive examples.

## 📚 Best Practices

1. **Consistent Spacing**: Use Tailwind's spacing scale (4px increments)
2. **Color Usage**: Stick to the defined color palette
3. **Component Composition**: Build complex UIs from simple components
4. **Accessibility First**: Always include labels and ARIA attributes
5. **Performance**: Use loading states and skeleton loaders
6. **Feedback**: Provide visual feedback for all user actions
7. **Animations**: Keep animations subtle and purposeful

## 🔧 Customization

### Extending Colors
Edit `frontend/tailwind.config.ts` to add custom colors:

```ts
colors: {
  custom: {
    500: '#YOUR_COLOR',
  }
}
```

### Custom Components
Create new components following the existing patterns:
- Use Framer Motion for animations
- Include proper TypeScript types
- Support variants and sizes
- Add accessibility features

## 📖 Examples

Check these files for implementation examples:
- `/frontend/src/app/ui-showcase/page.tsx` - All components
- `/frontend/src/components/DashboardLayout.tsx` - Layout patterns
- `/frontend/src/components/Button.tsx` - Component structure
- `/frontend/src/app/globals.css` - Custom CSS utilities

## 🎯 Next Steps

1. Explore the UI Showcase page
2. Review the component source code
3. Implement components in your pages
4. Customize colors and styles as needed
5. Add new components following the patterns

---

**Note**: All components are built with TypeScript, Tailwind CSS, and Framer Motion for a modern, type-safe, and animated experience.
