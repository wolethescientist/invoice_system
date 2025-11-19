-- Financial Roadmap / Long-term Goals Feature
-- Migration for financial goals, contributions, and milestones

-- Financial Goals Table
CREATE TABLE IF NOT EXISTS financial_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    goal_type VARCHAR NOT NULL CHECK (goal_type IN (
        'savings', 'debt_repayment', 'investment', 'emergency_fund',
        'retirement', 'education', 'home_purchase', 'vehicle', 'vacation', 'other'
    )),
    target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12, 2) DEFAULT 0.00 CHECK (current_amount >= 0),
    monthly_contribution DECIMAL(12, 2) DEFAULT 0.00 CHECK (monthly_contribution >= 0),
    target_date DATE NOT NULL,
    start_date DATE NOT NULL,
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goal Contributions Table
CREATE TABLE IF NOT EXISTS goal_contributions (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    contribution_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goal Milestones Table
CREATE TABLE IF NOT EXISTS goal_milestones (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
    target_date DATE NOT NULL,
    achieved INTEGER DEFAULT 0 CHECK (achieved IN (0, 1)),
    achieved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON financial_goals(status);
CREATE INDEX IF NOT EXISTS idx_financial_goals_target_date ON financial_goals(target_date);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_date ON goal_contributions(contribution_date);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON goal_milestones(goal_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_financial_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER financial_goals_updated_at
    BEFORE UPDATE ON financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_goals_updated_at();

-- Sample data (optional)
-- INSERT INTO financial_goals (user_id, name, description, goal_type, target_amount, current_amount, monthly_contribution, target_date, start_date, priority)
-- VALUES 
--     (1, 'Emergency Fund', 'Build 6 months of expenses', 'emergency_fund', 15000.00, 5000.00, 500.00, '2026-12-31', '2025-01-01', 1),
--     (1, 'Home Down Payment', 'Save for house down payment', 'home_purchase', 50000.00, 10000.00, 1000.00, '2028-06-30', '2025-01-01', 2),
--     (1, 'Vacation Fund', 'Europe trip', 'vacation', 5000.00, 1200.00, 200.00, '2026-06-01', '2025-01-01', 3);
