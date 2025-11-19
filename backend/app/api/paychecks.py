from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, func
from typing import List, Optional
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.paycheck import Paycheck, PaycheckInstance, PaycheckAllocation, PaycheckFrequency
from app.models.budget import Budget, BudgetCategory
from app.schemas.paycheck import (
    PaycheckCreate, PaycheckUpdate, Paycheck as PaycheckSchema,
    PaycheckInstanceCreate, PaycheckInstance as PaycheckInstanceSchema,
    PaycheckSchedule, BudgetFundingPlan, CategoryFundingStatus
)

router = APIRouter(prefix="/api/paychecks", tags=["paychecks"])


def calculate_next_paycheck_date(current_date: date, frequency: PaycheckFrequency) -> date:
    """Calculate next paycheck date based on frequency"""
    if frequency == PaycheckFrequency.WEEKLY:
        return current_date + timedelta(days=7)
    elif frequency == PaycheckFrequency.BIWEEKLY:
        return current_date + timedelta(days=14)
    elif frequency == PaycheckFrequency.SEMIMONTHLY:
        # Typically 15th and last day of month
        if current_date.day < 15:
            return current_date.replace(day=15)
        else:
            next_month = current_date + relativedelta(months=1)
            return next_month.replace(day=1) + relativedelta(days=-1)
    elif frequency == PaycheckFrequency.MONTHLY:
        return current_date + relativedelta(months=1)
    else:
        return current_date


def generate_upcoming_dates(start_date: date, frequency: PaycheckFrequency, count: int = 6) -> List[date]:
    """Generate upcoming paycheck dates"""
    dates = []
    current = start_date
    for _ in range(count):
        dates.append(current)
        current = calculate_next_paycheck_date(current, frequency)
    return dates


