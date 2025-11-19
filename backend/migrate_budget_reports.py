#!/usr/bin/env python3
"""
Migration script for budget reports feature
"""
import os
from supabase import create_client, Client

def migrate():
    # Get Supabase credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        return False
    
    # Create Supabase client
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Read migration SQL
    with open("supabase_migrations/budget_reports.sql", "r") as f:
        migration_sql = f.read()
    
    try:
        # Execute migration
        print("Running budget reports migration...")
        supabase.postgrest.rpc("exec_sql", {"sql": migration_sql}).execute()
        print("✓ Budget reports migration completed successfully")
        return True
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        return False

if __name__ == "__main__":
    migrate()
