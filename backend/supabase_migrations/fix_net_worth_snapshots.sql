-- Fix missing columns in net_worth_snapshots table
-- This adds the total_assets and total_liabilities columns if they don't exist

-- Add total_assets column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'net_worth_snapshots' 
        AND column_name = 'total_assets'
    ) THEN
        ALTER TABLE net_worth_snapshots 
        ADD COLUMN total_assets DECIMAL(15, 2) NOT NULL DEFAULT 0.0;
    END IF;
END $$;

-- Add total_liabilities column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'net_worth_snapshots' 
        AND column_name = 'total_liabilities'
    ) THEN
        ALTER TABLE net_worth_snapshots 
        ADD COLUMN total_liabilities DECIMAL(15, 2) NOT NULL DEFAULT 0.0;
    END IF;
END $$;

-- Add liquid_assets column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'net_worth_snapshots' 
        AND column_name = 'liquid_assets'
    ) THEN
        ALTER TABLE net_worth_snapshots 
        ADD COLUMN liquid_assets DECIMAL(15, 2) DEFAULT 0.0;
    END IF;
END $$;

-- Update existing records to calculate values from net_worth
-- Assuming net_worth = total_assets - total_liabilities
-- We'll set total_assets = net_worth and total_liabilities = 0 for existing records
UPDATE net_worth_snapshots 
SET 
    total_assets = COALESCE(net_worth, 0.0),
    total_liabilities = 0.0,
    liquid_assets = COALESCE(liquid_assets, 0.0)
WHERE total_assets = 0.0 AND total_liabilities = 0.0;
