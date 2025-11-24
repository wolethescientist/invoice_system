-- ⚠️ WARNING: This migration has issues with sinking_funds table ⚠️
-- The sinking_funds section has been commented out because it renames in the wrong direction
-- Use fix_sinking_funds_column.sql instead for sinking_funds fixes
--
-- Migration to fix column names to match updated models
-- This ensures consistency between database schema and SQLAlchemy models
-- Run this in Supabase SQL Editor

-- Fix sinking_funds table
-- Note: The correct column name is target_cents (not target_amount_cents)
-- If you previously ran this migration and it renamed to target_amount_cents,
-- run fix_sinking_funds_column.sql to rename it back
-- ALTER TABLE sinking_funds 
--   RENAME COLUMN target_cents TO target_amount_cents;  -- WRONG DIRECTION - DO NOT USE

-- Fix assets table (change from DECIMAL to INTEGER for cents)
ALTER TABLE assets 
  RENAME COLUMN current_value TO current_value_cents;

ALTER TABLE assets 
  ALTER COLUMN current_value_cents TYPE INTEGER USING (current_value_cents * 100)::INTEGER;

-- Fix liabilities table (change from DECIMAL to INTEGER for cents)
ALTER TABLE liabilities 
  RENAME COLUMN current_balance TO current_balance_cents;

ALTER TABLE liabilities 
  ALTER COLUMN current_balance_cents TYPE INTEGER USING (current_balance_cents * 100)::INTEGER;

ALTER TABLE liabilities 
  RENAME COLUMN minimum_payment TO minimum_payment_cents;

ALTER TABLE liabilities 
  ALTER COLUMN minimum_payment_cents TYPE INTEGER USING (minimum_payment_cents * 100)::INTEGER;

-- Fix paychecks table
ALTER TABLE paychecks 
  RENAME COLUMN amount_cents TO net_amount_cents;

ALTER TABLE paychecks 
  RENAME COLUMN next_date TO pay_date;

-- Update index name for paychecks
DROP INDEX IF EXISTS idx_paychecks_next_date;
CREATE INDEX idx_paychecks_pay_date ON paychecks(pay_date);

-- Fix financial_goals table (change from DECIMAL to INTEGER for cents)
ALTER TABLE financial_goals 
  RENAME COLUMN target_amount TO target_amount_cents;

ALTER TABLE financial_goals 
  ALTER COLUMN target_amount_cents TYPE INTEGER USING (target_amount_cents * 100)::INTEGER;

ALTER TABLE financial_goals 
  RENAME COLUMN current_amount TO current_amount_cents;

ALTER TABLE financial_goals 
  ALTER COLUMN current_amount_cents TYPE INTEGER USING (current_amount_cents * 100)::INTEGER;

ALTER TABLE financial_goals 
  RENAME COLUMN monthly_contribution TO monthly_contribution_cents;

ALTER TABLE financial_goals 
  ALTER COLUMN monthly_contribution_cents TYPE INTEGER USING (monthly_contribution_cents * 100)::INTEGER;

-- Add is_active column to financial_goals if it doesn't exist
ALTER TABLE financial_goals 
  ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1));

-- Update asset snapshots (change from DECIMAL to INTEGER for cents)
ALTER TABLE asset_snapshots 
  RENAME COLUMN value TO value_cents;

ALTER TABLE asset_snapshots 
  ALTER COLUMN value_cents TYPE INTEGER USING (value_cents * 100)::INTEGER;

-- Update liability snapshots (change from DECIMAL to INTEGER for cents)
ALTER TABLE liability_snapshots 
  RENAME COLUMN balance TO balance_cents;

ALTER TABLE liability_snapshots 
  ALTER COLUMN balance_cents TYPE INTEGER USING (balance_cents * 100)::INTEGER;

-- Update net_worth_snapshots (change from DECIMAL to INTEGER for cents)
ALTER TABLE net_worth_snapshots 
  RENAME COLUMN total_assets TO total_assets_cents;

ALTER TABLE net_worth_snapshots 
  ALTER COLUMN total_assets_cents TYPE INTEGER USING (total_assets_cents * 100)::INTEGER;

ALTER TABLE net_worth_snapshots 
  RENAME COLUMN total_liabilities TO total_liabilities_cents;

ALTER TABLE net_worth_snapshots 
  ALTER COLUMN total_liabilities_cents TYPE INTEGER USING (total_liabilities_cents * 100)::INTEGER;

ALTER TABLE net_worth_snapshots 
  RENAME COLUMN net_worth TO net_worth_cents;

ALTER TABLE net_worth_snapshots 
  ALTER COLUMN net_worth_cents TYPE INTEGER USING (net_worth_cents * 100)::INTEGER;

ALTER TABLE net_worth_snapshots 
  RENAME COLUMN liquid_assets TO liquid_assets_cents;

ALTER TABLE net_worth_snapshots 
  ALTER COLUMN liquid_assets_cents TYPE INTEGER USING (liquid_assets_cents * 100)::INTEGER;

-- Update goal_contributions (change from DECIMAL to INTEGER for cents)
ALTER TABLE goal_contributions 
  RENAME COLUMN amount TO amount_cents;

ALTER TABLE goal_contributions 
  ALTER COLUMN amount_cents TYPE INTEGER USING (amount_cents * 100)::INTEGER;

-- Update goal_milestones (change from DECIMAL to INTEGER for cents)
ALTER TABLE goal_milestones 
  RENAME COLUMN target_amount TO target_amount_cents;

ALTER TABLE goal_milestones 
  ALTER COLUMN target_amount_cents TYPE INTEGER USING (target_amount_cents * 100)::INTEGER;
