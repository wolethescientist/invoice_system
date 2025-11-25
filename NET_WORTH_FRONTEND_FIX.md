# Net Worth Frontend-Backend Integration Fix

## Problem
Frontend was sending dollar amounts but backend expected cents, causing 422 errors:
```
POST /api/net-worth/liabilities 422 (Unprocessable Content)
```

## Root Cause
- Frontend: Sends `current_balance: 100.50` (dollars as float)
- Backend: Expects `current_balance_cents: 10050` (cents as integer)

## Solution

### Backend Changes (`backend/app/schemas/net_worth.py`)

#### Asset Response Schema
✅ Changed from returning `current_value_cents` (int) to `current_value` (float)
✅ Added custom `from_orm()` to convert cents → dollars

#### Liability Response Schema
✅ Changed from returning `current_balance_cents` (int) to `current_balance` (float)
✅ Changed from returning `minimum_payment_cents` (int) to `minimum_payment` (float)
✅ Added custom `from_orm()` to convert cents → dollars

### Frontend Changes (`frontend/src/lib/net-worth-api.ts`)

#### createAsset()
✅ Converts `current_value` (dollars) → `current_value_cents` (cents)

#### updateAsset()
✅ Converts `current_value` (dollars) → `current_value_cents` (cents)

#### createLiability()
✅ Converts `current_balance` (dollars) → `current_balance_cents` (cents)
✅ Converts `minimum_payment` (dollars) → `minimum_payment_cents` (cents)

#### updateLiability()
✅ Converts `current_balance` (dollars) → `current_balance_cents` (cents)
✅ Converts `minimum_payment` (dollars) → `minimum_payment_cents` (cents)

## Data Flow

### Creating a Liability
1. **User Input**: $500.00
2. **Frontend Form**: `current_balance: 500.00` (float)
3. **API Function**: Converts to `current_balance_cents: 50000` (int)
4. **Backend Validation**: Accepts integer cents
5. **Database**: Stores `50000` (INTEGER)
6. **Response Schema**: Converts back to `current_balance: 500.00` (float)
7. **Frontend Display**: Shows $500.00

### Reading a Liability
1. **Database**: Returns `current_balance_cents: 50000` (INTEGER)
2. **Model Property**: `liability.current_balance` returns `500.00`
3. **Response Schema**: `from_orm()` converts to `current_balance: 500.00`
4. **Frontend**: Receives `{ current_balance: 500.00 }`
5. **Display**: Shows $500.00

## Benefits
- ✅ Frontend works with familiar dollar amounts
- ✅ Backend stores precise cents (no floating-point errors)
- ✅ Seamless conversion at API boundary
- ✅ Type-safe on both ends

## Testing
After deployment, test these operations:

### Create Asset
```javascript
POST /api/net-worth/assets
{
  "name": "Savings Account",
  "asset_type": "savings",
  "current_value_cents": 100000,  // $1,000.00
  "is_liquid": true
}
```

### Create Liability
```javascript
POST /api/net-worth/liabilities
{
  "name": "Credit Card",
  "liability_type": "credit_card",
  "current_balance_cents": 50000,  // $500.00
  "minimum_payment_cents": 2500    // $25.00
}
```

Both should return 200 OK with dollar values in response.

## Files Changed
- `backend/app/schemas/net_worth.py` - Updated Asset and Liability response schemas
- `frontend/src/lib/net-worth-api.ts` - Added dollar-to-cents conversion
