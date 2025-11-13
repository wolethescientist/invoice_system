from pydantic import BaseModel
from datetime import datetime

class PaymentCreate(BaseModel):
    amount_cents: int
    method: str = "bank transfer"
    paid_at: datetime

class Payment(BaseModel):
    id: int
    invoice_id: int
    amount_cents: int
    paid_at: datetime
    method: str
    created_at: datetime
    
    class Config:
        from_attributes = True
