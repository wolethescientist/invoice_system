# Smart Category Suggestions - Quick Start

Get up and running with intelligent transaction categorization in 5 minutes!

## 🚀 Quick Setup

### 1. Run Database Migration

**For SQLite (Local Development)**:
```bash
cd backend
python migrate_category_suggestions.py
```

**For Supabase (Production)**:
```bash
# Execute the SQL file in your Supabase SQL editor
cat backend/supabase_migrations/category_suggestions.sql
```

### 2. Restart Backend
```bash
# The new endpoints are automatically included
cd backend
python -m uvicorn app.main:app --reload
```

### 3. Start Using It!

The feature is now active. No frontend changes needed - it's already integrated!

## 📝 First Transaction with Smart Suggestions

1. **Navigate to Transactions**
   - Go to your budget page
   - Click "Add Transaction"

2. **Enter Details**
   ```
   Amount: $50.00
   Date: Today
   Description: "Grocery shopping at Walmart"
   ```

3. **See Magic Happen**
   - After typing 3+ characters, suggestions appear
   - Click a suggestion to apply it instantly
   - See real-time budget updates

4. **Submit**
   - Review the budget impact
   - Click "Add Transaction"
   - Done!

## 🎯 Using the Components

### Option 1: Use SmartTransactionForm (Recommended)

Replace your existing transaction form:

```tsx
import SmartTransactionForm from '@/components/SmartTransactionForm';

// In your page/component
<SmartTransactionForm
  budgetId={budgetId}
  categories={categories}
  onSuccess={() => router.refresh()}
/>
```

### Option 2: Add Suggestions to Existing Form

Add suggestions to your current form:

```tsx
import CategorySuggestions from '@/components/CategorySuggestions';

// In your form
<CategorySuggestions
  budgetId={budgetId}
  notes={formData.notes}
  amountCents={amountCents}
  onSelectCategory={(id, name) => {
    setFormData(prev => ({ ...prev, category_id: id }));
  }}
/>
```

### Option 3: View Statistics

Show suggestion performance:

```tsx
import CategorySuggestionStats from '@/components/CategorySuggestionStats';

// In your dashboard
<CategorySuggestionStats />
```

## 🧪 Test It Out

### Test Scenario 1: First Transaction
```
1. Add: "Walmart groceries" → Select "Groceries" category
2. Add: "Walmart grocery shopping" → See suggestion for "Groceries"!
3. Click suggestion → Category auto-filled
```

### Test Scenario 2: Amount-Based
```
1. Add: "Gas" $45 → Select "Transportation"
2. Add: "Fuel" $47 → See "Transportation" suggested (similar amount)
```

### Test Scenario 3: Learning
```
1. Add 5 transactions with "coffee" → Select "Dining Out"
2. Add: "Morning coffee" → See "Dining Out" with high confidence
```

## 📊 Check Your Stats

After adding 10+ transactions:

1. Navigate to your dashboard
2. Add the stats component
3. View your accuracy rate
4. See accepted vs rejected suggestions

## 🎨 Customization

### Adjust Suggestion Limit
```tsx
<CategorySuggestions
  budgetId={budgetId}
  notes={notes}
  onSelectCategory={handleSelect}
  // Show up to 5 suggestions instead of 3
/>
```

### Change Debounce Delay
Edit `CategorySuggestions.tsx`:
```tsx
// Change from 500ms to 300ms
const timeoutId = setTimeout(fetchSuggestions, 300);
```

### Customize Confidence Thresholds
Edit `CategorySuggestions.tsx`:
```tsx
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'text-green-600';  // Stricter
  if (confidence >= 0.7) return 'text-yellow-600';
  return 'text-gray-600';
};
```

## 🔧 API Usage

### Get Suggestions Programmatically

```typescript
import { categorySuggestionsApi } from '@/lib/category-suggestions-api';

const suggestions = await categorySuggestionsApi.getSuggestions({
  budget_id: 1,
  notes: "Coffee at Starbucks",
  amount_cents: 550
});

console.log(suggestions);
// [{
//   category_id: 3,
//   category_name: "Dining Out",
//   confidence: 0.85,
//   reason: "keyword_match",
//   usage_count: 8
// }]
```

### Submit Feedback

```typescript
await categorySuggestionsApi.submitFeedback({
  transaction_id: 123,
  suggested_category_id: 3,
  actual_category_id: 3,  // Same = accepted
  pattern_text: "coffee at starbucks"
});
```

### Get Statistics

```typescript
const stats = await categorySuggestionsApi.getStats(30);
console.log(`Accuracy: ${stats.accuracy}%`);
```

## 💡 Pro Tips

### Tip 1: Be Descriptive
```
❌ "Store"
✅ "Walmart groceries"
```

### Tip 2: Be Consistent
```
✅ "Starbucks coffee"
✅ "Coffee at Starbucks"
❌ "Morning drink" (for Starbucks)
```

### Tip 3: Use Suggestions
The more you accept accurate suggestions, the better they become!

### Tip 4: Include Merchant Names
```
✅ "Gas at Shell"
✅ "Dinner at Olive Garden"
✅ "Haircut at SuperCuts"
```

## 🐛 Quick Troubleshooting

### No Suggestions?
- Type at least 3 characters
- Wait 500ms (debounce delay)
- Add more transactions first (need history)

### Wrong Suggestions?
- Select the correct category
- System learns from corrections
- Give it 10-20 transactions to learn

### Not Learning?
- Check browser console for errors
- Verify migration ran successfully
- Ensure feedback is being submitted

## 📈 Expected Results

After using the feature:

| Transactions | Expected Accuracy |
|--------------|-------------------|
| 0-10         | 30-50%           |
| 10-25        | 50-70%           |
| 25-50        | 70-85%           |
| 50+          | 85-95%           |

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Suggestions appear as you type
- ✅ Confidence scores are displayed
- ✅ Clicking suggestions fills the category
- ✅ Budget updates in real-time
- ✅ Stats show improving accuracy

## 🔄 Next Steps

1. **Add 20+ transactions** with good descriptions
2. **Use suggestions** when they're accurate
3. **Check stats** after a week
4. **Enjoy** faster transaction entry!

## 📚 Learn More

- Full documentation: `SMART_CATEGORIZATION_GUIDE.md`
- API docs: `API_DOCUMENTATION.md`
- Troubleshooting: See guide above

## 🎯 Quick Win

Try this right now:
1. Add transaction: "Walmart groceries" → Groceries
2. Add transaction: "Walmart shopping" → See suggestion!
3. Click suggestion → Done in 2 seconds! ⚡

That's it! You're now using AI-powered transaction categorization. Happy budgeting! 🎊
