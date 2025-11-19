from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class AssetType(str, enum.Enum):
    CASH = "cash"
    CHECKING = "checking"
    SAVINGS = "savings"
    INVESTMENT = "investment"
    RETIREMENT = "retirement"
    REAL_ESTATE = "real_estate"
    VEHICLE = "vehicle"
    CRYPTO = "crypto"
    OTHER = "other"


class LiabilityType(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    STUDENT_LOAN = "student_loan"
    MORTGAGE = "mortgage"
    AUTO_LOAN = "auto_loan"
    PERSONAL_LOAN = "personal_loan"
    MEDICAL_DEBT = "medical_debt"
    OTHER = "other"


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    asset_type = Column(SQLEnum(AssetType), nullable=False)
    current_value = Column(Float, nullable=False)
    institution = Column(String)
    account_number_last4 = Column(String(4))
    notes = Column(String)
    is_liquid = Column(Integer, default=1)  # 0 or 1 (boolean)
    is_active = Column(Integer, default=1)  # 0 or 1 (boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    snapshots = relationship("AssetSnapshot", back_populates="asset", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_asset_user_active', 'user_id', 'is_active'),
    )


class Liability(Base):
    __tablename__ = "liabilities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    liability_type = Column(SQLEnum(LiabilityType), nullable=False)
    current_balance = Column(Float, nullable=False)
    interest_rate = Column(Float, default=0.0)
    minimum_payment = Column(Float, default=0.0)
    institution = Column(String)
    account_number_last4 = Column(String(4))
    notes = Column(String)
    is_active = Column(Integer, default=1)  # 0 or 1 (boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    snapshots = relationship("LiabilitySnapshot", back_populates="liability", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_liability_user_active', 'user_id', 'is_active'),
    )


class AssetSnapshot(Base):
    __tablename__ = "asset_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    value = Column(Float, nullable=False)
    snapshot_date = Column(Date, nullable=False)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    asset = relationship("Asset", back_populates="snapshots")

    __table_args__ = (
        Index('idx_asset_snapshot_date', 'asset_id', 'snapshot_date'),
    )


class LiabilitySnapshot(Base):
    __tablename__ = "liability_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    liability_id = Column(Integer, ForeignKey("liabilities.id"), nullable=False)
    balance = Column(Float, nullable=False)
    snapshot_date = Column(Date, nullable=False)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    liability = relationship("Liability", back_populates="snapshots")

    __table_args__ = (
        Index('idx_liability_snapshot_date', 'liability_id', 'snapshot_date'),
    )


class NetWorthSnapshot(Base):
    __tablename__ = "net_worth_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    total_assets = Column(Float, nullable=False)
    total_liabilities = Column(Float, nullable=False)
    net_worth = Column(Float, nullable=False)
    liquid_assets = Column(Float, default=0.0)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('idx_networth_user_date', 'user_id', 'snapshot_date'),
    )
