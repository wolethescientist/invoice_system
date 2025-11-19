-- Paycheck Planning Feature Migration
-- This migration adds tables for managing paycheck schedules and allocations

-- Create paychecks table
CREATE TABLE IF NOT EXISTS paychecks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'semimonthly', 'monthly', 'custom')),
    next_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paychecks_user_id ON paychecks(user_id);
CREATE INDEX idx_paychecks_next_date ON paychecks(next_date);
CREATE INDEX idx_paychecks_user_active ON paychecks(user_id, is_active);

-- Create paycheck_instances table (actual paycheck occurrences)
CREATE TABLE IF NOT EXISTS paycheck_instances (
    id SERIAL PRIMARY KEY,
    paycheck_id INTEGER NOT NULL REFERENCES paychecks(id) ON DELETE CASCADE,
    budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    date DATE NOT NULL,
    is_received BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paycheck_instances_paycheck_id ON paycheck_instances(paycheck_id);
CREATE INDEX idx_paycheck_instances_budget_id ON paycheck_instances(budget_id);
CREATE INDEX idx_paycheck_instances_date ON paycheck_instances(date);
CREATE UNIQUE INDEX idx_paycheck_instances_unique ON paycheck_instances(paycheck_id, budget_id, date);

-- Create paycheck_allocations table (how funds are allocated to categories)
CREATE TABLE IF NOT EXISTS paycheck_allocations (
    id SERIAL PRIMARY KEY,
    paycheck_id INTEGER NOT NULL REFERENCES paychecks(id) ON DELETE CASCADE,
    instance_id INTEGER REFERENCES paycheck_instances(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paycheck_allocations_paycheck_id ON paycheck_allocations(paycheck_id);
CREATE INDEX idx_paycheck_allocations_instance_id ON paycheck_allocations(instance_id);
CREATE INDEX idx_paycheck_allocations_category_id ON paycheck_allocations(category_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paychecks_updated_at BEFORE UPDATE ON paychecks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paycheck_allocations_updated_at BEFORE UPDATE ON paycheck_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE paychecks IS 'Stores recurring paycheck schedules for users';
COMMENT ON TABLE paycheck_instances IS 'Stores actual paycheck occurrences linked to specific budgets';
COMMENT ON TABLE paycheck_allocations IS 'Tracks how paycheck funds are allocated to budget categories. When instance_id is NULL, it represents a template allocation.';
COMMENT ON COLUMN paycheck_allocations.instance_id IS 'NULL for template allocations, set for actual instance allocations';
