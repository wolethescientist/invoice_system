from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, default="Demo Company")
    address = Column(String)
    email = Column(String)
    default_tax = Column(Integer, default=0)  # basis points
    currency = Column(String, default="USD")
    invoice_prefix = Column(String, default="INV")
    last_sequence = Column(Integer, default=0)
