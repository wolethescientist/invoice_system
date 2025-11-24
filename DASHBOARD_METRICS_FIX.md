# Dashboard Metrics API Fix

## Issues Fixed

The dashboard metrics endpoint (`/api/metrics/dashboard`) was failing with multiple errors:

### 1. Sinking Funds Column Mismatch
**Error**: `column sinking_funds.target_cents does not exist`

**Root Cause**: The database had `target_amount_cents` but the model was querying for `target_cents`

**Fix**:
- Updated `SinkingFund` model to use `target_cents` column name
- Updated `SinkingFundBase` and `SinkingFundUpdate` schemas to use `target_cents`
- Created migration script to rename the database column

### 2. UnboundLocalError in Metrics API
**Error**: `cannot access local variable 'sinking_funds' where it is not associated with a value`

**Root Cause**: The `sinking_funds` variable was only initialized inside a try block, but referenced outside when an exception occurred

**Fix**:
- Initialize `sinking_funds = []` before the try block
- This ensures the variable exists even if the query fails

### 3. Boolean Filter Issues
**Error**: Various filtering issues with `is_active` columns

**Root Cause**: Mixing integer (0/1) and boolean (True/False) comparisons

**Fixes**:
- **Sinking Funds**: Changed filter from `is_active == 1` to `is_active == True`
- **Assets/Liabilities**: Changed filter from `is_active == 1` to `is_active == True`
- **Financial Goals**: Kept as integer comparison since the column is defined as Integer
- **Paychecks**: Added `is_active == True` filter for consistency

### 4. Financial Goals is_active Handling
**Error**: `type object 'FinancialGoal' has no attribute 'is_active'`

**Root Cause**: Trying to filter by `is_active` in the query when it's an Integer column (0/1)

**Fix**:
- Query all goals first without `is_active` filter
- Filter in Python: `active_records = [g for g in goals if g.is_active == 1]`
- Then filter by status for active/completed counts

## Files Modified

### Backend Models
- `backend/app/models/sinking_fund.py` - Changed `target_amount_cents` to `target_cents`

### Backend Schemas
- `backend/app/schemas/sinking_fund.py` - Updated field names to match model

### Backend APIs
- `backend/app/api/metrics.py` - Fixed all filtering and variable initialization issues

### Migrations
- `backend/supabase_migrations/fix_sinking_funds_column.sql` - SQL migration
- `backend/migrate_sinking_funds_column.py` - Python migration script

## How to Apply (Supabase)

### Important Note
There is an old migration script `backend/migrate_column_names.py` that does the OPPOSITE (renames `target_cents` to `target_amount_cents`). **Do not run that script** as it conflicts with this fix.

### Option 1: Supabase Dashboard SQL Editor (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `backend/supabase_migrations/fix_sinking_funds_column.sql`
5. Click **Run**

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push

# Or apply the specific migration
psql $DATABASE_URL -f backend/supabase_migrations/fix_sinking_funds_column.sql
```

### Option 3: Direct SQL (Quick Fix)
Run this in Supabase SQL Editor:
```sql
-- Check if column needs renaming
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sinking_funds' 
        AND column_name = 'target_amount_cents'
    ) THEN
        ALTER TABLE sinking_funds 
        RENAME COLUMN target_amount_cents TO target_cents;
        RAISE NOTICE 'Column renamed successfully';
    ELSE
        RAISE NOTICE 'Column already named target_cents or does not exist';
    END IF;
END $$;
```

### Verification
After running the migration, verify the column exists:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sinking_funds' 
AND column_name = 'target_cents';
```

Expected result: Should show `target_cents` with type `integer`

## Testing

After applying the migration, test the dashboard metrics endpoint:

```bash
# Login first
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get dashboard metrics
curl http://localhost:8000/api/metrics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response should include:
- `budget` - Current month budget metrics
- `transactions` - Transaction count for current month
- `sinking_funds` - Sinking funds summary with fund details
- `net_worth` - Assets, liabilities, and net worth totals
- `goals` - Financial goals summary
- `paychecks` - Upcoming paycheck information

## Notes

- The fix maintains backward compatibility by using SQL migrations that check for column existence
- All boolean filters now consistently use `True/False` instead of mixing with `1/0`
- Error handling ensures partial data is returned even if individual sections fail
- The `sinking_funds` variable initialization prevents UnboundLocalError
