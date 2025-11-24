#!/usr/bin/env python3
"""
Migration script to rename sinking_funds.target_amount_cents to target_cents
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def migrate():
    """Rename target_amount_cents to target_cents in sinking_funds table"""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if table exists
        inspector = inspect(engine)
        if 'sinking_funds' not in inspector.get_table_names():
            print("❌ sinking_funds table does not exist")
            return False
        
        # Get current columns
        columns = [col['name'] for col in inspector.get_columns('sinking_funds')]
        
        # Check if we need to migrate
        if 'target_cents' in columns:
            print("✅ Column target_cents already exists")
            return True
        
        if 'target_amount_cents' not in columns:
            print("❌ Column target_amount_cents does not exist")
            return False
        
        # Rename the column
        print("🔄 Renaming target_amount_cents to target_cents...")
        
        try:
            conn.execute(text("""
                ALTER TABLE sinking_funds 
                RENAME COLUMN target_amount_cents TO target_cents
            """))
            conn.commit()
            print("✅ Successfully renamed column")
            return True
        except Exception as e:
            print(f"❌ Error renaming column: {e}")
            conn.rollback()
            return False

if __name__ == "__main__":
    print("Starting sinking_funds column migration...")
    success = migrate()
    sys.exit(0 if success else 1)
