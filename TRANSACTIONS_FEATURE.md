# Transaction Tracking Feature

## Overview
Manual transaction tracking feature with full CRUD operations, linked to budgets and categories. Includes live validation, real-time budget updates, and spending visualization.

## Backend Implementation

### Database Model
**File:** `backend/app/models/transaction.py`

```python
class Transaction:
    - id: Primary key
    - user_id: Foreign key to users
    - budget_id: Foreign key to budgets
    - category_id: Foreign key to budget_categories
    - amount_cents: Transaction amount (stored as cents)
    - date: Transaction date
    - notes: Optional notes
    - created_at: Timestamp
    - updated_at: Timestamp
```

### API Endpoints
**File:** `backend/app/api/transactions.py`

- `POST /api/transactions` - Create new transaction
- `GET /api/transactions` - List transactions with filters
  - Query params: `budget_id`, `category_id`, `start_date`, `end_date`, `limit`
- `GET /api/transactions/{id}` - Get single transaction
- `GET /api/transactions/budget/{budget_id}/summary` - Get spending summary by category
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Validation
**File:** `backend/app/schemas/transaction.py`

- Amount must be greater than 0
- Date is required
- Category must belong to the selected budget
- Budget must belong to the authenticated user

### Migration
**File:** `backend/migrate_transactions.py`

Run to create the transactions table:
```bash
python backend/migrate_transactions.py
```

## Frontend Implementation

### Transaction Management Page
**File:** `frontend/src/app/transactions/page.tsx`

Features:
- Add new transactions with inline form
- Live validation for amounts and dates
- Filter by budget and category
- View recent transactions list
- Delete transactions
- Real-time updates

Form Fields:
- Budget selector (dropdown)
- Category selector (filtered by budget)
- Amount input with $ prefix
- Date picker (max: today)
- Optional notes textarea

Validation:
- Amount must be > 0
- Date cannot be in the future
- Budget and category are required
- Live validation on blur

### Budget Detail Page Enhancement
**File:** `frontend/src/app/budgets/[id]/page.tsx`

Added Features:
- Category spending visualization
- Progress bars showing spent vs allocated
- Color-coded indicators:
  - Green: < 90% spent
  - Yellow: 90-100% spent
  - Red: > 100% spent (over budget)
- "Add Transaction" button
- Real-time spending updates

### Navigation
**File:** `frontend/src/components/DashboardLayout.tsx`

Added "Transactions" link to main navigation.

## Testing

### Backend Tests
**File:** `backend/test_transactions.py`

Run tests:
```bash
python backend/test_transactions.py
```

Tests cover:
1. User authentication
2. Budget creation
3. Transaction creation
4. Listing transactions
5. Filtering by budget
6. Filtering by category
7. Budget spending summary
8. Transaction updates
9. Single transaction retrieval
10. Transaction deletion

## Usage Flow

### Creating a Transaction
1. Navigate to Transactions page
2. Click "Add Transaction"
3. Select budget (loads categories)
4. Select category
5. Enter amount (validated live)
6. Select date (max: today)
7. Add optional notes
8. Click "Add Transaction"
9. Transaction appears in list immediately
10. Budget page updates automatically

### Viewing Spending
1. Navigate to Budgets
2. Click on a budget
3. View category spending with progress bars
4. See allocated vs spent amounts
5. Monitor remaining budget per category

### Filtering Transactions
1. On Transactions page
2. Use budget filter dropdown
3. Use category filter dropdown
4. View filtered results
5. Filters persist until changed

## Key Features

### Live Validation
- Amount validation on blur
- Date validation (no future dates)
- Category validation (must belong to budget)
- Form-level validation before submit

### Real-time Updates
- Budget page auto-refreshes every 30 seconds
- Transaction list updates immediately after create/delete
- Spending summary recalculates on each view

### Visual Indicators
- Progress bars for category spending
- Color-coded status (green/yellow/red)
- Percentage spent display
- Remaining amount calculation

### Data Integrity
- Transactions linked to user accounts
- Categories validated against budgets
- Cascade delete (deleting budget removes transactions)
- Indexed queries for performance

## Database Indexes
For optimal performance:
- `idx_transactions_user_id`
- `idx_transactions_budget_id`
- `idx_transactions_category_id`
- `idx_transactions_date`

## API Response Examples

### Create Transaction
```json
POST /api/transactions
{
  "budget_id": 1,
  "category_id": 5,
  "amount_cents": 4599,
  "date": "2025-11-18",
  "notes": "Grocery shopping"
}

Response: 201 Created
{
  "id": 1,
  "user_id": 1,
  "budget_id": 1,
  "category_id": 5,
  "amount_cents": 4599,
  "date": "2025-11-18",
  "notes": "Grocery shopping",
  "created_at": "2025-11-18T10:30:00",
  "updated_at": "2025-11-18T10:30:00"
}
```

### List Transactions
```json
GET /api/transactions?budget_id=1&limit=10

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "budget_id": 1,
    "category_id": 5,
    "category_name": "Groceries",
    "amount_cents": 4599,
    "date": "2025-11-18",
    "notes": "Grocery shopping",
    "created_at": "2025-11-18T10:30:00",
    "updated_at": "2025-11-18T10:30:00"
  }
]
```

### Budget Summary
```json
GET /api/transactions/budget/1/summary

Response: 200 OK
{
  "budget_id": 1,
  "categories": [
    {
      "category_id": 5,
      "category_name": "Groceries",
      "allocated_cents": 50000,
      "spent_cents": 12849,
      "remaining_cents": 37151
    }
  ]
}
```

## Security
- All endpoints require authentication
- Users can only access their own transactions
- Budget/category ownership validated on create/update
- SQL injection prevention via SQLAlchemy ORM

## Performance Considerations
- Indexed queries for fast filtering
- Limit parameter to prevent large result sets
- Efficient joins for category names
- Cached budget summaries (30s refresh)

## Future Enhancements
- Transaction editing UI
- Bulk import from CSV
- Recurring transactions
- Transaction search
- Export to PDF/Excel
- Transaction attachments (receipts)
- Split transactions across categories
- Transaction tags/labels
