-- COMPREHENSIVE FIX: Convert ALL integer boolean columns to proper BOOLEAN type
-- Run this in Supabase SQL Editor
-- This fixes: "operator does not exist: integer = boolean"

-- CRITICAL TABLES (from error messages)

-- 1. liabilities.is_active
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'liabilities' 
        AND column_name = 'is_active' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE liabilities 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
        RAISE NOTICE 'Fixed: liabilities.is_active';
    ELSE
        RAISE NOTICE 'Skip: liabilities.is_active (already boolean or not found)';
    END IF;
END $$;

-- 2. assets.is_active
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'is_active' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE assets 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
        RAISE NOTICE 'Fixed: assets.is_active';
    ELSE
        RAISE NOTICE 'Skip: assets.is_active (already boolean or not found)';
    END IF;
END $$;

-- 3. assets.is_liquid
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'is_liquid' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE assets 
        ALTER COLUMN is_liquid TYPE BOOLEAN USING (is_liquid::integer::boolean);
        RAISE NOTICE 'Fixed: assets.is_liquid';
    ELSE
        RAISE NOTICE 'Skip: assets.is_liquid (already boolean or not found)';
    END IF;
END $$;

-- 4. paychecks.is_active
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'paychecks' 
        AND column_name = 'is_active' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE paychecks 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
        RAISE NOTICE 'Fixed: paychecks.is_active';
    ELSE
        RAISE NOTICE 'Skip: paychecks.is_active (already boolean or not found)';
    END IF;
END $$;

-- 5. financial_goals.is_active
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_goals' 
        AND column_name = 'is_active' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE financial_goals 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
        RAISE NOTICE 'Fixed: financial_goals.is_active';
    ELSE
        RAISE NOTICE 'Skip: financial_goals.is_active (already boolean or not found)';
    END IF;
END $$;

-- 6. sinking_funds.is_active
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sinking_funds' 
        AND column_name = 'is_active' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE sinking_funds 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
        RAISE NOTICE 'Fixed: sinking_funds.is_active';
    ELSE
        RAISE NOTICE 'Skip: sinking_funds.is_active (already boolean or not found)';
    END IF;
END $$;

-- OTHER TABLES

-- 7. budget_categories.is_active
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budget_categories' 
        AND column_name = 'is_active' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE budget_categories 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
        RAISE NOTICE 'Fixed: budget_categories.is_active';
    ELSE
        RAISE NOTICE 'Skip: budget_categories.is_active (already boolean or not found)';
    END IF;
END $$;

-- 8. category_templates.is_active
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'category_templates' 
        AND column_name = 'is_active' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE category_templates 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
        RAISE NOTICE 'Fixed: category_templates.is_active';
    ELSE
        RAISE NOTICE 'Skip: category_templates.is_active (already boolean or not found)';
    END IF;
END $$;

-- 9. transactions.is_split
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'is_split' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE transactions 
        ALTER COLUMN is_split TYPE BOOLEAN USING (is_split::integer::boolean);
        RAISE NOTICE 'Fixed: transactions.is_split';
    ELSE
        RAISE NOTICE 'Skip: transactions.is_split (already boolean or not found)';
    END IF;
END $$;

-- 10. budgets.is_active
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' 
        AND column_name = 'is_active' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE budgets 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
        RAISE NOTICE 'Fixed: budgets.is_active';
    ELSE
        RAISE NOTICE 'Skip: budgets.is_active (already boolean or not found)';
    END IF;
END $$;

-- 11. customers.is_active
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'is_active' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE customers 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
        RAISE NOTICE 'Fixed: customers.is_active';
    ELSE
        RAISE NOTICE 'Skip: customers.is_active (already boolean or not found)';
    END IF;
END $$;

-- 12. invoices.is_paid
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'is_paid' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE invoices 
        ALTER COLUMN is_paid TYPE BOOLEAN USING (is_paid::integer::boolean);
        RAISE NOTICE 'Fixed: invoices.is_paid';
    ELSE
        RAISE NOTICE 'Skip: invoices.is_paid (already boolean or not found)';
    END IF;
END $$;

-- 13. paycheck_instances.is_received
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'paycheck_instances' 
        AND column_name = 'is_received' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE paycheck_instances 
        ALTER COLUMN is_received TYPE BOOLEAN USING (is_received::integer::boolean);
        RAISE NOTICE 'Fixed: paycheck_instances.is_received';
    ELSE
        RAISE NOTICE 'Skip: paycheck_instances.is_received (already boolean or not found)';
    END IF;
END $$;

-- VERIFICATION: Show all boolean-like columns and their types
SELECT 
    table_name, 
    column_name, 
    data_type,
    CASE 
        WHEN data_type = 'boolean' THEN '✅ CORRECT'
        WHEN data_type = 'integer' THEN '❌ STILL INTEGER'
        ELSE '⚠️ UNEXPECTED'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    column_name LIKE '%is_%' 
    OR column_name = 'is_paid'
    OR column_name = 'is_liquid'
    OR column_name = 'is_split'
    OR column_name = 'is_active'
    OR column_name = 'is_received'
)
ORDER BY 
    CASE WHEN data_type = 'integer' THEN 0 ELSE 1 END,
    table_name, 
    column_name;
