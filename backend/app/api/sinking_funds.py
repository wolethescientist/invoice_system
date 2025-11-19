from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.sinking_fund import SinkingFund, SinkingFundContribution
from app.schemas.sinking_fund import (
    SinkingFundCreate, SinkingFundUpdate, SinkingFund as SinkingFundSchema,
    SinkingFundWithContributions, SinkingFundProgress, SinkingFundSummary,
    SinkingFundContributionCreate, SinkingFundContribution as ContributionSchema
)

router = APIRouter(prefix="/api/sinking-funds", tags=["sinking-funds"])

def calculate_fund_progress(fund: SinkingFund, total_contributed: int, contribution_count: int) -> dict:
    """Calculate progress metrics for a sinking fund"""
    remaining = fund.target_cents - fund.current_balance_cents
    progress_percentage = (fund.current_balance_cents / fund.target_cents * 100) if fund.target_cents > 0 else 0
    
    # Calculate months to target
    months_to_target = None
    on_track = True
    
    if fund.monthly_contribution_cents > 0 and remaining > 0:
        months_to_target = remaining / fund.monthly_contribution_cents
        
        # Check if on track based on target date
        if fund.target_date:
            months_until_target_date = (fund.target_date - datetime.utcnow()).days / 30.44
            on_track = months_to_target <= months_until_target_date if months_until_target_date > 0 else False
    
    return {
        "progress_percentage": round(progress_percentage, 2),
        "remaining_cents": remaining,
        "months_to_target": round(months_to_target, 1) if months_to_target else None,
        "on_track": on_track,
        "total_contributed_cents": total_contributed,
        "contribution_count": contribution_count
    }

@router.post("", response_model=SinkingFundSchema, status_code=status.HTTP_201_CREATED)
def create_sinking_fund(
    fund_data: SinkingFundCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new sinking fund"""
    fund = SinkingFund(
        user_id=current_user.id,
        name=fund_data.name,
        target_cents=fund_data.target_cents,
        monthly_contribution_cents=fund_data.monthly_contribution_cents,
        target_date=fund_data.target_date,
        description=fund_data.description,
        color=fund_data.color
    )
    
    db.add(fund)
    db.commit()
    db.refresh(fund)
    
    return fund

@router.get("", response_model=List[SinkingFundSchema])
def list_sinking_funds(
    include_inactive: bool = Query(False, description="Include inactive funds"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all sinking funds for the current user"""
    query = db.query(SinkingFund).filter(SinkingFund.user_id == current_user.id)
    
    if not include_inactive:
        query = query.filter(SinkingFund.is_active == True)
    
    funds = query.order_by(SinkingFund.created_at.desc()).all()
    return funds

@router.get("/summary", response_model=SinkingFundSummary)
def get_sinking_funds_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary of all sinking funds"""
    funds = db.query(SinkingFund).filter(
        SinkingFund.user_id == current_user.id,
        SinkingFund.is_active == True
    ).all()
    
    total_target = sum(f.target_cents for f in funds)
    total_saved = sum(f.current_balance_cents for f in funds)
    total_remaining = total_target - total_saved
    overall_progress = (total_saved / total_target * 100) if total_target > 0 else 0
    
    return {
        "total_funds": len(funds),
        "total_target_cents": total_target,
        "total_saved_cents": total_saved,
        "total_remaining_cents": total_remaining,
        "overall_progress_percentage": round(overall_progress, 2),
        "active_funds": len(funds)
    }

@router.get("/{fund_id}", response_model=SinkingFundWithContributions)
def get_sinking_fund(
    fund_id: int,
    include_contributions: bool = Query(True, description="Include contribution history"),
    contribution_limit: int = Query(50, le=500, description="Limit contributions returned"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific sinking fund with optional contribution history"""
    query = db.query(SinkingFund).filter(
        SinkingFund.id == fund_id,
        SinkingFund.user_id == current_user.id
    )
    
    if include_contributions:
        query = query.options(selectinload(SinkingFund.contributions))
    
    fund = query.first()
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sinking fund not found"
        )
    
    # Limit contributions if requested
    if include_contributions and contribution_limit:
        fund.contributions = sorted(
            fund.contributions,
            key=lambda c: c.contribution_date,
            reverse=True
        )[:contribution_limit]
    
    return fund

