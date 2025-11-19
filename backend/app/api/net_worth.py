from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta

from ..core.database import get_db
from ..api.deps import get_current_user
from ..models.user import User
from ..models.net_worth import Asset, Liability, AssetSnapshot, LiabilitySnapshot, NetWorthSnapshot
from ..models.transaction import Transaction
from ..models.financial_goal import FinancialGoal, GoalStatus
from ..schemas.net_worth import (
    AssetCreate, AssetUpdate, Asset as AssetSchema,
    LiabilityCreate, LiabilityUpdate, Liability as LiabilitySchema,
    AssetSnapshotCreate, AssetSnapshot as AssetSnapshotSchema,
    LiabilitySnapshotCreate, LiabilitySnapshot as LiabilitySnapshotSchema,
    NetWorthSnapshot as NetWorthSnapshotSchema,
    NetWorthSummary, NetWorthProjection, NetWorthTrend,
    AssetBreakdown, LiabilityBreakdown, NetWorthAlert
)

router = APIRouter(prefix="/api/net-worth", tags=["net-worth"])


def calculate_net_worth(user_id: int, db: Session) -> dict:
    """Calculate current net worth for a user"""
    assets = db.query(Asset).filter(
        Asset.user_id == user_id,
        Asset.is_active == 1
    ).all()
    
    liabilities = db.query(Liability).filter(
        Liability.user_id == user_id,
        Liability.is_active == 1
    ).all()
    
    total_assets = sum(a.current_value for a in assets)
    total_liabilities = sum(l.current_balance for l in liabilities)
    liquid_assets = sum(a.current_value for a in assets if a.is_liquid)
    
    return {
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "net_worth": total_assets - total_liabilities,
        "liquid_assets": liquid_assets,
        "asset_count": len(assets),
        "liability_count": len(liabilities)
    }


def generate_alerts(user_id: int, db: Session) -> List[NetWorthAlert]:
    """Generate alerts for significant net worth changes"""
    alerts = []
    
    # Get recent snapshots
    snapshots = db.query(NetWorthSnapshot).filter(
        NetWorthSnapshot.user_id == user_id
    ).order_by(NetWorthSnapshot.snapshot_date.desc()).limit(30).all()
    
    if len(snapshots) < 2:
        return alerts
    
    current = snapshots[0]
    previous = snapshots[1]
    
    change = current.net_worth - previous.net_worth
    change_pct = (change / previous.net_worth * 100) if previous.net_worth != 0 else 0
    
    # Alert for significant increase (>10%)
    if change_pct > 10:
        alerts.append(NetWorthAlert(
            alert_type="significant_increase",
            severity="info",
            message=f"Your net worth increased by {change_pct:.1f}% since last snapshot",
            change_amount=change,
            change_percentage=change_pct
        ))
    
    # Alert for significant decrease (>10%)
    elif change_pct < -10:
        alerts.append(NetWorthAlert(
            alert_type="significant_decrease",
            severity="warning",
            message=f"Your net worth decreased by {abs(change_pct):.1f}% since last snapshot",
            change_amount=change,
            change_percentage=change_pct
        ))
    
    # Alert for negative net worth
    if current.net_worth < 0:
        alerts.append(NetWorthAlert(
            alert_type="negative_net_worth",
            severity="critical",
            message="Your net worth is currently negative",
            change_amount=current.net_worth,
            change_percentage=None
        ))
    
    # Alert for low liquid assets
    if current.liquid_assets < current.total_liabilities * 0.1:
        alerts.append(NetWorthAlert(
            alert_type="low_liquidity",
            severity="warning",
            message="Your liquid assets are less than 10% of your total liabilities",
            change_amount=current.liquid_assets,
            change_percentage=None
        ))
    
    return alerts


# Asset endpoints
@router.post("/assets", response_model=AssetSchema)
def create_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new asset"""
    db_asset = Asset(
        user_id=current_user.id,
        **asset.model_dump()
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    
    # Create initial snapshot
    snapshot = AssetSnapshot(
        asset_id=db_asset.id,
        value=db_asset.current_value,
        snapshot_date=date.today()
    )
    db.add(snapshot)
    db.commit()
    
    return db_asset


@router.get("/assets", response_model=List[AssetSchema])
def get_assets(
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all assets for the current user"""
    query = db.query(Asset).filter(Asset.user_id == current_user.id)
    
    if not include_inactive:
        query = query.filter(Asset.is_active == 1)
    
    return query.order_by(Asset.asset_type, Asset.name).all()


