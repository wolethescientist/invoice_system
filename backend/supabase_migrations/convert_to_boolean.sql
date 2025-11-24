-- Migration to convert all is_active columns from INTEGER to BOOLEAN
-- This fixes the "operator does not exist: integer = boolean" error

-- Convert assets.is_active
ALTER TABLE assets 
ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);

-- Convert assets.is_liquid
ALTER TABLE assets 
ALTER COLUMN is_liquid TYPE BOOLEAN USING (is_liquid::integer::boolean);

-- Convert liabilities.is_active
ALTER TABLE liabilities 
ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);

-- Convert sinking_funds.is_active
ALTER TABLE sinking_funds 
ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);

-- Convert paychecks.is_active
ALTER TABLE paychecks 
ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);

-- Convert financial_goals.is_active
ALTER TABLE financial_goals 
ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);

-- Convert category_templates.is_active
ALTER TABLE category_templates 
ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);

-- Convert budget_categories.is_active
ALTER TABLE budget_categories 
ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);

-- Convert transactions.is_split (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'is_split'
    ) THEN
        ALTER TABLE transactions 
        ALTER COLUMN is_split TYPE BOOLEAN USING (is_split::integer::boolean);
    END IF;
END $$;

-- Convert budgets.is_active (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE budgets 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
    END IF;
END $$;

-- Convert customers.is_active (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE customers 
        ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer::boolean);
    END IF;
END $$;

-- Convert invoices.is_paid (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'is_paid'
    ) THEN
        ALTER TABLE invoices 
        ALTER COLUMN is_paid TYPE BOOLEAN USING (is_paid::integer::boolean);
    END IF;
END $$;
