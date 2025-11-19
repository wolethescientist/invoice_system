from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class BudgetReport(Base):
    """Saved custom budget reports"""
    __tablename__ = "budget_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False)  # spending, income, category, trend, comparison
    date_range_start = Column(Date, nullable=False)
    date_range_end = Column(Date, nullable=False)
    filters = Column(JSON, nullable=True)  # Store filter criteria as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User")
