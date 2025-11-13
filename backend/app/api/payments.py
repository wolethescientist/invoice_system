from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.payment import Payment as PaymentModel
from app.models.invoice import Invoice as InvoiceModel, InvoiceStatus
from app.models.user import User
from app.schemas.payment import Payment, PaymentCreate

router = APIRouter(prefix="/api/invoices", tags=["payments"])

@router.post("/{invoice_id}/payments", response_model=Payment)
def record_payment(
    invoice_id: int,
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    payment = PaymentModel(
        invoice_id=invoice_id,
        amount_cents=payment_data.amount_cents,
        paid_at=payment_data.paid_at,
        method=payment_data.method
    )
    db.add(payment)
    
    invoice.balance_due_cents -= payment_data.amount_cents
    
    if invoice.balance_due_cents <= 0:
        invoice.status = InvoiceStatus.PAID
        invoice.balance_due_cents = 0
    
    db.commit()
    db.refresh(payment)
    return payment
