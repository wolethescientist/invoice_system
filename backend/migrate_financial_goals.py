"""
Migration script for Financial Roadmap feature
Migrates financial goals, contributions, and milestones tables
"""
import sqlite3
from datetime import datetime

def migrate():
    conn = sqlite3.connect('invoicing.db')
    cursor = conn.cursor()
    
    print("Starting Financial Roadmap migration...")
    
    # Create financial_goals table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS financial_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            goal_type TEXT NOT NULL CHECK (goal_type IN (
                'savings', 'debt_repayment', 'investment', 'emergency_fund',
                'retirement', 'education', 'home_purchase', 'vehicle', 'vacation', 'other'
            )),
            target_amount REAL NOT NULL CHECK (target_amount > 0),
            current_amount REAL DEFAULT 0.0 CHECK (current_amount >= 0),
            monthly_contribution REAL DEFAULT 0.0 CHECK (monthly_contribution >= 0),
            target_date TEXT NOT NULL,
            start_date TEXT NOT NULL,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
            priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    print("✓ Created financial_goals table")
    
    # Create goal_contributions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS goal_contributions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_id INTEGER NOT NULL,
            amount REAL NOT NULL CHECK (amount > 0),
            contribution_date TEXT NOT NULL,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (goal_id) REFERENCES financial_goals(id) ON DELETE CASCADE
        )
    ''')
    print("✓ Created goal_contributions table")
    
    # Create goal_milestones table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS goal_milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            target_amount REAL NOT NULL CHECK (target_amount > 0),
            target_date TEXT NOT NULL,
            achieved INTEGER DEFAULT 0 CHECK (achieved IN (0, 1)),
            achieved_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (goal_id) REFERENCES financial_goals(id) ON DELETE CASCADE
        )
    ''')
    print("✓ Created goal_milestones table")
    
    # Create indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON financial_goals(status)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_financial_goals_target_date ON financial_goals(target_date)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON goal_contributions(goal_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_goal_contributions_date ON goal_contributions(contribution_date)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON goal_milestones(goal_id)')
    print("✓ Created indexes")
    
    conn.commit()
    conn.close()
    
    print("\n✅ Financial Roadmap migration completed successfully!")

if __name__ == "__main__":
    migrate()
