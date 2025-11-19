# Financial Roadmap - Supabase Setup Guide

## Step-by-Step Migration Instructions

### Step 1: Access Supabase SQL Editor

1. Log in to your Supabase dashboard at https://supabase.com
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

### Step 2: Copy Migration SQL

1. Open the file: `backend/supabase_migrations/financial_roadmap.sql`
2. Select all content (Ctrl+A or Cmd+A)
3. Copy to clipboard (Ctrl+C or Cmd+C)

### Step 3: Run Migration

1. Paste the SQL into the Supabase SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
3. Wait for the query to complete
4. You should see a success message

### Step 4: Verify Tables Created

**Option A: Using Table Editor**
1. Click **"Table Editor"** in the left sidebar
2. Look for these new tables:
   - `financial_goals`
   - `goal_contributions`
   - `goal_milestones`

**Option B: Using SQL Query**
Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('financial_goals', 'goal_contributions', 'goal_milestones');
```

You should see all three tables listed.

### Step 5: Check Table Structure

Run these queries to verify the tables are set up correctly:

```sql
-- Check financial_goals table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'financial_goals';

-- Check goal_contributions table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'goal_contributions';

-- Check goal_milestones table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'goal_milestones';
```

### Step 6: Verify Indexes

Check that indexes were created:
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename LIKE '%goal%';
```

You should see indexes like:
- `idx_financial_goals_user_id`
- `idx_financial_goals_status`
- `idx_financial_goals_target_date`
- `idx_goal_contributions_goal_id`
- `idx_goal_contributions_date`
- `idx_goal_milestones_goal_id`

### Step 7: Test with Sample Data (Optional)

Insert a test goal:
```sql
-- Replace 1 with your actual user_id
INSERT INTO financial_goals (
  user_id, 
  name, 
  goal_type, 
  target_amount, 
  monthly_contribution, 
  target_date, 
  start_date
) VALUES (
  1,
  'Test Emergency Fund',
  'emergency_fund',
  10000.00,
  500.00,
  '2026-12-31',
  '2025-01-01'
);

-- Verify it was created
SELECT * FROM financial_goals WHERE name = 'Test Emergency Fund';
```

### Step 8: Test API Endpoints

Start your backend server:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

Test the API:
```bash
# Get auth token first (replace with your credentials)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Use the token to get goals
curl http://localhost:8000/api/financial-goals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 9: Access Frontend

1. Start frontend: `cd frontend && npm run dev`
2. Navigate to: http://localhost:3000/financial-roadmap
3. Click "+ New Goal" to create your first goal

## Troubleshooting

### Error: "relation already exists"
The tables already exist. You can either:
- Skip the migration (tables are already set up)
- Drop existing tables first (⚠️ this deletes data):
  ```sql
  DROP TABLE IF EXISTS goal_milestones CASCADE;
  DROP TABLE IF EXISTS goal_contributions CASCADE;
  DROP TABLE IF EXISTS financial_goals CASCADE;
  ```
  Then run the migration again.

### Error: "permission denied"
Make sure you're using the correct Supabase project and have admin access.

### Tables not showing in Table Editor
- Refresh the page
- Check you're looking at the correct schema (public)
- Verify the SQL ran without errors

### API returns 404
- Verify backend is running
- Check that `financial_goals` router is registered in `backend/app/main.py`
- Ensure tables exist in Supabase

### Frontend shows "Loading..."
- Check browser console for errors
- Verify API is accessible
- Check authentication token is valid

## What Gets Created

### Tables

**financial_goals**
- Stores main goal information
- Links to users table
- Tracks progress and status

**goal_contributions**
- Records individual contributions
- Links to financial_goals
- Tracks dates and amounts

**goal_milestones**
- Stores intermediate targets
- Links to financial_goals
- Tracks achievement status

### Indexes
- Performance optimization for queries
- Speeds up filtering by user, status, date

### Triggers
- Automatically updates `updated_at` timestamp
- Maintains data consistency

### Constraints
- Foreign keys ensure referential integrity
- Check constraints validate data
- Cascading deletes clean up related records

## Next Steps

After successful migration:

1. ✅ Create your first goal via UI
2. ✅ Add a contribution
3. ✅ Set up milestones
4. ✅ Use the projection simulator
5. ✅ Track your progress!

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Review backend logs for API errors
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Ensure database connection is working

## Migration File Location

The SQL migration file is located at:
```
backend/supabase_migrations/financial_roadmap.sql
```

This file contains all the SQL needed to set up the Financial Roadmap feature in your Supabase database.
