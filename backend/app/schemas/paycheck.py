from pydantic import BaseModel, Field, validator
from datetime import date, datetime
from typing import List, Optional
from enum import Enum


class PaycheckFrequency(str, Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    SEMIMONTHLY = "semimonthly"
    MONTHLY = "monthly"
    CUSTOM = "custom"


class PaycheckAllocationBase(BaseModel):
    category_id: int
    amount_cents: int = Field(ge=0)
    order: int = 0


class PaycheckAllocationCreate(PaycheckAllocationBase):
    pass


class PaycheckAllocation(PaycheckAllocationBase):
    id: int
    paycheck_id: int
    instance_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaycheckBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    net_amount_cents: int = Field(ge=0)
    frequency: PaycheckFrequency
    pay_date: date
    is_active: bool = True


class PaycheckCreate(PaycheckBase):
    allocations: List[PaycheckAllocationCreate] = []
    
    @validator('allocations')
    def validate_allocations(cls, v, values):
        if 'net_amount_cents' in values:
            total = sum(a.amount_cents for a in v)
            if total > values['net_amount_cents']:
                raise ValueError('Total allocations cannot exceed paycheck amount')
        return v


class PaycheckUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    net_amount_cents: Optional[int] = Field(None, ge=0)
    frequency: Optional[PaycheckFrequency] = None
    pay_date: Optional[date] = None
    is_active: Optional[bool] = None
    allocations: Optional[List[PaycheckAllocationCreate]] = None


class Paycheck(PaycheckBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    allocations: List[PaycheckAllocation] = []
    
    class Config:
        from_attributes = True


class PaycheckInstanceBase(BaseModel):
    amount_cents: int = Field(ge=0)
    date: date
    is_received: bool = False


class PaycheckInstanceCreate(PaycheckInstanceBase):
    paycheck_id: int
    budget_id: int
    allocations: List[PaycheckAllocationCreate] = []


class PaycheckInstance(PaycheckInstanceBase):
    id: int
    paycheck_id: int
    budget_id: int
    created_at: datetime
    allocations: List[PaycheckAllocation] = []
    
    class Config:
        from_attributes = True


class PaycheckSchedule(BaseModel):
    """Upcoming paycheck schedule"""
    paycheck: Paycheck
    upcoming_dates: List[date]
    next_amount_cents: int


class BudgetFundingPlan(BaseModel):
    """Shows how budget will be funded by paychecks"""
    budget_id: int
    month: int
    year: int
    total_income_cents: int
    total_allocated_cents: int
    paychecks: List[PaycheckInstance]
    available_to_allocate_cents: int
    is_fully_funded: bool


class CategoryFundingStatus(BaseModel):
    """Shows funding status for a category"""
    category_id: int
    category_name: str
    allocated_cents: int
    funded_cents: int
    remaining_cents: int
    is_fully_funded: bool
    funding_sources: List[dict]  # Which paychecks fund this category
