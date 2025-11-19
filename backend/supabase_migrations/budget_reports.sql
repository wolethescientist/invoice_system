-- Budget Reports Migration
-- Create table for saved custom budget reports

CREATE TABLE IF NOT EXISTS budget_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('spending', 'income', 'category', 'trend', 'comparison')),
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    filters JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_budget_reports_user ON budget_reports(user_id);
CREATE INDEX idx_budget_reports_type ON budget_reports(user_id, report_type);
CREATE INDEX idx_budget_reports_dates ON budget_reports(user_id, date_range_start, date_range_end);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_budget_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_reports_updated_at
    BEFORE UPDATE ON budget_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_reports_updated_at();

-- Add comments for documentation
COMMENT ON TABLE budget_reports IS 'Saved custom budget report configurations';
COMMENT ON COLUMN budget_reports.report_type IS 'Type of report: spending, income, category, trend, or comparison';
COMMENT ON COLUMN budget_reports.filters IS 'JSON object containing filter criteria (budget_ids, category_ids, etc.)';
