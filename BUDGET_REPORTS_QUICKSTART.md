# Budget Reports - Quick Start Guide

## Setup

### 1. Run Database Migration

```bash
cd backend
python migrate_budget_reports.py
```

This creates the `budget_reports` table for saving custom report configurations.

### 2. Start Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

## Testing

Run the test script to verify all endpoints:

```bash
cd backend
python test_budget_reports.py
```

## Quick Usage

### Access Reports

Navigate to: `http://localhost:3000/reports`

### Generate Your First Report

1. **Select Report Type**: Choose from dropdown (Spending, Income, Category, Trend, Comparison)
2. **Set Date Range**: Use presets or custom dates
3. **Click Generate**: View interactive charts and data
4. **Save Report**: Click "Save Report" to reuse configuration

### Report Types

- **Spending Analysis**: See where your money goes with pie charts and trends
- **Income Summary**: Track income across budgets
- **Category Report**: Analyze category performance and utilization
- **Trend Analysis**: View spending trends with forecasting
- **Budget Comparison**: Compare multiple budgets 