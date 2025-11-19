#!/usr/bin/env python3
"""
Migration script for Category Suggestions feature
Creates tables for smart category suggestions based on transaction history
"""

import sqlite3
import os

def migrate_category_suggestions():
    """Create category suggestions tables in SQLite"""
    db_path = os.path.join(os.path.dirname(__file__), 'invoicing.db')
    
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Creating category_patterns table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS category_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                pattern_text VARCHAR(255) NOT NULL,
                confidence_score REAL DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
                usage_count INTEGER DEFAULT 1,
                last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE
            )
        """)
        
        print("Creating indexes for category_patterns...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_pattern_user_text 
            ON category_patterns(user_id, pattern_text)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_pattern_user_category 
            ON category_patterns(user_id, category_id)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_pattern_last_used 
            ON category_patterns(last_used DESC)
        """)
        
        print("Creating category_suggestion_logs table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS category_suggestion_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                transaction_id INTEGER,
                suggested_category_id INTEGER NOT NULL,
                actual_category_id INTEGER NOT NULL,
                pattern_text VARCHAR(255) NOT NULL,
                was_accepted INTEGER DEFAULT 0 CHECK (was_accepted IN (0, 1)),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
                FOREIGN KEY (suggested_category_id) REFERENCES budget_categories(id) ON DELETE CASCADE,
                FOREIGN KEY (actual_category_id) REFERENCES budget_categories(id) ON DELETE CASCADE
            )
        """)
        
        print("Creating indexes for category_suggestion_logs...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_suggestion_log_user 
            ON category_suggestion_logs(user_id, created_at DESC)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_suggestion_log_accepted 
            ON category_suggestion_logs(was_accepted, created_at DESC)
        """)
        
        conn.commit()
        print("✓ Category suggestions migration completed successfully!")
        return True
        
    except sqlite3.Error as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Category Suggestions Migration")
    print("=" * 60)
    migrate_category_suggestions()
