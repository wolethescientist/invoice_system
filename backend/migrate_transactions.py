#!/usr/bin/env python3
"""
Migration script to add transactions table
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Create transactions table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
                category_id INTEGER NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
                amount_cents INTEGER NOT NULL,
                date DATE NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Create indexes for better query performance
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON transactions(budget_id)
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id)
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)
        """))
        
        conn.commit()
        print("✓ Transactions table created successfully!")

if __name__ == "__main__":
    migrate()
