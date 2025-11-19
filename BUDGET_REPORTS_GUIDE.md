# Budget Reports - User Guide

## Overview

The Budget Reports feature provides comprehensive analytics and insights into your spending habits, income patterns, and budget performance. Generate custom reports with interactive visualizations to understand your financial trends.

## Features

### Report Types

1. **Spending Analysis**
   - Total spending breakdown by category
   - Transaction counts and averages
   - Pie charts and bar charts for visual analysis
   - Spending trends over time

2. **Income Summary**
   - Total income across budgets
   - Monthly income tracking
   - Average monthly income calculations
   - Income trends

3. **Category Report**
   - Detailed category performance
   - Allocated vs. spent comparison
   - Utilization percentages
   - Category efficiency analysis

4. **Trend Analysis**
   - Spending trends over time
   - Growth rate calculations
   - Predictive forecasting (3 periods ahead)
   - Customizable grouping (day/week/month)

5. **Budget Comparison**
   - Side-by-side budget analysis
   - Income, allocated, and spent comparison
   - Utilization percentages
   - Multi-period overview

### Interactive Visualizations

- **Pie Charts**: Category spending distribution
- **Bar Charts**: Category breakdown with transaction counts
- **Line Charts**: Trend analysis over time
- **Comparison Charts**: Multi-budget performance

### Date Range Options

Quick presets available:
- Last 30 Days
- Last 3 Months
- Last 6 Months
- This Year
- Last Year
- Custom date range

### Saved Reports

- Save frequently used report configurations
- Quick access to saved reports
- Run saved reports with one click
- Update or delete saved reports

## Getting Started

### 1. Access Reports

Navigate to the Reports page from your dashboard menu.

### 2. Configure Report

1. Select report type from dropdown
2. Choose date range (use presets or custom dates)
3. Select grouping option (for spending/trend reports)
4. Click "Generate Report"

### 3. View Results

Reports display with:
- Summary statistics at the top
- Interactive charts and visualizations
- Detailed data tables
- Trend lines and forecasts

### 4. Save Reports

1. Generate a report you want to save
2. Click "Save Report"
3. Enter a descriptive name
4. Access from "Saved Reports" sidebar

## API Endpoints

### Generate Reports

```
POST /api/reports/spending
POST /api/reports/income
POST /api/reports/category
POST /api/reports/trends
POST /api/reports/comparison
```

Request body:
```json
{
  "report_type": "spending",
  "date_range_start": "2024-01-01",
  "date_range_end": "2024-03-31",
  "group_by": "month",
  "filters": {
    "budget_ids": [1, 2],
    "category_ids": [5, 10],
    "min_amount_cents": 1000,
    "max_amount_cents": 50000
  }
}
```

### Dashboard Summary

```
GET /api/reports/dashboard?months=3
```

Returns quick summary for recent months.

### Saved Reports

```
POST /api/reports/saved          # Create
GET /api/reports/saved           # List all
GET /api/reports/saved/{id}      # Get one
PUT /api/reports/saved/{id}      # Update
DELETE /api/reports/saved/{id}   # Delete
POST /api/reports/saved/{id}/run # Execute
```

## Use Cases

### Monthly Budget Review

1. Generate a **Comparison Report** for the last 3 months
2. Review utilization percentages
3. Identify over-spending categories
4. Adjust next month's budget accordingly

### Spending Pattern Analysis

1. Create a **Spending Analysis** report for 6 months
2. Review category pie chart
3. Identify top spending categories
4. Look for opportunities to reduce expenses

### Income Tracking

1. Generate an **Income Report** for the year
2. Review monthly income trends
3. Calculate average monthly income
4. Plan future budgets based on income patterns

### Trend Forecasting

1. Create a **Trend Analysis** report
2. Review growth rate
3. Check forecast predictions
4. Adjust spending to meet goals

### Category Performance

1. Generate a **Category Report**
2. Review utilization percentages
3. Identify under-utilized categories
4. Reallocate budget to better match spending

## Tips & Best Practices

### Report Configuration

- Use longer date ranges (3-6 months) for trend analysis
- Use shorter ranges (1 month) for detailed spending review
- Group by month for long-term trends
- Group by week for short-term analysis

### Interpreting Results

- **Utilization > 100%**: Over-budget, need to adjust
- **Utilization < 50%**: Under-utilized, consider reallocation
- **Positive growth rate**: Spending increasing (watch carefully)
- **Negative growth rate**: Spending decreasing (good trend)

### Saved Reports

- Create monthly review reports
- Save year-end summary configurations
- Build quarterly comparison reports
- Set up category performance trackers

### Data Quality

- Ensure all transactions are categorized
- Keep budget allocations up to date
- Review and correct any data errors
- Use consistent category naming

## Troubleshooting

### No Data in Report

- Check date range includes transactions
- Verify budgets exist for the period
- Ensure transactions are properly categorized

### Unexpected Results

- Review filter settings
- Check for split transactions
- Verify budget allocations
- Confirm date range is correct

### Performance Issues

- Reduce date range for large datasets
- Use filters to narrow results
- Group by month instead of day
- Limit number of categories

## Advanced Features

### Filters

Apply filters to focus reports:
- Specific budgets
- Specific categories
- Amount ranges
- Category groups

### Forecasting

Trend reports include 3-period forecasts based on:
- Historical spending patterns
- Average growth rates
- Linear projection

### Export Options

(Coming soon)
- Export to CSV
- Export to PDF
- Share reports
- Schedule automated reports

## Integration

Reports integrate with:
- Budgets
- Transactions
- Categories
- Paychecks
- Financial Goals

## Support

For issues or questions:
1. Check this guide
2. Review API documentation
3. Check transaction data quality
4. Verify budget configurations
