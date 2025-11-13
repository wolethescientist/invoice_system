from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    paid_at = Column(DateTime, nullable=False)
    method = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
