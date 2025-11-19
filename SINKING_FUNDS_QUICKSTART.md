# Sinking Funds Quick Start Guide

## What are Sinking Funds?

Sinking funds are dedicated savings accounts for specific goals. Instead of saving randomly, you set aside money each month for planned expenses like:

- Emergency fund
- Vacation
- Car repairs
- Home improvements
- Holiday gifts
- New electronics
- Medical expenses

## Getting Started

### 1. Setup (One-time)

Run the database migration:

```bash
python backend/migrate_sinking_funds.py
```

You should see: `✓ Sinking funds tables created successfully`

### 2. Start the Application

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Access Sinking Funds

Navigate to: `http://localhost:3000/sinking-funds`

## Creating Your First Fund

### Example: Emergency Fund

1. Click **"Create New Fund"**

2. Fill in the details:
   - **Name**: Emergency Fund
   - **Target Amount**: $5,000.00
   - **Monthly Contribution**: $500.00
   - **Target Date**: (optional) 10 months from now
   - **Description**: 6 months of expenses
   - **Color**: Red (for urgency)

3. Click **"Create Fund"**

The system will show you:
- You'll reach your goal in approximately **10 months**
- Progress bar (currently at 0%)
- All fund details

## Adding Contributions

### Making a Deposit

1. Open your fund (click on it)
2. Click **"Add Contribution"**
3. Enter amount: `$500.00`
4. Add note: "Monthly contribution - January"
5. Click **"Add Contribution"**

Your balance updates automatically!

### Recording a Withdrawal

Sometimes you need to use your savings:

1. Click **"Add Contribution"**
2. Enter **negative** amount: `-$200.00`
3. Add note: "Car repair emergency"
4. Click **"Add Contribution"**

The balance decreases, and you can see the withdrawal in your history.

## Understanding Progress

### Progress Bar Colors

- 🔴 **Red** (0-25%): Just getting started
- 🟠 **Orange** (25-50%): Making progress
- 🟡 **Yellow** (50-75%): Halfway there!
- 🔵 **Blue** (75-100%): Almost done!
- 🟢 **Green** (100%+): Goal reached!

### On-Track Status

If you set a target date, the system tells you if you're on track:

- ✅ **On Track**: You'll reach your goal by the target date
- ⚠️ **Behind Schedule**: Need to increase contributions

### Key Metrics

- **Current Balance**: How much you've saved
- **Target Amount**: Your goal
- **Remaining**: How much more you need
- **Progress**: Percentage complete
- **Months to Target**: Based on your monthly contribution

## Common Use Cases

### 1. Emergency Fund
```
Target: $5,000
Monthly: $500
Timeline: 10 months
```

### 2. Vacation Fund
```
Target: $3,000
Monthly: $250
Timeline: 12 months
```

### 3. Car Replacement
```
Target: $15,000
Monthly: $300
Timeline: 50 months (4+ years)
```

### 4. Holiday Gifts
```
Target: $1,200
Monthly: $100
Timeline: 12 months
```

## Managing Multiple Funds

### Viewing All Funds

The main page shows:
- Summary cards with totals
- Grid of all your funds
- Quick actions (Edit/Delete)

### Sorting Options

Sort your funds by:
- **Date Created**: Newest first
- **Name**: Alphabetical
- **Progress**: Most complete first
- **Target Amount**: Largest first

### Summary Dashboard

At the top, see:
- **Total Funds**: How many you have
- **Total Target**: Combined goals
- **Total Saved**: All your savings
- **Overall Progress**: Across all funds

## Tips for Success

### 1. Start Small
Don't create too many funds at once. Start with 2-3 most important goals.

### 2. Be Realistic
Set achievable monthly contributions based on your actual budget.

### 3. Track Everything
Record every deposit and withdrawal, even small amounts.

### 4. Use Descriptions
Add notes to help remember why you saved or spent.

### 5. Review Monthly
Check your progress each month and adjust if needed.

### 6. Celebrate Milestones
When you hit 25%, 50%, 75%, and 100% - celebrate!

### 7. Color Code
Use colors to quickly identify fund types:
- Red: Emergency/urgent
- Blue: Long-term savings
- Green: Fun/vacation
- Yellow: Maintenance/repairs

## Editing a Fund

Need to change your plan?

1. Open the fund
2. Click **"Edit Fund"**
3. Update any field:
   - Increase/decrease target
   - Adjust monthly contribution
   - Change target date
   - Update description
4. Click **"Save Changes"**

## Deactivating a Fund

Completed a goal but want to keep the history?

1. Edit the fund
2. Uncheck **"Active"**
3. Save

The fund won't show in your main list but history is preserved.

## Deleting a Fund

⚠️ **Warning**: This permanently deletes the fund and all contributions!

1. Open the fund (or from main list)
2. Click **"Delete"**
3. Confirm deletion

## Testing the API

Want to verify everything works?

```bash
python backend/test_sinking_funds.py
```

This runs automated tests on all features.

## Troubleshooting

### Fund not showing up
- Refresh the page
- Check if it's marked as inactive
- Verify you're logged in

### Contribution not adding
- Check the amount format (use decimals: 100.00)
- Ensure you're not making balance negative
- Verify network connection

### Progress seems wrong
- Verify target amount is correct
- Check all contributions are recorded
- Refresh the page

## Example Workflow

### Month 1: Setup
1. Create Emergency Fund ($5,000 target)
2. Create Vacation Fund ($3,000 target)
3. Set monthly contributions

### Month 2-12: Regular Contributions
1. Each month, add contributions
2. Track progress
3. Adjust if needed

### Month 13: Review
1. Check overall progress
2. Celebrate completed goals
3. Create new funds for next goals

## Integration with Budget

Sinking funds work great with your budget:

1. Create budget category: "Savings"
2. Allocate total of all monthly contributions
3. When you save, record in both places
4. Track budget vs. actual savings

## Next Steps

1. ✅ Create your first fund
2. ✅ Add your first contribution
3. ✅ Set up 2-3 more funds
4. ✅ Review progress weekly
5. ✅ Adjust contributions as needed
6. ✅ Celebrate when you reach goals!

## Need Help?

- Check `SINKING_FUNDS_GUIDE.md` for detailed documentation
- Review `SINKING_FUNDS_IMPLEMENTATION.md` for technical details
- Run test script to verify functionality
- Check API documentation at `/docs`

## Success Story Example

**Goal**: Save $5,000 emergency fund in 10 months

**Month 1**: 
- Created fund
- Added $500
- Progress: 10%

**Month 5**:
- Consistent $500/month
- Balance: $2,500
- Progress: 50%
- Status: On track! ✅

**Month 8**:
- Had emergency: -$300 withdrawal
- Added extra $300 to catch up
- Still on track!

**Month 10**:
- Final contribution
- Balance: $5,000
- Progress: 100%
- Goal achieved! 🎉

Now you're ready to start building your sinking funds! Remember, consistency is key. Even small amounts add up over time.
