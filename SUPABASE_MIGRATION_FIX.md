# Fix Supabase Database Schema

## The Problem

Your Supabase database has the old column names, but your updated Python models expect new names. This causes the errors you're seeing.

## Solution: Run This SQL in Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the SQL below
5. Click "Run"

```sql
-- Fix sinking_funds table
ALTER TABLE sinking_funds 
  RENAME COLUMN target_cents TO target_amount_cents;

-- Fix assets table
ALTER TABLE assets 
  RENAME COLUMN current_value TO current_value_cents;

ALTER TABLE assets 
  ALTER COLUMN current_value_cents TYPE INTEGER USING (current_value_cents * 100)::INTEGER;

-- Fix liabilities table
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

-- Update index
DROP INDEX IF EXISTS idx_paychecks_next_date;
CREATE INDEX idx_paychecks_pay_date ON paychecks(pay_date);

-- Fix financial_goals table
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

-- Add is_active column to financial_goals
ALTER TABLE financial_goals 
  ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1));

-- Fix asset_snapshots
ALTER TABLE asset_snapshots 
  RENAME COLUMN value TO value_cents;

ALTER TABLE asset_snapshots 
  ALTER COLUMN value_cents TYPE INTEGER USING (value_cents * 100)::INTEGER;

-- Fix liability_snapshots
ALTER TABLE liability_snapshots 
  RENAME COLUMN balance TO balance_cents;

ALTER TABLE liability_snapshots 
  ALTER COLUMN balance_cents TYPE INTEGER USING (balance_cents * 100)::INTEGER;

-- Fix net_worth_snapshots
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

-- Fix goal_contributions
ALTER TABLE goal_contributions 
  RENAME COLUMN amount TO amount_cents;

ALTER TABLE goal_contributions 
  ALTER COLUMN amount_cents TYPE INTEGER USING (amount_cents * 100)::INTEGER;

-- Fix goal_milestones
ALTER TABLE goal_milestones 
  RENAME COLUMN target_amount TO target_amount_cents;

ALTER TABLE goal_milestones 
  ALTER COLUMN target_amount_cents TYPE INTEGER USING (target_amount_cents * 100)::INTEGER;
```

## After Running the Migration

1. Restart your backend server
2. All the errors should be resolved
3. Your dashboard metrics will load correctly

## What This Does

- Renames columns to match your updated Python models
- Converts monetary values from DECIMAL to INTEGER (cents) for precision
- Adds missing `is_active` column to financial_goals
- Updates all related snapshot and contribution tables
- Preserves your existing data by converting values appropriately

## If You Get "Column Already Exists" Errors

Some columns might already be renamed. That's fine - just ignore those specific errors and the rest will run.
