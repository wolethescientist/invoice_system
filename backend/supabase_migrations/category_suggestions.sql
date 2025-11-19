-- Category Suggestions Feature Migration
-- This migration adds tables for smart category suggestions based on transaction history

-- Table for storing learned category patterns
CREATE TABLE IF NOT EXISTS category_patterns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    pattern_text VARCHAR(255) NOT NULL,
    confidence_score REAL DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient pattern matching
CREATE INDEX IF NOT EXISTS idx_pattern_user_text ON category_patterns(user_id, pattern_text);
CREATE INDEX IF NOT EXISTS idx_pattern_user_category ON category_patterns(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_pattern_last_used ON category_patterns(last_used DESC);

-- Table for logging suggestion feedback
CREATE TABLE IF NOT EXISTS category_suggestion_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
    suggested_category_id INTEGER NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    actual_category_id INTEGER NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    pattern_text VARCHAR(255) NOT NULL,
    was_accepted INTEGER DEFAULT 0 CHECK (was_accepted IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_suggestion_log_user ON category_suggestion_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestion_log_accepted ON category_suggestion_logs(was_accepted, created_at DESC);

-- Enable Row Level Security
ALTER TABLE category_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_suggestion_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for category_patterns
CREATE POLICY "Users can view their own patterns"
    ON category_patterns FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own patterns"
    ON category_patterns FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own patterns"
    ON category_patterns FOR UPDATE
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own patterns"
    ON category_patterns FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- RLS Policies for category_suggestion_logs
CREATE POLICY "Users can view their own suggestion logs"
    ON category_suggestion_logs FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own suggestion logs"
    ON category_suggestion_logs FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

-- Function to clean up old patterns (optional maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_patterns()
RETURNS void AS $$
BEGIN
    -- Delete patterns not used in 6 months with low confidence
    DELETE FROM category_patterns
    WHERE last_used < CURRENT_TIMESTAMP - INTERVAL '6 months'
    AND confidence_score < 0.3
    AND usage_count < 3;
END;
$$ LANGUAGE plpgsql;

-- Comment on tables
COMMENT ON TABLE category_patterns IS 'Stores learned patterns for smart category suggestions';
COMMENT ON TABLE category_suggestion_logs IS 'Logs suggestion acceptance/rejection for improving the algorithm';
