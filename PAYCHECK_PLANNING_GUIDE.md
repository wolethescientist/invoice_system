# Paycheck Planning Feature Guide

## Overview

The Paycheck Planning feature allows users to schedule their income and manage budget allocations based on when they get paid. This helps users plan their spending around their actual cash flow.

## Key Features

### 1. Paycheck Schedules
- Create recurring paycheck schedules with different frequencies:
  - Weekly
  - Bi-weekly (every 2 weeks)
  - Semi-monthly (twice a month)
  - Monthly
  - Custom
- Set paycheck amount and next payment date
- Activate/deactivate paychecks as needed

### 2. Paycheck Instances
- Automatically generate paycheck occurrences for specific budget months
- Track which paychecks have been received
- Link paychecks to specific budgets

### 3. Category Allocations
- Define default allocation templates for each paycheck
- Specify how much of each paycheck goes to which budget categories
- Allocations are copied to instances but can be customized per occurrence

### 4. Budget Funding Plan
- View all paychecks scheduled for a budget month
- See total income vs. total allocated amounts
- Track available funds to allocate
- Monitor funding status (fully funded vs. needs funding)

### 5. Category Funding Status
- See how much each category has been funded
- Track remaining amounts needed for each category
- View which paychecks contribute to each category
- Visual progress bars showing funding percentage

## API Endpoints

### Paycheck Management

#### Create Paycheck
```
POST /api/paychecks
```
```json
{
  "name": "Main Job",
  "amount_cents": 250000,
  "frequency": "biweekly",
  "next_date": "2025-12-15",
  "is_active": true,
  "allocations": [
    {
      "category_id": 1,
      "amount_cents": 100000,
      "order": 0
    }
  ]
}
```

#### List Paychecks
```
GET /api/paychecks?active_only=true
```

#### Get Paycheck
```
GET /api/paychecks/{id}
```

#### Update Paycheck
```
PUT /api/paychecks/{id}
```

#### Delete Paycheck
```
DELETE /api/paychecks/{id}
```

#### Get Paycheck Schedule
```
GET /api/paychecks/{id}/schedule?months_ahead=3
```

### Paycheck Instances

#### Create Paycheck Instance
```
POST /api/paychecks/instances
```
```json
{
  "paycheck_id": 1,
  "budget_id": 1,
  "amount_cents": 250000,
  "date": "2025-12-15",
  "is_received": false,
  "allocations": [
    {
      "category_id": 1,
      "amount_cents": 100000,
      "order": 0
    }
  ]
}
```

#### List Budget Paycheck Instances
```
GET /api/paychecks/instances/budget/{budget_id}
```

#### Mark Paycheck Received
```
PUT /api/paychecks/instances/{instance_id}/receive
```

### Budget Funding

#### Get Budget Funding Plan
```
GET /api/paychecks/budget/{budget_id}/funding-plan
```

Response:
```json
{
  "budget_id": 1,
  "month": 12,
  "year": 2025,
  "total_income_cents": 500000,
  "total_allocated_cents": 320000,
  "paychecks": [...],
  "available_to_allocate_cents": 180000,
  "is_fully_funded": true
}
```

#### Get Category Funding Status
```
GET /api/paychecks/budget/{budget_id}/category-funding
```

Response:
```json
[
  {
    "category_id": 1,
    "category_name": "Rent",
    "allocated_cents": 150000,
    "funded_cents": 150000,
    "remaining_cents": 0,
    "is_fully_funded": true,
    "funding_sources": [
      {
        "instance_id": 1,
        "amount_cents": 75000
      },
      {
        "instance_id": 2,
        "amount_cents": 75000
      }
    ]
  }
]
```

#### Auto-Allocate Paychecks
```
POST /api/paychecks/budget/{budget_id}/auto-allocate
```

Automatically creates paycheck instances for all active paychecks that fall within the budget month, using their default allocation templates.

## Database Schema

### paychecks
- `id`: Primary key
- `user_id`: Foreign key to users
- `name`: Paycheck name (e.g., "Main Job")
- `amount_cents`: Paycheck amount in cents
- `frequency`: Payment frequency (weekly, biweekly, etc.)
- `next_date`: Next expected payment date
- `is_active`: Whether this paycheck is active
- `created_at`, `updated_at`: Timestamps

