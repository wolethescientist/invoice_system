from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Index, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    income_cents = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    categories = relationship("BudgetCategory", back_populates="budget", cascade="all, delete-orphan", lazy="select")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'month', 'year', name='unique_user_month_year'),
        Index('idx_budget_user_date', 'user_id', 'year', 'month'),
    )

class BudgetCategory(Base):
    __tablename__ = "budget_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False)
    name = Column(String(255), nullable=False)  # Explicit length for better performance
    allocated_cents = Column(Integer, nullable=False, default=0)
    order = Column(Integer, default=0)
    description = Column(Text, nullable=True)  # Optional description for categories
    category_group = Column(String(100), nullable=True)  # For grouping categories
    is_active = Column(Integer, default=1)  # Soft delete support
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    budget = relationship("Budget", back_populates="categories")
    
    __table_args__ = (
        Index('idx_budget_category_budget_order', 'budget_id', 'order'),
        Index('idx_budget_category_budget_active', 'budget_id', 'is_active'),
        Index('idx_budget_category_group', 'budget_id', 'category_group'),
    )
