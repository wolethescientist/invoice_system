-- Comprehensive fix for all column name mismatches
-- Run this in Supabase SQL Editor to fix all database schema issues

-- 1. Fix sinking_funds table (if it has wrong column name)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sinking_funds' 
        AND column_name = 'target_amount_cents'
    ) THEN
        ALTER TABLE sinking_funds 
        RENAME COLUMN target_amount_cents TO target_cents;
        RAISE NOTICE '✅ sinking_funds: Renamed target_amount_cents to target_cents';
    ELSE
        RAISE NOTICE 'ℹ️ sinking_funds: Column already correct';
    END IF;
END $$;

-- 2. Fix assets table (if it has wrong column name)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'current_value'
    ) THEN
        -- Check if it's already in cents or needs conversion
        ALTER TABLE assets 
        RENAME COLUMN current_value TO current_value_cents;
        RAISE NOTICE '✅ assets: Renamed current_value to current_value_cents';
        
        -- Note: If values need to be converted from dollars to cents, run:
        -- UPDATE assets SET current_value_cents = current_value_cents * 100;
    ELSE
        RAISE NOTICE 'ℹ️ assets: Column already correct';
    END IF;
END $$;

-- 3. Fix liabilities table (if it has wrong column names)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'liabilities' 
        AND column_name = 'current_balance'
    ) THEN
        ALTER TABLE liabilities 
        RENAME COLUMN current_balance TO current_balance_cents;
        RAISE NOTICE '✅ liabilities: Renamed current_balance to current_balance_cents';
    ELSE
        RAISE NOTICE 'ℹ️ liabilities: current_balance already correct';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'liabilities' 
        AND column_name = 'minimum_payment'
    ) THEN
        ALTER TABLE liabilities 
        RENAME COLUMN minimum_payment TO minimum_payment_cents;
        RAISE NOTICE '✅ liabilities: Renamed minimum_payment to minimum_payment_cents';
    ELSE
        RAISE NOTICE 'ℹ️ liabilities: minimum_payment already correct';
    END IF;
END $$;

-- 4. Fix paychecks table (if it has wrong column names)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'paychecks' 
        AND column_name = 'amount_cents'
    ) THEN
        ALTER TABLE paychecks 
        RENAME COLUMN amount_cents TO net_amount_cents;
        RAISE NOTICE '✅ paychecks: Renamed amount_cents to net_amount_cents';
    ELSE
        RAISE NOTICE 'ℹ️ paychecks: amount_cents already correct';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'paychecks' 
        AND column_name = 'next_date'
    ) THEN
        ALTER TABLE paychecks 
        RENAME COLUMN next_date TO pay_date;
        RAISE NOTICE '✅ paychecks: Renamed next_date to pay_date';
        
        -- Update index
        DROP INDEX IF EXISTS idx_paychecks_next_date;
        CREATE INDEX IF NOT EXISTS idx_paychecks_pay_date ON paychecks(pay_date);
    ELSE
        RAISE NOTICE 'ℹ️ paychecks: next_date already correct';
    END IF;
END $$;

-- 5. Verify all columns are correct
SELECT 
    'sinking_funds' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'sinking_funds' 
AND column_name IN ('target_cents', 'target_amount_cents')

UNION ALL

SELECT 
    'assets' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'assets' 
AND column_name IN ('current_value', 'current_value_cents')

UNION ALL

SELECT 
    'liabilities' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'liabilities' 
AND column_name IN ('current_balance', 'current_balance_cents', 'minimum_payment', 'minimum_payment_cents')

UNION ALL

SELECT 
    'paychecks' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'paychecks' 
AND column_name IN ('amount_cents', 'net_amount_cents', 'next_date', 'pay_date')

ORDER BY table_name, column_name;
