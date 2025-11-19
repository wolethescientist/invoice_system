from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("budget_categories.id"), nullable=True)  # Nullable for split transactions
    amount_cents = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(String, nullable=True)
    is_split = Column(Boolean, default=False, nullable=False)  # Flag for split transactions
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    budget = relationship("Budget")
    category = relationship("BudgetCategory")
    splits = relationship("TransactionSplit", back_populates="transaction", cascade="all, delete-orphan")


class TransactionSplit(Base):
    __tablename__ = "transaction_splits"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("budget_categories.id"), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    transaction = relationship("Transaction", back_populates="splits")
    category = relationship("BudgetCategory")