@router.post("", response_model=PaycheckSchema, status_code=status.HTTP_201_CREATED)
def create_paycheck(
    paycheck_data: PaycheckCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new paycheck schedule"""
    paycheck = Paycheck(
        user_id=current_user.id,
        name=paycheck_data.name,
        amount_cents=paycheck_data.amount_cents,
        frequency=paycheck_data.frequency,
        next_date=paycheck_data.next_date,
        is_active=paycheck_data.is_active
    )
    db.add(paycheck)
    db.flush()
    
    # Create allocation templates
    for alloc_data in paycheck_data.allocations:
        allocation = PaycheckAllocation(
            paycheck_id=paycheck.id,
            category_id=alloc_data.category_id,
            amount_cents=alloc_data.amount_cents,
            order=alloc_data.order
        )
        db.add(allocation)
    
    db.commit()
    db.refresh(paycheck)
    return paycheck


@router.get("", response_model=List[PaycheckSchema])
def list_paychecks(
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all paychecks for the current user"""
    query = db.query(Paycheck).filter(Paycheck.user_id == current_user.id)
    
    if active_only:
        query = query.filter(Paycheck.is_active == True)
    
    paychecks = query.order_by(Paycheck.next_date).all()
    return paychecks


@router.get("/{paycheck_id}", response_model=PaycheckSchema)
def get_paycheck(
    paycheck_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific paycheck"""
    paycheck = db.query(Paycheck).filter(
        Paycheck.id == paycheck_id,
        Paycheck.user_id == current_user.id
    ).first()
    
    if not paycheck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paycheck not found"
        )
    
    return paycheck


@router.put("/{paycheck_id}", response_model=PaycheckSchema)
def update_paycheck(
    paycheck_id: int,
    paycheck_data: PaycheckUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a paycheck"""
    paycheck = db.query(Paycheck).filter(
        Paycheck.id == paycheck_id,
        Paycheck.user_id == current_user.id
    ).first()
    
    if not paycheck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paycheck not found"
        )
    
    # Update fields
    if paycheck_data.name is not None:
        paycheck.name = paycheck_data.name
    if paycheck_data.amount_cents is not None:
        paycheck.amount_cents = paycheck_data.amount_cents
    if paycheck_data.frequency is not None:
        paycheck.frequency = paycheck_data.frequency
    if paycheck_data.next_date is not None:
        paycheck.next_date = paycheck_data.next_date
    if paycheck_data.is_active is not None:
        paycheck.is_active = paycheck_data.is_active
    
    # Update allocations if provided
    if paycheck_data.allocations is not None:
        # Delete existing template allocations (instance_id is null)
        db.query(PaycheckAllocation).filter(
            PaycheckAllocation.paycheck_id == paycheck_id,
            PaycheckAllocation.instance_id.is_(None)
        ).delete()
        
        # Create new allocations
        for alloc_data in paycheck_data.allocations:
            allocation = PaycheckAllocation(
                paycheck_id=paycheck.id,
                category_id=alloc_data.category_id,
                amount_cents=alloc_data.amount_cents,
                order=alloc_data.order
            )
            db.add(allocation)
    
    db.commit()
    db.refresh(paycheck)
    return paycheck


@router.delete("/{paycheck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paycheck(
    paycheck_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a paycheck"""
    paycheck = db.query(Paycheck).filter(
        Paycheck.id == paycheck_id,
        Paycheck.user_id == current_user.id
    ).first()
    
    if not paycheck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paycheck not found"
        )
    
    db.delete(paycheck)
    db.commit()
    return None


@router.get("/{paycheck_id}/schedule", response_model=PaycheckSchedule)
def get_paycheck_schedule(
    paycheck_id: int,
    months_ahead: int = Query(3, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get upcoming paycheck schedule"""
    paycheck = db.query(Paycheck).filter(
        Paycheck.id == paycheck_id,
        Paycheck.user_id == current_user.id
    ).first()
    
    if not paycheck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paycheck not found"
        )
    
    # Calculate how many dates to generate based on frequency
    if paycheck.frequency == PaycheckFrequency.WEEKLY:
        count = months_ahead * 4
    elif paycheck.frequency == PaycheckFrequency.BIWEEKLY:
        count = months_ahead * 2
    elif paycheck.frequency == PaycheckFrequency.SEMIMONTHLY:
        count = months_ahead * 2
    else:  # MONTHLY
        count = months_ahead
    
    upcoming_dates = generate_upcoming_dates(paycheck.next_date, paycheck.frequency, count)
    
    return {
        "paycheck": paycheck,
        "upcoming_dates": upcoming_dates,
        "next_amount_cents": paycheck.amount_cents
    }


@router.post("/instances", response_model=PaycheckInstanceSchema, status_code=status.HTTP_201_CREATED)
def create_paycheck_instance(
    instance_data: PaycheckInstanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a paycheck instance (actual occurrence)"""
    # Verify paycheck ownership
    paycheck = db.query(Paycheck).filter(
        Paycheck.id == instance_data.paycheck_id,
        Paycheck.user_id == current_user.id
    ).first()
    
    if not paycheck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paycheck not found"
        )
    
    # Verify budget ownership
    budget = db.query(Budget).filter(
        Budget.id == instance_data.budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Create instance
    instance = PaycheckInstance(
        paycheck_id=instance_data.paycheck_id,
        budget_id=instance_data.budget_id,
        amount_cents=instance_data.amount_cents,
        date=instance_data.date,
        is_received=instance_data.is_received
    )
    db.add(instance)
    db.flush()
    
    # Create allocations
    for alloc_data in instance_data.allocations:
        allocation = PaycheckAllocation(
            paycheck_id=instance_data.paycheck_id,
            instance_id=instance.id,
            category_id=alloc_data.category_id,
            amount_cents=alloc_data.amount_cents,
            order=alloc_data.order
        )
        db.add(allocation)
    
    db.commit()
    db.refresh(instance)
    return instance


@router.get("/instances/budget/{budget_id}", response_model=List[PaycheckInstanceSchema])
def list_budget_paycheck_instances(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all paycheck instances for a budget"""
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
    
    instances = db.query(PaycheckInstance).filter(
        PaycheckInstance.budget_id == budget_id
    ).order_by(PaycheckInstance.date).all()
    
    return instances


@router.put("/instances/{instance_id}/receive", response_model=PaycheckInstanceSchema)
def mark_paycheck_received(
    instance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a paycheck instance as received"""
    instance = db.query(PaycheckInstance).join(Paycheck).filter(
        PaycheckInstance.id == instance_id,
        Paycheck.user_id == current_user.id
    ).first()
    
    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paycheck instance not found"
        )
    
    instance.is_received = True
    db.commit()
    db.refresh(instance)
    return instance


@router.get("/budget/{budget_id}/funding-plan", response_model=BudgetFundingPlan)
def get_budget_funding_plan(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get funding plan for a budget showing all paychecks"""
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Get all paycheck instances for this budget
    instances = db.query(PaycheckInstance).filter(
        PaycheckInstance.budget_id == budget_id
    ).order_by(PaycheckInstance.date).all()
    
    total_paycheck_income = sum(inst.amount_cents for inst in instances)
    total_allocated = sum(cat.allocated_cents for cat in budget.categories)
    available = total_paycheck_income - total_allocated
    
    return {
        "budget_id": budget_id,
        "month": budget.month,
        "year": budget.year,
        "total_income_cents": total_paycheck_income,
        "total_allocated_cents": total_allocated,
        "paychecks": instances,
        "available_to_allocate_cents": available,
        "is_fully_funded": available >= 0 and total_allocated > 0
    }


@router.get("/budget/{budget_id}/category-funding", response_model=List[CategoryFundingStatus])
def get_category_funding_status(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get funding status for each category in a budget"""
    budget = db.query(Budget).options(
        selectinload(Budget.categories)
    ).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Get all allocations for this budget
    allocations = db.query(PaycheckAllocation).join(PaycheckInstance).filter(
        PaycheckInstance.budget_id == budget_id
    ).all()
    
    # Group allocations by category
    category_funding = {}
    for alloc in allocations:
        if alloc.category_id not in category_funding:
            category_funding[alloc.category_id] = {
                "funded_cents": 0,
                "sources": []
            }
        category_funding[alloc.category_id]["funded_cents"] += alloc.amount_cents
        category_funding[alloc.category_id]["sources"].append({
            "instance_id": alloc.instance_id,
            "amount_cents": alloc.amount_cents
        })
    
    # Build response
    result = []
    for category in budget.categories:
        funded = category_funding.get(category.id, {"funded_cents": 0, "sources": []})
        remaining = category.allocated_cents - funded["funded_cents"]
        
        result.append({
            "category_id": category.id,
            "category_name": category.name,
            "allocated_cents": category.allocated_cents,
            "funded_cents": funded["funded_cents"],
            "remaining_cents": remaining,
            "is_fully_funded": remaining <= 0,
            "funding_sources": funded["sources"]
        })
    
    return result


@router.post("/budget/{budget_id}/auto-allocate", response_model=List[PaycheckInstanceSchema])
def auto_allocate_paychecks(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Automatically allocate upcoming paychecks to budget categories"""
    budget = db.query(Budget).options(
        selectinload(Budget.categories)
    ).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Get active paychecks
    paychecks = db.query(Paycheck).filter(
        Paycheck.user_id == current_user.id,
        Paycheck.is_active == True
    ).all()
    
    if not paychecks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active paychecks found"
        )
    
    # Find paychecks that fall in this budget month
    from calendar import monthrange
    start_date = date(budget.year, budget.month, 1)
    _, last_day = monthrange(budget.year, budget.month)
    end_date = date(budget.year, budget.month, last_day)
    
    created_instances = []
    
    for paycheck in paychecks:
        # Generate dates for this paycheck
        upcoming_dates = generate_upcoming_dates(paycheck.next_date, paycheck.frequency, 12)
        
        # Filter dates that fall in this budget month
        month_dates = [d for d in upcoming_dates if start_date <= d <= end_date]
        
        for paycheck_date in month_dates:
            # Check if instance already exists
            existing = db.query(PaycheckInstance).filter(
                PaycheckInstance.paycheck_id == paycheck.id,
                PaycheckInstance.budget_id == budget_id,
                PaycheckInstance.date == paycheck_date
            ).first()
            
            if existing:
                continue
            
            # Create instance
            instance = PaycheckInstance(
                paycheck_id=paycheck.id,
                budget_id=budget_id,
                amount_cents=paycheck.amount_cents,
                date=paycheck_date,
                is_received=False
            )
            db.add(instance)
            db.flush()
            
            # Copy allocation template from paycheck
            template_allocations = db.query(PaycheckAllocation).filter(
                PaycheckAllocation.paycheck_id == paycheck.id,
                PaycheckAllocation.instance_id.is_(None)
            ).all()
            
            for template in template_allocations:
                allocation = PaycheckAllocation(
                    paycheck_id=paycheck.id,
                    instance_id=instance.id,
                    category_id=template.category_id,
                    amount_cents=template.amount_cents,
                    order=template.order
                )
                db.add(allocation)
            
            created_instances.append(instance)
    
    db.commit()
    
    # Refresh instances
    for instance in created_instances:
        db.refresh(instance)
    
    return created_instances
