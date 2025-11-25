#!/usr/bin/env python3
"""
Special fix for financial_goals.is_active which has constraints
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def fix_financial_goals():
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found")
        return False
    
    engine = create_engine(database_url)
    
    print("Fixing financial_goals.is_active...")
    print()
    
    # Check for constraints
    check_constraints_sql = """
    SELECT constraint_name, constraint_type
    FROM information_schema.table_constraints
    WHERE table_name = 'financial_goals'
    AND constraint_type IN ('CHECK', 'DEFAULT');
    """
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(check_constraints_sql))
            constraints = result.fetchall()
            
            if constraints:
                print("Found constraints:")
                for name, ctype in constraints:
                    print(f"  - {name} ({ctype})")
                print()
        
        # Try a different approach - drop and recreate
        with engine.begin() as conn:
            print("Step 1: Dropping constraints...")
            
            # Drop any check constraints on is_active
            drop_constraints_sql = """
            DO $$ 
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN (
                    SELECT constraint_name
                    FROM information_schema.constraint_column_usage
                    WHERE table_name = 'financial_goals'
                    AND column_name = 'is_active'
                ) LOOP
                    EXECUTE 'ALTER TABLE financial_goals DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
                END LOOP;
            END $$;
            """
            conn.execute(text(drop_constraints_sql))
            print("✅ Dropped constraints")
            
            print("Step 2: Dropping default...")
            conn.execute(text("ALTER TABLE financial_goals ALTER COLUMN is_active DROP DEFAULT;"))
            print("✅ Dropped default")
            
            print("Step 3: Converting to BOOLEAN...")
            conn.execute(text("""
                ALTER TABLE financial_goals 
                ALTER COLUMN is_active TYPE BOOLEAN 
                USING (CASE WHEN is_active = 1 THEN true ELSE false END);
            """))
            print("✅ Converted to BOOLEAN")
            
            print("Step 4: Setting new default...")
            conn.execute(text("ALTER TABLE financial_goals ALTER COLUMN is_active SET DEFAULT true;"))
            print("✅ Set default to true")
        
        # Verify
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT data_type FROM information_schema.columns
                WHERE table_name = 'financial_goals' AND column_name = 'is_active';
            """))
            dtype = result.scalar()
            
            print()
            if dtype == 'boolean':
                print("✅ SUCCESS! financial_goals.is_active is now BOOLEAN")
                return True
            else:
                print(f"❌ FAILED! Still {dtype}")
                return False
                
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    fix_financial_goals()
