# Sinking Funds Feature Guide

## Overview

The Sinking Funds feature allows users to create and manage savings goals with target amounts, monthly contribution plans, and progress tracking. This is perfect for saving towards specific goals like emergency funds, vacations, car purchases, or any other planned expense.

## Features

### Core Functionality

1. **Create Sinking Funds**
   - Set a target amount
   - Define monthly contribution plan
   - Optional target date
   - Add description and color coding
   - Track active/inactive status

2. **Track Progress**
   - Visual progress bars
   - Percentage completion
   - Remaining amount calculation
   - Months to target projection
   - On-track status indicator

3. **Manage Contributions**
   - Add deposits
   - Record withdrawals (negative amounts)
   - Add notes to contributions
   - View contribution history
   - Delete contributions

4. **Summary Dashboard**
   - Total funds overview
   - Combined target amounts
   - Total saved across all funds
   - Overall progress percentage
   - Active funds count

## Backend API

### Endpoints

#### Sinking Funds

- `POST /api/sinking-funds` - Create a new fund
- `GET /api/sinking-funds` - List all funds
- `GET /api/sinking-funds/summary` - Get summary statistics
- `GET /api/sinking-funds/{id}` - Get fund details with contributions
- `GET /api/sinking-funds/{id}/progress` - Get detailed progress metrics
- `PUT /api/sinking-funds/{id}` - Update fund
- `DELETE /api/sinking-funds/{id}` - Delete fund

#### Contributions

- `POST /api/sinking-funds/{id}/contributions` - Add contribution
- `GET /api/sinking-funds/{id}/contributions` - List contributions
- `DELETE /api/sinking-funds/{id}/contributions/{contribution_id}` - Delete contribution

### Data Models

#### SinkingFund
```python
{
  "id": int,
  "user_id": int,
  "name": str,
  "target_cents": int,
  "current_balance_cents": int,
  "monthly_contribution_cents": int,
  "target_date": datetime (optional),
  "description": str (optional),
  "color": str (optional),
  "is_active": bool,
  "created_at": datetime,
  "updated_at": datetime
}
```

#### SinkingFundContribution
```python
{
  "id": int,
  "fund_id": int,
  "amount_cents": int,  # Positive for deposits, negative for withdrawals
  "contribution_date": datetime,
  "notes": str (optional),
  "created_at": datetime
}
```

#### SinkingFundProgress
```python
{
  "fund": SinkingFund,
  "progress_percentage": float,
  "remaining_cents": int,
  "months_to_target": float (optional),
  "on_track": bool,
  "total_contributed_cents": int,
  "contribution_count": int
}
```

## Frontend Components

### Pages

1. **`/sinking-funds`** - Main listing page
   - Summary cards
   - Fund grid with progress bars
   - Sort options
   - Quick actions

2. **`/sinking-funds/new`** - Create new fund
   - Form with validation
   - Target amount calculator
   - Projection display

3. **`/sinking-funds/{id}`** - Fund detail page
   - Progress overview
   - Contribution form
   - Contribution history
   - Status indicators

4. **`/sinking-funds/{id}/edit`** - Edit fund
   - Update all fund properties
   - Activate/deactivate fund

### API Client

The `SinkingFundsAPI` class provides methods for all API operations:

```typescript
// Create fund
await SinkingFundsAPI.createFund({
  name: "Emergency Fund",
  target_cents: 500000,
  monthly_contribution_cents: 50000
})

// List funds
const funds = await SinkingFundsAPI.listFunds()

// Get progress
const progress = await SinkingFundsAPI.getFundProgress(fundId)

// Add contribution
await SinkingFundsAPI.addContribution(fundId, {
  amount_cents: 50000,
  notes: "Monthly contribution"
})
```

### Utility Functions

The `SinkingFundUtils` object provides helper functions:

- `formatCurrency(cents)` - Format cents as currency
- `calculateProgress(current, target)` - Calculate percentage
- `calculateMonthsToTarget(remaining, monthly)` - Project completion
- `getProgressColor(percentage)` - Get color based on progress
- `validateFund(data)` - Validate fund data

