-- Migration for unlimited budget categories with performance optimizations
-- Run this in your Supabase SQL editor

-- Add new columns to budget_categories table
ALTER TABLE budget_categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category_group VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add new columns to category_templates table
ALTER TABLE category_templates 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category_group VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT;

-- Create performance indexes for budget_categories
CREATE INDEX IF NOT EXISTS idx_budget_category_budget_order 
ON budget_categories(budget_id, "order");

CREATE INDEX IF NOT EXISTS idx_budget_category_budget_active 
ON budget_categories(budget_id, is_active);

CREATE INDEX IF NOT EXISTS idx_budget_category_group 
ON budget_categories(budget_id, category_group);

CREATE INDEX IF NOT EXISTS idx_budget_category_name_search 
ON budget_categories USING gin(to_tsvector('english', name));

-- Create performance indexes for budgets
CREATE INDEX IF NOT EXISTS idx_budget_user_date 
ON budgets(user_id, year, month);

-- Create performance indexes for category_templates
CREATE INDEX IF NOT EXISTS idx_category_template_user_active 
ON category_templates(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_category_template_user_type 
ON category_templates(user_id, category_type);

CREATE INDEX IF NOT EXISTS idx_category_template_user_order 
ON category_templates(user_id, "order");

CREATE INDEX IF NOT EXISTS idx_category_template_group 
ON category_templates(user_id, category_group);

CREATE INDEX IF NOT EXISTS idx_category_template_name_search 
ON category_templates USING gin(to_tsvector('english', name));

-- Update existing records to have is_active = 1
UPDATE budget_categories 
SET is_active = 1 
WHERE is_active IS NULL;

UPDATE budget_categories 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for budget_categories updated_at
DROP TRIGGER IF EXISTS update_budget_categories_updated_at ON budget_categories;
CREATE TRIGGER update_budget_categories_updated_at
    BEFORE UPDATE ON budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for category_templates updated_at (if it doesn't exist)
DROP TRIGGER IF EXISTS update_category_templates_updated_at ON category_templates;
CREATE TRIGGER update_category_templates_updated_at
    BEFORE UPDATE ON category_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for new columns (if RLS is enabled)
-- These policies inherit from existing table policies but are included for completeness

-- Policy for budget_categories (users can only access their own budget categories)
DROP POLICY IF EXISTS "Users can view their own budget categories" ON budget_categories;
CREATE POLICY "Users can view their own budget categories" ON budget_categories
    FOR SELECT USING (
        budget_id IN (
            SELECT id FROM budgets WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own budget categories" ON budget_categories;
CREATE POLICY "Users can insert their own budget categories" ON budget_categories
    FOR INSERT WITH CHECK (
        budget_id IN (
            SELECT id FROM budgets WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own budget categories" ON budget_categories;
CREATE POLICY "Users can update their own budget categories" ON budget_categories
    FOR UPDATE USING (
        budget_id IN (
            SELECT id FROM budgets WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own budget categories" ON budget_categories;
CREATE POLICY "Users can delete their own budget categories" ON budget_categories
    FOR DELETE USING (
        budget_id IN (
            SELECT id FROM budgets WHERE user_id = auth.uid()
        )
    );

-- Create materialized view for category analytics (optional performance optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS category_usage_stats AS
SELECT 
    ct.id as template_id,
    ct.name,
    ct.category_type,
    ct.category_group,
    COUNT(bc.id) as usage_count,
    AVG(bc.allocated_cents) as avg_allocation,
    SUM(bc.allocated_cents) as total_allocated
FROM category_templates ct
LEFT JOIN budget_categories bc ON ct.name = bc.name
WHERE ct.is_active = true
GROUP BY ct.id, ct.name, ct.category_type, ct.category_group;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_category_usage_stats_template_id 
ON category_usage_stats(template_id);

-- Function to refresh category usage stats
CREATE OR REPLACE FUNCTION refresh_category_usage_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW category_usage_stats;
END;
$$ LANGUAGE plpgsql;

-- Create function for bulk category operations
CREATE OR REPLACE FUNCTION bulk_update_categories(
    p_budget_id INTEGER,
    p_user_id UUID,
    p_updates JSONB
)
RETURNS JSONB AS $$
DECLARE
    update_record JSONB;
    category_id INTEGER;
    updated_count INTEGER := 0;
    errors TEXT[] := ARRAY[]::TEXT[];
    result JSONB;
BEGIN
    -- Verify budget ownership
    IF NOT EXISTS (
        SELECT 1 FROM budgets 
        WHERE id = p_budget_id AND user_id = p_user_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Budget not found or access denied'
        );
    END IF;

    -- Process each update
    FOR update_record IN SELECT * FROM jsonb_array_elements(p_updates)
    LOOP
        category_id := (update_record->>'category_id')::INTEGER;
        
        BEGIN
            UPDATE budget_categories 
            SET 
                name = COALESCE(update_record->>'name', name),
                allocated_cents = COALESCE((update_record->>'allocated_cents')::INTEGER, allocated_cents),
                "order" = COALESCE((update_record->>'order')::INTEGER, "order"),
                category_group = COALESCE(update_record->>'category_group', category_group),
                description = COALESCE(update_record->>'description', description)
            WHERE id = category_id AND budget_id = p_budget_id;
            
            IF FOUND THEN
                updated_count := updated_count + 1;
            ELSE
                errors := array_append(errors, 'Category ' || category_id || ' not found');
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            errors := array_append(errors, 'Error updating category ' || category_id || ': ' || SQLERRM);
        END;
    END LOOP;

    result := jsonb_build_object(
        'success', array_length(errors, 1) IS NULL,
        'updated_count', updated_count,
        'errors', errors
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION bulk_update_categories(INTEGER, UUID, JSONB) TO authenticated;

COMMENT ON TABLE budget_categories IS 'Budget categories with unlimited support and performance optimizations';
COMMENT ON TABLE category_templates IS 'Category templates with grouping and enhanced metadata';
COMMENT ON MATERIALIZED VIEW category_usage_stats IS 'Analytics view for category template usage patterns';
COMMENT ON FUNCTION bulk_update_categories IS 'Efficiently update multiple budget categories in a single operation';