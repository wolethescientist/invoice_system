from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class InvoiceItemBase(BaseModel):
    description: str
    quantity: int
    unit_price_cents: int
    tax_rate: int = 0

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    line_total_cents: int
    
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    customer_id: int
    issue_date: date
    due_date: date
    notes: Optional[str] = None
    discount_cents: int = 0

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class InvoiceUpdate(BaseModel):
    customer_id: Optional[int] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None
    discount_cents: Optional[int] = None
    items: Optional[List[InvoiceItemCreate]] = None

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    status: str
    subtotal_cents: int
    tax_cents: int
    total_cents: int
    balance_due_cents: int
    pdf_path: Optional[str] = None
    created_at: datetime
    items: List[InvoiceItem] = []
    
    class Config:
        from_attributes = True