@router.get("/assets/{asset_id}", response_model=AssetSchema)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific asset"""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return asset


@router.put("/assets/{asset_id}", response_model=AssetSchema)
def update_asset(
    asset_id: int,
    asset_update: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an asset"""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    update_data = asset_update.model_dump(exclude_unset=True)
    old_value = asset.current_value
    
    for field, value in update_data.items():
        setattr(asset, field, value)
    
    asset.updated_at = datetime.utcnow()
    
    # Create snapshot if value changed
    if "current_value" in update_data and update_data["current_value"] != old_value:
        snapshot = AssetSnapshot(
            asset_id=asset.id,
            value=asset.current_value,
            snapshot_date=date.today()
        )
        db.add(snapshot)
    
    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an asset"""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted successfully"}


# Liability endpoints
@router.post("/liabilities", response_model=LiabilitySchema)
def create_liability(
    liability: LiabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new liability"""
    db_liability = Liability(
        user_id=current_user.id,
        **liability.model_dump()
    )
    db.add(db_liability)
    db.commit()
    db.refresh(db_liability)
    
    # Create initial snapshot
    snapshot = LiabilitySnapshot(
        liability_id=db_liability.id,
        balance=db_liability.current_balance,
        snapshot_date=date.today()
    )
    db.add(snapshot)
    db.commit()
    
    return db_liability


