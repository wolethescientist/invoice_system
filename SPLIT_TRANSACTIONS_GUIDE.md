# Split Transactions Feature Guide

## Overview

The split transactions feature allows you to divide a single transaction across multiple budget categories. This is useful for purchases that span multiple spending areas (e.g., a grocery trip that includes both food and household items).

## Features

✅ Split a single transaction into multiple category allocations
✅ Real-time validation that splits equal the transaction total
✅ Visual feedback for split amount matching
✅ Maintain accurate category totals across split transactions
✅ Display split details in transaction list
✅ Filter transactions by category (includes splits)

## Database Schema

### Transactions Table Updates
- `is_split` (BOOLEAN): Flag indicating if transaction is split
- `category_id` (BIGINT, nullable): NULL for split transactions, category ID for regular transactions

### New Transaction Splits Table
```sql
transaction_splits (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT REFERENCES transactions(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES budget_categories(id),
    amount_cents INTEGER CHECK (amount_cents > 0),
    notes TEXT,
    created_at TIMESTAMPTZ
)
```

## Setup Instructions

### 1. Apply Database Migration

Run the Supabase migration:

```bash
# In Supabase SQL Editor, run:
backend/supabase_migrations/split_transactions.sql
```

This will:
- Add `is_split` column to transactions
- Make `category_id` nullable
- Create `transaction_splits` table
- Add indexes for performance
- Set up Row Level Security policies

### 2. Backend is Ready

The backend API has been updated to support:
- Creating split transactions
- Validating split amounts
- Querying transactions with splits
- Calculating category totals including splits

### 3. Frontend is Ready

The frontend UI includes:
- Split transaction toggle in transaction form
- Dynamic split entry form
- Real-time validation and visual feedback
- Split display in transaction list

## API Usage

### Create a Regular Transaction

```json
POST /api/transactions
{
  "budget_id": 1,
  "category_id": 5,
  "amount_cents": 5000,
  "date": "2024-01-15",
  "notes": "Grocery shopping",
  "is_split": false
}
```

### Create a Split Transaction

```json
POST /api/transactions
{
  "budget_id": 1,
  "category_id": null,
  "amount_cents": 10000,
  "date": "2024-01-15",
  "notes": "Target run",
  "is_split": true,
  "splits": [
    {
      "category_id": 5,
      "amount_cents": 6000,
      "notes": "Groceries"
    },
    {
      "category_id": 8,
      "amount_cents": 4000,
      "notes": "Household items"
    }
  ]
}
```

### Validation Rules

1. **Split amounts must equal transaction total**
   - Sum of all split amounts must exactly match the transaction amount
   - Backend validates this and returns 422 error if mismatch

2. **Split transactions require splits array**
   - If `is_split` is true, `splits` array must be provided
   - Must have at least one split

3. **Category validation**
   - All split categories must belong to the same budget
   - Regular transactions must have a category_id
   - Split transactions must have category_id = null

4. **Amount validation**
   - All amounts must be positive integers (cents)
   - Individual split amounts must be > 0

## Frontend Usage

### Creating a Split Transaction

1. Click "Add Transaction"
2. Select budget and enter amount
3. Check "Split across multiple categories"
4. The split form appears showing:
   - Total transaction amount
   - Current split total
   - Remaining amount
5. For each split:
   - Select category
   - Enter amount
   - Add optional notes
6. Add more splits with "+ Add Another Split"
7. Visual feedback shows:
   - ✅ Green when splits match total
   - ⚠️ Orange when splits don't match
   - ⚠️ Red when splits exceed total
8. Submit button disabled until splits are valid

### Viewing Split Transactions

Split transactions display with:
- Purple "SPLIT" badge
- "Multiple Categories" label
- Expandable list showing each split:
  - Category name
  - Split amount
  - Split notes (if any)
- Total transaction amount

### Filtering

When filtering by category:
- Shows regular transactions in that category
- Shows split transactions that include that category
- Displays which portion went to the filtered category

## Testing

Run the test script to verify functionality:

```bash
cd backend
python test_split_transactions.py
```

The test will:
1. Create a regular transaction
2. Create a valid split transaction
3. Test invalid split rejection
4. List all transactions
5. Verify budget summary calculations

## Budget Summary Calculations

Category totals now include:
- Regular transactions assigned to the category
- Split amounts allocated to the category

Example:
- Category "Groceries" allocated: $500
- Regular transaction: $50
- Split transaction portion: $60
- Total spent: $110
- Remaining: $390

## Best Practices

1. **Use splits for mixed purchases**
   - Grocery + household items
   - Gas + car wash
   - Restaurant + entertainment

2. **Add notes to splits**
   - Helps remember what each portion was for
   - Makes reviewing spending easier

3. **Keep splits simple**
   - Don't over-split small transactions
   - Use 2-4 categories typically
   - Round to whole dollars when possible

4. **Review split transactions**
   - Check category totals regularly
   - Ensure splits make sense
   - Adjust categories if needed

## Troubleshooting

### "Splits must equal transaction amount"
- Check that sum of splits exactly matches total
- Use cents (not dollars) in calculations
- Verify no rounding errors

### "Category not found in this budget"
- Ensure all split categories belong to selected budget
- Refresh category list if budget was just created

### Split form not appearing
- Enter transaction amount first
- Check "Split across multiple categories"
- Ensure budget has multiple categories

### Category totals incorrect
- Verify migration was applied
- Check that splits are being saved
- Review budget summary endpoint response

## Technical Details

### Performance Considerations

- Indexes on `transaction_id` and `category_id` in splits table
- Efficient queries using JOINs
- Batch loading of splits with transactions

### Security

- Row Level Security on transaction_splits table
- Users can only access their own transaction splits
- Category validation prevents cross-budget splits

### Data Integrity

- Foreign key constraints ensure referential integrity
- CASCADE delete removes splits when transaction deleted
- CHECK constraints enforce positive amounts
- Validation in both frontend and backend

## Future Enhancements

Potential improvements:
- Edit existing split transactions
- Convert regular transaction to split
- Split templates for common patterns
- Percentage-based splits
- Auto-calculate remaining split amount
- Split transaction reports
