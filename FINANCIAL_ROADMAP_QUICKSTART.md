# Financial Roadmap - Quick Start Guide

## Setup (5 minutes)

### 1. Run Database Migration in Supabase

**Steps:**
1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Copy the entire contents of `backend/supabase_migrations/financial_roadmap.sql`
5. Paste into the SQL editor
6. Click **"Run"** or press `Ctrl+Enter`
7. Verify success message appears

**What this creates:**
- `financial_goals` table
- `goal_contributions` table
- `goal_milestones` table
- Indexes for performance
- Triggers for timestamps

### 2. Verify Backend
```bash
# Start backend
cd backend
python -m uvicorn app.main:app --reload

# Test endpoint
curl http://localhost:8000/api/financial-goals
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Access Feature
Navigate to: `http://localhost:3000/financial-roadmap`

## Create Your First Goal (2 minutes)

1. Click **"+ New Goal"** button
2. Select goal type (e.g., "Emergency Fund")
3. Enter goal name: "6-Month Emergency Fund"
4. Set target amount: $15,000
5. Set monthly contribution: $500
6. Choose target date: 1 year from now
7. Click **"Create Goal"**

## Add a Contribution (30 seconds)

1. Open your goal from the list
2. Click **"+ Add Contribution"**
3. Enter amount: $500
4. Select date: today
5. Add optional note
6. Click **"Add"**

## Set Milestones (1 minute)

1. In goal detail view, find Milestones section
2. Click **"+ Add Milestone"**
3. Enter milestone name: "First $5,000"
4. Set target amount: $5,000
5. Choose target date
6. Click **"Add"**

## Use Interactive Projection (30 seconds)

1. In goal detail view, find "Projection & Simulation"
2. Move the slider to adjust monthly contribution
3. Watch the projection chart update in real-time
4. See how different contributions affect completion date

## Quick Tips

- **Priority Matters**: Set emergency fund and debt repayment as priority 1
- **Be Realistic**: Base monthly contributions on actual budget capacity
- **Track Everything**: Record all contributions for accurate projections
- **Check Regularly**: Review goals monthly and adjust as needed
- **Use Milestones**: Break large goals into smaller, motivating steps

## Common Scenarios

### Scenario 1: Emergency Fund
```
Type: Emergency Fund
Target: $10,000 (6 months expenses)
Monthly: $400
Timeline: 25 months
Priority: 1
```

### Scenario 2: Debt Payoff
```
Type: Debt Repayment
Target: $8,000 (credit card)
Monthly: $500
Timeline: 16 months
Priority: 1
```

### Scenario 3: Vacation
```
Type: Vacation
Target: $3,000
Monthly: $250
Timeline: 12 months
Priority: 3
```

## Navigation

- **Dashboard**: `/financial-roadmap` - View all goals
- **New Goal**: `/financial-roadmap/new` - Create goal
- **Goal Details**: `/financial-roadmap/[id]` - View/manage goal
- **Edit Goal**: `/financial-roadmap/[id]/edit` - Update goal

## Keyboard Shortcuts

- `Ctrl/Cmd + N` - New goal (when on roadmap page)
- `Esc` - Close forms/modals
- `Tab` - Navigate form fields

## Troubleshooting

**Goals not loading?**
- Check backend is running
- Verify database migration completed
- Check browser console for errors

**Projection seems wrong?**
- Ensure monthly contribution is set
- Verify target date is in the future
- Check current amount is less than target

**Can't add contribution?**
- Verify amount is positive
- Check date format is valid
- Ensure goal exists and is accessible

## Next Steps

1. Create 2-3 primary goals
2. Set up milestones for each
3. Record your first contributions
4. Experiment with projection simulator
5. Review progress weekly
6. Adjust contributions based on budget

## Support

For issues or questions:
- Check API documentation: `/docs` endpoint
- Review full guide: `FINANCIAL_ROADMAP_GUIDE.md`
- Check troubleshooting: `TROUBLESHOOTING.md`