@router.get("/{fund_id}/progress", response_model=SinkingFundProgress)
def get_fund_progress(
    fund_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed progress information for a sinking fund"""
    fund = db.query(SinkingFund).filter(
        SinkingFund.id == fund_id,
        SinkingFund.user_id == current_user.id
    ).first()
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sinking fund not found"
        )
    
    # Calculate total contributed and contribution count
    contribution_stats = db.query(
        func.sum(SinkingFundContribution.amount_cents).label('total'),
        func.count(SinkingFundContribution.id).label('count')
    ).filter(
        SinkingFundContribution.fund_id == fund_id
    ).first()
    
    total_contributed = contribution_stats.total or 0
    contribution_count = contribution_stats.count or 0
    
    progress = calculate_fund_progress(fund, total_contributed, contribution_count)
    
    return {"fund": fund, **progress}

@router.put("/{fund_id}", response_model=SinkingFundSchema)
def update_sinking_fund(
    fund_id: int,
    fund_data: SinkingFundUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a sinking fund"""
    fund = db.query(SinkingFund).filter(
        SinkingFund.id == fund_id,
        SinkingFund.user_id == current_user.id
    ).first()
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sinking fund not found"
        )
    
    # Update fields
    update_data = fund_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fund, field, value)
    
    db.commit()
    db.refresh(fund)
    
    return fund

@router.delete("/{fund_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sinking_fund(
    fund_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a sinking fund"""
    fund = db.query(SinkingFund).filter(
        SinkingFund.id == fund_id,
        SinkingFund.user_id == current_user.id
    ).first()
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sinking fund not found"
        )
    
    db.delete(fund)
    db.commit()
    
    return None

# Contribution endpoints

@router.post("/{fund_id}/contributions", response_model=ContributionSchema, status_code=status.HTTP_201_CREATED)
def add_contribution(
    fund_id: int,
    contribution_data: SinkingFundContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a contribution (deposit or withdrawal) to a sinking fund"""
    fund = db.query(SinkingFund).filter(
        SinkingFund.id == fund_id,
        SinkingFund.user_id == current_user.id
    ).first()
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sinking fund not found"
        )
    
    # Create contribution
    contribution = SinkingFundContribution(
        fund_id=fund_id,
        amount_cents=contribution_data.amount_cents,
        contribution_date=contribution_data.contribution_date or datetime.utcnow(),
        notes=contribution_data.notes
    )
    
    # Update fund balance
    fund.current_balance_cents += contribution_data.amount_cents
    
    # Ensure balance doesn't go negative
    if fund.current_balance_cents < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Withdrawal would result in negative balance"
        )
    
    db.add(contribution)
    db.commit()
    db.refresh(contribution)
    
    return contribution

@router.get("/{fund_id}/contributions", response_model=List[ContributionSchema])
def list_contributions(
    fund_id: int,
    limit: int = Query(50, le=500, description="Number of contributions to return"),
    offset: int = Query(0, ge=0, description="Number of contributions to skip"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List contributions for a sinking fund"""
    # Verify fund ownership
    fund = db.query(SinkingFund).filter(
        SinkingFund.id == fund_id,
        SinkingFund.user_id == current_user.id
    ).first()
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sinking fund not found"
        )
    
    contributions = db.query(SinkingFundContribution).filter(
        SinkingFundContribution.fund_id == fund_id
    ).order_by(
        desc(SinkingFundContribution.contribution_date)
    ).offset(offset).limit(limit).all()
    
    return contributions

@router.delete("/{fund_id}/contributions/{contribution_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contribution(
    fund_id: int,
    contribution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a contribution and adjust fund balance"""
    # Verify fund ownership
    fund = db.query(SinkingFund).filter(
        SinkingFund.id == fund_id,
        SinkingFund.user_id == current_user.id
    ).first()
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sinking fund not found"
        )
    
    contribution = db.query(SinkingFundContribution).filter(
        SinkingFundContribution.id == contribution_id,
        SinkingFundContribution.fund_id == fund_id
    ).first()
    
    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found"
        )
    
    # Adjust fund balance
    fund.current_balance_cents -= contribution.amount_cents
    
    db.delete(contribution)
    db.commit()
    
    return None
