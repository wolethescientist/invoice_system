-- Run this in Supabase SQL Editor to check your column types
-- This will show you exactly what needs to be fixed

SELECT 
    table_name, 
    column_name, 
    data_type,
    CASE 
        WHEN data_type = 'integer' THEN '❌ NEEDS FIX'
        WHEN data_type = 'boolean' THEN '✅ CORRECT'
        ELSE '⚠️ CHECK'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    column_name LIKE '%is_%' 
    OR column_name = 'is_paid'
    OR column_name = 'is_liquid'
    OR column_name = 'is_split'
    OR column_name = 'is_active'
    OR column_name = 'is_received'
)
ORDER BY 
    CASE WHEN data_type = 'integer' THEN 0 ELSE 1 END,
    table_name, 
    column_name;
