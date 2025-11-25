# Net Worth System - Complete Cents Fix

## Problem Summary
The entire net worth system had a mismatch between the database schema (which uses `_cents` columns with INTEGER type) and the Python code (which expected Float columns without `_cents` suffix).

## Database Schema (Production)
All tables correctly use cents-based INTEGER columns:
- `assets.current_value_cents` (INTEGER)
- `liabilities.current_balance_cents` (INTEGER)
- `liabilities.minimum_payment_cents` (INTEGER)
- `asset_snapshots.value_cents` (INTEGER)
- `liability_snapshots.balance_cents` (INTEGER)
- `net_worth_snapshots.total_assets_cents` (INTEGER)
- `net_worth_snapshots.total_liabilities_cents` (INTEGER)
- `net_worth_snapshots.net_worth_cents` (INTEGER)
- `net_worth_snapshots.liquid_assets_cents` (INTEGER)

## Changes Made

### 1. Models (`backend/app/models/net_worth.py`)
✅ Updated all models to use `_cents` column names with INTEGER type
✅ Added `@property` methods to provide dollar values for backward compatibility:
   - `Asset.current_value` → returns `current_value_cents / 100.0`
   - `Liability.current_balance` → returns `current_balance_cents / 100.0`
   - `Liability.minimum_payment` → returns `minimum_payment_cents / 100.0`
   - `AssetSnapshot.value` → returns `value_cents / 100.0`
   - `LiabilitySnapshot.balance` → returns `balance_cents / 100.0`

### 2. API (`backend/app/api/net_worth.py`)
✅ Updated snapshot creation to use `_cents` columns:
   - `AssetSnapshot(value_cents=...)` instead of `value=...`
   - `LiabilitySnapshot(balance_cents=...)` instead of `balance=...`
✅ Updated `generate_alerts()` to convert cents to dollars
✅ Updated `create_snapshot()` to convert dollars to cents
✅ Updated `get_summary()` to convert cents to dollars
✅ Updated `get_trends()` to convert cents to dollars

### 3. Schemas (`backend/app/schemas/net_worth.py`)
✅ Schemas already use `_cents` fields (no changes needed for Create/Update)
✅ Added custom `from_orm()` methods to response schemas:
   - `AssetSnapshot` - converts `value_cents` to `value` (dollars)
   - `LiabilitySnapshot` - converts `balance_cents` to `balance` (dollars)
   - `NetWorthSnapshot` - converts all `_cents` fields to dollars

## How It Works

### Storage Layer (Database)
- All monetary values stored as INTEGER cents
- Example: $123.45 stored as 12345

### Model Layer (SQLAlchemy)
- Columns defined as `_cents` with INTEGER type
- Properties provide dollar values for easy access
- Example: `asset.current_value` returns `asset.current_value_cents / 100.0`

### API Layer (FastAPI)
- Accepts dollar values from frontend
- Converts to cents when writing to database
- Converts to dollars when reading from database

### Schema Layer (Pydantic)
- Input schemas accept `_cents` fields (integers)
- Output schemas return dollar values (floats)
- Custom `from_orm()` methods handle conversion

## Benefits
1. ✅ No floating-point precision errors
2. ✅ Matches actual database schema
3. ✅ No database migration required
4. ✅ Backward compatible with existing API
5. ✅ Frontend code unchanged

## Testing
Run the test to verify consistency:
```bash
python backend/test_net_worth_cents.py
```

All tests should pass:
- ✅ Assets table uses cents
- ✅ Liabilities table uses cents
- ✅ Asset snapshots use cents
- ✅ Liability snapshots use cents
- ✅ Net worth snapshots use cents
- ✅ All cents columns are INTEGER type

## Deployment
1. Commit all changes
2. Push to Git
3. Render will auto-deploy
4. Verify endpoints work:
   - `POST /api/net-worth/assets`
   - `POST /api/net-worth/liabilities`
   - `POST /api/net-worth/snapshots`
   - `GET /api/net-worth/summary`
   - `GET /api/net-worth/trends`
   - `GET /api/net-worth/alerts`

## Files Changed
- `backend/app/models/net_worth.py` - Added properties, updated column names
- `backend/app/api/net_worth.py` - Updated snapshot creation, conversions
- `backend/app/schemas/net_worth.py` - Added custom serializers
