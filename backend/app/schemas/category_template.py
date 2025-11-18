from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CategoryTemplateBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category_type: str = Field(default="expense", pattern="^(income|expense|savings)$")
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    default_allocation_cents: int = Field(ge=0, default=0)
    order: int = Field(ge=0, default=0)

class CategoryTemplateCreate(CategoryTemplateBase):
    pass

class CategoryTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category_type: Optional[str] = Field(None, pattern="^(income|expense|savings)$")
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    default_allocation_cents: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    order: Optional[int] = Field(None, ge=0)

class CategoryTemplate(CategoryTemplateBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CategoryTemplateList(BaseModel):
    templates: List[CategoryTemplate]
    total: int