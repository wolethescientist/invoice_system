from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SinkingFundContributionBase(BaseModel):
    amount_cents: int
    contribution_date: Optional[datetime] = None
    notes: Optional[str] = None

class SinkingFundContributionCreate(SinkingFundContributionBase):
    pass

class SinkingFundContribution(SinkingFundContributionBase):
    id: int
    fund_id: int
    contribution_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class SinkingFundBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    target_cents: int = Field(ge=0)
    monthly_contribution_cents: int = Field(ge=0, default=0)
    target_date: Optional[datetime] = None
    description: Optional[str] = None
    color: Optional[str] = None

class SinkingFundCreate(SinkingFundBase):
    pass

class SinkingFundUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    target_cents: Optional[int] = Field(None, ge=0)
    monthly_contribution_cents: Optional[int] = Field(None, ge=0)
    target_date: Optional[datetime] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

class SinkingFund(SinkingFundBase):
    id: int
    user_id: int
    current_balance_cents: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SinkingFundWithContributions(SinkingFund):
    contributions: List[SinkingFundContribution] = []

class SinkingFundProgress(BaseModel):
    fund: SinkingFund
    progress_percentage: float
    remaining_cents: int
    months_to_target: Optional[float] = None
    on_track: bool
    total_contributed_cents: int
    contribution_count: int

class SinkingFundSummary(BaseModel):
    total_funds: int
    total_target_cents: int
    total_saved_cents: int
    total_remaining_cents: int
    overall_progress_percentage: float
    active_funds: int
