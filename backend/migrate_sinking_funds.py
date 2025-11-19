"""
Migration script for sinking funds feature
Creates the sinking_funds and sinking_fund_contributions tables
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Create sinking_funds table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sinking_funds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                target_cents INTEGER NOT NULL,
                current_balance_cents INTEGER NOT NULL DEFAULT 0,
                monthly_contribution_cents INTEGER NOT NULL DEFAULT 0,
                target_date DATETIME,
                description TEXT,
                color VARCHAR(50),
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """))
        
        # Create index on user_id and is_active
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_sinking_fund_user 
            ON sinking_funds(user_id, is_active)
        """))
        
        # Create sinking_fund_contributions table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sinking_fund_contributions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fund_id INTEGER NOT NULL,
                amount_cents INTEGER NOT NULL,
                contribution_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (fund_id) REFERENCES sinking_funds(id) ON DELETE CASCADE
            )
        """))
        
        # Create index on fund_id and contribution_date
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_contribution_fund_date 
            ON sinking_fund_contributions(fund_id, contribution_date)
        """))
        
        conn.commit()
        print("✓ Sinking funds tables created successfully")

if __name__ == "__main__":
    migrate()
