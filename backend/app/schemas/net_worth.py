from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class AssetType(str, Enum):
    CASH = "cash"
    CHECKING = "checking"
    SAVINGS = "savings"
    INVESTMENT = "investment"
    RETIREMENT = "retirement"
    REAL_ESTATE = "real_estate"
    VEHICLE = "vehicle"
    CRYPTO = "crypto"
    OTHER = "other"


class LiabilityType(str, Enum):
    CREDIT_CARD = "credit_card"
    STUDENT_LOAN = "student_loan"
    MORTGAGE = "mortgage"
    AUTO_LOAN = "auto_loan"
    PERSONAL_LOAN = "personal_loan"
    MEDICAL_DEBT = "medical_debt"
    OTHER = "other"


# Asset Schemas
class AssetBase(BaseModel):
    name: str
    asset_type: AssetType
    current_value_cents: int
    institution: Optional[str] = None
    account_number_last4: Optional[str] = None
    notes: Optional[str] = None
    is_liquid: bool = True
    is_active: bool = True


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[AssetType] = None
    current_value_cents: Optional[int] = None
    institution: Optional[str] = None
    account_number_last4: Optional[str] = None
    notes: Optional[str] = None
    is_liquid: Optional[bool] = None
    is_active: Optional[bool] = None


class Asset(BaseModel):
    id: int
    user_id: int
    name: str
    asset_type: AssetType
    current_value: float  # Return dollars, not cents
    institution: Optional[str] = None
    account_number_last4: Optional[str] = None
    notes: Optional[str] = None
    is_liquid: bool = True
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, obj):
        """Convert cents to dollars when loading from database"""
        return cls(
            id=obj.id,
            user_id=obj.user_id,
            name=obj.name,
            asset_type=obj.asset_type,
            current_value=obj.current_value_cents / 100.0,
            institution=obj.institution,
            account_number_last4=obj.account_number_last4,
            notes=obj.notes,
            is_liquid=obj.is_liquid,
            is_active=obj.is_active,
            created_at=obj.created_at,
            updated_at=obj.updated_at
        )

    class Config:
        from_attributes = True


# Liability Schemas
class LiabilityBase(BaseModel):
    name: str
    liability_type: LiabilityType
    current_balance_cents: int
    interest_rate: float = 0.0
    minimum_payment_cents: int = 0
    institution: Optional[str] = None
    account_number_last4: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True


class LiabilityCreate(LiabilityBase):
    pass


class LiabilityUpdate(BaseModel):
    name: Optional[str] = None
    liability_type: Optional[LiabilityType] = None
    current_balance_cents: Optional[int] = None
    interest_rate: Optional[float] = None
    minimum_payment_cents: Optional[int] = None
    institution: Optional[str] = None
    account_number_last4: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class Liability(BaseModel):
    id: int
    user_id: int
    name: str
    liability_type: LiabilityType
    current_balance: float  # Return dollars, not cents
    interest_rate: float = 0.0
    minimum_payment: float  # Return dollars, not cents
    institution: Optional[str] = None
    account_number_last4: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, obj):
        """Convert cents to dollars when loading from database"""
        return cls(
            id=obj.id,
            user_id=obj.user_id,
            name=obj.name,
            liability_type=obj.liability_type,
            current_balance=obj.current_balance_cents / 100.0,
            interest_rate=obj.interest_rate,
            minimum_payment=obj.minimum_payment_cents / 100.0,
            institution=obj.institution,
            account_number_last4=obj.account_number_last4,
            notes=obj.notes,
            is_active=obj.is_active,
            created_at=obj.created_at,
            updated_at=obj.updated_at
        )

    class Config:
        from_attributes = True


# Snapshot Schemas
class AssetSnapshotCreate(BaseModel):
    asset_id: int
    value: float
    snapshot_date: date
    notes: Optional[str] = None


class AssetSnapshot(BaseModel):
    id: int
    asset_id: int
    value: float
    snapshot_date: date
    notes: Optional[str]
    created_at: datetime

    @classmethod
    def from_orm(cls, obj):
        """Convert cents to dollars when loading from database"""
        return cls(
            id=obj.id,
            asset_id=obj.asset_id,
            value=obj.value_cents / 100.0,
            snapshot_date=obj.snapshot_date,
            notes=obj.notes,
            created_at=obj.created_at
        )

    class Config:
        from_attributes = True


class LiabilitySnapshotCreate(BaseModel):
    liability_id: int
    balance: float
    snapshot_date: date
    notes: Optional[str] = None


class LiabilitySnapshot(BaseModel):
    id: int
    liability_id: int
    balance: float
    snapshot_date: date
    notes: Optional[str]
    created_at: datetime

    @classmethod
    def from_orm(cls, obj):
        """Convert cents to dollars when loading from database"""
        return cls(
            id=obj.id,
            liability_id=obj.liability_id,
            balance=obj.balance_cents / 100.0,
            snapshot_date=obj.snapshot_date,
            notes=obj.notes,
            created_at=obj.created_at
        )

    class Config:
        from_attributes = True


class NetWorthSnapshot(BaseModel):
    id: int
    user_id: int
    snapshot_date: date
    total_assets: float
    total_liabilities: float
    net_worth: float
    liquid_assets: float
    notes: Optional[str]
    created_at: datetime

    @classmethod
    def from_orm(cls, obj):
        """Convert cents to dollars when loading from database"""
        return cls(
            id=obj.id,
            user_id=obj.user_id,
            snapshot_date=obj.snapshot_date,
            total_assets=obj.total_assets_cents / 100.0,
            total_liabilities=obj.total_liabilities_cents / 100.0,
            net_worth=obj.net_worth_cents / 100.0,
            liquid_assets=(obj.liquid_assets_cents or 0) / 100.0,
            notes=obj.notes,
            created_at=obj.created_at
        )

    class Config:
        from_attributes = True


# Summary and Projection Schemas
class NetWorthSummary(BaseModel):
    current_net_worth: float
    total_assets: float
    total_liabilities: float
    liquid_assets: float
    asset_count: int
    liability_count: int
    change_30_days: Optional[float] = None
    change_90_days: Optional[float] = None
    change_1_year: Optional[float] = None
    change_30_days_pct: Optional[float] = None
    change_90_days_pct: Optional[float] = None
    change_1_year_pct: Optional[float] = None


class NetWorthProjection(BaseModel):
    projection_date: date
    projected_net_worth: float
    projected_assets: float
    projected_liabilities: float
    assumptions: dict


class NetWorthTrend(BaseModel):
    date: date
    net_worth: float
    assets: float
    liabilities: float


class AssetBreakdown(BaseModel):
    asset_type: str
    total_value: float
    percentage: float
    count: int


class LiabilityBreakdown(BaseModel):
    liability_type: str
    total_balance: float
    percentage: float
    count: int
    total_interest_rate: float
    total_minimum_payment: float


class NetWorthAlert(BaseModel):
    alert_type: str
    severity: str  # info, warning, critical
    message: str
    change_amount: Optional[float] = None
    change_percentage: Optional[float] = None
