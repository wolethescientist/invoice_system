from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BudgetCategoryBase(BaseModel):
    name: str
    allocated_cents: int = Field(ge=0)
    order: int = 0

class BudgetCategoryCreate(BudgetCategoryBase):
    description: Optional[str] = None
    category_group: Optional[str] = None

class BudgetCategoryUpdate(BaseModel):
    name: Optional[str] = None
    allocated_cents: Optional[int] = Field(None, ge=0)
    order: Optional[int] = None
    description: Optional[str] = None
    category_group: Optional[str] = None

class BudgetCategorySingleUpdate(BaseModel):
    category_id: int
    name: Optional[str] = None
    allocated_cents: Optional[int] = Field(None, ge=0)
    order: Optional[int] = None
    description: Optional[str] = None
    category_group: Optional[str] = None

class BudgetCategoryBulkUpdate(BaseModel):
    updates: List[BudgetCategorySingleUpdate]

class BudgetCategory(BudgetCategoryBase):
    id: int
    budget_id: int
    description: Optional[str] = None
    category_group: Optional[str] = None
    is_active: int = 1
    created_at: datetime
    updated_at: datetime
    
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

class CategoryGroup(BaseModel):
    name: str
    count: int
    total_allocated_cents: int
