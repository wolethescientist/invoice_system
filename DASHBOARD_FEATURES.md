# Dashboard Features Guide

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [☰] Hikey                                    Nov 20, 2025   │ ← Top Bar
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│  📊 Dash │  Dashboard                                        │
│  💰 Budg │  Welcome back! Here's your financial overview.   │
│  💳 Tran │                                                   │
│  🏦 Sink │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  💵 Payc │  │ Net  │ │Budget│ │Sinking│ │Goals │            │
│  🎯 Goal │  │Worth │ │Avail │ │ Funds│ │Progr │            │
│  📈 Net  │  └──────┘ └──────┘ └──────┘ └──────┘            │
│  📑 Repo │                                                   │
│  🧾 Invo │  ┌─────────────────┐ ┌─────────────────┐        │
│  👥 Cust │  │ Budget Overview │ │ Net Worth Chart │        │
│          │  │   [Bar Chart]   │ │   [Pie Chart]   │        │
│  ────────│  └─────────────────┘ └─────────────────┘        │
│  🚪 Logo │                                                   │
│          │  ┌─────────────────┐ ┌─────────────────┐        │
└──────────┤  │ Sinking Funds   │ │ Financial Goals │        │
 Sidebar   │  │  [Progress Bars]│ │  [Stats & Bar]  │        │
           │  └─────────────────┘ └─────────────────┘        │
           │                                                   │
           │  ┌──────┐ ┌──────┐ ┌──────┐                     │
           │  │Trans │ │Next  │ │Repor │                     │
           │  │actns │ │Paych │ │ ts   │                     │
           │  └──────┘ └──────┘ └──────┘                     │
           └───────────────────────────────────────────────────┘
```

## Dashboard Sections

### 1. Key Metrics (Top Row)
Four cards displaying critical financial metrics:

**Net Worth Card:**
- Large number showing total net worth
- Color: Green (positive) / Red (negative)
- Subtitle: Asset and liability counts
- Icon: 📈

**Budget Available Card:**
- Shows remaining budget amount
- Color: Green (under budget) / Red (over budget)
- Subtitle: Percentage remaining
- Icon: 💰

**Sinking Funds Card:**
- Total saved across all funds
- Color: Brand blue
- Subtitle: Number of active funds
- Icon: 🏦

**Goals Progress Card:**
- Number of active goals
- Color: Purple
- Subtitle: Completed goals count
- Icon: 🎯

### 2. Budget Overview (Chart Section)
**Bar Chart showing:**
- Income (Green bar)
- Allocated (Blue bar)
- Spent (Orange bar)

**Below chart:**
- Three columns with exact amounts
- Link to detailed budget page
- Empty state if no budget exists

### 3. Net Worth Breakdown (Chart Section)
**Pie Chart showing:**
- Assets (Green slice)
- Liabilities (Red slice)

**Below chart:**
- Two columns: Assets and Liabilities
- Item counts for each
- Link to net worth page
- Empty state with "Get Started" button

### 4. Sinking Funds (Progress Section)
**Display:**
- Two summary cards: Total Saved & Total Goal
- List of top 5 funds with progress bars
- Each fund shows: Name, Amount/Target, Progress bar
- Link to view all funds
- Empty state with "Create Fund" button

### 5. Financial Goals (Stats Section)
**Display:**
- Three stat cards: Total, Active, Completed
- Large progress card with:
  - Current amount saved
  - Target amount
  - Gradient progress bar
  - Percentage complete
- Link to goals page
- Empty state with "Create Goal" button

### 6. Quick Actions (Bottom Row)
Three action cards:

**Transactions:**
- Count for current month
- "View" button
- Links to transactions page

**Next Paycheck:**
- Amount and date
- "View" button
- Links to paychecks page

**Reports:**
- Icon display
- "View" button
- Links to reports page

## Color Coding System

### Status Colors:
- **Green (#10B981)**: Positive values, under budget, assets
- **Red (#EF4444)**: Negative values, over budget, liabilities
- **Blue (#0B6CF1)**: Primary brand, allocated amounts
- **Orange (#F59E0B)**: Spent amounts, warnings
- **Purple (#8B5CF6)**: Goals, special features
- **Gray (#6B7280)**: Neutral text, labels

### Background Colors:
- **White**: Main cards
- **Neutral-50**: Page background
- **Brand-50**: Accent backgrounds
- **Gradient**: Special highlight cards

## Interactive Elements

### Hover Effects:
- Cards lift up slightly (y: -4px)
- Shadow increases
- Smooth transition (300ms)

### Click Actions:
- All metric cards are clickable
- Links navigate to detailed pages
- Buttons have scale animation

### Progress Bars:
- Smooth width transitions
- Color changes based on progress
- Rounded corners

## Responsive Breakpoints

### Mobile (< 768px):
- Single column layout
- Sidebar collapses
- Stacked cards
- Simplified charts

### Tablet (768px - 1024px):
- 2-column grid
- Sidebar visible
- Medium-sized charts

### Desktop (> 1024px):
- 4-column grid for metrics
- 2-column for charts
- Full sidebar
- Large charts

## Empty States

Each section has a helpful empty state:

```
┌─────────────────────────────┐
│                             │
│    No budget for this       │
│         month               │
│                             │
│    [Create Budget]          │
│                             │
└─────────────────────────────┘
```

Features:
- Clear message
- Call-to-action button
- Centered layout
- Friendly tone

## Data Refresh

- Automatic refresh on page load
- React Query caching (5 minutes)
- Manual refresh available
- Loading skeletons during fetch

## Navigation Flow

From dashboard, users can navigate to:
1. Budget details → `/budgets/[id]`
2. Net worth → `/net-worth`
3. Sinking funds → `/sinking-funds`
4. Financial goals → `/financial-roadmap`
5. Transactions → `/transactions`
6. Paychecks → `/paychecks`
7. Reports → `/reports`

## Performance Tips

- Single API call for all data
- Efficient chart rendering
- Lazy loading of heavy components
- Optimized re-renders
- Cached query results

## Accessibility Features

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast compliance
- Screen reader support
