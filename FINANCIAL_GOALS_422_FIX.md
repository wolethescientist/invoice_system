# Financial Goals 422/500 Error Fix

## Problem
When creating a financial goal, the API returned:
1. First a 422 Unprocessable Content error (schema mismatch)
2. Then a 500 Internal Server Error (database constraint violation)

## Root Causes

### Issue 1: Schema Mismatch (422 Error)
- **Frontend** was sending: `target_amount` and `monthly_contribution` (as float/number in dollars)
- **Backend model** was expecting: `target_amount_cents` and `monthly_contribution_cents` (as integers)
- **Actual Database** has: `target_amount` and `monthly_contribution` (as REAL/DECIMAL in dollars)

### Issue 2: Enum Case Mismatch (500 Error)
- **Backend model** was using uppercase enums: `GoalType.SAVINGS` → `'SAVINGS'`
- **Database constraint** expects lowercase values: `'savings'`, `'debt_repayment'`, etc.

## Solution
Updated the model and schema to match the actual database structure:

### Changes Made

1. **Model Layer** (`backend/app/models/financial_goal.py`):
   - Changed from `target_amount_cents` (Integer) to `target_amount` (Float)
   - Changed from `current_amount_cents` (Integer) to `current_amount` (Float)
   - Changed from `monthly_contribution_cents` (Integer) to `monthly_contribution` (Float)
   - Changed from `SQLEnum(GoalType)` to `String` (to allow lowercase values)
   - Changed from `SQLEnum(GoalStatus)` to `String` (to allow lowercase values)
   - Removed `is_active` column (not in database schema)

2. **Schema Layer** (`backend/app/schemas/financial_goal.py`):
   - Simplified to work directly with dollar amounts (no conversion needed)
   - Removed complex `from_orm()` and `to_cents_dict()` methods
   - Schema now matches database structure exactly

3. **API Layer** (`backend/app/api/financial_goals.py`):
   - Removed all cents conversion logic
   - Updated status comparisons to use lowercase strings (`'active'`, `'completed'`)
   - Simplified all endpoints to work directly with Float amounts

## How It Works Now

### Creating a Goal (Frontend → Backend → Database)
```
Frontend sends:
{
  "goal_type": "savings",
  "target_amount": 10000.00,
  "monthly_contribution": 500.00
}

↓ No conversion needed

Database stores:
{
  "goal_type": "savings",
  "target_amount": 10000.00,
  "monthly_contribution": 500.00
}
```

### Database Schema
The actual database uses:
- `target_amount REAL` (SQLite) or `DECIMAL(12,2)` (PostgreSQL) - stores dollars
- `goal_type VARCHAR` with CHECK constraint for lowercase values
- `status VARCHAR` with CHECK constraint for lowercase values

## Testing
Run the test script to verify the fix:
```bash
cd backend
python test_financial_goals_fix.py
```

## No Frontend Changes Required
The frontend API calls remain unchanged - they send and receive dollar amounts with lowercase enum values as expected.
