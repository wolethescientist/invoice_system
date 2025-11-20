# Component Quick Reference

Quick copy-paste examples for all UI components.

## 🔘 Button

```tsx
import { Button } from '@/components'

// Basic
<Button>Click Me</Button>

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

// States
<Button isLoading>Loading...</Button>
<Button disabled>Disabled</Button>
```

## 🎴 Card

```tsx
import { Card, StatCard } from '@/components'

// Basic
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>

// Variants
<Card hover>Hover Effect</Card>
<Card gradient>Gradient BG</Card>
<Card glass>Glass Effect</Card>

// Stat Card
<StatCard
  title="Revenue"
  value="$45,231"
  change={12.5}
  trend="up"
  icon="💰"
  color="brand"
/>
```

## 🏷️ Badge

```tsx
import { Badge } from '@/components'

// Variants
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="neutral">Neutral</Badge>

// With Dot
<Badge variant="success" dot>Online</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

## 📝 Input

```tsx
import { Input, TextArea } from '@/components'

// Basic
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
/>

// With Icon
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

// With Helper
<Input
  label="Password"
  helperText="Min 8 characters"
/>

// Required
<Input
  label="Name"
  required
/>

// Text Area
<TextArea
  label="Description"
  rows={4}
  placeholder="Enter text..."
/>
```

## 🪟 Modal

```tsx
import { Modal, ConfirmModal } from '@/components'

// Basic Modal
const [open, setOpen] = useState(false)

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Modal Title"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>Save</Button>
    </>
  }
>
  <p>Modal content here</p>
</Modal>

// Confirm Dialog
<ConfirmModal
  isOpen={open}
  onClose={() => setOpen(false)}
  onConfirm={handleDelete}
  title="Delete Item?"
  message="This cannot be undone."
  variant="danger"
  confirmText="Delete"
  cancelText="Cancel"
/>
```

## 🔔 Toast

```tsx
import { useToast } from '@/components'

function MyComponent() {
  const { showToast } = useToast()

  return (
    <>
      <Button onClick={() => showToast('success', 'Saved!')}>
        Save
      </Button>
      <Button onClick={() => showToast('error', 'Failed!')}>
        Error
      </Button>
      <Button onClick={() => showToast('warning', 'Warning!')}>
        Warn
      </Button>
      <Button onClick={() => showToast('info', 'Info!')}>
        Info
      </Button>
    </>
  )
}
```

## 💬 Tooltip

```tsx
import { Tooltip } from '@/components'

<Tooltip content="Click to edit" position="top">
  <Button>Edit</Button>
</Tooltip>

// Positions: top, bottom, left, right
<Tooltip content="Help text" position="bottom">
  <span>?</span>
</Tooltip>
```

## ⏳ Loading

```tsx
import { LoadingSpinner, LoadingPage, LoadingSkeleton } from '@/components'

// Spinner
<LoadingSpinner size="md" color="brand" />

// Full Page
<LoadingPage />

// Skeleton
<LoadingSkeleton className="h-20 w-full rounded-xl" />
```

## 📭 Empty State

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

## 🎨 Utility Classes

```tsx
// Card styles
<div className="card">Basic card</div>
<div className="card card-hover">Hover card</div>
<div className="glass">Glass effect</div>

// Input
<input className="input" />

// Badge
<span className="badge badge-success">Success</span>

// Text
<h1 className="gradient-text">Gradient Text</h1>

// Scrollbar
<div className="scrollbar-thin">Content</div>

// Focus
<button className="focus-ring">Button</button>

// Loading
<div className="skeleton h-20 w-full" />
```

## 🎭 Common Patterns

### Form with Validation
```tsx
<Card>
  <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
  <form className="space-y-4">
    <Input
      label="Email"
      type="email"
      required
      error={errors.email}
    />
    <Input
      label="Password"
      type="password"
      required
      helperText="Min 8 characters"
      error={errors.password}
    />
    <Button type="submit" className="w-full">
      Sign Up
    </Button>
  </form>
</Card>
```

### Stats Dashboard
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard
    title="Revenue"
    value="$45,231"
    change={12.5}
    trend="up"
    icon="💰"
    color="brand"
  />
  <StatCard
    title="Users"
    value="2,345"
    change={8.2}
    trend="up"
    icon="👥"
    color="success"
  />
  <StatCard
    title="Tasks"
    value="23"
    change={-5.4}
    trend="down"
    icon="📋"
    color="warning"
  />
  <StatCard
    title="Rate"
    value="3.2%"
    change={0}
    trend="neutral"
    icon="📈"
    color="error"
  />
</div>
```

### Action Confirmation
```tsx
const [confirmOpen, setConfirmOpen] = useState(false)
const { showToast } = useToast()

const handleDelete = async () => {
  try {
    await deleteItem(id)
    showToast('success', 'Item deleted')
    setConfirmOpen(false)
  } catch (error) {
    showToast('error', 'Failed to delete')
  }
}

<Button variant="danger" onClick={() => setConfirmOpen(true)}>
  Delete
</Button>

<ConfirmModal
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  onConfirm={handleDelete}
  title="Delete Item?"
  message="This action cannot be undone."
  variant="danger"
/>
```

### List with Empty State
```tsx
{items.length === 0 ? (
  <EmptyState
    icon="📭"
    title="No items yet"
    description="Create your first item to get started"
    action={{
      label: 'Create Item',
      onClick: () => router.push('/items/new')
    }}
  />
) : (
  <div className="space-y-4">
    {items.map(item => (
      <Card key={item.id} hover>
        {/* Item content */}
      </Card>
    ))}
  </div>
)}
```

### Loading States
```tsx
{isLoading ? (
  <div className="space-y-4">
    <LoadingSkeleton className="h-20 w-full rounded-xl" />
    <LoadingSkeleton className="h-20 w-full rounded-xl" />
    <LoadingSkeleton className="h-20 w-full rounded-xl" />
  </div>
) : (
  <div className="space-y-4">
    {/* Actual content */}
  </div>
)}
```

### Status Badges
```tsx
const getStatusBadge = (status: string) => {
  const config = {
    active: { variant: 'success', label: 'Active' },
    pending: { variant: 'warning', label: 'Pending' },
    failed: { variant: 'error', label: 'Failed' },
    draft: { variant: 'neutral', label: 'Draft' },
  }
  
  const { variant, label } = config[status]
  return <Badge variant={variant} dot>{label}</Badge>
}
```

## 🎯 Pro Tips

1. **Combine Components**: Use Card + Input + Button for forms
2. **Feedback Loop**: Always use Toast for user actions
3. **Loading States**: Show LoadingSkeleton while fetching
4. **Empty States**: Use EmptyState for empty lists
5. **Tooltips**: Add context to icon buttons
6. **Confirmations**: Use ConfirmModal for destructive actions
7. **Variants**: Match button variants to action severity
8. **Accessibility**: Always include labels on inputs

## 📱 Responsive Grid

```tsx
// 1 column mobile, 2 tablet, 3 desktop, 4 large
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>

// 1 column mobile, 2 desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Content */}
</div>
```

## 🎨 Color Classes

```tsx
// Text colors
text-brand-600
text-success-600
text-warning-600
text-error-600
text-neutral-600

// Background colors
bg-brand-50
bg-success-100
bg-warning-100
bg-error-100
bg-neutral-100

// Border colors
border-brand-500
border-success-500
border-warning-500
border-error-500
border-neutral-300
```

---

**Quick Start**: Copy any example and customize to your needs!
