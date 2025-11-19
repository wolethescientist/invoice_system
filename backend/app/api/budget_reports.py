from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.budget_report import BudgetReport
from app.schemas.budget_report import (
    ReportRequest, SavedReportCreate, SavedReportUpdate, SavedReport,
    SpendingReport, IncomeReport, CategoryReport, TrendReport, ComparisonReport
)
from app.services.budget_reports import BudgetReportService

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.post("/spending", response_model=SpendingReport)
def generate_spending_report(
    request: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate spending report with category breakdown and trends"""
    return BudgetReportService.generate_spending_report(db, current_user.id, request)

@router.post("/income", response_model=IncomeReport)
def generate_income_report(
    request: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate income report from budgets"""
    return BudgetReportService.generate_income_report(db, current_user.id, request)

@router.post("/category", response_model=List[CategoryReport])
def generate_category_report(
    request: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate detailed category analysis"""
    return BudgetReportService.generate_category_report(db, current_user.id, request)

@router.post("/trends", response_model=TrendReport)
def generate_trend_report(
    request: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate trend analysis with forecasting"""
    return BudgetReportService.generate_trend_report(db, current_user.id, request)

@router.post("/comparison", response_model=ComparisonReport)
def generate_comparison_report(
    request: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate budget comparison report"""
    return BudgetReportService.generate_comparison_report(db, current_user.id, request)

@router.get("/dashboard", response_model=dict)
def get_dashboard_summary(
    months: int = Query(3, ge=1, le=12, description="Number of months to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quick dashboard summary"""
    return BudgetReportService.get_dashboard_summary(db, current_user.id, months)

# Saved reports management
@router.post("/saved", response_model=SavedReport, status_code=status.HTTP_201_CREATED)
def create_saved_report(
    report_data: SavedReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save a report configuration for later use"""
    report = BudgetReport(
        user_id=current_user.id,
        name=report_data.name,
        report_type=report_data.report_type,
        date_range_start=report_data.date_range_start,
        date_range_end=report_data.date_range_end,
        filters=report_data.filters
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("/saved", response_model=List[SavedReport])
def list_saved_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all saved reports"""
    reports = db.query(BudgetReport).filter(
        BudgetReport.user_id == current_user.id
    ).order_by(BudgetReport.updated_at.desc()).all()
    return reports

@router.get("/saved/{report_id}", response_model=SavedReport)
def get_saved_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a saved report configuration"""
    report = db.query(BudgetReport).filter(
        BudgetReport.id == report_id,
        BudgetReport.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved report not found"
        )
    
    return report

@router.put("/saved/{report_id}", response_model=SavedReport)
def update_saved_report(
    report_id: int,
    report_data: SavedReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a saved report configuration"""
    report = db.query(BudgetReport).filter(
        BudgetReport.id == report_id,
        BudgetReport.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved report not found"
        )
    
    if report_data.name is not None:
        report.name = report_data.name
    if report_data.date_range_start is not None:
        report.date_range_start = report_data.date_range_start
    if report_data.date_range_end is not None:
        report.date_range_end = report_data.date_range_end
    if report_data.filters is not None:
        report.filters = report_data.filters
    
    db.commit()
    db.refresh(report)
    return report

@router.delete("/saved/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a saved report"""
    report = db.query(BudgetReport).filter(
        BudgetReport.id == report_id,
        BudgetReport.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved report not found"
        )
    
    db.delete(report)
    db.commit()
    return None

@router.post("/saved/{report_id}/run")
def run_saved_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run a saved report and return results"""
    report = db.query(BudgetReport).filter(
        BudgetReport.id == report_id,
        BudgetReport.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved report not found"
        )
    
    # Build request from saved report
    request = ReportRequest(
        report_type=report.report_type,
        date_range_start=report.date_range_start,
        date_range_end=report.date_range_end,
        filters=report.filters
    )
    
    # Generate appropriate report
    if report.report_type == "spending":
        return BudgetReportService.generate_spending_report(db, current_user.id, request)
    elif report.report_type == "income":
        return BudgetReportService.generate_income_report(db, current_user.id, request)
    elif report.report_type == "category":
        return BudgetReportService.generate_category_report(db, current_user.id, request)
    elif report.report_type == "trend":
        return BudgetReportService.generate_trend_report(db, current_user.id, request)
    elif report.report_type == "comparison":
        return BudgetReportService.generate_comparison_report(db, current_user.id, request)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown report type: {report.report_type}"
        )
