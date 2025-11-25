"""
Test net worth system with cents-based columns
"""
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

def test_cents_consistency():
    """Test that all net worth tables use cents consistently"""
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found")
        return False
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("\n" + "="*80)
        print("NET WORTH CENTS CONSISTENCY TEST")
        print("="*80)
        
        tests_passed = 0
        tests_failed = 0
        
        # Test 1: Check assets table
        print("\n1️⃣  Testing assets table...")
        cursor.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'assets' AND column_name = 'current_value_cents'
        """)
        if cursor.fetchone():
            print("   ✅ assets.current_value_cents exists")
            tests_passed += 1
        else:
            print("   ❌ assets.current_value_cents missing")
            tests_failed += 1
        
        # Test 2: Check liabilities table
        print("\n2️⃣  Testing liabilities table...")
        cursor.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'liabilities' 
            AND column_name IN ('current_balance_cents', 'minimum_payment_cents')
        """)
        results = cursor.fetchall()
        if len(results) == 2:
            print("   ✅ liabilities has both cents columns")
            tests_passed += 1
        else:
            print(f"   ❌ liabilities missing cents columns (found {len(results)}/2)")
            tests_failed += 1
        
        # Test 3: Check asset_snapshots table
        print("\n3️⃣  Testing asset_snapshots table...")
        cursor.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'asset_snapshots' AND column_name = 'value_cents'
        """)
        if cursor.fetchone():
            print("   ✅ asset_snapshots.value_cents exists")
            tests_passed += 1
        else:
            print("   ❌ asset_snapshots.value_cents missing")
            tests_failed += 1
        
        # Test 4: Check liability_snapshots table
        print("\n4️⃣  Testing liability_snapshots table...")
        cursor.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'liability_snapshots' AND column_name = 'balance_cents'
        """)
        if cursor.fetchone():
            print("   ✅ liability_snapshots.balance_cents exists")
            tests_passed += 1
        else:
            print("   ❌ liability_snapshots.balance_cents missing")
            tests_failed += 1
        
        # Test 5: Check net_worth_snapshots table
        print("\n5️⃣  Testing net_worth_snapshots table...")
        cursor.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'net_worth_snapshots' 
            AND column_name IN ('total_assets_cents', 'total_liabilities_cents', 'net_worth_cents', 'liquid_assets_cents')
        """)
        results = cursor.fetchall()
        if len(results) == 4:
            print("   ✅ net_worth_snapshots has all cents columns")
            tests_passed += 1
        else:
            print(f"   ❌ net_worth_snapshots missing cents columns (found {len(results)}/4)")
            tests_failed += 1
        
        # Test 6: Check data types are INTEGER
        print("\n6️⃣  Testing data types...")
        cursor.execute("""
            SELECT table_name, column_name, data_type
            FROM information_schema.columns 
            WHERE table_name IN ('assets', 'liabilities', 'asset_snapshots', 'liability_snapshots', 'net_worth_snapshots')
            AND column_name LIKE '%_cents'
            AND data_type != 'integer'
        """)
        wrong_types = cursor.fetchall()
        if not wrong_types:
            print("   ✅ All cents columns are INTEGER type")
            tests_passed += 1
        else:
            print(f"   ❌ Found {len(wrong_types)} columns with wrong data type:")
            for col in wrong_types:
                print(f"      - {col['table_name']}.{col['column_name']}: {col['data_type']}")
            tests_failed += 1
        
        # Summary
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"✅ Passed: {tests_passed}")
        print(f"❌ Failed: {tests_failed}")
        print(f"📊 Total:  {tests_passed + tests_failed}")
        
        cursor.close()
        conn.close()
        
        return tests_failed == 0
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == "__main__":
    success = test_cents_consistency()
    
    if success:
        print("\n" + "="*80)
        print("✅ ALL TESTS PASSED - Database schema is consistent!")
        print("="*80)
    else:
        print("\n" + "="*80)
        print("❌ TESTS FAILED - Database schema has issues")
        print("="*80)
        exit(1)
