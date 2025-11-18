from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.category_template import CategoryTemplate
from app.models.budget import BudgetCategory
from app.models.transaction import Transaction
from app.schemas.category_template import (
    CategoryTemplateCreate, CategoryTemplateUpdate, 
    CategoryTemplate as CategoryTemplateSchema,
    CategoryTemplateList
)

router = APIRouter(prefix="/api/category-templates", tags=["category-templates"])

@router.post("", response_model=CategoryTemplateSchema, status_code=status.HTTP_201_CREATED)
def create_category_template(
    template_data: CategoryTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new category template"""
    # Check if template with same name already exists for user
    existing = db.query(CategoryTemplate).filter(
        CategoryTemplate.user_id == current_user.id,
        CategoryTemplate.name == template_data.name,
        CategoryTemplate.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category template '{template_data.name}' already exists"
        )
    
    template = CategoryTemplate(
        user_id=current_user.id,
        **template_data.dict()
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return template

@router.get("", response_model=CategoryTemplateList)
def list_category_templates(
    active_only: bool = Query(True, description="Filter to active templates only"),
    category_type: Optional[str] = Query(None, description="Filter by category type"),
    category_group: Optional[str] = Query(None, description="Filter by category group"),
    search: Optional[str] = Query(None, description="Search templates by name"),
    limit: int = Query(100, le=500, description="Number of templates to return"),
    offset: int = Query(0, ge=0, description="Number of templates to skip"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List user's category templates with pagination and filtering"""
    query = db.query(CategoryTemplate).filter(
        CategoryTemplate.user_id == current_user.id
    )
    
    if active_only:
        query = query.filter(CategoryTemplate.is_active == True)
    
    if category_type:
        query = query.filter(CategoryTemplate.category_type == category_type)
    
    if category_group:
        query = query.filter(CategoryTemplate.category_group == category_group)
    
    if search:
        query = query.filter(CategoryTemplate.name.ilike(f"%{search}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    templates = query.order_by(
        CategoryTemplate.order, 
        CategoryTemplate.name
    ).offset(offset).limit(limit).all()
    
    return CategoryTemplateList(
        templates=templates,
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total
    )

@router.get("/{template_id}", response_model=CategoryTemplateSchema)
def get_category_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific category template"""
    template = db.query(CategoryTemplate).filter(
        CategoryTemplate.id == template_id,
        CategoryTemplate.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category template not found"
        )
    
    return template

@router.put("/{template_id}", response_model=CategoryTemplateSchema)
def update_category_template(
    template_id: int,
    template_data: CategoryTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a category template"""
    template = db.query(CategoryTemplate).filter(
        CategoryTemplate.id == template_id,
        CategoryTemplate.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category template not found"
        )
    
    # Check for name conflicts if name is being updated
    if template_data.name and template_data.name != template.name:
        existing = db.query(CategoryTemplate).filter(
            CategoryTemplate.user_id == current_user.id,
            CategoryTemplate.name == template_data.name,
            CategoryTemplate.is_active == True,
            CategoryTemplate.id != template_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category template '{template_data.name}' already exists"
            )
    
    # Update fields
    update_data = template_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    
    return template

@router.delete("/{template_id}")
def delete_category_template(
    template_id: int,
    force: bool = Query(False, description="Force delete even if used in budgets"),
    replacement_template_id: Optional[int] = Query(None, description="ID of template to replace with"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a category template with transaction reallocation"""
    template = db.query(CategoryTemplate).filter(
        CategoryTemplate.id == template_id,
        CategoryTemplate.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category template not found"
        )
    
    # Check if template is used in any budget categories
    used_categories = db.query(BudgetCategory).filter(
        BudgetCategory.name == template.name
    ).all()
    
    if used_categories and not force:
        return {
            "message": "Template is used in existing budgets",
            "used_in_budgets": len(used_categories),
            "requires_force": True
        }
    
    # Handle replacement if specified
    replacement_template = None
    if replacement_template_id:
        replacement_template = db.query(CategoryTemplate).filter(
            CategoryTemplate.id == replacement_template_id,
            CategoryTemplate.user_id == current_user.id,
            CategoryTemplate.is_active == True
        ).first()
        
        if not replacement_template:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Replacement template not found or inactive"
            )
    
    # Update existing budget categories and transactions
    if used_categories:
        if replacement_template:
            # Update categories to use replacement template name
            for category in used_categories:
                category.name = replacement_template.name
        else:
            # Mark categories as "Uncategorized" or similar
            for category in used_categories:
                category.name = f"Deleted: {category.name}"
    
    # Soft delete the template
    template.is_active = False
    
    db.commit()
    
    return {
        "message": "Category template deleted successfully",
        "updated_categories": len(used_categories) if used_categories else 0,
        "replacement_used": replacement_template.name if replacement_template else None
    }