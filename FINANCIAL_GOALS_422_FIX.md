# Financial Goals 422 Error Fix

## Problem
When creating a financial goal, the API returned a 422 Unprocessable Content error. This was caused by a schema mismatch between the frontend and backend.

## Root Cause
- **Frontend** was sending: `target_amount` and `monthly_contribution` (as float/number in dollars)
- **Backend** was expecting: `target_amount_cents` and `monthly_contribution_cents` (as integers in cents)
- **Database** stores amounts in cents as integers for precision

## Solution
Updated the Pydantic schemas to handle the conversion automatically:

### Changes Made

1. **Schema Layer** (`backend/app/schemas/financial_goal.py`):
   - Changed `FinancialGoalBase` to accept dollar amounts (`target_amount`, `monthly_contribution`)
   - Added conversion logic in `FinancialGoalCreate` to convert to cents
   - Added `from_orm()` method in `FinancialGoal` to convert cents back to dollars when reading
   - Updated `FinancialGoalUpdate` with `to_cents_dict()` method for updates

2. **API Layer** (`backend/app/api/financial_goals.py`):
   - Updated `create_goal()` to convert dollar amounts to cents before saving
   - Updated `get_goal()`, `get_goals()` to use `from_orm()` for proper conversion
   - Updated `update_goal()` to use `to_cents_dict()` for proper conversion
   - Updated `calculate_projection()` to work with cents internally
   - Updated `get_goals_summary()` to convert cents to dollars for calculations

## How It Works Now

### Creating a Goal (Frontend → Backend → Database)
```
Frontend sends:
{
  "target_amount": 10000.00,
  "monthly_contribution": 500.00
}

↓ Schema converts to cents

Database stores:
{
  "target_amount_cents": 1000000,
  "monthly_contribution_cents": 50000
}
```

### Reading a Goal (Database → Backend → Frontend)
```
Database has:
{
  "target_amount_cents": 1000000,
  "monthly_contribution_cents": 50000
}

↓ from_orm() converts to dollars

Frontend receives:
{
  "target_amount": 10000.00,
  "monthly_contribution": 500.00
}
```

## Testing
Run the test script to verify the fix:
```bash
cd backend
python test_financial_goals_fix.py
```

## No Frontend Changes Required
The frontend API calls remain unchanged - they continue to send and receive dollar amounts as expected.
