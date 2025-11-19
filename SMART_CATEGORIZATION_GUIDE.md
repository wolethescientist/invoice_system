# Smart Category Suggestions Guide

## Overview

The Smart Category Suggestions feature uses machine learning-like algorithms to automatically suggest budget categories for transactions based on your spending history and patterns. This saves time and ensures consistent categorization across your budget.

## Features

### 🎯 Intelligent Suggestions
- **Exact Match**: Recognizes identical transaction descriptions you've used before
- **Keyword Matching**: Finds similar transactions based on keywords in descriptions
- **Amount-Based**: Suggests categories based on similar transaction amounts
- **Frequency-Based**: Recommends your most frequently used categories as fallback

### 📊 Learning System
- Learns from every transaction you categorize
- Improves accuracy over time based on your choices
- Adapts to your spending patterns automatically
- Tracks confidence scores for each pattern

### 📈 Real-Time Feedback
- Shows confidence level for each suggestion (percentage match)
- Displays reason for suggestion (exact match, similar, etc.)
- Shows usage count for each pattern
- Provides instant budget impact preview

### 📉 Performance Tracking
- View suggestion accuracy statistics
- Track accepted vs rejected suggestions
- Monitor learning progress over time
- Filter stats by time period (7, 30, 90 days)

## How It Works

### 1. Pattern Learning

When you create a transaction, the system:
1. Normalizes the transaction description (lowercase, removes special characters)
2. Extracts meaningful keywords
3. Associates the description with the chosen category
4. Stores this pattern with a confidence score

### 2. Suggestion Algorithm

When you type a transaction description, the system:
1. **Exact Match** (highest priority): Looks for identical descriptions
2. **Keyword Match**: Searches for similar keywords in past transactions
3. **Amount Match**: Finds transactions with similar amounts
4. **Popular Categories**: Falls back to frequently used categories

### 3. Confidence Scoring

Each suggestion includes a confidence score:
- **80-100%**: Exact match or very strong pattern
- **50-79%**: Good keyword match or similar transaction
- **30-49%**: Amount-based or frequently used category

### 4. Continuous Improvement

The system improves by:
- Increasing confidence when patterns are reused
- Decreasing confidence when suggestions are rejected
- Learning new patterns from every transaction
- Adapting to changes in your spending habits

## Usage

### Adding a Transaction with Smart Suggestions

1. **Enter Amount**: Type the transaction amount
2. **Enter Description**: Start typing a description (e.g., "Grocery shopping at Walmart")
3. **View Suggestions**: Smart suggestions appear automatically after 3+ characters
4. **Select Suggestion**: Click a suggestion to apply it instantly
5. **Review Budget Impact**: See real-time budget updates
6. **Submit**: Complete the transaction

### Understanding Suggestions

Each suggestion shows:
- **Category Name**: The suggested budget category
- **Confidence Badge**: Match percentage (color-coded)
- **Reason**: Why this category was suggested
- **Usage Count**: How many times this pattern was used

### Suggestion Reasons

- **Exact match**: You've used this exact description before
- **Similar transaction**: Keywords match previous transactions
- **Similar amount**: Amount is close to past transactions in this category
- **Frequently used**: One of your most-used categories

### Visual Feedback

- **Green highlight**: Category successfully applied from suggestion
- **Yellow warning**: Transaction will exceed category budget
- **Progress bar**: Shows budget usage after transaction
- **Confidence colors**:
  - Green (80%+): High confidence
  - Yellow (50-79%): Medium confidence
  - Gray (<50%): Low confidence

## Best Practices

### For Better Suggestions

1. **Be Consistent**: Use similar descriptions for similar transactions
   - Good: "Walmart groceries", "Walmart grocery shopping"
   - Avoid: Random descriptions for the same store

2. **Be Descriptive**: Include meaningful keywords
   - Good: "Gas at Shell station"
   - Avoid: "Stuff" or "Things"

3. **Use Suggestions**: Accept accurate suggestions to reinforce patterns
   - The more you use suggestions, the better they become

4. **Correct Mistakes**: If a suggestion is wrong, select the correct category
   - The system learns from corrections

### Improving Accuracy

- Add at least 10-20 transactions before expecting high accuracy
- Use descriptive notes that include merchant names or transaction types
- Be consistent with your categorization choices
- Review the stats dashboard to track improvement

## API Endpoints

### Get Suggestions
```
POST /api/category-suggestions/suggest
```

Request:
```json
{
  "budget_id": 1,
  "notes": "Grocery shopping at Walmart",
  "amount_cents": 5000
}
```

