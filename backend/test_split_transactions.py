"""
Test script for split transaction functionality
Run this after applying the split_transactions.sql migration
"""
import requests
import json
from datetime import date

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpass123"

def test_split_transactions():
    print("🧪 Testing Split Transaction Functionality\n")
    
    # Step 1: Login
    print("1️⃣ Logging in...")
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful\n")
    
    # Step 2: Get or create a budget
    print("2️⃣ Getting budget...")
    budgets_response = requests.get(f"{BASE_URL}/api/budgets", headers=headers)
    budgets = budgets_response.json()
    
    if not budgets:
        print("❌ No budgets found. Please create a budget first.")
        return
    
    budget = budgets[0]
    budget_id = budget["id"]
    print(f"✅ Using budget: {budget['month']}/{budget['year']}\n")
    
    # Step 3: Get budget details with categories
    print("3️⃣ Getting budget categories...")
    budget_detail = requests.get(f"{BASE_URL}/api/budgets/{budget_id}", headers=headers)
    categories = budget_detail.json()["budget"]["categories"]
    
    if len(categories) < 2:
        print("❌ Need at least 2 categories to test split transactions")
        return
    
    print(f"✅ Found {len(categories)} categories\n")
    
    # Step 4: Create a regular transaction
    print("4️⃣ Creating regular transaction...")
    regular_transaction = {
        "budget_id": budget_id,
        "category_id": categories[0]["id"],
        "amount_cents": 5000,  # $50.00
        "date": str(date.today()),
        "notes": "Regular transaction test",
        "is_split": False
    }
    
    regular_response = requests.post(
        f"{BASE_URL}/api/transactions",
        headers=headers,
        json=regular_transaction
    )
    
    if regular_response.status_code == 201:
        print(f"✅ Regular transaction created: ${regular_response.json()['amount_cents']/100:.2f}\n")
    else:
        print(f"❌ Failed to create regular transaction: {regular_response.text}\n")
    
    # Step 5: Create a split transaction
    print("5️⃣ Creating split transaction...")
    split_transaction = {
        "budget_id": budget_id,
        "category_id": None,
        "amount_cents": 10000,  # $100.00
        "date": str(date.today()),
        "notes": "Split transaction test",
        "is_split": True,
        "splits": [
            {
                "category_id": categories[0]["id"],
                "amount_cents": 6000,  # $60.00
                "notes": f"Split to {categories[0]['name']}"
            },
            {
                "category_id": categories[1]["id"],
                "amount_cents": 4000,  # $40.00
                "notes": f"Split to {categories[1]['name']}"
            }
        ]
    }
    
    split_response = requests.post(
        f"{BASE_URL}/api/transactions",
        headers=headers,
        json=split_transaction
    )
    
    if split_response.status_code == 201:
        result = split_response.json()
        print(f"✅ Split transaction created: ${result['amount_cents']/100:.2f}")
        print(f"   Splits: {len(result['splits'])} categories")
        for split in result['splits']:
            print(f"   - {split['category_name']}: ${split['amount_cents']/100:.2f}")
        print()
    else:
        print(f"❌ Failed to create split transaction: {split_response.text}\n")
        return
    
    # Step 6: Test invalid split (amounts don't match)
    print("6️⃣ Testing invalid split (amounts don't match)...")
    invalid_split = {
        "budget_id": budget_id,
        "category_id": None,
        "amount_cents": 10000,  # $100.00
        "date": str(date.today()),
        "is_split": True,
        "splits": [
            {
                "category_id": categories[0]["id"],
                "amount_cents": 5000,  # $50.00
            },
            {
                "category_id": categories[1]["id"],
                "amount_cents": 3000,  # $30.00 (only $80 total, should be $100)
            }
        ]
    }
    
    invalid_response = requests.post(
        f"{BASE_URL}/api/transactions",
        headers=headers,
        json=invalid_split
    )
    
    if invalid_response.status_code == 422:
        print("✅ Correctly rejected invalid split\n")
    else:
        print(f"❌ Should have rejected invalid split: {invalid_response.status_code}\n")
    
    # Step 7: List transactions
    print("7️⃣ Listing all transactions...")
    list_response = requests.get(
        f"{BASE_URL}/api/transactions?budget_id={budget_id}",
        headers=headers
    )
    
    if list_response.status_code == 200:
        transactions = list_response.json()
        print(f"✅ Found {len(transactions)} transactions")
        for txn in transactions:
            if txn['is_split']:
                print(f"   - SPLIT: ${txn['amount_cents']/100:.2f} across {len(txn['splits'])} categories")
            else:
                print(f"   - {txn.get('category_name', 'N/A')}: ${txn['amount_cents']/100:.2f}")
        print()
    else:
        print(f"❌ Failed to list transactions: {list_response.text}\n")
    
    # Step 8: Get budget summary
    print("8️⃣ Getting budget summary...")
    summary_response = requests.get(
        f"{BASE_URL}/api/transactions/budget/{budget_id}/summary",
        headers=headers
    )
    
    if summary_response.status_code == 200:
        summary = summary_response.json()
        print("✅ Budget summary:")
        for cat in summary['categories']:
            print(f"   - {cat['category_name']}: ${cat['spent_cents']/100:.2f} spent of ${cat['allocated_cents']/100:.2f}")
        print()
    else:
        print(f"❌ Failed to get summary: {summary_response.text}\n")
    
    print("✅ All tests completed!")

if __name__ == "__main__":
    try:
        test_split_transactions()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
