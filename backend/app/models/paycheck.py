from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.core.database import Base


class PaycheckFrequency(str, Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    SEMIMONTHLY = "semimonthly"
    MONTHLY = "monthly"
    CUSTOM = "custom"


class Paycheck(Base):
    __tablename__ = "paychecks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)  # e.g., "Main Job", "Side Gig"
    amount_cents = Column(Integer, nullable=False)
    frequency = Column(SQLEnum(PaycheckFrequency), nullable=False)
    next_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    allocations = relationship("PaycheckAllocation", back_populates="paycheck", cascade="all, delete-orphan")
    instances = relationship("PaycheckInstance", back_populates="paycheck", cascade="all, delete-orphan")


class PaycheckInstance(Base):
    """Represents an actual paycheck occurrence"""
    __tablename__ = "paycheck_instances"
    
    id = Column(Integer, primary_key=True, index=True)
    paycheck_id = Column(Integer, ForeignKey("paychecks.id"), nullable=False)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    is_received = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    paycheck = relationship("Paycheck", back_populates="instances")
    budget = relationship("Budget")
    allocations = relationship("PaycheckAllocation", back_populates="instance", cascade="all, delete-orphan")


class PaycheckAllocation(Base):
    """Tracks how paycheck funds are allocated to budget categories"""
    __tablename__ = "paycheck_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    paycheck_id = Column(Integer, ForeignKey("paychecks.id"), nullable=False)
    instance_id = Column(Integer, ForeignKey("paycheck_instances.id"), nullable=True)  # Null for templates
    category_id = Column(Integer, ForeignKey("budget_categories.id"), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    paycheck = relationship("Paycheck", back_populates="allocations")
    instance = relationship("PaycheckInstance", back_populates="allocations")
    category = relationship("BudgetCategory")
