from pydantic import BaseModel
from typing import List

class MonthlyRevenue(BaseModel):
    month: str
    revenue_cents: int

class TopCustomer(BaseModel):
    id: int
    name: str
    total_paid_cents: int

class MetricsSummary(BaseModel):
    outstanding_count: int
    outstanding_total_cents: int
    overdue_count: int
    overdue_total_cents: int
    monthly_revenue: List[MonthlyRevenue]
    top_customers: List[TopCustomer]
