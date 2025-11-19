from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class GoalType(str, Enum):
    SAVINGS = "savings"
    DEBT_REPAYMENT = "debt_repayment"
    INVESTMENT = "investment"
    EMERGENCY_FUND = "emergency_fund"
    RETIREMENT = "retirement"
    EDUCATION = "education"
    HOME_PURCHASE = "home_purchase"
    VEHICLE = "vehicle"
    VACATION = "vacation"
    OTHER = "other"


class GoalStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class GoalContributionBase(BaseModel):
    amount: float = Field(..., gt=0)
    contribution_date: date
    notes: Optional[str] = None


class GoalContributionCreate(GoalContributionBase):
    pass


class GoalContribution(GoalContributionBase):
    id: int
    goal_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class GoalMilestoneBase(BaseModel):
    name: str
    target_amount: float = Field(..., gt=0)
    target_date: date


class GoalMilestoneCreate(GoalMilestoneBase):
    pass


class GoalMilestoneUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0)
    target_date: Optional[date] = None
    achieved: Optional[bool] = None


class GoalMilestone(GoalMilestoneBase):
    id: int
    goal_id: int
    achieved: bool
    achieved_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FinancialGoalBase(BaseModel):
    name: str
    description: Optional[str] = None
    goal_type: GoalType
    target_amount: float = Field(..., gt=0)
    monthly_contribution: float = Field(default=0.0, ge=0)
    target_date: date
    start_date: date
    priority: int = Field(default=1, ge=1, le=5)
    notes: Optional[str] = None


class FinancialGoalCreate(FinancialGoalBase):
    pass


class FinancialGoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    goal_type: Optional[GoalType] = None
    target_amount: Optional[float] = Field(None, gt=0)
    current_amount: Optional[float] = Field(None, ge=0)
    monthly_contribution: Optional[float] = Field(None, ge=0)
    target_date: Optional[date] = None
    status: Optional[GoalStatus] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None


class FinancialGoal(FinancialGoalBase):
    id: int
    user_id: int
    current_amount: float
    status: GoalStatus
    created_at: datetime
    updated_at: datetime
    contributions: List[GoalContribution] = []
    milestones: List[GoalMilestone] = []

    class Config:
        from_attributes = True


class GoalProjection(BaseModel):
    goal_id: int
    projected_completion_date: date
    months_remaining: int
    on_track: bool
    required_monthly_contribution: float
    projected_final_amount: float
    shortfall: float


class GoalSummary(BaseModel):
    total_goals: int
    active_goals: int
    completed_goals: int
    total_target_amount: float
    total_current_amount: float
    total_monthly_contributions: float
    overall_progress_percentage: float
