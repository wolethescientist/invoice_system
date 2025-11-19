# Net Worth Tracking - Installation Instructions

## Quick Installation

### 1. Backend Setup

#### Option A: SQLite (Local Development)
```bash
cd backend
python migrate_net_worth.py
```

#### Option B: Supabase/PostgreSQL (Production)
Run the SQL migration file in your Supabase SQL editor:
```bash
# Copy the contents of backend/supabase_migrations/net_worth.sql
# and execute in Supabase SQL Editor
```

### 2. Verify Installation

Test the backend API:
```bash
cd backend
python test_net_worth.py
```

This will:
- Create sample assets and liabilities
- Generate snapshots
- Test all API endpoints
- Display summary and analytics

### 3. Start the Application

#### Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

The backend will be available at: http://localhost:8000

#### Frontend
```bash
cd frontend
npm install  # if not already done
npm run dev
```

The frontend will be available at: http://localhost:3000

### 4. Access the Feature

Navigate to: http://localhost:3000/net-worth

## What Was Added

### Backend Files
- `backend/app/models/net_worth.py` - Database models
- `backend/app/schemas/net_worth.py` - Pydantic schemas
- `backend/app/api/net_worth.py` - API endpoints
- `backend/migrate_net_worth.py` - SQLite migration
- `backend/test_net_worth.py` - Test script
- `backend/supabase_migrations/net_worth.sql` - PostgreSQL migration

### Frontend Files
- `frontend/src/lib/net-worth-api.ts` - API client
- `frontend/src/components/NetWorthSummaryCard.tsx` - Summary component
- `frontend/src/components/NetWorthChart.tsx` - Trend chart
- `frontend/src/components/NetWorthAlerts.tsx` - Alert notifications
- `frontend/src/components/AssetLiabilityBreakdown.tsx` - Breakdown charts
- `frontend/src/app/net-worth/page.tsx` - Main dashboard
- `frontend/src/app/net-worth/assets/page.tsx` - Asset list
- `frontend/src/app/net-worth/assets/new/page.tsx` - Create asset
- `frontend/src/app/net-worth/assets/[id]/edit/page.tsx` - Edit asset
- `frontend/src/app/net-worth/liabilities/page.tsx` - Liability list
- `frontend/src/app/net-worth/liabilities/new/page.tsx` - Create liability
- `frontend/src/app/net-worth/liabilities/[id]/edit/page.tsx` - Edit liability
- `frontend/src/app/net-worth/projection/page.tsx` - Projection view

### Documentation
- `NET_WORTH_GUIDE.md` - Comprehensive user guide
- `NET_WORTH_QUICKSTART.md` - Quick start guide
- `NET_WORTH_SUMMARY.md` - Implementation summary
- `NET_WORTH_INSTALLATION.md` - This file

### Modified Files
- `backend/app/main.py` - Added net_worth router
- `FEATURES_CHECKLIST.md` - Added net worth features

## Database Tables Created

1. **assets** - Track user assets
2. **liabilities** - Track user debts
3. **asset_snapshots** - Historical asset values
4. **liability_snapshots** - Historical liability balances
5. **net_worth_snapshots** - Aggregated net worth over time

## API Endpoints Added

### Assets
- `GET /api/net-worth/assets` - List assets
- `POST /api/net-worth/assets` - Create asset
- `GET /api/net-worth/assets/{id}` - Get asset
- `PUT /api/net-worth/assets/{id}` - Update asset
- `DELETE /api/net-worth/assets/{id}` - Delete asset

### Liabilities
- `GET /api/net-worth/liabilities` - List liabilities
- `POST /api/net-worth/liabilities` - Create liability
- `GET /api/net-worth/liabilities/{id}` - Get liability
- `PUT /api/net-worth/liabilities/{id}` - Update liability
- `DELETE /api/net-worth/liabilities/{id}` - Delete liability

### Analytics
- `GET /api/net-worth/summary` - Net worth summary
- `GET /api/net-worth/trends?months=12` - Trend data
- `GET /api/net-worth/breakdown/assets` - Asset breakdown
- `GET /api/net-worth/breakdown/liabilities` - Liability breakdown
- `GET /api/net-worth/projection?months=12` - Future projection
- `GET /api/net-worth/alerts` - Alert notifications
- `POST /api/net-worth/snapshots` - Create snapshot

## Dependencies

All required dependencies are already in the project:
- **Backend**: FastAPI, SQLAlchemy, Pydantic (already installed)
- **Frontend**: React, Next.js, Recharts (already installed)

No additional packages need to be installed.

## Troubleshooting

### Backend Issues

**Migration fails:**
```bash
# Make sure you're in the backend directory
cd backend

# Check if database file exists
ls hikey.db

# Try running migration again
python migrate_net_worth.py
```

**Import errors:**
```bash
# Make sure all dependencies are installed
pip install -r requirements.txt
```

**API not responding:**
```bash
# Check if backend is running
curl http://localhost:8000/health

# Restart backend
python -m uvicorn app.main:app --reload
```

### Frontend Issues

**Module not found errors:**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install
```

**Chart not displaying:**
- Ensure recharts is installed: `npm list recharts`
- Clear browser cache
- Check browser console for errors

**API connection errors:**
- Verify backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in .env.local
- Ensure you're logged in

## Testing

### Manual Testing Checklist
1. ✅ Login to the application
2. ✅ Navigate to /net-worth
3. ✅ Create an asset
4. ✅ Create a liability
5. ✅ Create a snapshot
6. ✅ View summary card
7. ✅ View trend chart
8. ✅ View breakdown charts
9. ✅ View projection
10. ✅ Edit asset value
11. ✅ Edit liability balance
12. ✅ Check alerts

### Automated Testing
```bash
cd backend
python test_net_worth.py
```

Expected output:
- ✅ Assets created
- ✅ Liabilities created
- ✅ Snapshot created
- ✅ Summary retrieved
- ✅ Breakdowns calculated
- ✅ Projection generated
- ✅ Alerts checked

## Next Steps

1. **Add your real data**: Start adding your actual assets and liabilities
2. **Create regular snapshots**: Set a reminder to create monthly snapshots
3. **Set financial goals**: Link to the Financial Roadmap feature
4. **Monitor trends**: Check your net worth dashboard regularly
5. **Review projections**: Adjust your financial strategy based on projections

## Support

- 📖 Full Guide: `NET_WORTH_GUIDE.md`
- 🚀 Quick Start: `NET_WORTH_QUICKSTART.md`
- 📊 Summary: `NET_WORTH_SUMMARY.md`
- 🔧 API Docs: Check `/docs` endpoint on backend

## Security Notes

- All data is user-specific and isolated
- Only last 4 digits of account numbers are stored
- Authentication required for all endpoints
- Data encrypted in transit (HTTPS in production)

---

**Installation Complete!** 🎉

You now have a fully functional net worth tracking system. Start by adding your assets and liabilities, then create your first snapshot to begin tracking your financial progress.
