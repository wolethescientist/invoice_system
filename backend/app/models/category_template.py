from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Index, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class CategoryTemplate(Base):
    """User-defined category templates for budget creation"""
    __tablename__ = "category_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)  # Explicit length for better performance
    category_type = Column(String(50), nullable=False, default="expense")  # income, expense, savings
    icon = Column(String(10), nullable=True)  # icon name or emoji
    color = Column(String(7), nullable=True)  # hex color code
    default_allocation_cents = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)  # Optional description
    category_group = Column(String(100), nullable=True)  # For grouping templates
    tags = Column(Text, nullable=True)  # JSON array of tags for filtering
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_category_template_user_active', 'user_id', 'is_active'),
        Index('idx_category_template_user_type', 'user_id', 'category_type'),
        Index('idx_category_template_user_order', 'user_id', 'order'),
        Index('idx_category_template_group', 'user_id', 'category_group'),
    )