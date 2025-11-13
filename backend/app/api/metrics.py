from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.invoice import Invoice as InvoiceModel, InvoiceStatus
from app.models.payment import Payment as PaymentModel
from app.models.customer import Customer as CustomerModel
from app.models.user import User
from app.schemas.metrics import MetricsSummary, MonthlyRevenue, TopCustomer

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

@router.get("/summary", response_model=MetricsSummary)
def get_metrics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Outstanding invoices
    outstanding = db.query(InvoiceModel).filter(
        InvoiceModel.balance_due_cents > 0,
        InvoiceModel.status != InvoiceStatus.PAID
    ).all()
    
    outstanding_count = len(outstanding)
    outstanding_total = sum(inv.balance_due_cents for inv in outstanding)
    
    # Overdue invoices
    today = date.today()
    overdue = [inv for inv in outstanding if inv.due_date < today]
    overdue_count = len(overdue)
    overdue_total = sum(inv.balance_due_cents for inv in overdue)
    
    # Monthly revenue (last 6 months)
    monthly_data = db.query(
        func.strftime('%Y-%m', PaymentModel.paid_at).label('month'),
        func.sum(PaymentModel.amount_cents).label('revenue')
    ).group_by('month').order_by('month').limit(6).all()
    
    monthly_revenue = [
        MonthlyRevenue(month=row.month, revenue_cents=row.revenue or 0)
        for row in monthly_data
    ]
    
    # Top customers by total paid
    top_customers_data = db.query(
        CustomerModel.id,
        CustomerModel.name,
        func.sum(PaymentModel.amount_cents).label('total_paid')
    ).join(
        InvoiceModel, InvoiceModel.customer_id == CustomerModel.id
    ).join(
        PaymentModel, PaymentModel.invoice_id == InvoiceModel.id
    ).group_by(CustomerModel.id).order_by(func.sum(PaymentModel.amount_cents).desc()).limit(5).all()
    
    top_customers = [
        TopCustomer(id=row.id, name=row.name, total_paid_cents=row.total_paid or 0)
        for row in top_customers_data
    ]
    
    return MetricsSummary(
        outstanding_count=outstanding_count,
        outstanding_total_cents=outstanding_total,
        overdue_count=overdue_count,
        overdue_total_cents=overdue_total,
        monthly_revenue=monthly_revenue,
        top_customers=top_customers
    )
