from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class SinkingFund(Base):
    __tablename__ = "sinking_funds"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    target_cents = Column(Integer, nullable=False)  # Target amount in cents
    current_balance_cents = Column(Integer, nullable=False, default=0)  # Current saved amount
    monthly_contribution_cents = Column(Integer, nullable=False, default=0)  # Planned monthly contribution
    target_date = Column(DateTime, nullable=True)  # Optional target completion date
    description = Column(Text, nullable=True)
    color = Column(String(50), nullable=True)  # For UI visualization
    is_active = Column(Integer, default=1)  # 0 or 1 (boolean) to match database
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    contributions = relationship("SinkingFundContribution", back_populates="fund", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_sinking_fund_user', 'user_id', 'is_active'),
    )

class SinkingFundContribution(Base):
    __tablename__ = "sinking_fund_contributions"
    
    id = Column(Integer, primary_key=True, index=True)
    fund_id = Column(Integer, ForeignKey("sinking_funds.id"), nullable=False)
    amount_cents = Column(Integer, nullable=False)  # Can be positive (deposit) or negative (withdrawal)
    contribution_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    fund = relationship("SinkingFund", back_populates="contributions")
    
    __table_args__ = (
        Index('idx_contribution_fund_date', 'fund_id', 'contribution_date'),
    )
