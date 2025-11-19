from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract, or_
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionSplit
from app.models.budget import Budget, BudgetCategory
from app.schemas.transaction import (
    TransactionCreate, TransactionUpdate, 
    Transaction as TransactionSchema,
    TransactionWithCategory,
    TransactionWithSplits,
    TransactionSplitWithCategory
)

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

def _get_transaction_with_splits(db: Session, transaction_id: int, user_id: int):
    """Helper function to get transaction with splits and category names"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id
    ).first()
    
    if not transaction:
        return None
    
    result = {
        "id": transaction.id,
        "user_id": transaction.user_id,
        "budget_id": transaction.budget_id,
        "category_id": transaction.category_id,
        "amount_cents": transaction.amount_cents,
        "date": transaction.date,
        "notes": transaction.notes,
        "is_split": transaction.is_split,
        "created_at": transaction.created_at,
        "updated_at": transaction.updated_at,
        "splits": []
    }
    
    if transaction.is_split:
        splits = db.query(TransactionSplit, BudgetCategory.name).join(
            BudgetCategory, TransactionSplit.category_id == BudgetCategory.id
        ).filter(TransactionSplit.transaction_id == transaction_id).all()
        
        result["splits"] = [
            {
                "id": split.id,
                "transaction_id": split.transaction_id,
                "category_id": split.category_id,
                "amount_cents": split.amount_cents,
                "notes": split.notes,
                "created_at": split.created_at,
                "category_name": category_name
            }
            for split, category_name in splits
        ]
    
    return result

@router.post("", response_model=TransactionWithSplits, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify budget belongs to user
    budget = db.query(Budget).filter(
        Budget.id == transaction_data.budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # For non-split transactions, verify category belongs to budget
    if not transaction_data.is_split:
        if transaction_data.category_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="category_id is required for non-split transactions"
            )
        
        category = db.query(BudgetCategory).filter(
            BudgetCategory.id == transaction_data.category_id,
            BudgetCategory.budget_id == transaction_data.budget_id
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found in this budget"
            )
    
    # For split transactions, verify all split categories belong to budget
    if transaction_data.is_split and transaction_data.splits:
        for split in transaction_data.splits:
            category = db.query(BudgetCategory).filter(
                BudgetCategory.id == split.category_id,
                BudgetCategory.budget_id == transaction_data.budget_id
            ).first()
            
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category {split.category_id} not found in this budget"
                )
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        budget_id=transaction_data.budget_id,
        category_id=transaction_data.category_id,
        amount_cents=transaction_data.amount_cents,
        date=transaction_data.date,
        notes=transaction_data.notes,
        is_split=transaction_data.is_split
    )
    
    db.add(transaction)
    db.flush()  # Get transaction ID before creating splits
    
    # Create splits if this is a split transaction
    if transaction_data.is_split and transaction_data.splits:
        for split_data in transaction_data.splits:
            split = TransactionSplit(
                transaction_id=transaction.id,
                category_id=split_data.category_id,
                amount_cents=split_data.amount_cents,
                notes=split_data.notes
            )
            db.add(split)
    
    db.commit()
    db.refresh(transaction)
    
    # Load splits with category names
    result = _get_transaction_with_splits(db, transaction.id, current_user.id)
    return result

@router.get("", response_model=List[TransactionWithSplits])
def list_transactions(
    budget_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if budget_id:
        query = query.filter(Transaction.budget_id == budget_id)
    
    if category_id:
        # For split transactions, filter by splits
        split_transaction_ids = db.query(TransactionSplit.transaction_id).filter(
            TransactionSplit.category_id == category_id
        ).subquery()
        
        query = query.filter(
            or_(
                Transaction.category_id == category_id,
                Transaction.id.in_(split_transaction_ids)
            )
        )
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.order_by(Transaction.date.desc(), Transaction.created_at.desc()).limit(limit).all()
    
    # Get full details with splits for each transaction
    results = []
    for transaction in transactions:
        result = _get_transaction_with_splits(db, transaction.id, current_user.id)
        if result:
            results.append(result)
    
    return results

@router.get("/{transaction_id}", response_model=TransactionWithSplits)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = _get_transaction_with_splits(db, transaction_id, current_user.id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return result

@router.get("/budget/{budget_id}/summary")
def get_budget_transaction_summary(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify budget belongs to user
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Get all categories with their spent amounts
    categories = db.query(BudgetCategory).filter(
        BudgetCategory.budget_id == budget_id
    ).all()
    
    category_summary = []
    for category in categories:
        # Get regular transactions
        regular_spent = db.query(Transaction).filter(
            Transaction.category_id == category.id,
            Transaction.is_split == False
        ).with_entities(
            Transaction.amount_cents
        ).all()
        
        # Get split transactions
        split_spent = db.query(TransactionSplit).filter(
            TransactionSplit.category_id == category.id
        ).with_entities(
            TransactionSplit.amount_cents
        ).all()
        
        regular_cents = sum(t[0] for t in regular_spent) if regular_spent else 0
        split_cents = sum(s[0] for s in split_spent) if split_spent else 0
        spent_cents = regular_cents + split_cents
        remaining_cents = category.allocated_cents - spent_cents
        
        category_summary.append({
            "category_id": category.id,
            "category_name": category.name,
            "allocated_cents": category.allocated_cents,
            "spent_cents": spent_cents,
            "remaining_cents": remaining_cents
        })
    
    return {
        "budget_id": budget_id,
        "categories": category_summary
    }

@router.put("/{transaction_id}", response_model=TransactionSchema)
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # If category is being changed, verify it belongs to the same budget
    if transaction_data.category_id is not None:
        category = db.query(BudgetCategory).filter(
            BudgetCategory.id == transaction_data.category_id,
            BudgetCategory.budget_id == transaction.budget_id
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found in this budget"
            )
        
        transaction.category_id = transaction_data.category_id
    
    if transaction_data.amount_cents is not None:
        transaction.amount_cents = transaction_data.amount_cents
    
    if transaction_data.date is not None:
        transaction.date = transaction_data.date
    
    if transaction_data.notes is not None:
        transaction.notes = transaction_data.notes
    
    db.commit()
    db.refresh(transaction)
    
    return transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    db.delete(transaction)
    db.commit()
    
    return None
