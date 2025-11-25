# Boolean Column Migration Guide

## Problem
PostgreSQL was throwing errors when comparing columns:
- `operator does not exist: boolean = integer` 
- `operator does not exist: integer = boolean`

This happened because of a mismatch between:
1. **Database schema**: Some columns were INTEGER, some were BOOLEAN
2. **SQLAlchemy models**: Defined as Integer for SQLite compatibility
3. **Query code**: Using both `== 1` and `== True` comparisons

## Solution

### Step 1: Run the Database Migration

This script converts all INTEGER boolean-like columns to proper BOOLEAN type in PostgreSQL:

```bash
cd backend
python migrate_to_boolean.py
```

The migration will convert these columns:
- `assets.is_active` (INTEGER → BOOLEAN)
- `assets.is_liquid` (INTEGER → BOOLEAN)
- `liabilities.is_active` (INTEGER → BOOLEAN)
- `sinking_funds.is_active` (INTEGER → BOOLEAN)
- `paychecks.is_active` (INTEGER → BOOLEAN)
- `financial_goals.is_active` (INTEGER → BOOLEAN)
- `category_templates.is_active` (INTEGER → BOOLEAN)
- `budget_categories.is_active` (INTEGER → BOOLEAN)
- `transactions.is_split` (INTEGER → BOOLEAN, if exists)
- `budgets.is_active` (INTEGER → BOOLEAN, if exists)
- `customers.is_active` (INTEGER → BOOLEAN, if exists)
- `invoices.is_paid` (INTEGER → BOOLEAN, if exists)

### Step 2: Updated Models

All SQLAlchemy models have been updated to use `Column(Boolean, default=True)` instead of `Column(Integer, default=1)`:

- ✅ `backend/app/models/sinking_fund.py`
- ✅ `backend/app/models/paycheck.py`
- ✅ `backend/app/models/net_worth.py` (Asset and Liability)
- ✅ `backend/app/models/financial_goal.py`
- ✅ `backend/app/models/budget.py` (BudgetCategory)
- ✅ `backend/app/models/category_template.py` (already Boolean)

### Step 3: Updated Query Code

All queries have been updated to use `== True` instead of `== 1`:

- ✅ `backend/app/api/budgets.py`
- ✅ `backend/app/api/metrics.py`
- ✅ `backend/app/api/net_worth.py`
- ✅ `backend/app/services/category_suggestion.py`

## Verification

After running the migration, verify the column types:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public'
AND (column_name LIKE '%is_%' OR column_name = 'is_paid')
AND table_name IN (
    'assets', 'liabilities', 'sinking_funds', 'paychecks', 
    'financial_goals', 'category_templates', 'budget_categories',
    'transactions', 'budgets', 'customers', 'invoices'
)
ORDER BY table_name, column_name;
```

All columns should show `data_type = 'boolean'`.

## Manual Migration (Alternative)

If you prefer to run the SQL directly in Supabase SQL Editor:

1. Go to your Supabase project → SQL Editor
2. Copy the contents of `backend/supabase_migrations/convert_to_boolean.sql`
3. Run the SQL script
4. Verify the changes

## Troubleshooting

### Error: "cannot cast type integer to boolean"
This means the column is already BOOLEAN. The migration is safe to re-run.

### Error: "column does not exist"
Some tables may not exist in your database. The migration uses conditional logic to skip missing tables.

### Data Integrity
The migration uses `USING (column::integer::boolean)` which converts:
- `0` → `false`
- `1` → `true`
- `NULL` → `NULL`

All existing data will be preserved correctly.

## Benefits

After this migration:
- ✅ Proper type safety in PostgreSQL
- ✅ Consistent boolean semantics across the codebase
- ✅ Better query performance (boolean comparisons are faster)
- ✅ No more type mismatch errors
- ✅ Clearer intent in code (`True`/`False` vs `1`/`0`)

## Files Created

1. `backend/supabase_migrations/convert_to_boolean.sql` - SQL migration script
2. `backend/migrate_to_boolean.py` - Python migration runner with verification
3. `BOOLEAN_MIGRATION_GUIDE.md` - This guide