### paycheck_instances
- `id`: Primary key
- `paycheck_id`: Foreign key to paychecks
- `budget_id`: Foreign key to budgets
- `amount_cents`: Actual amount for this instance
- `date`: Date of this paycheck occurrence
- `is_received`: Whether the paycheck has been received
- `created_at`: Timestamp

### paycheck_allocations
- `id`: Primary key
- `paycheck_id`: Foreign key to paychecks
- `instance_id`: Foreign key to paycheck_instances (NULL for templates)
- `category_id`: Foreign key to budget_categories
- `amount_cents`: Allocation amount in cents
- `order`: Display order
- `created_at`, `updated_at`: Timestamps

## Frontend Pages

### `/paychecks`
List all paychecks with options to:
- View active/inactive paychecks
- Create new paycheck
- Edit/delete existing paychecks

### `/paychecks/new`
Create a new paycheck schedule with:
- Name
- Amount
- Frequency
- Next payment date
- Active status

### `/paychecks/{id}`
View paycheck details including:
- Basic information
- Upcoming payment schedule
- Default allocations

### `/paychecks/{id}/edit`
Edit paycheck details and allocations

### `/budgets/{id}/funding`
View budget funding plan showing:
- Funding summary (income, allocated, available)
- All paychecks for the month
- Category funding status with progress bars
- Auto-allocate button

## Usage Workflow

### 1. Set Up Paychecks
1. Navigate to `/paychecks`
2. Click "Add Paycheck"
3. Enter paycheck details (name, amount, frequency, next date)
4. Save the paycheck

### 2. Configure Allocations (Optional)
1. Edit the paycheck
2. Add allocation templates for categories
3. Specify how much goes to each category by default

### 3. Link Paychecks to Budget
1. Navigate to a budget
2. Click "Funding Plan" or go to `/budgets/{id}/funding`
3. Click "Auto-Allocate Paychecks"
4. System creates instances for all paychecks in that month

### 4. Monitor Funding
1. View the funding plan to see:
   - Total income from paychecks
   - How much is allocated
   - Which categories are fully funded
   - Which categories need more funding

### 5. Mark Paychecks Received
1. As paychecks arrive, mark them as received
2. This helps track actual vs. expected income

## Best Practices

1. **Set Up All Income Sources**: Create separate paychecks for different jobs or income sources
2. **Use Allocation Templates**: Define default allocations to save time
3. **Review Before Auto-Allocate**: Check your budget categories before auto-allocating
4. **Update Next Date**: After receiving a paycheck, the system should auto-update the next date
5. **Deactivate Old Paychecks**: Instead of deleting, deactivate paychecks you no longer receive
6. **Monitor Funding Status**: Regularly check category funding to ensure all needs are covered

## Migration

### Local SQLite
```bash
python backend/migrate_paychecks.py
```

### Supabase/PostgreSQL
Run the SQL migration:
```bash
psql -d your_database -f backend/supabase_migrations/paycheck_planning.sql
```

## Testing

Run the test script:
```bash
python backend/test_paychecks.py
```

This will:
1. Create a test budget
2. Create a paycheck schedule
3. Get the paycheck schedule
4. Auto-allocate paychecks to the budget
5. View funding plan
6. Check category funding status

## Troubleshooting

### Paychecks Not Showing in Budget
- Ensure paychecks are marked as active
- Check that paycheck dates fall within the budget month
- Run auto-allocate to create instances

### Allocations Don't Match
- Template allocations are copied to instances
- Instances can be modified independently
- Check both template and instance allocations

### Funding Calculation Issues
- Verify all paycheck instances are linked to correct budget
- Check that allocations sum correctly
- Ensure category IDs are valid

## Future Enhancements

Potential improvements:
- Variable paycheck amounts (e.g., commission-based)
- Split paychecks across multiple months
- Paycheck reminders/notifications
- Historical paycheck tracking
- Income vs. expense reports
- Automatic next date calculation after marking received
- Bulk edit allocations
- Copy allocations from previous paycheck
