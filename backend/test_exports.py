"""Test CSV export functionality"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import requests
from datetime import date, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpass123"

def test_exports():
    """Test CSV export endpoints"""
    
    # Login
    print("Logging in...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    
    if response.status_code != 200:
        print(f"Login failed: {response.status_code}")
        print(response.text)
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("✓ Login successful\n")
    
    # Test 1: Export all transactions
    print("Test 1: Export all transactions...")
    response = requests.get(
        f"{BASE_URL}/api/exports/transactions/csv",
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"✓ Exported transactions CSV ({len(response.text)} bytes)")
        print("First 500 characters:")
        print(response.text[:500])
        print()
    else:
        print(f"✗ Failed: {response.status_code}")
        print(response.text)
    
    # Test 2: Export transactions with date filter
    print("\nTest 2: Export transactions with date filter...")
    end_date = date.today()
    start_date = end_date - timedelta(days=30)
    
    response = requests.get(
        f"{BASE_URL}/api/exports/transactions/csv",
        params={
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"✓ Exported filtered transactions CSV ({len(response.text)} bytes)")
        lines = response.text.split('\n')
        print(f"Total rows: {len(lines)}")
        print("Header:", lines[0] if lines else "Empty")
        print()
    else:
        print(f"✗ Failed: {response.status_code}")
        print(response.text)
    
    # Test 3: Export split transactions
    print("\nTest 3: Export split transactions...")
    response = requests.get(
        f"{BASE_URL}/api/exports/transactions/splits/csv",
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"✓ Exported split transactions CSV ({len(response.text)} bytes)")
        lines = response.text.split('\n')
        print(f"Total rows: {len(lines)}")
        print()
    else:
        print(f"✗ Failed: {response.status_code}")
        print(response.text)
    
    # Test 4: Export budget summary
    print("\nTest 4: Export budget summary...")
    response = requests.get(
        f"{BASE_URL}/api/exports/budgets/csv",
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"✓ Exported budget summary CSV ({len(response.text)} bytes)")
        print("First 500 characters:")
        print(response.text[:500])
        print()
    else:
        print(f"✗ Failed: {response.status_code}")
        print(response.text)
    
    # Test 5: Export specific budget
    print("\nTest 5: Export specific budget...")
    # First get a budget ID
    response = requests.get(
        f"{BASE_URL}/api/budgets",
        headers=headers
    )
    
    if response.status_code == 200 and response.json():
        budget_id = response.json()[0]["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/exports/budgets/csv",
            params={"budget_id": budget_id},
            headers=headers
        )
        
        if response.status_code == 200:
            print(f"✓ Exported specific budget CSV ({len(response.text)} bytes)")
            lines = response.text.split('\n')
            print(f"Total rows: {len(lines)}")
            print()
        else:
            print(f"✗ Failed: {response.status_code}")
            print(response.text)
    else:
        print("No budgets found to test with")
    
    print("\n" + "="*50)
    print("CSV Export Tests Complete!")
    print("="*50)


if __name__ == "__main__":
    test_exports()
