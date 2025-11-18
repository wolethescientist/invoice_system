from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
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
    
    categories = relationship("BudgetCategory", back_populates="budget", cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'month', 'year', name='unique_user_month_year'),
    )

class BudgetCategory(Base):
    __tablename__ = "budget_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False)
    name = Column(String, nullable=False)
    allocated_cents = Column(Integer, nullable=False, default=0)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    budget = relationship("Budget", back_populates="categories")
