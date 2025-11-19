-- Net Worth Tracking Tables

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('cash', 'checking', 'savings', 'investment', 'retirement', 'real_estate', 'vehicle', 'crypto', 'other')),
    current_value DECIMAL(15, 2) NOT NULL,
    institution VARCHAR(255),
    account_number_last4 VARCHAR(4),
    notes TEXT,
    is_liquid INTEGER DEFAULT 1 CHECK (is_liquid IN (0, 1)),
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_user_active ON assets(user_id, is_active);

-- Liabilities table
CREATE TABLE IF NOT EXISTS liabilities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    liability_type VARCHAR(50) NOT NULL CHECK (liability_type IN ('credit_card', 'student_loan', 'mortgage', 'auto_loan', 'personal_loan', 'medical_debt', 'other')),
    current_balance DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) DEFAULT 0.0,
    minimum_payment DECIMAL(10, 2) DEFAULT 0.0,
    institution VARCHAR(255),
    account_number_last4 VARCHAR(4),
    notes TEXT,
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_liability_user_active ON liabilities(user_id, is_active);

-- Asset snapshots table (for historical tracking)
CREATE TABLE IF NOT EXISTS asset_snapshots (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    value DECIMAL(15, 2) NOT NULL,
    snapshot_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_snapshot_date ON asset_snapshots(asset_id, snapshot_date);

-- Liability snapshots table (for historical tracking)
CREATE TABLE IF NOT EXISTS liability_snapshots (
    id SERIAL PRIMARY KEY,
    liability_id INTEGER NOT NULL REFERENCES liabilities(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) NOT NULL,
    snapshot_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_liability_snapshot_date ON liability_snapshots(liability_id, snapshot_date);

-- Net worth snapshots table (aggregated view)
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_assets DECIMAL(15, 2) NOT NULL,
    total_liabilities DECIMAL(15, 2) NOT NULL,
    net_worth DECIMAL(15, 2) NOT NULL,
    liquid_assets DECIMAL(15, 2) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_networth_user_date ON net_worth_snapshots(user_id, snapshot_date);

-- Trigger to update updated_at timestamp for assets
CREATE OR REPLACE FUNCTION update_asset_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_asset_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_asset_updated_at();

-- Trigger to update updated_at timestamp for liabilities
CREATE OR REPLACE FUNCTION update_liability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_liability_updated_at
    BEFORE UPDATE ON liabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_liability_updated_at();
