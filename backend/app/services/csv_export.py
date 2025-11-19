"""CSV Export Service for transactions and budgets"""
import csv
import io
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.models.transaction import Transaction, TransactionSplit
from app.models.budget import Budget, BudgetCategory


class CSVExportService:
    """Service for generating CSV exports"""
    
    @staticmethod
    def export_transactions(
        db: Session,
        user_id: int,
        budget_id: Optional[int] = None,
        category_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> str:
        """Export transactions to CSV format"""
        
        # Build query
        query = db.query(
            Transaction.id,
            Transaction.date,
            Transaction.amount_cents,
            Transaction.notes,
            Transaction.is_split,
            Budget.month,
            Budget.year,
            BudgetCategory.name.label('category_name')
        ).join(
            Budget, Transaction.budget_id == Budget.id
        ).outerjoin(
            BudgetCategory, Transaction.category_id == BudgetCategory.id
        ).filter(
            Transaction.user_id == user_id
        )
        
        # Apply filters
        if budget_id:
            query = query.filter(Transaction.budget_id == budget_id)
        if category_id:
            query = query.filter(Transaction.category_id == category_id)
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        
        query = query.order_by(Transaction.date.desc(), Transaction.id.desc())
        transactions = query.all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Transaction ID',
            'Date',
            'Amount',
            'Category',
            'Notes',
            'Budget Period',
            'Is Split'
        ])
        
        # Write data rows
        for txn in transactions:
            amount = txn.amount_cents / 100.0
            budget_period = f"{txn.month:02d}/{txn.year}"
            category = txn.category_name if txn.category_name else "Split Transaction"
            
            writer.writerow([
                txn.id,
                txn.date.strftime('%Y-%m-%d'),
                f"{amount:.2f}",
                category,
                txn.notes or '',
                budget_period,
                'Yes' if txn.is_split else 'No'
            ])
        
        return output.getvalue()
    
    @staticmethod
    def export_transaction_splits(
        db: Session,
        user_id: int,
        budget_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> str:
        """Export transaction splits to CSV format (detailed view)"""
        
        # Build query for split transactions
        query = db.query(
            Transaction.id.label('transaction_id'),
            Transaction.date,
            Transaction.amount_cents.label('total_amount_cents'),
            Transaction.notes.label('transaction_notes'),
            TransactionSplit.id.label('split_id'),
            TransactionSplit.amount_cents.label('split_amount_cents'),
            TransactionSplit.notes.label('split_notes'),
            BudgetCategory.name.label('category_name'),
            Budget.month,
            Budget.year
        ).join(
            TransactionSplit, Transaction.id == TransactionSplit.transaction_id
        ).join(
            Budget, Transaction.budget_id == Budget.id
        ).join(
            BudgetCategory, TransactionSplit.category_id == BudgetCategory.id
        ).filter(
            Transaction.user_id == user_id,
            Transaction.is_split == True
        )
        
        # Apply filters
        if budget_id:
            query = query.filter(Transaction.budget_id == budget_id)
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        
        query = query.order_by(Transaction.date.desc(), Transaction.id.desc())
        splits = query.all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Transaction ID',
            'Split ID',
            'Date',
            'Total Amount',
            'Split Amount',
            'Category',
            'Transaction Notes',
            'Split Notes',
            'Budget Period'
        ])
        
        # Write data rows
        for split in splits:
            total_amount = split.total_amount_cents / 100.0
            split_amount = split.split_amount_cents / 100.0
            budget_period = f"{split.month:02d}/{split.year}"
            
            writer.writerow([
                split.transaction_id,
                split.split_id,
                split.date.strftime('%Y-%m-%d'),
                f"{total_amount:.2f}",
                f"{split_amount:.2f}",
                split.category_name,
                split.transaction_notes or '',
                split.split_notes or '',
                budget_period
            ])
        
        return output.getvalue()
    
    @staticmethod
    def export_budget_summary(
        db: Session,
        user_id: int,
        budget_id: Optional[int] = None,
        year: Optional[int] = None,
        month: Optional[int] = None
    ) -> str:
        """Export budget summary with categories to CSV format"""
        
        # Build query
        query = db.query(Budget).filter(Budget.user_id == user_id)
        
        if budget_id:
            query = query.filter(Budget.id == budget_id)
        if year:
            query = query.filter(Budget.year == year)
        if month:
            query = query.filter(Budget.month == month)
        
        query = query.order_by(Budget.year.desc(), Budget.month.desc())
        budgets = query.all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Budget Period',
            'Category',
            'Category Group',
            'Allocated Amount',
            'Spent Amount',
            'Remaining Amount',
            'Total Income',
            'Total Allocated',
            'Budget Remaining'
        ])
        
        # Write data rows
        for budget in budgets:
            budget_period = f"{budget.month:02d}/{budget.year}"
            total_allocated = sum(cat.allocated_cents for cat in budget.categories)
            budget_remaining = budget.income_cents - total_allocated
            
            for category in budget.categories:
                if not category.is_active:
                    continue
                
                # Calculate spent amount
                spent_cents = CSVExportService._calculate_category_spent(
                    db, category.id
                )
                remaining_cents = category.allocated_cents - spent_cents
                
                writer.writerow([
                    budget_period,
                    category.name,
                    category.category_group or '',
                    f"{category.allocated_cents / 100.0:.2f}",
                    f"{spent_cents / 100.0:.2f}",
                    f"{remaining_cents / 100.0:.2f}",
                    f"{budget.income_cents / 100.0:.2f}",
                    f"{total_allocated / 100.0:.2f}",
                    f"{budget_remaining / 100.0:.2f}"
                ])
        
        return output.getvalue()
    
    @staticmethod
    def _calculate_category_spent(db: Session, category_id: int) -> int:
        """Calculate total spent for a category"""
        # Regular transactions
        regular_spent = db.query(Transaction).filter(
            Transaction.category_id == category_id,
            Transaction.is_split == False
        ).with_entities(Transaction.amount_cents).all()
        
        # Split transactions
        split_spent = db.query(TransactionSplit).filter(
            TransactionSplit.category_id == category_id
        ).with_entities(TransactionSplit.amount_cents).all()
        
        regular_total = sum(t[0] for t in regular_spent) if regular_spent else 0
        split_total = sum(s[0] for s in split_spent) if split_spent else 0
        
        return regular_total + split_total
