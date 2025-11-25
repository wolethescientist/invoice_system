from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class GoalType(str, enum.Enum):
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


class GoalStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class FinancialGoal(Base):
    __tablename__ = "financial_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    goal_type = Column(String, nullable=False)  # Using String for lowercase enum values
    target_amount_cents = Column(Integer, nullable=False)  # Target amount in cents
    current_amount_cents = Column(Integer, default=0)  # Current amount in cents
    monthly_contribution_cents = Column(Integer, default=0)  # Monthly contribution in cents
    target_date = Column(Date, nullable=False)
    start_date = Column(Date, nullable=False)
    status = Column(String, default='active')  # Using String for lowercase enum values
    priority = Column(Integer, default=1)  # 1-5, 1 being highest
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="financial_goals")
    contributions = relationship("GoalContribution", back_populates="goal", cascade="all, delete-orphan")
    milestones = relationship("GoalMilestone", back_populates="goal", cascade="all, delete-orphan")


class GoalContribution(Base):
    __tablename__ = "goal_contributions"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("financial_goals.id"), nullable=False)
    amount = Column(Float, nullable=False)
    contribution_date = Column(Date, nullable=False)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    goal = relationship("FinancialGoal", back_populates="contributions")


class GoalMilestone(Base):
    __tablename__ = "goal_milestones"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("financial_goals.id"), nullable=False)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    target_date = Column(Date, nullable=False)
    achieved = Column(Integer, default=0)  # 0 or 1 (boolean)
    achieved_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    goal = relationship("FinancialGoal", back_populates="milestones")
