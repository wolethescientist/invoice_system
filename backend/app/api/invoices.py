from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.invoice import Invoice as InvoiceModel, InvoiceItem as InvoiceItemModel, InvoiceStatus
from app.models.user import User
from app.models.settings import Settings as SettingsModel
from app.schemas.invoice import Invoice, InvoiceCreate, InvoiceUpdate
from app.services.pdf import generate_invoice_pdf

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

def calculate_invoice_totals(items_data: list, discount_cents: int = 0):
    subtotal = 0
    tax_total = 0
    
    for item in items_data:
        line_subtotal = item.quantity * item.unit_price_cents
        line_tax = (line_subtotal * item.tax_rate) // 10000
        subtotal += line_subtotal
        tax_total += line_tax
    
    total = subtotal + tax_total - discount_cents
    return subtotal, tax_total, total

def generate_invoice_number(db: Session) -> str:
    settings = db.query(SettingsModel).first()
    if not settings:
        settings = SettingsModel()
        db.add(settings)
        db.commit()
    
    settings.last_sequence += 1
    db.commit()
    
    year = datetime.now().year
    return f"{settings.invoice_prefix}-{year}-{settings.last_sequence:04d}"

@router.get("", response_model=List[Invoice])
def list_invoices(
    status: Optional[str] = None,
    q: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(InvoiceModel)
    
    if status:
        query = query.filter(InvoiceModel.status == status)
    
    if q:
        query = query.filter(InvoiceModel.invoice_number.contains(q))
    
    # Update overdue status
    today = date.today()
    overdue_invoices = query.filter(
        InvoiceModel.due_date < today,
        InvoiceModel.balance_due_cents > 0,
        InvoiceModel.status != InvoiceStatus.PAID
    ).all()
    
    for inv in overdue_invoices:
        inv.status = InvoiceStatus.OVERDUE
    db.commit()
    
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()

@router.post("", response_model=Invoice)
def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subtotal, tax, total = calculate_invoice_totals(invoice_data.items, invoice_data.discount_cents)
    
    invoice = InvoiceModel(
        customer_id=invoice_data.customer_id,
        invoice_number=generate_invoice_number(db),
        issue_date=invoice_data.issue_date,
        due_date=invoice_data.due_date,
        notes=invoice_data.notes,
        subtotal_cents=subtotal,
        tax_cents=tax,
        discount_cents=invoice_data.discount_cents,
        total_cents=total,
        balance_due_cents=total,
        status=InvoiceStatus.DRAFT
    )
    db.add(invoice)
    db.flush()
    
    for item_data in invoice_data.items:
        line_subtotal = item_data.quantity * item_data.unit_price_cents
        line_tax = (line_subtotal * item_data.tax_rate) // 10000
        line_total = line_subtotal + line_tax
        
        item = InvoiceItemModel(
            invoice_id=invoice.id,
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price_cents=item_data.unit_price_cents,
            tax_rate=item_data.tax_rate,
            line_total_cents=line_total
        )
        db.add(item)
    
    db.commit()
    db.refresh(invoice)
    return invoice

@router.get("/{invoice_id}", response_model=Invoice)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.put("/{invoice_id}", response_model=Invoice)
def update_invoice(
    invoice_id: int,
    invoice_data: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_dict = invoice_data.model_dump(exclude_unset=True, exclude={"items"})
    for key, value in update_dict.items():
        setattr(invoice, key, value)
    
    if invoice_data.items is not None:
        db.query(InvoiceItemModel).filter(InvoiceItemModel.invoice_id == invoice_id).delete()
        
        subtotal, tax, total = calculate_invoice_totals(invoice_data.items, invoice.discount_cents)
        invoice.subtotal_cents = subtotal
        invoice.tax_cents = tax
        invoice.total_cents = total
        
        for item_data in invoice_data.items:
            line_subtotal = item_data.quantity * item_data.unit_price_cents
            line_tax = (line_subtotal * item_data.tax_rate) // 10000
            line_total = line_subtotal + line_tax
            
            item = InvoiceItemModel(
                invoice_id=invoice.id,
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price_cents=item_data.unit_price_cents,
                tax_rate=item_data.tax_rate,
                line_total_cents=line_total
            )
            db.add(item)
    
    db.commit()
    db.refresh(invoice)
    return invoice

@router.post("/{invoice_id}/send")
def send_invoice(
    invoice_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    background_tasks.add_task(generate_invoice_pdf, invoice_id, db)
    
    invoice.status = InvoiceStatus.SENT
    db.commit()
    
    return {"message": "Invoice sent, PDF generation in progress", "status": "accepted"}

@router.get("/{invoice_id}/pdf")
def download_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if not invoice.pdf_path:
        generate_invoice_pdf(invoice_id, db)
        db.refresh(invoice)
    
    if not invoice.pdf_path:
        raise HTTPException(status_code=404, detail="PDF not generated")
    
    return FileResponse(
        invoice.pdf_path,
        media_type="application/pdf",
        filename=f"{invoice.invoice_number}.pdf"
    )
