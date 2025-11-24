# Database Schema Fix Summary

## Issues Fixed

The application was experiencing multiple database-related errors due to inconsistencies between model definitions, schemas, and API code. This fix addresses all of these issues.

## Errors Resolved

1. **SinkingFund**: `'SinkingFund' object has no attribute 'target_amount_cents'`
   - Model had `target_cents` but code expected `target_amount_cents`

2. **Asset/Liability**: `operator does not exist: integer = boolean`
   - Code was using `is_active == True` but column is INTEGER (0 or 1)

3. **FinancialGoal**: `type object 'FinancialGoal' has no attribute 'is_active'`
   - Model was missing the `is_active` column

4. **Paycheck**: `type object 'Paycheck' has no attribute 'pay_date'`
   - Model had `next_date` but code expected `pay_date`
   - Model had `amount_cents` but code expected `net_amount_cents`

## Changes Made

### 1. Model Updates

#### `backend/app/models/sinking_fund.py`
- Renamed `target_cents` → `target_amount_cents`

#### `backend/app/models/net_worth.py`
- Renamed `current_value` → `current_value_cents` (Asset)
- Changed type from Float to Integer for cents
- Renamed `current_balance` → `current_balance_cents` (Liability)
- Renamed `minimum_payment` → `minimum_payment_cents` (Liability)
- Changed types from Float to Integer for cents

#### `backend/app/models/financial_goal.py`
- Renamed `target_amount` → `target_amount_cents`
- Renamed `current_amount` → `current_amount_cents`
- Renamed `monthly_contribution` → `monthly_contribution_cents`
- Changed types from Float to Integer for cents
- Added `is_active` column (INTEGER, default 1)

#### `backend/app/models/paycheck.py`
- Renamed `amount_cents` → `net_amount_cents`
- Renamed `next_date` → `pay_date`

### 2. Schema Updates

Updated all Pydantic schemas to match the new model field names:
- `backend/app/schemas/sinking_fund.py`
- `backend/app/schemas/net_worth.py`
- `backend/app/schemas/financial_goal.py`
- `backend/app/schemas/paycheck.py`

### 3. API Updates

#### `backend/app/api/metrics.py`
- Fixed boolean comparisons: `is_active == True` → `is_active == 1`
- Fixed status comparisons: `g.status == 'in_progress'` → `g.status.value == 'active'`
- Updated field references to use new column names

#### `backend/app/api/paychecks.py`
- Updated all references from `amount_cents` → `net_amount_cents`
- Updated all references from `next_date` → `pay_date`

### 4. Database Migration

Created migration files to update the database schema:

#### `backend/supabase_migrations/fix_column_names.sql`
- SQL migration script with all column renames and type changes

#### `backend/migrate_column_names.py`
- Python migration script that safely applies the changes
- Checks for existing columns before attempting changes
- Uses transactions for safety

## How to Apply the Fix

### Option 1: Run the Python Migration Script (Recommended)

```bash
cd backend
python migrate_column_names.py
```

This script will:
- Check which columns need to be updated
- Apply only the necessary changes
- Use transactions to ensure data integrity
- Provide clear feedback on what was changed

### Option 2: Run the SQL Migration Manually

```bash
cd backend
psql -d your_database -f supabase_migrations/fix_column_names.sql
```

### Option 3: Restart with Fresh Database

If you're in development and don't need to preserve data:

```bash
cd backend
python init_db.py  # This will recreate all tables with correct schema
python seed.py     # Optional: add sample data
```

## Verification

After applying the migration, restart your backend server and check:

1. Dashboard metrics should load without errors
2. Sinking funds should display correctly
3. Net worth assets and liabilities should work
4. Financial goals should be accessible
5. Paycheck planning should function properly

## Notes

- All monetary values are now consistently stored as INTEGER cents (not DECIMAL/FLOAT)
- Boolean values in SQLite/PostgreSQL are stored as INTEGER (0 or 1)
- The migration preserves existing data by converting values appropriately
- Indexes are updated to match new column names
