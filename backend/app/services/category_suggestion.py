from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import re
from collections import defaultdict

from app.models.transaction import Transaction, TransactionSplit
from app.models.budget import BudgetCategory
from app.models.category_suggestion import CategoryPattern, CategorySuggestionLog


class CategorySuggestionService:
    """Service for suggesting budget categories based on transaction history"""
    
    def __init__(self, db: Session):
        self.db = db
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize text for pattern matching"""
        if not text:
            return ""
        # Convert to lowercase, remove extra spaces, remove special chars
        text = text.lower().strip()
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text
    
    @staticmethod
    def extract_keywords(text: str, min_length: int = 3) -> List[str]:
        """Extract meaningful keywords from text"""
        normalized = CategorySuggestionService.normalize_text(text)
        words = normalized.split()
        # Filter out common words and short words
        stop_words = {'the', 'and', 'for', 'with', 'from', 'this', 'that', 'was', 'are'}
        keywords = [w for w in words if len(w) >= min_length and w not in stop_words]
        return keywords
    
    def learn_from_transaction(
        self, 
        user_id: int, 
        category_id: int, 
        notes: str,
        transaction_id: Optional[int] = None
    ) -> None:
        """Learn category patterns from a transaction"""
        if not notes or not notes.strip():
            return
        
        pattern_text = self.normalize_text(notes)
        if not pattern_text:
            return
        
        # Check if pattern already exists
        existing_pattern = self.db.query(CategoryPattern).filter(
            CategoryPattern.user_id == user_id,
            CategoryPattern.pattern_text == pattern_text
        ).first()
        
        if existing_pattern:
            # Update existing pattern
            existing_pattern.usage_count += 1
            existing_pattern.last_used = datetime.utcnow()
            # If category changed, update it and reset confidence
            if existing_pattern.category_id != category_id:
                existing_pattern.category_id = category_id
                existing_pattern.confidence_score = 0.5
            else:
                # Increase confidence (max 1.0)
                existing_pattern.confidence_score = min(1.0, existing_pattern.confidence_score + 0.1)
        else:
            # Create new pattern
            new_pattern = CategoryPattern(
                user_id=user_id,
                category_id=category_id,
                pattern_text=pattern_text,
                confidence_score=0.7,  # Start with moderate confidence
                usage_count=1,
                last_used=datetime.utcnow()
            )
            self.db.add(new_pattern)
        
        self.db.commit()
    
    def get_suggestions(
        self, 
        user_id: int, 
        budget_id: int,
        notes: str,
        amount_cents: Optional[int] = None,
        limit: int = 3
    ) -> List[Dict]:
        """Get category suggestions based on notes and history"""
        if not notes or not notes.strip():
            return self._get_popular_categories(user_id, budget_id, limit)
        
        pattern_text = self.normalize_text(notes)
        keywords = self.extract_keywords(notes)
        
        suggestions = []
        
        # 1. Exact pattern match
        exact_matches = self.db.query(
            CategoryPattern, BudgetCategory
        ).join(
            BudgetCategory, CategoryPattern.category_id == BudgetCategory.id
        ).filter(
            CategoryPattern.user_id == user_id,
            CategoryPattern.pattern_text == pattern_text,
            BudgetCategory.budget_id == budget_id,
            BudgetCategory.is_active == True
        ).order_by(
            desc(CategoryPattern.confidence_score),
            desc(CategoryPattern.usage_count)
        ).limit(limit).all()
        
        for pattern, category in exact_matches:
            suggestions.append({
                "category_id": category.id,
                "category_name": category.name,
                "confidence": pattern.confidence_score,
                "reason": "exact_match",
                "usage_count": pattern.usage_count
            })
        
        # 2. Keyword-based matching if we don't have enough exact matches
        if len(suggestions) < limit and keywords:
            keyword_matches = self._get_keyword_matches(
                user_id, budget_id, keywords, limit - len(suggestions)
            )
            suggestions.extend(keyword_matches)
        
        # 3. Amount-based suggestions if still not enough
        if len(suggestions) < limit and amount_cents:
            amount_matches = self._get_amount_based_suggestions(
                user_id, budget_id, amount_cents, limit - len(suggestions)
            )
            suggestions.extend(amount_matches)
        
        # 4. Fall back to popular categories
        if len(suggestions) < limit:
            popular = self._get_popular_categories(
                user_id, budget_id, limit - len(suggestions)
            )
            suggestions.extend(popular)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_suggestions = []
        for s in suggestions:
            if s["category_id"] not in seen:
                seen.add(s["category_id"])
                unique_suggestions.append(s)
        
        return unique_suggestions[:limit]
    
    def _get_keyword_matches(
        self, 
        user_id: int, 
        budget_id: int, 
        keywords: List[str], 
        limit: int
    ) -> List[Dict]:
        """Find categories based on keyword matching"""
        if not keywords:
            return []
        
        # Score categories based on keyword matches
        category_scores = defaultdict(lambda: {"score": 0, "matches": 0, "category": None})
        
        for keyword in keywords:
            # Find patterns containing this keyword
            patterns = self.db.query(
                CategoryPattern, BudgetCategory
            ).join(
                BudgetCategory, CategoryPattern.category_id == BudgetCategory.id
            ).filter(
                CategoryPattern.user_id == user_id,
                CategoryPattern.pattern_text.like(f"%{keyword}%"),
                BudgetCategory.budget_id == budget_id,
                BudgetCategory.is_active == True
            ).all()
            
            for pattern, category in patterns:
                cat_id = category.id
                if category_scores[cat_id]["category"] is None:
                    category_scores[cat_id]["category"] = category
                
                # Score based on confidence and usage
                score = pattern.confidence_score * (1 + min(pattern.usage_count / 10, 1))
                category_scores[cat_id]["score"] += score
                category_scores[cat_id]["matches"] += 1
        
        # Sort by score and convert to result format
        sorted_categories = sorted(
            category_scores.items(),
            key=lambda x: (x[1]["score"], x[1]["matches"]),
            reverse=True
        )
        
        results = []
        for cat_id, data in sorted_categories[:limit]:
            if data["category"]:
                results.append({
                    "category_id": cat_id,
                    "category_name": data["category"].name,
                    "confidence": min(data["score"] / len(keywords), 1.0),
                    "reason": "keyword_match",
                    "usage_count": data["matches"]
                })
        
        return results
    
    def _get_amount_based_suggestions(
        self, 
        user_id: int, 
        budget_id: int, 
        amount_cents: int, 
        limit: int
    ) -> List[Dict]:
        """Suggest categories based on similar transaction amounts"""
        # Find transactions with similar amounts (within 20%)
        margin = amount_cents * 0.2
        min_amount = amount_cents - margin
        max_amount = amount_cents + margin
        
        # Get categories from similar transactions
        similar_transactions = self.db.query(
            Transaction.category_id,
            BudgetCategory.name,
            func.count(Transaction.id).label('count')
        ).join(
            BudgetCategory, Transaction.category_id == BudgetCategory.id
        ).filter(
            Transaction.user_id == user_id,
            Transaction.amount_cents.between(min_amount, max_amount),
            Transaction.is_split == False,
            BudgetCategory.budget_id == budget_id,
            BudgetCategory.is_active == True
        ).group_by(
            Transaction.category_id, BudgetCategory.name
        ).order_by(
            desc('count')
        ).limit(limit).all()
        
        results = []
        for category_id, category_name, count in similar_transactions:
            results.append({
                "category_id": category_id,
                "category_name": category_name,
                "confidence": 0.5,  # Lower confidence for amount-based
                "reason": "similar_amount",
                "usage_count": count
            })
        
        return results
    
    def _get_popular_categories(
        self, 
        user_id: int, 
        budget_id: int, 
        limit: int
    ) -> List[Dict]:
        """Get most frequently used categories as fallback"""
        # Get categories with most transactions
        popular = self.db.query(
            BudgetCategory.id,
            BudgetCategory.name,
            func.count(Transaction.id).label('count')
        ).outerjoin(
            Transaction, and_(
                Transaction.category_id == BudgetCategory.id,
                Transaction.user_id == user_id
            )
        ).filter(
            BudgetCategory.budget_id == budget_id,
            BudgetCategory.is_active == True
        ).group_by(
            BudgetCategory.id, BudgetCategory.name
        ).order_by(
            desc('count')
        ).limit(limit).all()
        
        results = []
        for category_id, category_name, count in popular:
            results.append({
                "category_id": category_id,
                "category_name": category_name,
                "confidence": 0.3,  # Low confidence for popular fallback
                "reason": "frequently_used",
                "usage_count": count
            })
        
        return results
    
    def log_suggestion_feedback(
        self,
        user_id: int,
        suggested_category_id: int,
        actual_category_id: int,
        pattern_text: str,
        transaction_id: Optional[int] = None
    ) -> None:
        """Log whether a suggestion was accepted or rejected"""
        was_accepted = 1 if suggested_category_id == actual_category_id else 0
        
        log_entry = CategorySuggestionLog(
            user_id=user_id,
            transaction_id=transaction_id,
            suggested_category_id=suggested_category_id,
            actual_category_id=actual_category_id,
            pattern_text=self.normalize_text(pattern_text),
            was_accepted=was_accepted
        )
        self.db.add(log_entry)
        
        # If rejected, decrease confidence in the wrong pattern
        if not was_accepted:
            wrong_pattern = self.db.query(CategoryPattern).filter(
                CategoryPattern.user_id == user_id,
                CategoryPattern.category_id == suggested_category_id,
                CategoryPattern.pattern_text == self.normalize_text(pattern_text)
            ).first()
            
            if wrong_pattern:
                wrong_pattern.confidence_score = max(0.1, wrong_pattern.confidence_score - 0.2)
        
        self.db.commit()
    
    def get_suggestion_stats(self, user_id: int, days: int = 30) -> Dict:
        """Get statistics about suggestion accuracy"""
        since_date = datetime.utcnow() - timedelta(days=days)
        
        logs = self.db.query(CategorySuggestionLog).filter(
            CategorySuggestionLog.user_id == user_id,
            CategorySuggestionLog.created_at >= since_date
        ).all()
        
        if not logs:
            return {
                "total_suggestions": 0,
                "accepted": 0,
                "rejected": 0,
                "accuracy": 0.0
            }
        
        total = len(logs)
        accepted = sum(1 for log in logs if log.was_accepted)
        rejected = total - accepted
        accuracy = (accepted / total) * 100 if total > 0 else 0
        
        return {
            "total_suggestions": total,
            "accepted": accepted,
            "rejected": rejected,
            "accuracy": round(accuracy, 2)
        }
