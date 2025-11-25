#!/usr/bin/env python3
"""
Diagnostic script to check the actual data types of columns in the database.
This will tell us exactly what needs to be fixed.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def diagnose_database():
    """Check all boolean-like columns in the database"""
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment variables")
        return False
    
    print("=" * 80)
    print("DATABASE COLUMN TYPE DIAGNOSIS")
    print("=" * 80)
    print()
    
    engine = create_engine(database_url)
    
    # Check all tables and their boolean-like columns
    check_sql = """
    SELECT 
        table_name, 
        column_name, 
        data_type,
        column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND (
        column_name LIKE '%is_%' 
        OR column_name = 'is_paid'
        OR column_name = 'is_liquid'
        OR column_name = 'is_split'
        OR column_name = 'is_active'
        OR column_name = 'is_received'
    )
    ORDER BY table_name, column_name;
    """
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(check_sql))
            rows = result.fetchall()
            
            if not rows:
                print("⚠️  No boolean-like columns found in database")
                return False
            
            print("📊 CURRENT DATABASE STATE:")
            print()
            
            integer_cols = []
            boolean_cols = []
            
            for row in rows:
                table, column, dtype, default = row
                full_name = f"{table}.{column}"
                
                if dtype == "integer":
                    status = "❌ INTEGER"
                    integer_cols.append(full_name)
                elif dtype == "boolean":
                    status = "✅ BOOLEAN"
                    boolean_cols.append(full_name)
                else:
                    status = f"⚠️  {dtype}"
                
                print(f"  {status:20} {full_name:40} (default: {default})")
            
            print()
            print("=" * 80)
            print("SUMMARY")
            print("=" * 80)
            print()
            
            if integer_cols:
                print(f"❌ NEEDS CONVERSION ({len(integer_cols)} columns are INTEGER):")
                for col in integer_cols:
                    print(f"   - {col}")
                print()
            
            if boolean_cols:
                print(f"✅ ALREADY CORRECT ({len(boolean_cols)} columns are BOOLEAN):")
                for col in boolean_cols:
                    print(f"   - {col}")
                print()
            
            # Check specific problem tables from error
            print("=" * 80)
            print("CHECKING PROBLEM TABLES FROM ERROR MESSAGE")
            print("=" * 80)
            print()
            
            problem_tables = ['liabilities', 'assets', 'paychecks', 'financial_goals', 'sinking_funds']
            
            for table in problem_tables:
                table_cols = [col for col in integer_cols if col.startswith(f"{table}.")]
                if table_cols:
                    print(f"❌ {table}: HAS INTEGER COLUMNS")
                    for col in table_cols:
                        print(f"   - {col}")
                else:
                    table_bool = [col for col in boolean_cols if col.startswith(f"{table}.")]
                    if table_bool:
                        print(f"✅ {table}: All columns are BOOLEAN")
                    else:
                        print(f"⚠️  {table}: No boolean columns found (table may not exist)")
            
            print()
            print("=" * 80)
            print("RECOMMENDATION")
            print("=" * 80)
            print()
            
            if integer_cols:
                print("🔧 ACTION REQUIRED:")
                print()
                print("Your database has INTEGER columns but your code uses boolean comparisons.")
                print("Run this SQL in Supabase SQL Editor to fix:")
                print()
                print("```sql")
                for col in integer_cols:
                    table, column = col.split('.')
                    print(f"ALTER TABLE {table} ALTER COLUMN {column} TYPE BOOLEAN USING ({column}::integer::boolean);")
                print("```")
                print()
                print("OR run: python migrate_to_boolean.py")
            else:
                print("✅ All columns are already BOOLEAN type!")
                print()
                print("If you're still getting errors, the issue might be:")
                print("1. Cached connections - restart your backend server")
                print("2. Different database - check your DATABASE_URL")
                print("3. Code not deployed - make sure changes are pushed")
            
            return True
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    diagnose_database()
