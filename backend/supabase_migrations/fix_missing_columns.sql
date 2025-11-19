-- Quick fix for missing description columns
-- Run this in your Supabase SQL editor if you haven't run unlimited_categories.sql

-- Add missing columns to budget_categories
ALTER TABLE budget_categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category_group VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to category_templates
ALTER TABLE category_templates 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category_group VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT;

-- Update existing records
UPDATE budget_categories 
SET is_active = 1 
WHERE is_active IS NULL;

UPDATE budget_categories 
SET updated_at = created_at 
WHERE updated_at IS NULL;
