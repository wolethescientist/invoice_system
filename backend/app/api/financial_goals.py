from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from dateutil.relativedelta import relativedelta

from ..core.database import get_db
from ..api.deps import get_current_user
from ..models.user import User
from ..models.financial_goal import FinancialGoal, GoalContribution, GoalMilestone, GoalStatus
from ..schemas.financial_goal import (
    FinancialGoalCreate,
    FinancialGoalUpdate,
    FinancialGoal as FinancialGoalSchema,
    GoalContributionCreate,
    GoalContribution as GoalContributionSchema,
    GoalMilestoneCreate,
    GoalMilestoneUpdate,
    GoalMilestone as GoalMilestoneSchema,
    GoalProjection,
    GoalSummary
)

router = APIRouter(prefix="/api/financial-goals", tags=["financial-goals"])


def calculate_projection(goal: FinancialGoal) -> GoalProjection:
    """Calculate projection for goal completion"""
    # Convert cents to dollars for calculations
    target_amount = goal.target_amount_cents / 100
    current_amount = goal.current_amount_cents / 100
    monthly_contribution = goal.monthly_contribution_cents / 100
    
    remaining_amount = target_amount - current_amount
    
    if monthly_contribution <= 0:
        # No contributions, can't project
        months_remaining = 999
        projected_date = goal.target_date
        on_track = False
        required_monthly = remaining_amount
    else:
        months_remaining = int(remaining_amount / monthly_contribution) + 1
        projected_date = date.today() + relativedelta(months=months_remaining)
        
        # Calculate required monthly contribution to meet target date
        months_to_target = (goal.target_date.year - date.today().year) * 12 + \
                          (goal.target_date.month - date.today().month)
        
        if months_to_target <= 0:
            required_monthly = remaining_amount
            on_track = current_amount >= target_amount
        else:
            required_monthly = remaining_amount / months_to_target
            on_track = monthly_contribution >= required_monthly
    
    projected_final = current_amount + (monthly_contribution * months_remaining)
    shortfall = max(0, target_amount - projected_final)
    
    return GoalProjection(
        goal_id=goal.id,
        projected_completion_date=projected_date,
        months_remaining=months_remaining,
        on_track=on_track,
        required_monthly_contribution=round(required_monthly, 2),
        projected_final_amount=round(projected_final, 2),
        shortfall=round(shortfall, 2)
    )


@router.post("/", response_model=FinancialGoalSchema)
def create_goal(
    goal: FinancialGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new financial goal"""
    # Convert dollar amounts to cents for database storage
    goal_data = goal.model_dump(exclude={'target_amount', 'monthly_contribution'})
    goal_data['target_amount_cents'] = int(goal.target_amount * 100)
    goal_data['monthly_contribution_cents'] = int(goal.monthly_contribution * 100)
    
    db_goal = FinancialGoal(
        user_id=current_user.id,
        **goal_data
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return FinancialGoalSchema.from_orm(db_goal)


@router.get("/", response_model=List[FinancialGoalSchema])
def get_goals(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all financial goals for the current user"""
    query = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id)
    
    if status:
        query = query.filter(FinancialGoal.status == status)
    
    goals = query.order_by(FinancialGoal.priority, FinancialGoal.target_date).all()
    return [FinancialGoalSchema.from_orm(goal) for goal in goals]


