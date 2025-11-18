# Transaction Tracking - UI Guide

## Page Layouts

### 1. Transactions Page (`/transactions`)

```
┌─────────────────────────────────────────────────────────────┐
│ Navigation: Dashboard | Invoices | Customers | Budgets |    │
│             Transactions                              Logout │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Transactions                          [+ Add Transaction]   │
│  Track your spending and manage transactions                 │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ New Transaction                                      │   │
│  │                                                       │   │
│  │  Budget: [November 2025 ▼]  Category: [Groceries ▼] │   │
│  │  Amount: [$____.__]          Date: [2025-11-18]     │   │
│  │  Notes: [Optional notes...]                          │   │
│  │                                                       │   │
│  │                          [Cancel] [Add Transaction]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Filter by Budget: [All Budgets ▼]                    │   │
│  │ Filter by Category: [All Categories ▼]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Recent Transactions                                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Groceries              Nov 18, 2025    $45.99 [Delete]│   │
│  │ Whole Foods shopping                                  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Gas                    Nov 18, 2025    $55.00 [Delete]│   │
│  │ Gas station fill-up                                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Entertainment          Nov 17, 2025    $29.99 [Delete]│   │
│  │ Movie tickets                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Budget Detail Page with Spending (`/budgets/[id]`)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Budgets                                            │
│                                                               │
│  November 2025                [Add Transaction] [Edit] [Del] │
│  View your budget details                                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Monthly Income                                       │   │
│  │ $5,000.00                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Income:      $5,000.00                               │   │
│  │ Allocated:   $5,000.00                               │   │
│  │ ─────────────────────────────────────────────────   │   │
│  │ Remaining:   $0.00 ✓                                 │   │
│  │ Budget is balanced! Every dollar is allocated.       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Budget Categories                                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Groceries                              $500.00       │   │
│  │ Spent: $128.49          Remaining: $371.51           │   │
│  │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 25%          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Gas                                    $200.00       │   │
│  │ Spent: $55.00           Remaining: $145.00           │   │
│  │ ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 27%          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Entertainment                          $150.00       │   │
│  │ Spent: $29.99           Remaining: $120.01           │   │
│  │ ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 20%          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Form States

### Add Transaction Form - Empty State
```
┌─────────────────────────────────────────────────────┐
│ New Transaction                                      │
│                                                       │
│ Budget *                                             │
│ [Select budget ▼]                                    │
│                                                       │
│ Category *                                           │
│ [Select category ▼]                    (disabled)    │
│                                                       │
│ Amount *                                             │
│ [$____.__]                                           │
│                                                       │
│ Date *                                               │
│ [2025-11-18]                                         │
│                                                       │
│ Notes (optional)                                     │
│ [Add any notes about this transaction...]            │
│                                                       │
│                          [Cancel] [Add Transaction]  │
└─────────────────────────────────────────────────────┘
```

### Add Transaction Form - With Validation Errors
```
┌─────────────────────────────────────────────────────┐
│ New Transaction                                      │
│                                                       │
│ Budget *                                             │
│ [November 2025 ▼]                                    │
│                                                       │
│ Category *                                           │
│ [Select category ▼]                                  │
│ ⚠ Category is required                               │
│                                                       │
│ Amount *                                             │
│ [$0.00]                                              │
│ ⚠ Amount must be greater than 0                      │
│                                                       │
│ Date *                                               │
│ [2025-11-18]                                         │
│                                                       │
│ Notes (optional)                                     │
│ [Grocery shopping]                                   │
│                                                       │
│                          [Cancel] [Add Transaction]  │
└─────────────────────────────────────────────────────┘
```

### Add Transaction Form - Valid & Ready
```
┌─────────────────────────────────────────────────────┐
│ New Transaction                                      │
│                                                       │
│ Budget *                                             │
│ [November 2025 ▼]                                    │
│                                                       │
│ Category *                                           │
│ [Groceries ▼]                                        │
│                                                       │
│ Amount *                                             │
│ [$45.99]                                             │
│                                                       │
│ Date *                                               │
│ [2025-11-18]                                         │
│                                                       │
│ Notes (optional)                                     │
│ [Whole Foods shopping]                               │
│                                                       │
│                          [Cancel] [Add Transaction]  │
└─────────────────────────────────────────────────────┘
```

## Progress Bar States

### Under Budget (Green)
```
Groceries                                    $500.00
Spent: $128.49              Remaining: $371.51
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 25%
```

### Near Budget (Yellow - 90%+)
```
Gas                                          $200.00
Spent: $185.00              Remaining: $15.00
████████████████████████████████████░░░░ 92%
```

### Over Budget (Red - 100%+)
```
Entertainment                                $150.00
Spent: $165.00              Remaining: -$15.00
████████████████████████████████████████ 110%
```

## Transaction List Item
```
┌─────────────────────────────────────────────────────┐
│ Groceries              Nov 18, 2025    $45.99 [Delete]│
│ Whole Foods shopping                                  │
└─────────────────────────────────────────────────────┘
```

## Empty States

### No Transactions
```
┌─────────────────────────────────────────────────────┐
│ Recent Transactions                                   │
├─────────────────────────────────────────────────────┤
│                                                       │
│         No transactions found.                        │
│         Add your first transaction to get started!    │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### No Budgets
```
┌─────────────────────────────────────────────────────┐
│ Transactions                          [+ Add Transaction]│
│                                                       │
│ You need to create a budget first before adding      │
│ transactions.                                         │
│                                                       │
│                          [Go to Budgets]              │
└─────────────────────────────────────────────────────┘
```

