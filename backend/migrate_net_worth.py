#!/usr/bin/env python3
"""
Migration script for net worth tracking tables
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import engine, Base
from app.models.net_worth import Asset, Liability, AssetSnapshot, LiabilitySnapshot, NetWorthSnapshot

def migrate():
    """Create net worth tracking tables"""
    print("Creating net worth tracking tables...")
    Base.metadata.create_all(bind=engine, tables=[
        Asset.__table__,
        Liability.__table__,
        AssetSnapshot.__table__,
        LiabilitySnapshot.__table__,
        NetWorthSnapshot.__table__
    ])
    print("Net worth tracking tables created successfully!")

if __name__ == "__main__":
    migrate()
