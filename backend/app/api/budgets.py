from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.budget import Budget, BudgetCategory
from app.models.category_template import CategoryTemplate
from app.schemas.budget import (
    BudgetCreate, BudgetUpdate, Budget as BudgetSchema,
    BudgetSummary, BudgetCategoryUpdate
)

router = APIRouter(prefix="/api/budgets", tags=["budgets"])

def calculate_budget_summary(budget: Budget) -> dict:
    """Calculate budget allocation summary"""
    total_allocated = sum(cat.allocated_cents for cat in budget.categories)
    remaining = budget.income_cents - total_allocated
    is_balanced = remaining == 0
    
    return {
        "total_allocated_cents": total_allocated,
        "remaining_cents": remaining,
        "is_balanced": is_balanced
    }

@router.post("", response_model=BudgetSummary, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if budget already exists for this month/year
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == budget_data.month,
        Budget.year == budget_data.year
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Budget for {budget_data.month}/{budget_data.year} already exists"
        )
    
    # Create budget
    budget = Budget(
        user_id=current_user.id,
        month=budget_data.month,
        year=budget_data.year,
        income_cents=budget_data.income_cents
    )
    db.add(budget)
    db.flush()
    
    # Create categories
    for cat_data in budget_data.categories:
        category = BudgetCategory(
            budget_id=budget.id,
            name=cat_data.name,
            allocated_cents=cat_data.allocated_cents,
            order=cat_data.order
        )
        db.add(category)
    
    db.commit()
    db.refresh(budget)
    
    summary = calculate_budget_summary(budget)
    return {"budget": budget, **summary}

@router.get("", response_model=List[BudgetSchema])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).order_by(Budget.year.desc(), Budget.month.desc()).all()
    
    return budgets

@router.get("/{budget_id}", response_model=BudgetSummary)
def get_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    summary = calculate_budget_summary(budget)
    return {"budget": budget, **summary}

@router.get("/period/{year}/{month}", response_model=BudgetSummary)
def get_budget_by_period(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.year == year,
        Budget.month == month
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget for {month}/{year} not found"
        )
    
    summary = calculate_budget_summary(budget)
    return {"budget": budget, **summary}

@router.put("/{budget_id}", response_model=BudgetSummary)
def update_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Update income if provided
    if budget_data.income_cents is not None:
        budget.income_cents = budget_data.income_cents
    
    # Update categories if provided
    if budget_data.categories is not None:
        # Delete existing categories
        db.query(BudgetCategory).filter(
            BudgetCategory.budget_id == budget_id
        ).delete()
        
        # Create new categories
        for cat_data in budget_data.categories:
            category = BudgetCategory(
                budget_id=budget.id,
                name=cat_data.name,
                allocated_cents=cat_data.allocated_cents,
                order=cat_data.order
            )
            db.add(category)
    
    db.commit()
    db.refresh(budget)
    
    summary = calculate_budget_summary(budget)
    return {"budget": budget, **summary}

@router.post("/from-templates", response_model=BudgetSummary, status_code=status.HTTP_201_CREATED)
def create_budget_from_templates(
    month: int,
    year: int,
    income_cents: int,
    template_ids: List[int] = [],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a budget using category templates"""
    # Check if budget already exists
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == month,
        Budget.year == year
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Budget for {month}/{year} already exists"
        )
    
    # Create budget
    budget = Budget(
        user_id=current_user.id,
        month=month,
        year=year,
        income_cents=income_cents
    )
    db.add(budget)
    db.flush()
    
    # Get templates to use
    if template_ids:
        templates = db.query(CategoryTemplate).filter(
            CategoryTemplate.id.in_(template_ids),
            CategoryTemplate.user_id == current_user.id,
            CategoryTemplate.is_active == True
        ).all()
    else:
        # Use all active templates if none specified
        templates = db.query(CategoryTemplate).filter(
            CategoryTemplate.user_id == current_user.id,
            CategoryTemplate.is_active == True
        ).order_by(CategoryTemplate.order, CategoryTemplate.name).all()
    
    # Create categories from templates
    for template in templates:
        category = BudgetCategory(
            budget_id=budget.id,
            name=template.name,
            allocated_cents=template.default_allocation_cents,
            order=template.order
        )
        db.add(category)
    
    db.commit()
    db.refresh(budget)
    
    summary = calculate_budget_summary(budget)
    return {"budget": budget, **summary}

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    db.delete(budget)
    db.commit()
    
    return None
