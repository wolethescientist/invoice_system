from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class CategoryPattern(Base):
    """Stores learned patterns for category suggestions"""
    __tablename__ = "category_patterns"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("budget_categories.id"), nullable=False)
    pattern_text = Column(String(255), nullable=False)  # Normalized text pattern (lowercase, trimmed)
    confidence_score = Column(Float, default=1.0)  # How confident we are in this pattern
    usage_count = Column(Integer, default=1)  # How many times this pattern was used
    last_used = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_pattern_user_text', 'user_id', 'pattern_text'),
        Index('idx_pattern_user_category', 'user_id', 'category_id'),
    )


class CategorySuggestionLog(Base):
    """Logs suggestion acceptance/rejection for improving the algorithm"""
    __tablename__ = "category_suggestion_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    suggested_category_id = Column(Integer, ForeignKey("budget_categories.id"), nullable=False)
    actual_category_id = Column(Integer, ForeignKey("budget_categories.id"), nullable=False)
    pattern_text = Column(String(255), nullable=False)
    was_accepted = Column(Integer, default=0)  # 1 if accepted, 0 if rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_suggestion_log_user', 'user_id', 'created_at'),
    )
