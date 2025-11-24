-- Fix sinking_funds table column name
-- Rename target_amount_cents to target_cents to match the model

-- Check if the old column exists and rename it
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
    END IF;
END $$;

-- If target_cents doesn't exist yet, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sinking_funds' 
        AND column_name = 'target_cents'
    ) THEN
        ALTER TABLE sinking_funds 
        ADD COLUMN target_cents INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;
