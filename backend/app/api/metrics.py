from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.invoice import Invoice as InvoiceModel, InvoiceStatus
from app.models.payment import Payment as PaymentModel
from app.models.customer import Customer as CustomerModel
from app.models.budget import Budget, BudgetCategory
from app.models.transaction import Transaction, TransactionSplit
from app.models.sinking_fund import SinkingFund, SinkingFundContribution
from app.models.net_worth import Asset, Liability
from app.models.financial_goal import FinancialGoal
from app.models.paycheck import Paycheck
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
    # Use to_char for PostgreSQL, strftime for SQLite
    from app.core.config import settings
    if 'postgresql' in settings.DATABASE_URL:
        monthly_data = db.query(
            func.to_char(PaymentModel.paid_at, 'YYYY-MM').label('month'),
            func.sum(PaymentModel.amount_cents).label('revenue')
        ).group_by('month').order_by('month').limit(6).all()
    else:
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

@router.get("/dashboard")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive dashboard metrics for all features"""
    try:
        today = date.today()
        current_month = today.month
        current_year = today.year
    except Exception as e:
        print(f"Error getting date: {e}")
        today = date.today()
        current_month = today.month
        current_year = today.year
    
    # Budget metrics - current month
    budget_metrics = None
    try:
        current_budget = db.query(Budget).filter(
            Budget.user_id == current_user.id,
            Budget.month == current_month,
            Budget.year == current_year
        ).first()
        
        if current_budget:
            total_allocated = sum(cat.allocated_cents for cat in current_budget.categories)
            
            # Calculate total spent
            total_spent = 0
            for category in current_budget.categories:
                try:
                    regular_spent = db.query(func.sum(Transaction.amount_cents)).filter(
                        Transaction.category_id == category.id,
                        Transaction.is_split == False
                    ).scalar() or 0
                    
                    split_spent = db.query(func.sum(TransactionSplit.amount_cents)).filter(
                        TransactionSplit.category_id == category.id
                    ).scalar() or 0
                    
                    total_spent += regular_spent + split_spent
                except Exception as e:
                    print(f"Error calculating spent for category {category.id}: {e}")
                    continue
            
            budget_metrics = {
                "budget_id": current_budget.id,
                "income_cents": current_budget.income_cents,
                "allocated_cents": total_allocated,
                "spent_cents": total_spent,
                "remaining_cents": current_budget.income_cents - total_allocated,
                "available_cents": total_allocated - total_spent
            }
    except Exception as e:
        print(f"Error getting budget metrics: {e}")
        budget_metrics = None
    
    # Transaction metrics - this month
    transaction_count = 0
    try:
        transaction_count = db.query(func.count(Transaction.id)).filter(
            Transaction.user_id == current_user.id,
            extract('month', Transaction.date) == current_month,
            extract('year', Transaction.date) == current_year
        ).scalar() or 0
    except Exception as e:
        print(f"Error getting transaction count: {e}")
        transaction_count = 0
    
    # Sinking funds metrics
    sinking_funds_metrics = []
    total_sinking_funds_saved = 0
    total_sinking_funds_goal = 0
    sinking_funds = []
    
    try:
        sinking_funds = db.query(SinkingFund).filter(
            SinkingFund.user_id == current_user.id,
            SinkingFund.is_active == True
        ).all()
        
        for fund in sinking_funds:
            try:
                contributions = db.query(SinkingFundContribution).filter(
                    SinkingFundContribution.fund_id == fund.id
                ).all()
                
                total_contributed = sum(c.amount_cents for c in contributions)
                total_sinking_funds_saved += total_contributed
                total_sinking_funds_goal += fund.target_cents
                
                sinking_funds_metrics.append({
                    "id": fund.id,
                    "name": fund.name,
                    "target_amount_cents": fund.target_cents,
                    "contributed_cents": total_contributed,
                    "remaining_cents": fund.target_cents - total_contributed
                })
            except Exception as e:
                print(f"Error processing sinking fund {fund.id}: {e}")
                continue
    except Exception as e:
        print(f"Error getting sinking funds: {e}")
    
    # Net worth metrics
    net_worth_metrics = {
        "total_assets_cents": 0,
        "total_liabilities_cents": 0,
        "net_worth_cents": 0,
        "asset_count": 0,
        "liability_count": 0
    }
    
    try:
        assets = db.query(Asset).filter(
            Asset.user_id == current_user.id,
            Asset.is_active == True
        ).all()
        
        liabilities = db.query(Liability).filter(
            Liability.user_id == current_user.id,
            Liability.is_active == True
        ).all()
        
        total_assets = sum(a.current_value_cents for a in assets)
        total_liabilities = sum(l.current_balance_cents for l in liabilities)
        net_worth = total_assets - total_liabilities
        
        net_worth_metrics = {
            "total_assets_cents": total_assets,
            "total_liabilities_cents": total_liabilities,
            "net_worth_cents": net_worth,
            "asset_count": len(assets),
            "liability_count": len(liabilities)
        }
    except Exception as e:
        print(f"Error getting net worth metrics: {e}")
    
    # Financial goals metrics
    goals_metrics = {
        "total_goals": 0,
        "active_goals": 0,
        "completed_goals": 0,
        "total_target_cents": 0,
        "total_saved_cents": 0
    }
    
    try:
        goals = db.query(FinancialGoal).filter(
            FinancialGoal.user_id == current_user.id
        ).all()
        
        # Filter by is_active (which is an Integer column: 0 or 1)
        active_records = [g for g in goals if g.is_active == 1]
        active_goals = [g for g in active_records if g.status.value == 'active']
        completed_goals = [g for g in active_records if g.status.value == 'completed']
        
        goals_metrics = {
            "total_goals": len(active_records),
            "active_goals": len(active_goals),
            "completed_goals": len(completed_goals),
            "total_target_cents": sum(g.target_amount_cents for g in active_goals),
            "total_saved_cents": sum(g.current_amount_cents for g in active_goals)
        }
    except Exception as e:
        print(f"Error getting goals metrics: {e}")
    
    # Paycheck metrics - upcoming
    paycheck_metrics = {
        "upcoming_count": 0,
        "next_paycheck": None
    }
    
    try:
        upcoming_paychecks = db.query(Paycheck).filter(
            Paycheck.user_id == current_user.id,
            Paycheck.is_active == True,
            Paycheck.pay_date >= today
        ).order_by(Paycheck.pay_date).limit(3).all()
        
        paycheck_metrics = {
            "upcoming_count": len(upcoming_paychecks),
            "next_paycheck": {
                "id": upcoming_paychecks[0].id,
                "amount_cents": upcoming_paychecks[0].net_amount_cents,
                "pay_date": upcoming_paychecks[0].pay_date.isoformat()
            } if upcoming_paychecks else None
        }
    except Exception as e:
        print(f"Error getting paycheck metrics: {e}")
    
    return {
        "budget": budget_metrics,
        "transactions": {
            "count_this_month": transaction_count
        },
        "sinking_funds": {
            "total_saved_cents": total_sinking_funds_saved,
            "total_goal_cents": total_sinking_funds_goal,
            "fund_count": len(sinking_funds),
            "funds": sinking_funds_metrics[:5]  # Top 5
        },
        "net_worth": net_worth_metrics,
        "goals": goals_metrics,
        "paychecks": paycheck_metrics
    }
