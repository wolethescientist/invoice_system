from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date

class TransactionBase(BaseModel):
    budget_id: int
    category_id: int
    amount_cents: int = Field(gt=0)
    date: date
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    category_id: Optional[int] = None
    amount_cents: Optional[int] = Field(None, gt=0)
    date: Optional[date] = None
    notes: Optional[str] = None

class Transaction(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TransactionWithCategory(Transaction):
    category_name: str
    
    class Config:
        from_attributes = True
