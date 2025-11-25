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
    monthly_contribution: float = Field(default=0, ge=0)
    target_date: date
    start_date: date
    priority: int = Field(default=1, ge=1, le=5)
    notes: Optional[str] = None


class FinancialGoalCreate(FinancialGoalBase):
    @property
    def target_amount_cents(self) -> int:
        return int(self.target_amount * 100)
    
    @property
    def monthly_contribution_cents(self) -> int:
        return int(self.monthly_contribution * 100)


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
    is_active: Optional[bool] = None
    
    def to_cents_dict(self):
        """Convert dollar amounts to cents for database storage"""
        data = self.model_dump(exclude_unset=True)
        if 'target_amount' in data:
            data['target_amount_cents'] = int(data.pop('target_amount') * 100)
        if 'current_amount' in data:
            data['current_amount_cents'] = int(data.pop('current_amount') * 100)
        if 'monthly_contribution' in data:
            data['monthly_contribution_cents'] = int(data.pop('monthly_contribution') * 100)
        return data


class FinancialGoal(FinancialGoalBase):
    id: int
    user_id: int
    current_amount: float
    status: GoalStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    contributions: List[GoalContribution] = []
    milestones: List[GoalMilestone] = []

    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        """Convert cents to dollars when reading from database"""
        data = {
            'id': obj.id,
            'user_id': obj.user_id,
            'name': obj.name,
            'description': obj.description,
            'goal_type': obj.goal_type,
            'target_amount': obj.target_amount_cents / 100,
            'current_amount': obj.current_amount_cents / 100,
            'monthly_contribution': obj.monthly_contribution_cents / 100,
            'target_date': obj.target_date,
            'start_date': obj.start_date,
            'status': obj.status,
            'is_active': obj.is_active,
            'priority': obj.priority,
            'notes': obj.notes,
            'created_at': obj.created_at,
            'updated_at': obj.updated_at,
            'contributions': obj.contributions,
            'milestones': obj.milestones
        }
        return cls(**data)


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