@router.get("/liabilities", response_model=List[LiabilitySchema])
def get_liabilities(
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all liabilities for the current user"""
    query = db.query(Liability).filter(Liability.user_id == current_user.id)
    
    if not include_inactive:
        query = query.filter(Liability.is_active == 1)
    
    return query.order_by(Liability.liability_type, Liability.name).all()


@router.get("/liabilities/{liability_id}", response_model=LiabilitySchema)
def get_liability(
    liability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific liability"""
    liability = db.query(Liability).filter(
        Liability.id == liability_id,
        Liability.user_id == current_user.id
    ).first()
    
    if not liability:
        raise HTTPException(status_code=404, detail="Liability not found")
    
    return liability


@router.put("/liabilities/{liability_id}", response_model=LiabilitySchema)
def update_liability(
    liability_id: int,
    liability_update: LiabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a liability"""
    liability = db.query(Liability).filter(
        Liability.id == liability_id,
        Liability.user_id == current_user.id
    ).first()
    
    if not liability:
        raise HTTPException(status_code=404, detail="Liability not found")
    
    update_data = liability_update.model_dump(exclude_unset=True)
    old_balance = liability.current_balance
    
    for field, value in update_data.items():
        setattr(liability, field, value)
    
    liability.updated_at = datetime.utcnow()
    
    # Create snapshot if balance changed
    if "current_balance" in update_data and update_data["current_balance"] != old_balance:
        snapshot = LiabilitySnapshot(
            liability_id=liability.id,
            balance=liability.current_balance,
            snapshot_date=date.today()
        )
        db.add(snapshot)
    
    db.commit()
    db.refresh(liability)
    return liability


@router.delete("/liabilities/{liability_id}")
def delete_liability(
    liability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a liability"""
    liability = db.query(Liability).filter(
        Liability.id == liability_id,
        Liability.user_id == current_user.id
    ).first()
    
    if not liability:
        raise HTTPException(status_code=404, detail="Liability not found")
    
    db.delete(liability)
    db.commit()
    return {"message": "Liability deleted successfully"}


# Snapshot endpoints
@router.post("/snapshots")
def create_snapshot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a net worth snapshot for today"""
    nw_data = calculate_net_worth(current_user.id, db)
    
    # Check if snapshot already exists for today
    existing = db.query(NetWorthSnapshot).filter(
        NetWorthSnapshot.user_id == current_user.id,
        NetWorthSnapshot.snapshot_date == date.today()
    ).first()
    
    if existing:
        # Update existing snapshot
        existing.total_assets = nw_data["total_assets"]
        existing.total_liabilities = nw_data["total_liabilities"]
        existing.net_worth = nw_data["net_worth"]
        existing.liquid_assets = nw_data["liquid_assets"]
        db.commit()
        return {"message": "Snapshot updated successfully"}
    
    # Create new snapshot
    snapshot = NetWorthSnapshot(
        user_id=current_user.id,
        snapshot_date=date.today(),
        total_assets=nw_data["total_assets"],
        total_liabilities=nw_data["total_liabilities"],
        net_worth=nw_data["net_worth"],
        liquid_assets=nw_data["liquid_assets"]
    )
    db.add(snapshot)
    db.commit()
    
    return {"message": "Snapshot created successfully"}


@router.get("/snapshots", response_model=List[NetWorthSnapshotSchema])
def get_snapshots(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get net worth snapshots"""
    query = db.query(NetWorthSnapshot).filter(
        NetWorthSnapshot.user_id == current_user.id
    )
    
    if start_date:
        query = query.filter(NetWorthSnapshot.snapshot_date >= start_date)
    if end_date:
        query = query.filter(NetWorthSnapshot.snapshot_date <= end_date)
    
    return query.order_by(NetWorthSnapshot.snapshot_date.desc()).all()


# Summary and analytics endpoints
@router.get("/summary", response_model=NetWorthSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get net worth summary with trends"""
    current = calculate_net_worth(current_user.id, db)
    
    # Get historical snapshots for trend calculation
    today = date.today()
    snapshot_30 = db.query(NetWorthSnapshot).filter(
        NetWorthSnapshot.user_id == current_user.id,
        NetWorthSnapshot.snapshot_date <= today - timedelta(days=30)
    ).order_by(NetWorthSnapshot.snapshot_date.desc()).first()
    
    snapshot_90 = db.query(NetWorthSnapshot).filter(
        NetWorthSnapshot.user_id == current_user.id,
        NetWorthSnapshot.snapshot_date <= today - timedelta(days=90)
    ).order_by(NetWorthSnapshot.snapshot_date.desc()).first()
    
    snapshot_1y = db.query(NetWorthSnapshot).filter(
        NetWorthSnapshot.user_id == current_user.id,
        NetWorthSnapshot.snapshot_date <= today - timedelta(days=365)
    ).order_by(NetWorthSnapshot.snapshot_date.desc()).first()
    
    summary = NetWorthSummary(
        current_net_worth=current["net_worth"],
        total_assets=current["total_assets"],
        total_liabilities=current["total_liabilities"],
        liquid_assets=current["liquid_assets"],
        asset_count=current["asset_count"],
        liability_count=current["liability_count"]
    )
    
    if snapshot_30:
        summary.change_30_days = current["net_worth"] - snapshot_30.net_worth
        summary.change_30_days_pct = (summary.change_30_days / snapshot_30.net_worth * 100) if snapshot_30.net_worth != 0 else 0
    
    if snapshot_90:
        summary.change_90_days = current["net_worth"] - snapshot_90.net_worth
        summary.change_90_days_pct = (summary.change_90_days / snapshot_90.net_worth * 100) if snapshot_90.net_worth != 0 else 0
    
    if snapshot_1y:
        summary.change_1_year = current["net_worth"] - snapshot_1y.net_worth
        summary.change_1_year_pct = (summary.change_1_year / snapshot_1y.net_worth * 100) if snapshot_1y.net_worth != 0 else 0
    
    return summary


@router.get("/trends", response_model=List[NetWorthTrend])
def get_trends(
    months: int = Query(12, ge=1, le=60),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get net worth trends over time"""
    start_date = date.today() - relativedelta(months=months)
    
    snapshots = db.query(NetWorthSnapshot).filter(
        NetWorthSnapshot.user_id == current_user.id,
        NetWorthSnapshot.snapshot_date >= start_date
    ).order_by(NetWorthSnapshot.snapshot_date).all()
    
    return [
        NetWorthTrend(
            date=s.snapshot_date,
            net_worth=s.net_worth,
            assets=s.total_assets,
            liabilities=s.total_liabilities
        )
        for s in snapshots
    ]


@router.get("/breakdown/assets", response_model=List[AssetBreakdown])
def get_asset_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get asset breakdown by type"""
    assets = db.query(Asset).filter(
        Asset.user_id == current_user.id,
        Asset.is_active == 1
    ).all()
    
    total_value = sum(a.current_value for a in assets)
    
    breakdown_dict = {}
    for asset in assets:
        asset_type = asset.asset_type.value
        if asset_type not in breakdown_dict:
            breakdown_dict[asset_type] = {
                "total_value": 0,
                "count": 0
            }
        breakdown_dict[asset_type]["total_value"] += asset.current_value
        breakdown_dict[asset_type]["count"] += 1
    
    return [
        AssetBreakdown(
            asset_type=asset_type,
            total_value=data["total_value"],
            percentage=(data["total_value"] / total_value * 100) if total_value > 0 else 0,
            count=data["count"]
        )
        for asset_type, data in breakdown_dict.items()
    ]


@router.get("/breakdown/liabilities", response_model=List[LiabilityBreakdown])
def get_liability_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get liability breakdown by type"""
    liabilities = db.query(Liability).filter(
        Liability.user_id == current_user.id,
        Liability.is_active == 1
    ).all()
    
    total_balance = sum(l.current_balance for l in liabilities)
    
    breakdown_dict = {}
    for liability in liabilities:
        liability_type = liability.liability_type.value
        if liability_type not in breakdown_dict:
            breakdown_dict[liability_type] = {
                "total_balance": 0,
                "count": 0,
                "total_interest_rate": 0,
                "total_minimum_payment": 0
            }
        breakdown_dict[liability_type]["total_balance"] += liability.current_balance
        breakdown_dict[liability_type]["count"] += 1
        breakdown_dict[liability_type]["total_interest_rate"] += liability.interest_rate
        breakdown_dict[liability_type]["total_minimum_payment"] += liability.minimum_payment
    
    return [
        LiabilityBreakdown(
            liability_type=liability_type,
            total_balance=data["total_balance"],
            percentage=(data["total_balance"] / total_balance * 100) if total_balance > 0 else 0,
            count=data["count"],
            total_interest_rate=data["total_interest_rate"],
            total_minimum_payment=data["total_minimum_payment"]
        )
        for liability_type, data in breakdown_dict.items()
    ]


@router.get("/projection", response_model=NetWorthProjection)
def get_projection(
    months: int = Query(12, ge=1, le=120),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Project future net worth based on current trends and goals"""
    current = calculate_net_worth(current_user.id, db)
    
    # Get active financial goals
    goals = db.query(FinancialGoal).filter(
        FinancialGoal.user_id == current_user.id,
        FinancialGoal.status == GoalStatus.ACTIVE
    ).all()
    
    monthly_goal_contributions = sum(g.monthly_contribution for g in goals)
    
    # Get liabilities with payments
    liabilities = db.query(Liability).filter(
        Liability.user_id == current_user.id,
        Liability.is_active == 1
    ).all()
    
    monthly_debt_payments = sum(l.minimum_payment for l in liabilities)
    
    # Simple projection: current + (monthly savings - debt payments) * months
    # This is a simplified model; real projections would be more complex
    net_monthly_change = monthly_goal_contributions - monthly_debt_payments
    
    projected_assets = current["total_assets"] + (monthly_goal_contributions * months)
    projected_liabilities = max(0, current["total_liabilities"] - (monthly_debt_payments * months))
    projected_net_worth = projected_assets - projected_liabilities
    
    projection_date = date.today() + relativedelta(months=months)
    
    return NetWorthProjection(
        projection_date=projection_date,
        projected_net_worth=projected_net_worth,
        projected_assets=projected_assets,
        projected_liabilities=projected_liabilities,
        assumptions={
            "monthly_goal_contributions": monthly_goal_contributions,
            "monthly_debt_payments": monthly_debt_payments,
            "net_monthly_change": net_monthly_change,
            "months_projected": months
        }
    )


@router.get("/alerts", response_model=List[NetWorthAlert])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get net worth alerts"""
    return generate_alerts(current_user.id, db)
