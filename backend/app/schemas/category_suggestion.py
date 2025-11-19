from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CategorySuggestion(BaseModel):
    category_id: int
    category_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    reason: str  # exact_match, keyword_match, similar_amount, frequently_used
    usage_count: int = 0


class SuggestionRequest(BaseModel):
    budget_id: int
    notes: str
    amount_cents: Optional[int] = None


class SuggestionResponse(BaseModel):
    suggestions: List[CategorySuggestion]


class SuggestionFeedback(BaseModel):
    transaction_id: Optional[int] = None
    suggested_category_id: int
    actual_category_id: int
    pattern_text: str


class SuggestionStats(BaseModel):
    total_suggestions: int
    accepted: int
    rejected: int
    accuracy: float
