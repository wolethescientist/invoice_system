#!/usr/bin/env python3
"""
Migration script to apply unlimited categories support to Supabase
"""

import os
import sys
from pathlib import Path
from supabase import create_client, Client

def apply_supabase_migration():
    """Apply database migrations for unlimited categories feature to Supabase"""
    
    # Get Supabase credentials from environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.")
        sys.exit(1)
    
    try:
        print("Connecting to Supabase...")
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Read the migration SQL file
        migration_file = Path(__file__).parent / "supabase_migrations" / "unlimited_categories.sql"
        
        if not migration_file.exists():
            print(f"❌ Migration file not found: {migration_file}")
            sys.exit(1)
        
        print("Reading migration file...")
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        print("Applying migration to Supabase...")
        print("\n" + "="*60)
        print("MIGRATION SQL TO APPLY:")
        print("="*60)
        print(migration_sql)
        print("="*60)
        print("\nPlease copy the above SQL and run it in your Supabase SQL Editor.")
        print("This script cannot directly execute DDL statements due to RLS restrictions.")
        print("\nSteps to apply:")
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Create a new query")
        print("4. Copy and paste the SQL above")
        print("5. Run the query")
        
        # Test connection by checking if we can access the tables
        try:
            result = supabase.table('budgets').select('id').limit(1).execute()
            print(f"\n✓ Connection successful - found {len(result.data)} budget records")
        except Exception as e:
            print(f"\n⚠ Connection test failed: {e}")
        
        print("\n✓ Migration instructions provided successfully!")
        
    except Exception as e:
        print(f"❌ Migration preparation failed: {e}")
        sys.exit(1)

def check_migration_status():
    """Check if the migration has been applied"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        return False
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Try to select from budget_categories with new columns
        result = supabase.table('budget_categories').select('id, description, category_group, is_active').limit(1).execute()
        print("✓ Migration appears to be applied - new columns are accessible")
        return True
        
    except Exception as e:
        print(f"⚠ Migration may not be applied yet: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        check_migration_status()
    else:
        apply_supabase_migration()