## Database Schema

### Tables

#### sinking_funds
```sql
CREATE TABLE sinking_funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_cents INTEGER NOT NULL,
    current_balance_cents INTEGER NOT NULL DEFAULT 0,
    monthly_contribution_cents INTEGER NOT NULL DEFAULT 0,
    target_date DATETIME,
    description TEXT,
    color VARCHAR(50),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sinking_fund_user ON sinking_funds(user_id, is_active);
```

#### sinking_fund_contributions
```sql
CREATE TABLE sinking_fund_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fund_id INTEGER NOT NULL,
    amount_cents INTEGER NOT NULL,
    contribution_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fund_id) REFERENCES sinking_funds(id) ON DELETE CASCADE
);

CREATE INDEX idx_contribution_fund_date ON sinking_fund_contributions(fund_id, contribution_date);
```

## Setup Instructions

### 1. Run Database Migration

```bash
# Windows
python backend\migrate_sinking_funds.py

# Linux/Mac
python backend/migrate_sinking_funds.py
```

### 2. Start Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Test the API

```bash
python backend/test_sinking_funds.py
```

## Usage Examples

### Creating a Fund

1. Navigate to `/sinking-funds`
2. Click "Create New Fund"
3. Fill in:
   - Name: "Emergency Fund"
   - Target: $5,000
   - Monthly Contribution: $500
   - Target Date: (optional)
   - Description: "6 months expenses"
4. Click "Create Fund"

### Adding Contributions

1. Open a fund detail page
2. Click "Add Contribution"
3. Enter amount (positive for deposit, negative for withdrawal)
4. Add optional notes
5. Click "Add Contribution"

### Tracking Progress

The system automatically calculates:
- Current balance
- Progress percentage
- Remaining amount
- Months to target (based on monthly contribution)
- On-track status (if target date is set)

### Visual Indicators

- **Progress bars**: Color-coded based on completion
  - Red: 0-25%
  - Orange: 25-50%
  - Yellow: 50-75%
  - Blue: 75-100%
  - Green: 100%+

- **On-track status**: 
  - Green: On track to meet target date
  - Orange: Behind schedule

## Best Practices

1. **Set Realistic Goals**: Base target amounts on actual needs
2. **Regular Contributions**: Set up automatic monthly contributions
3. **Track Everything**: Record all deposits and withdrawals
4. **Use Descriptions**: Add context to help remember the purpose
5. **Color Coding**: Use colors to quickly identify fund types
6. **Review Progress**: Check monthly to stay motivated
7. **Adjust as Needed**: Update monthly contributions if circumstances change

## Integration with Budgets

Sinking funds can be integrated with your budget system:

1. Create a budget category for each sinking fund
2. Allocate the monthly contribution amount
3. When you contribute to the fund, record it as a transaction
4. Track both in the budget and sinking fund for complete visibility

## Future Enhancements

Potential features to add:

- Automatic contributions from budget categories
- Recurring contribution schedules
- Fund templates for common goals
- Charts and graphs for progress visualization
- Goal milestones and celebrations
- Export/import fund data
- Shared funds for family goals
- Interest calculation for savings accounts
- Integration with bank accounts

## Troubleshooting

### Fund not updating after contribution
- Check that the contribution was successfully added
- Refresh the page
- Verify the amount is correct (cents, not dollars)

### Progress calculation seems wrong
- Ensure target_cents is set correctly
- Check that current_balance_cents matches total contributions
- Verify no contributions were deleted

### Can't delete a contribution
- Ensure you have permission (must be fund owner)
- Check that the contribution exists
- Verify it won't make the balance negative

## API Testing

Use the provided test script to verify all endpoints:

```bash
python backend/test_sinking_funds.py
```

This will:
1. Create test user
2. Create multiple funds
3. Add contributions
4. Test all CRUD operations
5. Verify calculations
6. Clean up test data

## Support

For issues or questions:
1. Check this guide
2. Review API documentation
3. Check backend logs
4. Test with the provided test script
5. Verify database schema is correct
