from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, func, desc
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.budget import Budget, BudgetCategory
from app.models.category_template import CategoryTemplate
from app.schemas.budget import (
    BudgetCreate, BudgetUpdate, Budget as BudgetSchema,
    BudgetSummary, BudgetCategoryUpdate, BudgetCategoryBulkUpdate
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
    include_categories: bool = Query(True, description="Include category details"),
    category_limit: Optional[int] = Query(None, description="Limit number of categories returned"),
    category_offset: Optional[int] = Query(0, description="Offset for category pagination"),
    category_group: Optional[str] = Query(None, description="Filter categories by group"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Use selectinload for efficient category loading
    query = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    )
    
    if include_categories:
        query = query.options(selectinload(Budget.categories))
    
    budget = query.first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Apply category filtering and pagination if requested
    if include_categories and (category_limit or category_group):
        category_query = db.query(BudgetCategory).filter(
            BudgetCategory.budget_id == budget_id,
            BudgetCategory.is_active == True
        )
        
        if category_group:
            category_query = category_query.filter(BudgetCategory.category_group == category_group)
        
        category_query = category_query.order_by(BudgetCategory.order, BudgetCategory.name)
        
        if category_offset:
            category_query = category_query.offset(category_offset)
        if category_limit:
            category_query = category_query.limit(category_limit)
        
        budget.categories = category_query.all()
    
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

@router.get("/{budget_id}/categories", response_model=List[dict])
def get_budget_categories(
    budget_id: int,
    limit: int = Query(50, le=500, description="Number of categories to return"),
    offset: int = Query(0, ge=0, description="Number of categories to skip"),
    search: Optional[str] = Query(None, description="Search categories by name"),
    group: Optional[str] = Query(None, description="Filter by category group"),
    sort_by: str = Query("order", description="Sort by: order, name, allocated_cents"),
    sort_desc: bool = Query(False, description="Sort in descending order"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paginated budget categories with filtering and sorting"""
    # Verify budget ownership
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Build query
    query = db.query(BudgetCategory).filter(
        BudgetCategory.budget_id == budget_id,
        BudgetCategory.is_active == True
    )
    
    # Apply filters
    if search:
        query = query.filter(BudgetCategory.name.ilike(f"%{search}%"))
    
    if group:
        query = query.filter(BudgetCategory.category_group == group)
    
    # Apply sorting
    sort_column = getattr(BudgetCategory, sort_by, BudgetCategory.order)
    if sort_desc:
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination
    categories = query.offset(offset).limit(limit).all()
    
    return {
        "categories": categories,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "has_more": offset + limit < total_count
    }

@router.post("/{budget_id}/categories/bulk", response_model=dict)
def bulk_update_categories(
    budget_id: int,
    updates: BudgetCategoryBulkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk update multiple budget categories"""
    # Verify budget ownership
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    updated_count = 0
    errors = []
    
    # Process updates
    for update in updates.updates:
        try:
            category = db.query(BudgetCategory).filter(
                BudgetCategory.id == update.category_id,
                BudgetCategory.budget_id == budget_id
            ).first()
            
            if not category:
                errors.append(f"Category {update.category_id} not found")
                continue
            
            # Apply updates
            if update.allocated_cents is not None:
                category.allocated_cents = update.allocated_cents
            if update.name is not None:
                category.name = update.name
            if update.order is not None:
                category.order = update.order
            if update.category_group is not None:
                category.category_group = update.category_group
            if update.description is not None:
                category.description = update.description
            
            updated_count += 1
            
        except Exception as e:
            errors.append(f"Error updating category {update.category_id}: {str(e)}")
    
    db.commit()
    
    return {
        "updated_count": updated_count,
        "errors": errors,
        "success": len(errors) == 0
    }

@router.post("/{budget_id}/categories/reorder", response_model=dict)
def reorder_categories(
    budget_id: int,
    category_orders: List[dict],  # [{"id": 1, "order": 0}, {"id": 2, "order": 1}]
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reorder budget categories"""
    # Verify budget ownership
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    updated_count = 0
    
    for item in category_orders:
        category = db.query(BudgetCategory).filter(
            BudgetCategory.id == item["id"],
            BudgetCategory.budget_id == budget_id
        ).first()
        
        if category:
            category.order = item["order"]
            updated_count += 1
    
    db.commit()
    
    return {
        "updated_count": updated_count,
        "message": f"Reordered {updated_count} categories"
    }

@router.get("/{budget_id}/groups", response_model=List[dict])
def get_category_groups(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all category groups in a budget with counts"""
    # Verify budget ownership
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Get groups with counts
    groups = db.query(
        BudgetCategory.category_group,
        func.count(BudgetCategory.id).label('count'),
        func.sum(BudgetCategory.allocated_cents).label('total_allocated')
    ).filter(
        BudgetCategory.budget_id == budget_id,
        BudgetCategory.is_active == True,
        BudgetCategory.category_group.isnot(None)
    ).group_by(BudgetCategory.category_group).all()
    
    return [
        {
            "name": group.category_group,
            "count": group.count,
            "total_allocated_cents": group.total_allocated or 0
        }
        for group in groups
    ]
