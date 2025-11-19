# Paycheck Planning - Quick Start Guide

## Setup (5 minutes)

### 1. Run Migration
```bash
# For local SQLite
python backend/migrate_paychecks.py

# For Supabase/PostgreSQL
psql -d your_database -f backend/supabase_migrations/paycheck_planning.sql
```

### 2. Start the Application
```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend (in another terminal)
cd frontend
npm run dev
```

### 3. Test the API
```bash
python backend/test_paychecks.py
```

## Quick Usage

### Create Your First Paycheck

1. **Navigate to Paychecks**
   - Go to http://localhost:3000/paychecks
   - Click "Add Paycheck"

2. **Enter Details**
   ```
   Name: Main Job
   Amount: $2,500.00
   Frequency: Bi-weekly
   Next Date: [Select next payday]
   Active: ✓
   ```

3. **Save**
   - Click "Create Paycheck"

### Link to Budget

1. **Open a Budget**
   - Go to your budget (e.g., December 2025)
   - Click "Funding Plan" button

2. **Auto-Allocate**
   - Click "Auto-Allocate Paychecks"
   - System creates instances for all paychecks in that month

3. **View Funding Status**
   - See total income from paychecks
   - Check which categories are funded
   - Monitor remaining amounts

## API Quick Reference

### Create Paycheck
```bash
curl -X POST http://localhost:8000/api/paychecks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Job",
    "amount_cents": 250000,
    "frequency": "biweekly",
    "next_date": "2025-12-15",
    "is_active": true
  }'
```

### Get Budget Funding Plan
```bash
curl http://localhost:8000/api/paychecks/budget/1/funding-plan \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Auto-Allocate Paychecks
```bash
curl -X POST http://localhost:8000/api/paychecks/budget/1/auto-allocate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Workflows

### Workflow 1: Basic Setup
1. Create paycheck → 2. Create budget → 3. Auto-allocate → 4. View funding

### Workflow 2: With Allocations
1. Create paycheck → 2. Add allocation templates → 3. Create budget → 4. Auto-allocate → 5. Categories auto-funded

### Workflow 3: Multiple Income Sources
1. Create paycheck for Job 1 → 2. Create paycheck for Job 2 → 3. Create budget → 4. Auto-allocate both → 5. View combined funding

## Key Features

✅ **Recurring Schedules** - Set up weekly, bi-weekly, semi-monthly, or monthly paychecks
✅ **Auto-Allocation** - Automatically create paycheck instances for budget months
✅ **Category Funding** - Track which categories are funded by which paychecks
✅ **Funding Status** - Visual progress bars showing funding percentage
✅ **Multiple Income** - Support for multiple jobs/income sources

## Next Steps

- Read the full [Paycheck Planning Guide](PAYCHECK_PLANNING_GUIDE.md)
- Set up allocation templates for your paychecks
- Explore category funding status
- Mark paychecks as received when they arrive

## Troubleshooting

**Q: Paychecks not showing in budget?**
A: Make sure they're active and dates fall within the budget month. Run auto-allocate.

**Q: How do I change allocation amounts?**
A: Edit the paycheck and update the allocation templates, or edit individual instances.

**Q: Can I have multiple paychecks per month?**
A: Yes! Create multiple paycheck schedules or use bi-weekly/weekly frequencies.

**Q: What if my paycheck amount varies?**
A: Create the paycheck with an average amount, then adjust individual instances as needed.
