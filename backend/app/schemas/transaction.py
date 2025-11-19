from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, date

class TransactionSplitBase(BaseModel):
    category_id: int
    amount_cents: int = Field(gt=0)
    notes: Optional[str] = None

class TransactionSplitCreate(TransactionSplitBase):
    pass

class TransactionSplit(TransactionSplitBase):
    id: int
    transaction_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class TransactionSplitWithCategory(TransactionSplit):
    category_name: str
    
    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    budget_id: int
    category_id: Optional[int] = None  # Optional for split transactions
    amount_cents: int = Field(gt=0)
    date: date
    notes: Optional[str] = None
    is_split: bool = False

class TransactionCreate(TransactionBase):
    splits: Optional[List[TransactionSplitCreate]] = None
    
    @field_validator('splits')
    @classmethod
    def validate_splits(cls, v, info):
        if v is not None and len(v) > 0:
            # If splits are provided, is_split must be True
            if not info.data.get('is_split'):
                raise ValueError('is_split must be True when splits are provided')
            # category_id should be None for split transactions
            if info.data.get('category_id') is not None:
                raise ValueError('category_id must be None for split transactions')
            # Validate sum of splits equals total amount
            total_splits = sum(split.amount_cents for split in v)
            if total_splits != info.data.get('amount_cents'):
                raise ValueError(f'Sum of splits ({total_splits}) must equal transaction amount ({info.data.get("amount_cents")})')
        elif info.data.get('is_split'):
            raise ValueError('splits must be provided when is_split is True')
        return v

class TransactionUpdate(BaseModel):
    category_id: Optional[int] = None
    amount_cents: Optional[int] = Field(None, gt=0)
    date: Optional[date] = None
    notes: Optional[str] = None

class Transaction(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TransactionWithCategory(Transaction):
    category_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class TransactionWithSplits(Transaction):
    splits: List[TransactionSplitWithCategory] = []
    
    class Config:
        from_attributes = True
