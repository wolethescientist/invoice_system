from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.budget import Budget
from app.services.category_suggestion import CategorySuggestionService
from app.schemas.category_suggestion import (
    SuggestionRequest,
    SuggestionResponse,
    SuggestionFeedback,
    SuggestionStats
)

router = APIRouter(prefix="/api/category-suggestions", tags=["category-suggestions"])


@router.post("/suggest", response_model=SuggestionResponse)
def get_category_suggestions(
    request: SuggestionRequest,
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get category suggestions based on transaction notes and history"""
    # Verify budget belongs to user
    budget = db.query(Budget).filter(
        Budget.id == request.budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    service = CategorySuggestionService(db)
    suggestions = service.get_suggestions(
        user_id=current_user.id,
        budget_id=request.budget_id,
        notes=request.notes,
        amount_cents=request.amount_cents,
        limit=limit
    )
    
    return {"suggestions": suggestions}


@router.post("/feedback", status_code=status.HTTP_204_NO_CONTENT)
def submit_suggestion_feedback(
    feedback: SuggestionFeedback,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Log whether a suggestion was accepted or rejected"""
    service = CategorySuggestionService(db)
    
    service.log_suggestion_feedback(
        user_id=current_user.id,
        suggested_category_id=feedback.suggested_category_id,
        actual_category_id=feedback.actual_category_id,
        pattern_text=feedback.pattern_text,
        transaction_id=feedback.transaction_id
    )
    
    # Learn from the actual category chosen
    service.learn_from_transaction(
        user_id=current_user.id,
        category_id=feedback.actual_category_id,
        notes=feedback.pattern_text,
        transaction_id=feedback.transaction_id
    )
    
    return None


@router.get("/stats", response_model=SuggestionStats)
def get_suggestion_statistics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get statistics about suggestion accuracy"""
    service = CategorySuggestionService(db)
    stats = service.get_suggestion_stats(current_user.id, days)
    return stats
