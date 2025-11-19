-- Migration: Add split transaction support
-- Description: Adds ability to split a single transaction across multiple budget categories

-- Add is_split column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_split BOOLEAN DEFAULT FALSE NOT NULL;

-- Make category_id nullable for split transactions (it will be NULL when is_split is TRUE)
ALTER TABLE transactions 
ALTER COLUMN category_id DROP NOT NULL;

-- Create transaction_splits table
CREATE TABLE IF NOT EXISTS transaction_splits (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES budget_categories(id),
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction_id 
ON transaction_splits(transaction_id);

CREATE INDEX IF NOT EXISTS idx_transaction_splits_category_id 
ON transaction_splits(category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_is_split 
ON transactions(is_split);

-- Note: RLS policies are not added here because user_id is INTEGER, not UUID
-- Authorization is handled at the application level in the FastAPI backend
-- If you need RLS, you would need to either:
-- 1. Use a mapping table between auth.uid() (UUID) and users.id (INTEGER)
-- 2. Or convert user_id columns to UUID type throughout the schema

-- Create trigger function to validate split category belongs to transaction's budget
CREATE OR REPLACE FUNCTION validate_split_category_budget()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the category belongs to the same budget as the transaction
    IF NOT EXISTS (
        SELECT 1 
        FROM transactions t
        JOIN budget_categories bc ON bc.budget_id = t.budget_id
        WHERE t.id = NEW.transaction_id 
        AND bc.id = NEW.category_id
    ) THEN
        RAISE EXCEPTION 'Category must belong to the same budget as the transaction';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate on insert and update
DROP TRIGGER IF EXISTS validate_split_category_budget_trigger ON transaction_splits;
CREATE TRIGGER validate_split_category_budget_trigger
    BEFORE INSERT OR UPDATE ON transaction_splits
    FOR EACH ROW
    EXECUTE FUNCTION validate_split_category_budget();

-- Add comments for documentation
COMMENT ON TABLE transaction_splits IS 'Stores individual category splits for transactions that are divided across multiple budget categories';
COMMENT ON COLUMN transactions.is_split IS 'Flag indicating if this transaction is split across multiple categories';
COMMENT ON COLUMN transactions.category_id IS 'Category ID for regular transactions; NULL for split transactions';
