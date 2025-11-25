#!/usr/bin/env python3
"""
Quick fix script to convert the 5 INTEGER columns to BOOLEAN.
Based on diagnostic results.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def fix_columns():
    """Fix the 5 INTEGER columns that need conversion"""
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment variables")
        return False
    
    print("=" * 80)
    print("FIXING BOOLEAN COLUMNS")
    print("=" * 80)
    print()
    print("Converting 5 INTEGER columns to BOOLEAN...")
    print()
    
    # The exact columns that need fixing based on diagnostic
    fixes = [
        ("assets", "is_liquid"),
        ("budget_categories", "is_active"),
        ("financial_goals", "is_active"),
        ("liabilities", "is_active"),
        # Note: invoices.discount_cents is NOT a boolean - skip it
    ]
    
    engine = create_engine(database_url)
    
    try:
        for table, column in fixes:
            # Use separate transaction for each column
            with engine.begin() as conn:
                # First, drop the default if it exists
                drop_default_sql = f"""
                ALTER TABLE {table} 
                ALTER COLUMN {column} DROP DEFAULT;
                """
                
                # Then convert the type
                convert_sql = f"""
                ALTER TABLE {table} 
                ALTER COLUMN {column} TYPE BOOLEAN 
                USING ({column}::integer::boolean);
                """
                
                # Finally, set the new boolean default
                set_default_sql = f"""
                ALTER TABLE {table} 
                ALTER COLUMN {column} SET DEFAULT true;
                """
                
                try:
                    # Check current type first
                    check_sql = f"""
                    SELECT data_type FROM information_schema.columns
                    WHERE table_name = '{table}' AND column_name = '{column}';
                    """
                    result = conn.execute(text(check_sql))
                    current_type = result.scalar()
                    
                    if current_type == 'boolean':
                        print(f"⚠️  Skip: {table}.{column} (already boolean)")
                        continue
                    
                    # Drop default first
                    try:
                        conn.execute(text(drop_default_sql))
                    except:
                        pass  # No default to drop
                    
                    # Convert type
                    conn.execute(text(convert_sql))
                    
                    # Set new default
                    conn.execute(text(set_default_sql))
                    
                    print(f"✅ Fixed: {table}.{column}")
                except Exception as e:
                    error_msg = str(e).lower()
                    if "cannot cast" in error_msg or "already" in error_msg:
                        print(f"⚠️  Skip: {table}.{column} (already boolean or can't convert)")
                    else:
                        print(f"❌ Error: {table}.{column} - {e}")
                        # Don't raise, continue with other columns
                        continue
        
        print()
        print("=" * 80)
        print("VERIFICATION")
        print("=" * 80)
        print()
        
        # Verify the changes
        verify_sql = """
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name, column_name) IN (
            ('assets', 'is_liquid'),
            ('budget_categories', 'is_active'),
            ('financial_goals', 'is_active'),
            ('liabilities', 'is_active')
        )
        ORDER BY table_name, column_name;
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(verify_sql))
            rows = result.fetchall()
            
            all_boolean = True
            for row in rows:
                table, column, dtype = row
                if dtype == "boolean":
                    print(f"✅ {table}.{column}: {dtype}")
                else:
                    print(f"❌ {table}.{column}: {dtype} (STILL NOT BOOLEAN!)")
                    all_boolean = False
        
        print()
        print("=" * 80)
        
        if all_boolean:
            print("✅ SUCCESS! All columns are now BOOLEAN")
            print()
            print("Next steps:")
            print("1. Restart your backend server")
            print("2. Test your dashboard")
            print("3. The 'operator does not exist: integer = boolean' error should be gone!")
        else:
            print("⚠️  Some columns are still not BOOLEAN")
            print("You may need to run the fix again or check for errors above.")
        
        print("=" * 80)
        return all_boolean
        
    except Exception as e:
        print()
        print("=" * 80)
        print(f"❌ ERROR: {e}")
        print("=" * 80)
        print()
        print("Troubleshooting:")
        print("1. Make sure DATABASE_URL is correct in .env")
        print("2. Check you have permission to alter tables")
        print("3. Try running the SQL manually in Supabase SQL Editor")
        return False

if __name__ == "__main__":
    print()
    success = fix_columns()
    print()
    
    if not success:
        sys.exit(1)
