"""CSV Export API endpoints"""
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.csv_export import CSVExportService

router = APIRouter(prefix="/api/exports", tags=["exports"])


@router.get("/transactions/csv")
def export_transactions_csv(
    budget_id: Optional[int] = Query(None, description="Filter by budget ID"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    start_date: Optional[date] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export transactions to CSV format.
    
    Filters:
    - budget_id: Filter transactions by budget
    - category_id: Filter transactions by category
    - start_date: Include transactions from this date onwards
    - end_date: Include transactions up to this date
    """
    csv_content = CSVExportService.export_transactions(
        db=db,
        user_id=current_user.id,
        budget_id=budget_id,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date
    )
    
    # Generate filename
    filename = "transactions"
    if start_date and end_date:
        filename += f"_{start_date}_{end_date}"
    elif start_date:
        filename += f"_from_{start_date}"
    elif end_date:
        filename += f"_until_{end_date}"
    filename += ".csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/transactions/splits/csv")
def export_transaction_splits_csv(
    budget_id: Optional[int] = Query(None, description="Filter by budget ID"),
    start_date: Optional[date] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export split transactions to CSV format (detailed view).
    
    This endpoint provides a detailed breakdown of split transactions,
    showing each split as a separate row.
    """
    csv_content = CSVExportService.export_transaction_splits(
        db=db,
        user_id=current_user.id,
        budget_id=budget_id,
        start_date=start_date,
        end_date=end_date
    )
    
    # Generate filename
    filename = "transaction_splits"
    if start_date and end_date:
        filename += f"_{start_date}_{end_date}"
    filename += ".csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/budgets/csv")
def export_budgets_csv(
    budget_id: Optional[int] = Query(None, description="Export specific budget"),
    year: Optional[int] = Query(None, description="Filter by year"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export budget summary with categories to CSV format.
    
    Filters:
    - budget_id: Export a specific budget
    - year: Filter budgets by year
    - month: Filter budgets by month
    """
    csv_content = CSVExportService.export_budget_summary(
        db=db,
        user_id=current_user.id,
        budget_id=budget_id,
        year=year,
        month=month
    )
    
    # Generate filename
    filename = "budget_summary"
    if year and month:
        filename += f"_{year}_{month:02d}"
    elif year:
        filename += f"_{year}"
    filename += ".csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
