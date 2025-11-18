# Transaction Tracking - Quick Start Guide

## Setup (5 minutes)

### 1. Run Database Migration
```bash
cd backend
python migrate_transactions.py
```

### 2. Start Backend (if not running)
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### 3. Start Frontend (if not running)
```bash
cd frontend
npm run dev
```

## Test the Feature (2 minutes)

### Option 1: Use the Test Script
```bash
cd backend
python test_transactions.py
```

This will:
- Create a test user
- Create a test budget with categories
- Add sample transactions
- Test all API endpoints
- Show spending summary

### Option 2: Use the UI

1. **Login/Register**
   - Go to http://localhost:3000
   - Login or create account

2. **Create a Budget**
   - Navigate to "Budgets"
   - Click "Create Budget"
   - Set income: $5000
   - Add categories:
     - Groceries: $500
     - Gas: $200
     - Entertainment: $150
   - Save budget

3. **Add Transactions**
   - Click "Transactions" in nav
   - Click "Add Transaction"
   - Select your budget
   - Select "Groceries"
   - Enter amount: $45.99
   - Select today's date
   - Add note: "Whole Foods"
   - Click "Add Transaction"

4. **View Spending**
   - Go back to "Budgets"
   - Click on your budget
   - See spending progress bars
   - Green bar shows $45.99 spent of $500

5. **Add More Transactions**
   - Add a few more to see the progress
   - Watch the bars fill up
   - See color change at 90% (yellow) and 100% (red)

## Quick API Test with curl

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -d "username=test@example.com&password=testpass123" \
  | jq -r .access_token)

# 2. Create transaction
curl -X POST http://localhost:8000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budget_id": 1,
    "category_id": 1,
    "amount_cents": 4599,
    "date": "2025-11-18",
    "notes": "Test transaction"
  }'

# 3. List transactions
curl http://localhost:8000/api/transactions \
  -H "Authorization: Bearer $TOKEN"

# 4. Get budget summary
curl http://localhost:8000/api/transactions/budget/1/summary \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### "Budget not found" error
- Make sure you created a budget first
- Check the budget_id in your request

### "Category not found" error
- Verify the category belongs to the selected budget
- Check category_id matches a category in that budget

### Database errors
- Run the migration script: `python migrate_transactions.py`
- Check database connection in `.env`

### Frontend not showing transactions
- Check browser console for errors
- Verify backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in frontend/.env.local

## What's Next?

Try these features:
- Filter transactions by budget or category
- Delete a transaction
- Create multiple budgets for different months
- Watch spending progress in real-time
- Add transactions from the budget detail page

## Key URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Transactions Page: http://localhost:3000/transactions
- Budgets Page: http://localhost:3000/budgets
