# Split Transactions - Quick Start

## 🚀 Setup (5 minutes)

### 1. Apply Database Migration

In your Supabase SQL Editor:

```sql
-- Copy and paste the contents of:
-- backend/supabase_migrations/split_transactions.sql
```

Or use the Supabase CLI:
```bash
supabase db push
```

### 2. Restart Backend (if running)

```bash
# The backend code is already updated, just restart if needed
cd backend
uvicorn app.main:app --reload
```

### 3. Test the Feature

```bash
cd backend
python test_split_transactions.py
```

## 📝 How to Use

### Creating a Split Transaction

1. **Go to Transactions page**
   - Navigate to `/transactions`

2. **Click "Add Transaction"**

3. **Fill in basic details:**
   - Select budget
   - Enter total amount (e.g., $100)
   - Select date

4. **Enable splitting:**
   - Check ☑️ "Split across multiple categories"

5. **Add splits:**
   - Select category for first split
   - Enter amount (e.g., $60)
   - Add notes (optional)
   - Click "+ Add Another Split"
   - Select second category
   - Enter amount (e.g., $40)

6. **Verify totals match:**
   - Watch the summary box
   - Green = good to go ✅
   - Orange/Red = adjust amounts ⚠️

7. **Submit**
   - Button enables when splits are valid

### Example Split Transaction

**Scenario:** $100 Target purchase

```
Total: $100.00

Split 1:
- Category: Groceries
- Amount: $60.00
- Notes: Food items

Split 2:
- Category: Household
- Amount: $40.00
- Notes: Cleaning supplies

✅ Splits match total!
```

## 🎯 Common Use Cases

### Grocery Store Trip
- Groceries: $80
- Household items: $20
- Personal care: $15

### Gas Station
- Gas: $45
- Car wash: $10
- Snacks: $5

### Restaurant with Entertainment
- Dining out: $60
- Entertainment (movie tickets): $30

### Online Shopping
- Clothing: $100
- Electronics: $50
- Books: $25

## ✅ Validation Rules

- ✅ Split amounts must equal transaction total exactly
- ✅ All categories must be from the same budget
- ✅ Each split must have a category and positive amount
- ✅ At least one split required for split transactions

## 🔍 Viewing Split Transactions

Split transactions show:
- Purple "SPLIT" badge
- "Multiple Categories" label
- List of all splits with amounts
- Total transaction amount

## 📊 Budget Impact

Split transactions correctly update:
- Each category's spent amount
- Budget summary totals
- Category remaining balances

Example:
```
Groceries Budget: $500
- Regular transactions: $200
- Split portions: $80
- Total spent: $280
- Remaining: $220
```

## 🐛 Troubleshooting

**Splits don't match total?**
- Check your math
- Use the visual feedback
- Remaining should show $0.00

**Can't see split form?**
- Enter amount first
- Check the split checkbox
- Ensure budget has categories

**Category not found?**
- Select budget first
- Verify categories exist
- Refresh the page

## 🧪 Test It Works

Run this quick test:

```bash
cd backend
python test_split_transactions.py
```

Should see:
- ✅ Login successful
- ✅ Regular transaction created
- ✅ Split transaction created
- ✅ Correctly rejected invalid split
- ✅ Budget summary correct

## 📚 More Information

See `SPLIT_TRANSACTIONS_GUIDE.md` for:
- Detailed API documentation
- Database schema details
- Advanced usage patterns
- Security considerations