@router.get("/summary", response_model=GoalSummary)
def get_goals_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary statistics for all goals"""
    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id).all()
    
    total_goals = len(goals)
    active_goals = len([g for g in goals if g.status == GoalStatus.ACTIVE])
    completed_goals = len([g for g in goals if g.status == GoalStatus.COMPLETED])
    total_target = sum(g.target_amount_cents / 100 for g in goals)
    total_current = sum(g.current_amount_cents / 100 for g in goals)
    total_monthly = sum(g.monthly_contribution_cents / 100 for g in goals if g.status == GoalStatus.ACTIVE)
    
    progress_pct = (total_current / total_target * 100) if total_target > 0 else 0
    
    return GoalSummary(
        total_goals=total_goals,
        active_goals=active_goals,
        completed_goals=completed_goals,
        total_target_amount=round(total_target, 2),
        total_current_amount=round(total_current, 2),
        total_monthly_contributions=round(total_monthly, 2),
        overall_progress_percentage=round(progress_pct, 2)
    )


@router.get("/{goal_id}", response_model=FinancialGoalSchema)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific financial goal"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return FinancialGoalSchema.from_orm(goal)


@router.get("/{goal_id}/projection", response_model=GoalProjection)
def get_goal_projection(
    goal_id: int,
    monthly_contribution: Optional[float] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get projection for a specific goal with optional contribution override"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Temporarily override monthly contribution for projection
    if monthly_contribution is not None:
        original_contribution = goal.monthly_contribution_cents
        goal.monthly_contribution_cents = int(monthly_contribution * 100)
        projection = calculate_projection(goal)
        goal.monthly_contribution_cents = original_contribution
    else:
        projection = calculate_projection(goal)
    
    return projection


@router.put("/{goal_id}", response_model=FinancialGoalSchema)
def update_goal(
    goal_id: int,
    goal_update: FinancialGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a financial goal"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Convert dollar amounts to cents
    update_data = goal_update.to_cents_dict()
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    goal.updated_at = datetime.utcnow()
    
    # Auto-complete if target reached
    if goal.current_amount_cents >= goal.target_amount_cents and goal.status == GoalStatus.ACTIVE:
        goal.status = GoalStatus.COMPLETED
    
    db.commit()
    db.refresh(goal)
    return FinancialGoalSchema.from_orm(goal)


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a financial goal"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}


# Contribution endpoints
@router.post("/{goal_id}/contributions", response_model=GoalContributionSchema)
def add_contribution(
    goal_id: int,
    contribution: GoalContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a contribution to a goal"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db_contribution = GoalContribution(
        goal_id=goal_id,
        **contribution.model_dump()
    )
    
    # Update goal current amount
    goal.current_amount += contribution.amount
    goal.updated_at = datetime.utcnow()
    
    # Auto-complete if target reached
    if goal.current_amount >= goal.target_amount and goal.status == GoalStatus.ACTIVE:
        goal.status = GoalStatus.COMPLETED
    
    db.add(db_contribution)
    db.commit()
    db.refresh(db_contribution)
    return db_contribution


@router.get("/{goal_id}/contributions", response_model=List[GoalContributionSchema])
def get_contributions(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all contributions for a goal"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return goal.contributions


# Milestone endpoints
@router.post("/{goal_id}/milestones", response_model=GoalMilestoneSchema)
def create_milestone(
    goal_id: int,
    milestone: GoalMilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a milestone for a goal"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db_milestone = GoalMilestone(
        goal_id=goal_id,
        **milestone.model_dump()
    )
    
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone


@router.get("/{goal_id}/milestones", response_model=List[GoalMilestoneSchema])
def get_milestones(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all milestones for a goal"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return goal.milestones


@router.put("/{goal_id}/milestones/{milestone_id}", response_model=GoalMilestoneSchema)
def update_milestone(
    goal_id: int,
    milestone_id: int,
    milestone_update: GoalMilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a milestone"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    milestone = db.query(GoalMilestone).filter(
        GoalMilestone.id == milestone_id,
        GoalMilestone.goal_id == goal_id
    ).first()
    
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    update_data = milestone_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "achieved" and value:
            milestone.achieved = 1
            milestone.achieved_date = date.today()
        elif field == "achieved" and not value:
            milestone.achieved = 0
            milestone.achieved_date = None
        else:
            setattr(milestone, field, value)
    
    db.commit()
    db.refresh(milestone)
    return milestone


@router.delete("/{goal_id}/milestones/{milestone_id}")
def delete_milestone(
    goal_id: int,
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a milestone"""
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    milestone = db.query(GoalMilestone).filter(
        GoalMilestone.id == milestone_id,
        GoalMilestone.goal_id == goal_id
    ).first()
    
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    db.delete(milestone)
    db.commit()
    return {"message": "Milestone deleted successfully"}
