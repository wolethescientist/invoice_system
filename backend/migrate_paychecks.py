"""
Migration script for paycheck planning feature
Run this to add paycheck tables to your local SQLite database
"""
import sqlite3
from datetime import datetime

def migrate():
    conn = sqlite3.connect('invoicing.db')
    cursor = conn.cursor()
    
    try:
        # Create paychecks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS paychecks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
                frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'semimonthly', 'monthly', 'custom')),
                next_date DATE NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_paychecks_user_id ON paychecks(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_paychecks_next_date ON paychecks(next_date)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_paychecks_user_active ON paychecks(user_id, is_active)")
        
        # Create paycheck_instances table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS paycheck_instances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                paycheck_id INTEGER NOT NULL,
                budget_id INTEGER NOT NULL,
                amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
                date DATE NOT NULL,
                is_received BOOLEAN NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paycheck_id) REFERENCES paychecks(id) ON DELETE CASCADE,
                FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
                UNIQUE(paycheck_id, budget_id, date)
            )
        """)
        
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_paycheck_instances_paycheck_id ON paycheck_instances(paycheck_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_paycheck_instances_budget_id ON paycheck_instances(budget_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_paycheck_instances_date ON paycheck_instances(date)")
        
        # Create paycheck_allocations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS paycheck_allocations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                paycheck_id INTEGER NOT NULL,
                instance_id INTEGER,
                category_id INTEGER NOT NULL,
                amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
                "order" INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paycheck_id) REFERENCES paychecks(id) ON DELETE CASCADE,
                FOREIGN KEY (instance_id) REFERENCES paycheck_instances(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE
            )
        """)
        
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_paycheck_allocations_paycheck_id ON paycheck_allocations(paycheck_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_paycheck_allocations_instance_id ON paycheck_allocations(instance_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_paycheck_allocations_category_id ON paycheck_allocations(category_id)")
        
        conn.commit()
        print("✓ Paycheck planning tables created successfully")
        
        # Verify tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'paycheck%'")
        tables = cursor.fetchall()
        print(f"✓ Created tables: {', '.join([t[0] for t in tables])}")
        
    except Exception as e:
        conn.rollback()
        print(f"✗ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
