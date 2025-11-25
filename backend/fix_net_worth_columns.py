"""
Fix missing columns in net_worth_snapshots table
"""
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

def fix_net_worth_columns():
    """Add missing columns to net_worth_snapshots table"""
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        return False
    
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Read the migration file
        print("📖 Reading migration file...")
        with open("backend/supabase_migrations/fix_net_worth_snapshots.sql", "r") as f:
            migration_sql = f.read()
        
        # Execute the migration
        print("🔧 Applying migration...")
        cursor.execute(migration_sql)
        conn.commit()
        
        # Verify the columns exist
        print("✅ Verifying columns...")
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'net_worth_snapshots'
            ORDER BY ordinal_position
        """)
        
        columns = cursor.fetchall()
        print("\n📋 Current columns in net_worth_snapshots:")
        for col in columns:
            print(f"  - {col['column_name']}: {col['data_type']}")
        
        # Check for required columns
        column_names = [col['column_name'] for col in columns]
        required_columns = ['total_assets', 'total_liabilities', 'net_worth', 'liquid_assets']
        
        missing = [col for col in required_columns if col not in column_names]
        if missing:
            print(f"\n❌ Still missing columns: {', '.join(missing)}")
            return False
        
        print("\n✅ All required columns are present!")
        
        # Close connection
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Fix Net Worth Snapshots Columns")
    print("=" * 60)
    
    success = fix_net_worth_columns()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ Migration failed!")
        print("=" * 60)
        exit(1)
