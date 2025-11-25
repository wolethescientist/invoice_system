# Net Worth Snapshots Column Fix

## Problem
The production database had `net_worth_snapshots` table with columns named with `_cents` suffix:
- `total_assets_cents`
- `total_liabilities_cents`
- `net_worth_cents`
- `liquid_assets_cents`

But the SQLAlchemy model expected columns without the suffix:
- `total_assets`
- `total_liabilities`
- `net_worth`
- `liquid_assets`

This caused errors: `column net_worth_snapshots.total_assets does not exist`

## Solution
Updated the codebase to use cents consistently:

### 1. Model Changes (`backend/app/models/net_worth.py`)
- Changed `NetWorthSnapshot` model to use `_cents` column names
- Changed column types from `Float` to `Integer` to store cents

### 2. API Changes (`backend/app/api/net_worth.py`)
- Updated `generate_alerts()` to convert cents to dollars for calculations
- Updated `create_snapshot()` to convert dollars to cents when saving
- Updated `get_summary()` to convert cents to dollars when reading
- Updated `get_trends()` to convert cents to dollars in response

### 3. Schema Changes (`backend/app/schemas/net_worth.py`)
- Added custom `from_orm()` method to `NetWorthSnapshot` schema
- Automatically converts cents to dollars when serializing to JSON

## How It Works
- **Storage**: All values stored in database as integers (cents)
- **API Layer**: Converts between cents (database) and dollars (API responses)
- **Frontend**: Receives and sends dollar amounts (no changes needed)

## Benefits
- Avoids floating-point precision issues
- Matches existing database schema
- No database migration required
- Frontend code unchanged

## Testing
The fix should resolve all 500 errors on these endpoints:
- `GET /api/net-worth/summary`
- `GET /api/net-worth/trends`
- `GET /api/net-worth/alerts`
- `POST /api/net-worth/snapshots`
