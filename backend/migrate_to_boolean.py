#!/usr/bin/env python3
"""
Migration script to convert INTEGER is_active columns to BOOLEAN in Supabase.
This fixes the "operator does not exist: integer = boolean" error.
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migration():
    """Run the boolean conversion migration"""
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment variables")
        print("Please set DATABASE_URL in your .env file")
        return False
    
    print("🔄 Connecting to database...")
    engine = create_engine(database_url)
    
    # Read migration SQL
    migration_file = Path(__file__).parent / "supabase_migrations" / "convert_to_boolean.sql"
    
    if not migration_file.exists():
        print(f"❌ ERROR: Migration file not found: {migration_file}")
        return False
    
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    print("📝 Running migration to convert INTEGER columns to BOOLEAN...")
    
    try:
        with engine.begin() as conn:
            # Execute the migration
            conn.execute(text(migration_sql))
            
        print("✅ Migration completed successfully!")
        print("\n📊 Converted columns:")
        print("   - assets.is_active (INTEGER → BOOLEAN)")
        print("   - assets.is_liquid (INTEGER → BOOLEAN)")
        print("   - liabilities.is_active (INTEGER → BOOLEAN)")
        print("   - sinking_funds.is_active (INTEGER → BOOLEAN)")
        print("   - paychecks.is_active (INTEGER → BOOLEAN)")
        print("   - financial_goals.is_active (INTEGER → BOOLEAN)")
        print("   - category_templates.is_active (INTEGER → BOOLEAN)")
        print("   - budget_categories.is_active (INTEGER → BOOLEAN)")
        print("   - transactions.is_split (INTEGER → BOOLEAN, if exists)")
        print("   - budgets.is_active (INTEGER → BOOLEAN, if exists)")
        print("   - customers.is_active (INTEGER → BOOLEAN, if exists)")
        print("   - invoices.is_paid (INTEGER → BOOLEAN, if exists)")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR during migration: {e}")
        print("\nIf you see 'cannot cast type integer to boolean', the columns may already be boolean.")
        print("You can verify column types in Supabase SQL Editor with:")
        print("  SELECT column_name, data_type FROM information_schema.columns")
        print("  WHERE table_name IN ('assets', 'liabilities', 'sinking_funds', 'paychecks', 'financial_goals')")
        print("  AND column_name LIKE '%is_%';")
        return False

def verify_migration():
    """Verify that columns are now boolean"""
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return False
    
    print("\n🔍 Verifying column types...")
    engine = create_engine(database_url)
    
    verify_sql = """
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND (column_name LIKE '%is_%' OR column_name = 'is_paid')
    AND table_name IN (
        'assets', 'liabilities', 'sinking_funds', 'paychecks', 
        'financial_goals', 'category_templates', 'budget_categories',
        'transactions', 'budgets', 'customers', 'invoices'
    )
    ORDER BY table_name, column_name;
    """
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(verify_sql))
            rows = result.fetchall()
            
            if rows:
                print("\n📋 Current column types:")
                for row in rows:
                    table, column, dtype = row
                    status = "✅" if dtype == "boolean" else "⚠️"
                    print(f"   {status} {table}.{column}: {dtype}")
            else:
                print("   No matching columns found")
                
        return True
        
    except Exception as e:
        print(f"❌ ERROR during verification: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Boolean Column Migration for Supabase")
    print("=" * 60)
    print()
    
    success = run_migration()
    
    if success:
        verify_migration()
        print("\n✅ All done! Your database columns are now properly typed as BOOLEAN.")
        print("   The 'operator does not exist: integer = boolean' error should be resolved.")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        sys.exit(1)
