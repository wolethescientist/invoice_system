"""
Check all net worth related tables for column naming consistency
"""
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

def check_table_columns(cursor, table_name):
    """Check columns for a specific table"""
    cursor.execute("""
        SELECT 
            column_name, 
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_name = %s
        ORDER BY ordinal_position
    """, (table_name,))
    
    columns = cursor.fetchall()
    
    if not columns:
        print(f"❌ Table '{table_name}' does not exist!")
        return None
    
    print(f"\n{'='*80}")
    print(f"📋 Table: {table_name}")
    print('='*80)
    for col in columns:
        nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
        default = f" DEFAULT {col['column_default']}" if col['column_default'] else ""
        print(f"  {col['column_name']:30} {col['data_type']:20} {nullable:10}{default}")
    
    return columns

def main():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found")
        return
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("\n" + "="*80)
        print("NET WORTH SYSTEM - DATABASE SCHEMA AUDIT")
        print("="*80)
        
        # Check all net worth related tables
        tables = [
            'assets',
            'liabilities',
            'asset_snapshots',
            'liability_snapshots',
            'net_worth_snapshots'
        ]
        
        issues = []
        
        for table in tables:
            columns = check_table_columns(cursor, table)
            
            if columns:
                column_names = [col['column_name'] for col in columns]
                
                # Check for cents vs non-cents columns
                if table == 'assets':
                    if 'current_value_cents' not in column_names and 'current_value' in column_names:
                        issues.append(f"⚠️  {table}: Uses 'current_value' instead of 'current_value_cents'")
                    elif 'current_value_cents' in column_names:
                        print(f"  ✅ Uses cents column: current_value_cents")
                
                elif table == 'liabilities':
                    if 'current_balance_cents' not in column_names and 'current_balance' in column_names:
                        issues.append(f"⚠️  {table}: Uses 'current_balance' instead of 'current_balance_cents'")
                    elif 'current_balance_cents' in column_names:
                        print(f"  ✅ Uses cents column: current_balance_cents")
                    
                    if 'minimum_payment_cents' not in column_names and 'minimum_payment' in column_names:
                        issues.append(f"⚠️  {table}: Uses 'minimum_payment' instead of 'minimum_payment_cents'")
                    elif 'minimum_payment_cents' in column_names:
                        print(f"  ✅ Uses cents column: minimum_payment_cents")
                
                elif table == 'asset_snapshots':
                    if 'value_cents' not in column_names and 'value' in column_names:
                        issues.append(f"⚠️  {table}: Uses 'value' instead of 'value_cents'")
                    elif 'value_cents' in column_names:
                        print(f"  ✅ Uses cents column: value_cents")
                
                elif table == 'liability_snapshots':
                    if 'balance_cents' not in column_names and 'balance' in column_names:
                        issues.append(f"⚠️  {table}: Uses 'balance' instead of 'balance_cents'")
                    elif 'balance_cents' in column_names:
                        print(f"  ✅ Uses cents column: balance_cents")
                
                elif table == 'net_worth_snapshots':
                    if 'total_assets_cents' in column_names:
                        print(f"  ✅ Uses cents columns")
        
        # Summary
        print("\n" + "="*80)
        print("SUMMARY")
        print("="*80)
        
        if issues:
            print("\n❌ ISSUES FOUND:")
            for issue in issues:
                print(f"  {issue}")
            print("\n⚠️  Database schema is inconsistent - some tables use DECIMAL, others use INTEGER cents")
        else:
            print("\n✅ All tables use consistent cents-based columns")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
