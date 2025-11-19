from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date

class ReportFilters(BaseModel):
    budget_ids: Optional[List[int]] = None
    category_ids: Optional[List[int]] = None
    category_groups: Optional[List[str]] = None
    min_amount_cents: Optional[int] = None
    max_amount_cents: Optional[int] = None

class ReportRequest(BaseModel):
    report_type: str = Field(..., description="Type: spending, income, category, trend, comparison")
    date_range_start: date
    date_range_end: date
    filters: Optional[ReportFilters] = None
    group_by: Optional[str] = Field(None, description="Group by: day, week, month, category, budget")

class SavedReportCreate(BaseModel):
    name: str = Field(..., max_length=255)
    report_type: str
    date_range_start: date
    date_range_end: date
    filters: Optional[Dict[str, Any]] = None

class SavedReportUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    date_range_start: Optional[date] = None
    date_range_end: Optional[date] = None
    filters: Optional[Dict[str, Any]] = None

class SavedReport(BaseModel):
    id: int
    user_id: int
    name: str
    report_type: str
    date_range_start: date
    date_range_end: date
    filters: Optional[Dict[str, Any]]
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

# Report response models
class CategorySpending(BaseModel):
    category_id: int
    category_name: str
    total_spent_cents: int
    transaction_count: int
    percentage: float

class MonthlyTrend(BaseModel):
    period: str  # YYYY-MM or YYYY-WW
    total_cents: int
    transaction_count: int
    avg_transaction_cents: int

class BudgetComparison(BaseModel):
    budget_id: int
    month: int
    year: int
    income_cents: int
    allocated_cents: int
    spent_cents: int
    remaining_cents: int
    utilization_percentage: float

class SpendingReport(BaseModel):
    total_spent_cents: int
    transaction_count: int
    avg_transaction_cents: int
    by_category: List[CategorySpending]
    trends: List[MonthlyTrend]

class IncomeReport(BaseModel):
    total_income_cents: int
    budget_count: int
    avg_monthly_income_cents: int
    by_month: List[Dict[str, Any]]

class CategoryReport(BaseModel):
    category_id: int
    category_name: str
    total_allocated_cents: int
    total_spent_cents: int
    budget_count: int
    avg_allocated_cents: int
    avg_spent_cents: int
    utilization_percentage: float

class TrendReport(BaseModel):
    period_type: str  # day, week, month
    trends: List[MonthlyTrend]
    growth_rate: float
    forecast: Optional[List[Dict[str, Any]]] = None

class ComparisonReport(BaseModel):
    budgets: List[BudgetComparison]
    total_income_cents: int
    total_spent_cents: int
    avg_utilization: float
