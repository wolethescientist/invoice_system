from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class CategoryTemplate(Base):
    """User-defined category templates for budget creation"""
    __tablename__ = "category_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category_type = Column(String, nullable=False, default="expense")  # income, expense, savings
    icon = Column(String, nullable=True)  # icon name or emoji
    color = Column(String, nullable=True)  # hex color code
    default_allocation_cents = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User")