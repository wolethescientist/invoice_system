from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case, extract
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
from app.models.budget import Budget, BudgetCategory
from app.models.transaction import Transaction, TransactionSplit
from app.models.paycheck import Paycheck
from app.schemas.budget_report import (
    ReportRequest, CategorySpending, MonthlyTrend, BudgetComparison,
    SpendingReport, IncomeReport, CategoryReport, TrendReport, ComparisonReport
)

class BudgetReportService:
    """Service for generating budget reports and analytics"""
    
    @staticmethod
    def generate_spending_report(
        db: Session,
        user_id: int,
        request: ReportRequest
    ) -> SpendingReport:
        """Generate comprehensive spending report"""
        
        # Base query for transactions
        query = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= request.date_range_start,
            Transaction.date <= request.date_range_end
        )
        
        # Apply filters
        if request.filters:
            if request.filters.budget_ids:
                query = query.filter(Transaction.budget_id.in_(request.filters.budget_ids))
            if request.filters.category_ids:
                query = query.filter(Transaction.category_id.in_(request.filters.category_ids))
            if request.filters.min_amount_cents:
                query = query.filter(Transaction.amount_cents >= request.filters.min_amount_cents)
            if request.filters.max_amount_cents:
                query = query.filter(Transaction.amount_cents <= request.filters.max_amount_cents)
        
        transactions = query.all()
        
        # Calculate totals
        total_spent = sum(t.amount_cents for t in transactions)
        transaction_count = len(transactions)
        avg_transaction = total_spent // transaction_count if transaction_count > 0 else 0
        
        # Group by category
        category_spending = db.query(
            BudgetCategory.id,
            BudgetCategory.name,
            func.sum(Transaction.amount_cents).label('total'),
            func.count(Transaction.id).label('count')
        ).join(
            Transaction, Transaction.category_id == BudgetCategory.id
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date >= request.date_range_start,
            Transaction.date <= request.date_range_end
        )
        
        if request.filters and request.filters.budget_ids:
            category_spending = category_spending.filter(
                Transaction.budget_id.in_(request.filters.budget_ids)
            )
        
        category_spending = category_spending.group_by(
            BudgetCategory.id, BudgetCategory.name
        ).all()
        
        by_category = [
            CategorySpending(
                category_id=cat.id,
                category_name=cat.name,
                total_spent_cents=cat.total,
                transaction_count=cat.count,
                percentage=round((cat.total / total_spent * 100) if total_spent > 0 else 0, 2)
            )
            for cat in category_spending
        ]
        
        # Generate trends
        trends = BudgetReportService._generate_trends(
            db, user_id, request.date_range_start, request.date_range_end,
            request.group_by or 'month', request.filters
        )
        
        return SpendingReport(
            total_spent_cents=total_spent,
            transaction_count=transaction_count,
            avg_transaction_cents=avg_transaction,
            by_category=by_category,
            trends=trends
        )
    
    @staticmethod
    def generate_income_report(
        db: Session,
        user_id: int,
        request: ReportRequest
    ) -> IncomeReport:
        """Generate income report from budgets and paychecks"""
        
        # Get budgets in date range
        budgets = db.query(Budget).filter(
            Budget.user_id == user_id
        ).all()
        
        # Filter by date range (convert month/year to date)
        filtered_budgets = []
        for budget in budgets:
            budget_date = date(budget.year, budget.month, 1)
            if request.date_range_start <= budget_date <= request.date_range_end:
                filtered_budgets.append(budget)
        
        total_income = sum(b.income_cents for b in filtered_budgets)
        budget_count = len(filtered_budgets)
        avg_monthly = total_income // budget_count if budget_count > 0 else 0
        
        # Group by month
        by_month = []
        for budget in filtered_budgets:
            by_month.append({
                'month': budget.month,
                'year': budget.year,
                'income_cents': budget.income_cents,
                'budget_id': budget.id
            })
        
        # Sort by date
        by_month.sort(key=lambda x: (x['year'], x['month']))
        
        return IncomeReport(
            total_income_cents=total_income,
            budget_count=budget_count,
            avg_monthly_income_cents=avg_monthly,
            by_month=by_month
        )
    
    @staticmethod
    def generate_category_report(
        db: Session,
        user_id: int,
        request: ReportRequest
    ) -> List[CategoryReport]:
        """Generate detailed category analysis"""
        
        # Get all categories in date range
        budgets = db.query(Budget).filter(
            Budget.user_id == user_id
        ).all()
        
        # Filter budgets by date range
        budget_ids = []
        for budget in budgets:
            budget_date = date(budget.year, budget.month, 1)
            if request.date_range_start <= budget_date <= request.date_range_end:
                budget_ids.append(budget.id)
        
        if not budget_ids:
            return []
        
        # Aggregate category data
        category_data = db.query(
            BudgetCategory.id,
            BudgetCategory.name,
            func.sum(BudgetCategory.allocated_cents).label('total_allocated'),
            func.count(BudgetCategory.id).label('budget_count')
        ).filter(
            BudgetCategory.budget_id.in_(budget_ids)
        ).group_by(
            BudgetCategory.id, BudgetCategory.name
        ).all()
        
        reports = []
        for cat in category_data:
            # Get spending for this category
            spent = db.query(
                func.sum(Transaction.amount_cents)
            ).filter(
                Transaction.category_id == cat.id,
                Transaction.date >= request.date_range_start,
                Transaction.date <= request.date_range_end
            ).scalar() or 0
            
            avg_allocated = cat.total_allocated // cat.budget_count if cat.budget_count > 0 else 0
            avg_spent = spent // cat.budget_count if cat.budget_count > 0 else 0
            utilization = round((spent / cat.total_allocated * 100) if cat.total_allocated > 0 else 0, 2)
            
            reports.append(CategoryReport(
                category_id=cat.id,
                category_name=cat.name,
                total_allocated_cents=cat.total_allocated,
                total_spent_cents=spent,
                budget_count=cat.budget_count,
                avg_allocated_cents=avg_allocated,
                avg_spent_cents=avg_spent,
                utilization_percentage=utilization
            ))
        
        return reports
    
    @staticmethod
    def generate_trend_report(
        db: Session,
        user_id: int,
        request: ReportRequest
    ) -> TrendReport:
        """Generate trend analysis with forecasting"""
        
        period_type = request.group_by or 'month'
        trends = BudgetReportService._generate_trends(
            db, user_id, request.date_range_start, request.date_range_end,
            period_type, request.filters
        )
        
        # Calculate growth rate
        growth_rate = 0.0
        if len(trends) >= 2:
            first_total = trends[0].total_cents
            last_total = trends[-1].total_cents
            if first_total > 0:
                growth_rate = round(((last_total - first_total) / first_total * 100), 2)
        
        # Simple forecast (next 3 periods based on average growth)
        forecast = None
        if len(trends) >= 3:
            avg_change = sum(
                trends[i].total_cents - trends[i-1].total_cents 
                for i in range(1, len(trends))
            ) / (len(trends) - 1)
            
            last_total = trends[-1].total_cents
            forecast = []
            for i in range(1, 4):
                forecast.append({
                    'period': f'Forecast +{i}',
                    'predicted_cents': int(last_total + (avg_change * i))
                })
        
        return TrendReport(
            period_type=period_type,
            trends=trends,
            growth_rate=growth_rate,
            forecast=forecast
        )
    
    @staticmethod
    def generate_comparison_report(
        db: Session,
        user_id: int,
        request: ReportRequest
    ) -> ComparisonReport:
        """Generate budget comparison report"""
        
        # Get budgets in date range
        budgets = db.query(Budget).filter(
            Budget.user_id == user_id
        ).all()
        
        comparisons = []
        total_income = 0
        total_spent = 0
        
        for budget in budgets:
            budget_date = date(budget.year, budget.month, 1)
            if not (request.date_range_start <= budget_date <= request.date_range_end):
                continue
            
            # Calculate allocated
            allocated = sum(cat.allocated_cents for cat in budget.categories)
            
            # Calculate spent
            spent = db.query(
                func.sum(Transaction.amount_cents)
            ).filter(
                Transaction.budget_id == budget.id,
                Transaction.date >= request.date_range_start,
                Transaction.date <= request.date_range_end
            ).scalar() or 0
            
            remaining = budget.income_cents - spent
            utilization = round((spent / budget.income_cents * 100) if budget.income_cents > 0 else 0, 2)
            
            comparisons.append(BudgetComparison(
                budget_id=budget.id,
                month=budget.month,
                year=budget.year,
                income_cents=budget.income_cents,
                allocated_cents=allocated,
                spent_cents=spent,
                remaining_cents=remaining,
                utilization_percentage=utilization
            ))
            
            total_income += budget.income_cents
            total_spent += spent
        
        avg_utilization = round((total_spent / total_income * 100) if total_income > 0 else 0, 2)
        
        return ComparisonReport(
            budgets=comparisons,
            total_income_cents=total_income,
            total_spent_cents=total_spent,
            avg_utilization=avg_utilization
        )
    
    @staticmethod
    def _generate_trends(
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
        group_by: str,
        filters: Optional[Any] = None
    ) -> List[MonthlyTrend]:
        """Generate trend data grouped by period"""
        
        # Build base query
        if group_by == 'day':
            period_expr = func.date(Transaction.date)
            period_format = '%Y-%m-%d'
        elif group_by == 'week':
            period_expr = func.strftime('%Y-W%W', Transaction.date)
            period_format = '%Y-W%W'
        else:  # month
            period_expr = func.strftime('%Y-%m', Transaction.date)
            period_format = '%Y-%m'
        
        query = db.query(
            period_expr.label('period'),
            func.sum(Transaction.amount_cents).label('total'),
            func.count(Transaction.id).label('count'),
            func.avg(Transaction.amount_cents).label('avg')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        )
        
        # Apply filters
        if filters:
            if filters.budget_ids:
                query = query.filter(Transaction.budget_id.in_(filters.budget_ids))
            if filters.category_ids:
                query = query.filter(Transaction.category_id.in_(filters.category_ids))
        
        results = query.group_by('period').order_by('period').all()
        
        return [
            MonthlyTrend(
                period=r.period,
                total_cents=r.total,
                transaction_count=r.count,
                avg_transaction_cents=int(r.avg)
            )
            for r in results
        ]
    
    @staticmethod
    def get_dashboard_summary(
        db: Session,
        user_id: int,
        months: int = 3
    ) -> Dict[str, Any]:
        """Get quick dashboard summary for recent months"""
        
        end_date = date.today()
        start_date = end_date - timedelta(days=months * 30)
        
        # Total spending
        total_spent = db.query(
            func.sum(Transaction.amount_cents)
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date
        ).scalar() or 0
        
        # Total income
        budgets = db.query(Budget).filter(
            Budget.user_id == user_id
        ).all()
        
        total_income = 0
        for budget in budgets:
            budget_date = date(budget.year, budget.month, 1)
            if start_date <= budget_date <= end_date:
                total_income += budget.income_cents
        
        # Top spending categories
        top_categories = db.query(
            BudgetCategory.name,
            func.sum(Transaction.amount_cents).label('total')
        ).join(
            Transaction, Transaction.category_id == BudgetCategory.id
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date
        ).group_by(
            BudgetCategory.name
        ).order_by(
            func.sum(Transaction.amount_cents).desc()
        ).limit(5).all()
        
        # Recent trend
        monthly_trend = db.query(
            func.strftime('%Y-%m', Transaction.date).label('month'),
            func.sum(Transaction.amount_cents).label('total')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date
        ).group_by('month').order_by('month').all()
        
        return {
            'total_spent_cents': total_spent,
            'total_income_cents': total_income,
            'remaining_cents': total_income - total_spent,
            'top_categories': [
                {'name': cat.name, 'total_cents': cat.total}
                for cat in top_categories
            ],
            'monthly_trend': [
                {'month': m.month, 'total_cents': m.total}
                for m in monthly_trend
            ]
        }
