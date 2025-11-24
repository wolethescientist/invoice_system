# Quick Fix for Supabase Dashboard Metrics

## The Problem
Your dashboard metrics endpoint has multiple column name mismatches:

1. **sinking_funds**: `target_amount_cents` → should be `target_cents`
2. **assets**: `current_value` → should be `current_value_cents`
3. **liabilities**: `current_balance` → should be `current_balance_cents`
4. **liabilities**: `minimum_payment` → should be `minimum_payment_cents`
5. **paychecks**: `amount_cents` → should be `net_amount_cents`
6. **paychecks**: `next_date` → should be `pay_date`

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run This SQL
Copy the entire contents of `backend/supabase_migrations/fix_all_column_names.sql` and run it.

Or copy this quick version:

```sql
-- Fix all column names at once
DO $$
BEGIN
    -- sinking_funds
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sinking_funds' AND column_name = 'target_amount_cents') THEN
        ALTER TABLE sinking_funds RENAME COLUMN target_amount_cents TO target_cents;
    END IF;
    
    -- assets
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'current_value') THEN
        ALTER TABLE assets RENAME COLUMN current_value TO current_value_cents;
    END IF;
    
    -- liabilities
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'liabilities' AND column_name = 'current_balance') THEN
        ALTER TABLE liabilities RENAME COLUMN current_balance TO current_balance_cents;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'liabilities' AND column_name = 'minimum_payment') THEN
        ALTER TABLE liabilities RENAME COLUMN minimum_payment TO minimum_payment_cents;
    END IF;
    
    -- paychecks
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paychecks' AND column_name = 'amount_cents') THEN
        ALTER TABLE paychecks RENAME COLUMN amount_cents TO net_amount_cents;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paychecks' AND column_name = 'next_date') THEN
        ALTER TABLE paychecks RENAME COLUMN next_date TO pay_date;
        DROP INDEX IF EXISTS idx_paychecks_next_date;
        CREATE INDEX IF NOT EXISTS idx_paychecks_pay_date ON paychecks(pay_date);
    END IF;
    
    RAISE NOTICE '✅ All columns fixed!';
END $$;
```

### Step 3: Verify
Run this to confirm all fixes:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE (table_name = 'sinking_funds' AND column_name = 'target_cents')
   OR (table_name = 'assets' AND column_name = 'current_value_cents')
   OR (table_name = 'liabilities' AND column_name IN ('current_balance_cents', 'minimum_payment_cents'))
   OR (table_name = 'paychecks' AND column_name IN ('net_amount_cents', 'pay_date'))
ORDER BY table_name, column_name;
```

You should see all the correct column names listed.

### Step 4: Test Your API
Your dashboard metrics endpoint should now work without errors:

```bash
GET /api/metrics/dashboard
```

The response should return 200 OK with complete data for all sections.

## What Caused This?

The `fix_column_names.sql` migration had bugs that renamed columns in the wrong direction. The original table definitions were correct, but this migration changed them to incorrect names. This has been fixed in the codebase, but if you already ran that migration, you need to apply this fix to rename them back.

## Files Updated

The following files have been corrected to use `target_cents`:
- ✅ `backend/app/models/sinking_fund.py`
- ✅ `backend/app/schemas/sinking_fund.py`
- ✅ `backend/app/api/sinking_funds.py`
- ✅ `backend/app/api/metrics.py`

## Need More Details?

See `DASHBOARD_METRICS_FIX.md` for the complete technical explanation.
