"""
Quick verification script for sinking funds feature
Run this from the project root to verify everything is set up correctly
"""

import sys
import os

def check_backend_files():
    """Check if all backend files exist"""
    files = [
        'backend/app/models/sinking_fund.py',
        'backend/app/schemas/sinking_fund.py',
        'backend/app/api/sinking_funds.py',
        'backend/migrate_sinking_funds.py',
        'backend/test_sinking_funds.py',
    ]
    
    print("Checking backend files...")
    all_exist = True
    for file in files:
        exists = os.path.exists(file)
        status = "✓" if exists else "✗"
        print(f"  {status} {file}")
        if not exists:
            all_exist = False
    
    return all_exist

def check_frontend_files():
    """Check if all frontend files exist"""
    files = [
        'frontend/src/lib/sinking-funds-api.ts',
        'frontend/src/app/sinking-funds/page.tsx',
        'frontend/src/app/sinking-funds/new/page.tsx',
        'frontend/src/app/sinking-funds/[id]/page.tsx',
        'frontend/src/app/sinking-funds/[id]/edit/page.tsx',
    ]
    
    print("\nChecking frontend files...")
    all_exist = True
    for file in files:
        exists = os.path.exists(file)
        status = "✓" if exists else "✗"
        print(f"  {status} {file}")
        if not exists:
            all_exist = False
    
    return all_exist

def check_documentation():
    """Check if documentation files exist"""
    files = [
        'SINKING_FUNDS_GUIDE.md',
        'SINKING_FUNDS_IMPLEMENTATION.md',
        'SINKING_FUNDS_QUICKSTART.md',
    ]
    
    print("\nChecking documentation...")
    all_exist = True
    for file in files:
        exists = os.path.exists(file)
        status = "✓" if exists else "✗"
        print(f"  {status} {file}")
        if not exists:
            all_exist = False
    
    return all_exist

def check_database():
    """Check if database tables exist"""
    try:
        import sqlite3
        conn = sqlite3.connect('backend/invoicing.db')
        cursor = conn.cursor()
        
        print("\nChecking database tables...")
        
        # Check sinking_funds table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sinking_funds'")
        funds_exists = cursor.fetchone() is not None
        print(f"  {'✓' if funds_exists else '✗'} sinking_funds table")
        
        # Check sinking_fund_contributions table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sinking_fund_contributions'")
        contrib_exists = cursor.fetchone() is not None
        print(f"  {'✓' if contrib_exists else '✗'} sinking_fund_contributions table")
        
        conn.close()
        return funds_exists and contrib_exists
    except Exception as e:
        print(f"  ✗ Error checking database: {e}")
        return False

def main():
    print("=" * 60)
    print("Sinking Funds Feature Verification")
    print("=" * 60)
    
    backend_ok = check_backend_files()
    frontend_ok = check_frontend_files()
    docs_ok = check_documentation()
    db_ok = check_database()
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Backend files:     {'✓ OK' if backend_ok else '✗ MISSING FILES'}")
    print(f"Frontend files:    {'✓ OK' if frontend_ok else '✗ MISSING FILES'}")
    print(f"Documentation:     {'✓ OK' if docs_ok else '✗ MISSING FILES'}")
    print(f"Database tables:   {'✓ OK' if db_ok else '✗ NOT MIGRATED'}")
    
    if all([backend_ok, frontend_ok, docs_ok, db_ok]):
        print("\n✓ All checks passed! Sinking funds feature is ready to use.")
        print("\nNext steps:")
        print("1. Start backend: cd backend && uvicorn app.main:app --reload")
        print("2. Start frontend: cd frontend && npm run dev")
        print("3. Visit: http://localhost:3000/sinking-funds")
        print("4. Or test API: python backend/test_sinking_funds.py")
        return 0
    else:
        print("\n✗ Some checks failed. Please review the output above.")
        if not db_ok:
            print("\nTo fix database: python backend/migrate_sinking_funds.py")
        return 1

if __name__ == "__main__":
    sys.exit(main())
