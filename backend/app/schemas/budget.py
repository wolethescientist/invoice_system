from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BudgetCategoryBase(BaseModel):
    name: str
    allocated_cents: int = Field(ge=0)
    order: int = 0

class BudgetCategoryCreate(BudgetCategoryBase):
    pass

class BudgetCategoryUpdate(BaseModel):
    name: Optional[str] = None
    allocated_cents: Optional[int] = Field(None, ge=0)
    order: Optional[int] = None

class BudgetCategory(BudgetCategoryBase):
    id: int
    budget_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class BudgetBase(BaseModel):
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2100)
    income_cents: int = Field(ge=0)

class BudgetCreate(BudgetBase):
    categories: List[BudgetCategoryCreate] = []

class BudgetUpdate(BaseModel):
    income_cents: Optional[int] = Field(None, ge=0)
    categories: Optional[List[BudgetCategoryCreate]] = None

class Budget(BudgetBase):
    id: int
    user_id: int
    categories: List[BudgetCategory]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class BudgetSummary(BaseModel):
    budget: Budget
    total_allocated_cents: int
    remaining_cents: int
    is_balanced: bool
