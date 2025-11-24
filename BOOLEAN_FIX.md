# Boolean Column Fix for PostgreSQL

## Problem
PostgreSQL was throwing errors when comparing boolean columns with integer values:
```
operator does not exist: boolean = integer
```

This occurred because the code was using `is_active == 1` but PostgreSQL has actual boolean columns that require boolean comparisons.

## Root Cause
- SQLAlchemy models defined `is_active` as `Column(Integer, default=1)` for SQLite compatibility
- PostgreSQL migrations created these as boolean columns
- Query code used `== 1` comparisons which work in SQLite but fail in PostgreSQL

## Solution
Changed all `is_active == 1` comparisons to `is_active == True` throughout the codebase.

## Files Modified
- `backend/app/api/budgets.py` - 3 occurrences fixed
- `backend/app/api/metrics.py` - 4 occurrences fixed (1 kept as fallback)
- `backend/app/api/net_worth.py` - 6 occurrences fixed
- `backend/app/services/category_suggestion.py` - 4 occurrences fixed

## Testing
After this fix, all dashboard metrics endpoints should work correctly with PostgreSQL:
- Sinking funds metrics
- Net worth metrics
- Financial goals metrics
- Paycheck metrics

The fix maintains backward compatibility since SQLAlchemy handles the conversion appropriately for both database types.
