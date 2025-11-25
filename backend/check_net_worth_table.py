"""
Check what columns exist in net_worth_snapshots table
"""
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

def check_table():
    """Check the current structure of net_worth_snapshots table"""
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found")
        return
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'net_worth_snapshots'
            )
        """)
        exists = cursor.fetchone()['exists']
        
        if not exists:
            print("❌ Table 'net_worth_snapshots' does not exist!")
            return
        
        print("✅ Table 'net_worth_snapshots' exists\n")
        
        # Get all columns
        cursor.execute("""
            SELECT 
                column_name, 
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'net_worth_snapshots'
            ORDER BY ordinal_position
        """)
        
        columns = cursor.fetchall()
        print("📋 Current columns:")
        print("-" * 80)
        for col in columns:
            nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
            default = f" DEFAULT {col['column_default']}" if col['column_default'] else ""
            print(f"  {col['column_name']:25} {col['data_type']:20} {nullable:10}{default}")
        
        # Get row count
        cursor.execute("SELECT COUNT(*) as count FROM net_worth_snapshots")
        count = cursor.fetchone()['count']
        print(f"\n📊 Total rows: {count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_table()