## Color Scheme

### Progress Bars
- **Green** (#10B981): 0-89% spent - On track
- **Yellow** (#F59E0B): 90-99% spent - Warning
- **Red** (#EF4444): 100%+ spent - Over budget

### Buttons
- **Primary** (Blue #2563EB): Add Transaction, Save
- **Secondary** (Gray #6B7280): Cancel, Filter
- **Danger** (Red #DC2626): Delete

### Status Indicators
- **Success** (Green): Budget balanced, transaction added
- **Warning** (Yellow): Unallocated funds, near budget
- **Error** (Red): Over budget, validation errors

## Responsive Behavior

### Desktop (1024px+)
- Two-column form layout
- Full navigation visible
- Wide transaction list
- Side-by-side filters

### Tablet (768px-1023px)
- Two-column form layout
- Compact navigation
- Full-width transaction list
- Stacked filters

### Mobile (< 768px)
- Single-column form layout
- Hamburger menu
- Full-width transaction list
- Stacked filters
- Larger touch targets

## Interactive Elements

### Hover States
- Buttons: Darker shade
- Transaction rows: Light gray background
- Delete button: Darker red

### Focus States
- Form inputs: Blue ring
- Buttons: Blue ring
- Dropdowns: Blue ring

### Loading States
- Button text changes to "Saving..."
- Button disabled during save
- Spinner on page load

### Success States
- Transaction appears in list immediately
- Form resets to empty
- Success message (optional)

## Accessibility

- All form fields have labels
- Required fields marked with *
- Error messages associated with fields
- Keyboard navigation supported
- ARIA labels on interactive elements
- Color not sole indicator (text + color)
- Sufficient color contrast

## User Flow

1. **Add Transaction**
   - Click "Add Transaction" button
   - Form slides down
   - Select budget (loads categories)
   - Select category
   - Enter amount (validates on blur)
   - Select date
   - Add notes (optional)
   - Click "Add Transaction"
   - Form closes, transaction appears

2. **View Spending**
   - Navigate to Budgets
   - Click on a budget
   - See progress bars
   - View spent/remaining amounts
   - Color indicates status

3. **Filter Transactions**
   - Use budget dropdown
   - Use category dropdown
   - List updates automatically
   - Clear filters to see all

4. **Delete Transaction**
   - Click "Delete" on transaction
   - Confirm deletion
   - Transaction removed
   - Budget totals update

## Tips for Users

- **Green is good**: Keep progress bars green
- **Watch yellow**: You're getting close to budget
- **Red means stop**: You've exceeded your budget
- **Add notes**: Help remember what you bought
- **Filter often**: Find specific transactions quickly
- **Check regularly**: Stay on top of spending