Response:
```json
{
  "suggestions": [
    {
      "category_id": 5,
      "category_name": "Groceries",
      "confidence": 0.95,
      "reason": "exact_match",
      "usage_count": 12
    }
  ]
}
```

### Submit Feedback
```
POST /api/category-suggestions/feedback
```

Request:
```json
{
  "transaction_id": 123,
  "suggested_category_id": 5,
  "actual_category_id": 5,
  "pattern_text": "grocery shopping at walmart"
}
```

### Get Statistics
```
GET /api/category-suggestions/stats?days=30
```

Response:
```json
{
  "total_suggestions": 45,
  "accepted": 38,
  "rejected": 7,
  "accuracy": 84.44
}
```

## Database Schema

### category_patterns
Stores learned patterns for suggestions:
- `user_id`: User who owns the pattern
- `category_id`: Associated budget category
- `pattern_text`: Normalized transaction description
- `confidence_score`: How confident we are (0.0-1.0)
- `usage_count`: Number of times pattern was used
- `last_used`: When pattern was last used

### category_suggestion_logs
Tracks suggestion performance:
- `user_id`: User who received suggestion
- `transaction_id`: Associated transaction
- `suggested_category_id`: What was suggested
- `actual_category_id`: What was actually chosen
- `was_accepted`: 1 if accepted, 0 if rejected
- `pattern_text`: The transaction description

## Components

### CategorySuggestions
Displays smart suggestions as user types:
```tsx
<CategorySuggestions
  budgetId={budgetId}
  notes={notes}
  amountCents={amountCents}
  onSelectCategory={(id, name, suggestion) => {
    // Handle selection
  }}
/>
```

### SmartTransactionForm
Complete transaction form with integrated suggestions:
```tsx
<SmartTransactionForm
  budgetId={budgetId}
  categories={categories}
  onSuccess={() => {
    // Handle success
  }}
/>
```

### CategorySuggestionStats
Dashboard showing suggestion performance:
```tsx
<CategorySuggestionStats />
```

## Troubleshooting

### No Suggestions Appearing

**Problem**: Suggestions don't show up when typing
**Solutions**:
- Ensure description is at least 3 characters
- Wait 500ms for debounce delay
- Check that you have past transactions with descriptions
- Verify budget has active categories

### Low Accuracy

**Problem**: Suggestions are often wrong
**Solutions**:
- Add more transactions to build pattern history
- Use more descriptive transaction notes
- Be consistent with categorization
- Give the system time to learn (10-20 transactions minimum)

### Suggestions Not Learning

**Problem**: Same wrong suggestions keep appearing
**Solutions**:
- Make sure to select the correct category when rejecting suggestions
- Check that feedback is being submitted (check browser console)
- Verify database migrations ran successfully
- Clear old patterns if spending habits changed significantly

## Performance Considerations

### Optimization
- Suggestions are debounced (500ms delay)
- Pattern matching uses indexed database queries
- Results are limited to top 3 suggestions
- Keyword extraction filters common words

### Scalability
- Patterns are user-specific (no cross-user data)
- Old unused patterns can be cleaned up
- Indexes optimize query performance
- Confidence scores prevent pattern bloat

## Privacy & Security

- All patterns are user-specific and private
- No data is shared between users
- Patterns are deleted when user is deleted (CASCADE)
- Row Level Security (RLS) enforced in Supabase

## Future Enhancements

Potential improvements:
- Category group suggestions
- Merchant recognition
- Recurring transaction detection
- Budget optimization recommendations
- Export/import pattern data
- Multi-language support
- Mobile app integration

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check browser console for errors
4. Verify database migrations completed
5. Test with simple, clear transaction descriptions

## Migration

To enable this feature:

1. **Run SQLite Migration**:
   ```bash
   python backend/migrate_category_suggestions.py
   ```

2. **Run Supabase Migration**:
   ```sql
   -- Execute backend/supabase_migrations/category_suggestions.sql
   ```

3. **Restart Backend**:
   ```bash
   # Backend will automatically include new endpoints
   ```

4. **Use Components**:
   ```tsx
   import SmartTransactionForm from '@/components/SmartTransactionForm';
   import CategorySuggestionStats from '@/components/CategorySuggestionStats';
   ```

## Summary

Smart Category Suggestions transforms transaction entry from a manual, repetitive task into an intelligent, assisted experience. The system learns your spending patterns and provides increasingly accurate suggestions over time, saving you time and ensuring consistent budget categorization.

Start using it today by adding transactions with descriptive notes, and watch as the system learns and adapts to your unique spending habits!
