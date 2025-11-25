# Deploy Net Worth Cents Fix

## What Was Fixed
The entire net worth system now correctly uses cents-based INTEGER columns to match the production database schema.

## Files Changed
- ✅ `backend/app/models/net_worth.py`
- ✅ `backend/app/api/net_worth.py`
- ✅ `backend/app/schemas/net_worth.py`

## Deployment Steps

### 1. Commit Changes
```bash
git add backend/app/models/net_worth.py
git add backend/app/api/net_worth.py
git add backend/app/schemas/net_worth.py
git commit -m "Fix net worth system to use cents columns consistently"
```

### 2. Push to Repository
```bash
git push
```

### 3. Monitor Render Deployment
- Go to https://dashboard.render.com
- Watch the deployment logs
- Wait for "Deploy succeeded" message

### 4. Verify Endpoints
Once deployed, test these endpoints in production:

#### Create Asset
```bash
POST /api/net-worth/assets
{
  "name": "Test Asset",
  "asset_type": "savings",
  "current_value_cents": 100000,  // $1,000.00
  "is_liquid": true
}
```

#### Create Liability
```bash
POST /api/net-worth/liabilities
{
  "name": "Test Liability",
  "liability_type": "credit_card",
  "current_balance_cents": 50000,  // $500.00
  "minimum_payment_cents": 2500    // $25.00
}
```

#### Create Snapshot
```bash
POST /api/net-worth/snapshots
```

#### Get Summary
```bash
GET /api/net-worth/summary
```

#### Get Trends
```bash
GET /api/net-worth/trends?months=12
```

#### Get Alerts
```bash
GET /api/net-worth/alerts
```

### 5. Check Logs
Monitor Render logs for any errors. All previous errors should be gone:
- ❌ `column net_worth_snapshots.total_assets does not exist` → FIXED
- ❌ `column assets.current_value does not exist` → FIXED
- ❌ `column liabilities.current_balance does not exist` → FIXED

## Expected Behavior
- ✅ All endpoints return 200 OK
- ✅ Values displayed in dollars (e.g., 1000.00)
- ✅ Values stored in cents (e.g., 100000)
- ✅ No database errors in logs

## Rollback Plan
If issues occur, revert the commit:
```bash
git revert HEAD
git push
```

## Notes
- No database migration needed (schema already correct)
- Frontend unchanged (API still returns dollars)
- Backward compatible with existing data
