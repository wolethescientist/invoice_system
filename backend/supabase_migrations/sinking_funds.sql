-- Sinking Funds Migration for Supabase (PostgreSQL)
-- Creates tables for sinking funds and contributions

-- Create sinking_funds table
CREATE TABLE IF NOT EXISTS sinking_funds (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_cents INTEGER NOT NULL,
    current_balance_cents INTEGER NOT NULL DEFAULT 0,
    monthly_contribution_cents INTEGER NOT NULL DEFAULT 0,
    target_date TIMESTAMP,
    description TEXT,
    color VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id and is_active for fast queries
CREATE INDEX IF NOT EXISTS idx_sinking_fund_user ON sinking_funds(user_id, is_active);

-- Create sinking_fund_contributions table
CREATE TABLE IF NOT EXISTS sinking_fund_contributions (
    id SERIAL PRIMARY KEY,
    fund_id INTEGER NOT NULL REFERENCES sinking_funds(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    contribution_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on fund_id and contribution_date for fast queries
CREATE INDEX IF NOT EXISTS idx_contribution_fund_date ON sinking_fund_contributions(fund_id, contribution_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sinking_funds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sinking_funds_updated_at
    BEFORE UPDATE ON sinking_funds
    FOR EACH ROW
    EXECUTE FUNCTION update_sinking_funds_updated_at();

-- Grant permissions (adjust based on your Supabase setup)
-- ALTER TABLE sinking_funds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sinking_fund_contributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (uncomment if using Row Level Security)
-- CREATE POLICY "Users can view their own sinking funds"
--     ON sinking_funds FOR SELECT
--     USING (auth.uid()::integer = user_id);

-- CREATE POLICY "Users can insert their own sinking funds"
--     ON sinking_funds FOR INSERT
--     WITH CHECK (auth.uid()::integer = user_id);

-- CREATE POLICY "Users can update their own sinking funds"
--     ON sinking_funds FOR UPDATE
--     USING (auth.uid()::integer = user_id);

-- CREATE POLICY "Users can delete their own sinking funds"
--     ON sinking_funds FOR DELETE
--     USING (auth.uid()::integer = user_id);

-- CREATE POLICY "Users can view contributions for their funds"
--     ON sinking_fund_contributions FOR SELECT
--     USING (EXISTS (
--         SELECT 1 FROM sinking_funds
--         WHERE sinking_funds.id = sinking_fund_contributions.fund_id
--         AND sinking_funds.user_id = auth.uid()::integer
--     ));

-- CREATE POLICY "Users can insert contributions for their funds"
--     ON sinking_fund_contributions FOR INSERT
--     WITH CHECK (EXISTS (
--         SELECT 1 FROM sinking_funds
--         WHERE sinking_funds.id = sinking_fund_contributions.fund_id
--         AND sinking_funds.user_id = auth.uid()::integer
--     ));

-- CREATE POLICY "Users can delete contributions for their funds"
--     ON sinking_fund_contributions FOR DELETE
--     USING (EXISTS (
--         SELECT 1 FROM sinking_funds
--         WHERE sinking_funds.id = sinking_fund_contributions.fund_id
--         AND sinking_funds.user_id = auth.uid()::integer
--     ));
