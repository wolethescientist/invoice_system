# Quick Fix: Boolean Type Errors

## The Error
```
operator does not exist: integer = boolean
```

## The Fix (One Command)

```bash
cd backend
python migrate_to_boolean.py
```

That's it! This will:
1. ✅ Convert all INTEGER boolean columns to BOOLEAN in your database
2. ✅ Verify the changes
3. ✅ Show you what was updated

## What Gets Fixed

All `is_active`, `is_liquid`, `is_split`, and `is_paid` columns across:
- assets
- liabilities  
- sinking_funds
- paychecks
- financial_goals
- category_templates
- budget_categories
- transactions
- budgets
- customers
- invoices

## Already Done

The code has already been updated to use proper boolean comparisons. You just need to run the database migration.

## Need Help?

See `BOOLEAN_MIGRATION_GUIDE.md` for detailed information.
