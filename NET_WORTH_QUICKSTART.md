# Net Worth Tracking - Quick Start Guide

Get started with net worth tracking in 5 minutes!

## Quick Setup

### 1. Run Database Migration

```bash
# SQLite (local development)
python backend/migrate_net_worth.py

# PostgreSQL/Supabase (production)
# Run the SQL in backend/supabase_migrations/net_worth.sql
```

### 2. Start the Application

```bash
# Backend
cd backend
python -m uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

### 3. Add Your First Asset

1. Navigate to http://localhost:3000/net-worth
2. Click **Manage Assets** → **Add Asset**
3. Fill in:
   - Name: "My Checking Account"
   - Type: Checking
   - Value: 5000
4. Click **Create Asset**

### 4. Add Your First Liability

1. Click **Manage Liabilities** → **Add Liability**
2. Fill in:
   - Name: "Credit Card"
   - Type: Credit Card
   - Balance: 2000
   - Interest Rate: 18.9
   - Min Payment: 50
3. Click **Create Liability**

### 5. Create Your First Snapshot

1. Return to the Net Worth page
2. Click **Create Snapshot**
3. Your net worth is now tracked!

## What You'll See

- **Net Worth**: $3,000 (Assets $5,000 - Liabilities $2,000)
- **Summary Card**: Current totals and counts
- **Breakdown Charts**: Visual distribution
- **Alerts**: Any important notifications

## Next Steps

1. **Add More Assets**: Bank accounts, investments, retirement, property
2. **Add More Liabilities**: Loans, mortgages, other debts
3. **Create Regular Snapshots**: Weekly or monthly for trend tracking
4. **View Projections**: See where you're headed
5. **Set Financial Goals**: Link to the Financial Roadmap feature

## Key Features

### Assets
- ✅ Multiple asset types
- ✅ Liquid vs. illiquid classification
- ✅ Historical value tracking
- ✅ Institution details

### Liabilities
- ✅ Multiple debt types
- ✅ Interest rate tracking
- ✅ Minimum payment tracking
- ✅ Historical balance tracking

### Analytics
- ✅ Net worth trends over time
- ✅ Asset/liability breakdowns
- ✅ 12-month projections
- ✅ Change alerts

## Testing the API

```bash
# Test the endpoints
python backend/test_net_worth.py
```

This will:
1. Create sample assets
2. Create sample liabilities
3. Generate a snapshot
4. Display summary and analytics
5. Show projections

## Common Asset Types

| Type | Examples |
|------|----------|
| Checking | Bank checking accounts |
| Savings | Savings accounts, CDs |
| Investment | Stocks, bonds, brokerage |
| Retirement | 401(k), IRA, pension |
| Real Estate | Home, rental property |
| Vehicle | Cars, boats, motorcycles |
| Crypto | Bitcoin, Ethereum, etc. |

## Common Liability Types

| Type | Examples |
|------|----------|
| Credit Card | Credit card balances |
| Student Loan | Education loans |
| Mortgage | Home loans |
| Auto Loan | Car financing |
| Personal Loan | Personal loans |
| Medical Debt | Medical bills |

## Tips for Accurate Tracking

1. **Include Everything**: Don't forget small accounts
2. **Use Current Values**: Update regularly
3. **Mark Liquidity**: Identify easily accessible funds
4. **Track Interest Rates**: Important for debt planning
5. **Create Snapshots**: Regular tracking shows progress

## Keyboard Shortcuts

- Navigate to Net Worth: `/net-worth`
- Add Asset: `/net-worth/assets/new`
- Add Liability: `/net-worth/liabilities/new`
- View Projection: `/net-worth/projection`

## Mobile Access

The interface is fully responsive:
- View net worth on mobile
- Update values on the go
- Create snapshots anywhere
- Check alerts and trends

## Integration Points

### With Financial Goals
- Projections use goal contributions
- Track progress toward wealth goals
- Align goals with net worth targets

### With Budget Planning
- Monitor how budgeting affects net worth
- Track spending impact
- Adjust budget based on net worth goals

### With Paycheck Planning
- Allocate funds to asset growth
- Plan debt payments
- Track paycheck impact on net worth

## Quick Reference

### Create Snapshot
```
POST /api/net-worth/snapshots
```

### Get Summary
```
GET /api/net-worth/summary
```

### Get Trends
```
GET /api/net-worth/trends?months=12
```

### Get Projection
```
GET /api/net-worth/projection?months=12
```

## Troubleshooting

**No trends showing?**
- Create at least one snapshot first

**Projection seems off?**
- Add financial goals for accurate projections
- Update debt payment amounts

**Values not updating?**
- Click "Create Snapshot" after making changes
- Refresh the page

## Need Help?

- 📖 Read the full guide: `NET_WORTH_GUIDE.md`
- 🔧 Check API docs: `API_DOCUMENTATION.md`
- 🐛 Report issues: GitHub Issues

---

**You're all set!** Start tracking your net worth and watch your wealth grow over time. 📈
