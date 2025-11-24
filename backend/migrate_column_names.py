#!/usr/bin/env python3
"""
⚠️ DEPRECATED - DO NOT USE THIS SCRIPT ⚠️

This migration script is OUTDATED and conflicts with the current model definitions.
The sinking_funds table should use 'target_cents', not 'target_amount_cents'.

Use migrate_sinking_funds_column.py instead for sinking funds column fixes.

Original purpose:
Migration script to fix column names in the database to match updated models.
This ensures consistency between database schema and SQLAlchemy models.
Works with both SQLite and PostgreSQL.
"""

import sys
import os
from sqlalchemy import text, inspect

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine

def get_columns(conn, table_name):
    """Get column names for a table (works with SQLite and PostgreSQL)"""
    inspector = inspect(engine)
    try:
        columns = inspector.get_columns(table_name)
        return [col['name'] for col in columns]
    except:
        return []

def column_exists(conn, table_name, column_name):
    """Check if a column exists in a table"""
    columns = get_columns(conn, table_name)
    return column_name in columns

def run_migration():
    """Run the column name migration"""
    print("Starting column name migration...")
    print(f"Database: {engine.url}")
    
    with engine.connect() as conn:
        try:
            # Start transaction
            trans = conn.begin()
            
            print("\n1. Fixing sinking_funds table...")
            if column_exists(conn, 'sinking_funds', 'target_cents'):
                conn.execute(text("ALTER TABLE sinking_funds RENAME COLUMN target_cents TO target_amount_cents"))
                print("   ✓ Renamed target_cents to target_amount_cents")
            else:
                print("   - Column already renamed or doesn't exist")
            
            print("\n2. Fixing assets table...")
            if column_exists(conn, 'assets', 'current_value'):
                # SQLite doesn't support ALTER COLUMN, need to recreate table
                print("   - Recreating assets table with correct schema...")
                conn.execute(text("""
                    CREATE TABLE assets_new (
                        id INTEGER PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        asset_type VARCHAR(50) NOT NULL,
                        current_value_cents INTEGER NOT NULL,
                        institution VARCHAR(255),
                        account_number_last4 VARCHAR(4),
                        notes TEXT,
                        is_liquid INTEGER DEFAULT 1,
                        is_active INTEGER DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """))
                conn.execute(text("""
                    INSERT INTO assets_new 
                    SELECT id, user_id, name, asset_type, 
                           CAST(current_value * 100 AS INTEGER) as current_value_cents,
                           institution, account_number_last4, notes, is_liquid, is_active,
                           created_at, updated_at
                    FROM assets
                """))
                conn.execute(text("DROP TABLE assets"))
                conn.execute(text("ALTER TABLE assets_new RENAME TO assets"))
                print("   ✓ Fixed current_value column")
            else:
                print("   - Column already fixed or doesn't exist")
            
            print("\n3. Fixing liabilities table...")
            if column_exists(conn, 'liabilities', 'current_balance'):
                print("   - Recreating liabilities table with correct schema...")
                conn.execute(text("""
                    CREATE TABLE liabilities_new (
                        id INTEGER PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        liability_type VARCHAR(50) NOT NULL,
                        current_balance_cents INTEGER NOT NULL,
                        interest_rate REAL DEFAULT 0.0,
                        minimum_payment_cents INTEGER DEFAULT 0,
                        institution VARCHAR(255),
                        account_number_last4 VARCHAR(4),
                        notes TEXT,
                        is_active INTEGER DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """))
                conn.execute(text("""
                    INSERT INTO liabilities_new 
                    SELECT id, user_id, name, liability_type,
                           CAST(current_balance * 100 AS INTEGER) as current_balance_cents,
                           interest_rate,
                           CAST(minimum_payment * 100 AS INTEGER) as minimum_payment_cents,
                           institution, account_number_last4, notes, is_active,
                           created_at, updated_at
                    FROM liabilities
                """))
                conn.execute(text("DROP TABLE liabilities"))
                conn.execute(text("ALTER TABLE liabilities_new RENAME TO liabilities"))
                print("   ✓ Fixed current_balance and minimum_payment columns")
            else:
                print("   - Columns already fixed")
            
            print("\n4. Fixing paychecks table...")
            if column_exists(conn, 'paychecks', 'amount_cents'):
                conn.execute(text("ALTER TABLE paychecks RENAME COLUMN amount_cents TO net_amount_cents"))
                print("   ✓ Renamed amount_cents to net_amount_cents")
            else:
                print("   - amount_cents already renamed")
            
            if column_exists(conn, 'paychecks', 'next_date'):
                conn.execute(text("ALTER TABLE paychecks RENAME COLUMN next_date TO pay_date"))
                conn.execute(text("DROP INDEX IF EXISTS idx_paychecks_next_date"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS idx_paychecks_pay_date ON paychecks(pay_date)"))
                print("   ✓ Renamed next_date to pay_date")
            else:
                print("   - next_date already renamed")
            
            print("\n5. Fixing financial_goals table...")
            if column_exists(conn, 'financial_goals', 'target_amount'):
                print("   - Recreating financial_goals table with correct schema...")
                conn.execute(text("""
                    CREATE TABLE financial_goals_new (
                        id INTEGER PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        goal_type VARCHAR(50) NOT NULL,
                        target_amount_cents INTEGER NOT NULL,
                        current_amount_cents INTEGER DEFAULT 0,
                        monthly_contribution_cents INTEGER DEFAULT 0,
                        target_date DATE NOT NULL,
                        start_date DATE NOT NULL,
                        status VARCHAR(20) DEFAULT 'active',
                        is_active INTEGER DEFAULT 1,
                        priority INTEGER DEFAULT 1,
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """))
                conn.execute(text("""
                    INSERT INTO financial_goals_new 
                    SELECT id, user_id, name, description, goal_type,
                           CAST(target_amount * 100 AS INTEGER) as target_amount_cents,
                           CAST(current_amount * 100 AS INTEGER) as current_amount_cents,
                           CAST(monthly_contribution * 100 AS INTEGER) as monthly_contribution_cents,
                           target_date, start_date, status, 1 as is_active, priority, notes,
                           created_at, updated_at
                    FROM financial_goals
                """))
                conn.execute(text("DROP TABLE financial_goals"))
                conn.execute(text("ALTER TABLE financial_goals_new RENAME TO financial_goals"))
                print("   ✓ Fixed all financial_goals columns")
            else:
                print("   - Columns already fixed")
                
                # Still check if is_active needs to be added
                if not column_exists(conn, 'financial_goals', 'is_active'):
                    conn.execute(text("ALTER TABLE financial_goals ADD COLUMN is_active INTEGER DEFAULT 1"))
                    print("   ✓ Added is_active column")
                else:
                    print("   - is_active column already exists")
            
            # Commit transaction
            trans.commit()
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    run_migration()
