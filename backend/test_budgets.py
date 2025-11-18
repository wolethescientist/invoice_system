"""
Test script for budget API endpoints.
Run this after starting the backend server to test the budget feature.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_budgets():
    print("Testing Budget API Endpoints\n")
    
    # 1. Register/Login
    print("1. Logging in...")
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    # Try to register first
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=login_data)
        if response.status_code == 201:
            print("   ✓ User registered")
    except:
        pass
    
    # Login
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"   ✓ Logged in successfully")
    else:
        print(f"   ✗ Login failed: {response.text}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create a budget
    print("\n2. Creating a budget...")
    budget_data = {
        "month": 12,
        "year": 2025,
        "income_cents": 500000,  # $5000
        "categories": [
            {"name": "Rent", "allocated_cents": 150000, "order": 0},
            {"name": "Groceries", "allocated_cents": 60000, "order": 1},
            {"name": "Transportation", "allocated_cents": 30000, "order": 2},
            {"name": "Savings", "allocated_cents": 100000, "order": 3},
            {"name": "Entertainment", "allocated_cents": 20000, "order": 4},
            {"name": "Utilities", "allocated_cents": 40000, "order": 5},
            {"name": "Miscellaneous", "allocated_cents": 100000, "order": 6},
        ]
    }
    
    response = requests.post(f"{BASE_URL}/api/budgets", json=budget_data, headers=headers)
    if response.status_code == 201:
        budget = response.json()
        budget_id = budget["budget"]["id"]
        print(f"   ✓ Budget created (ID: {budget_id})")
        print(f"   - Income: ${budget['budget']['income_cents'] / 100:.2f}")
        print(f"   - Allocated: ${budget['total_allocated_cents'] / 100:.2f}")
        print(f"   - Remaining: ${budget['remaining_cents'] / 100:.2f}")
        print(f"   - Balanced: {budget['is_balanced']}")
    else:
        print(f"   ✗ Failed to create budget: {response.text}")
        return
    
    # 3. List budgets
    print("\n3. Listing all budgets...")
    response = requests.get(f"{BASE_URL}/api/budgets", headers=headers)
    if response.status_code == 200:
        budgets = response.json()
        print(f"   ✓ Found {len(budgets)} budget(s)")
        for b in budgets:
            print(f"   - {b['month']}/{b['year']}: ${b['income_cents'] / 100:.2f}")
    else:
        print(f"   ✗ Failed to list budgets: {response.text}")
    
    # 4. Get specific budget
    print(f"\n4. Getting budget {budget_id}...")
    response = requests.get(f"{BASE_URL}/api/budgets/{budget_id}", headers=headers)
    if response.status_code == 200:
        budget = response.json()
        print(f"   ✓ Budget retrieved")
        print(f"   - Categories: {len(budget['budget']['categories'])}")
        for cat in budget['budget']['categories']:
            print(f"     • {cat['name']}: ${cat['allocated_cents'] / 100:.2f}")
    else:
        print(f"   ✗ Failed to get budget: {response.text}")
    
    # 5. Update budget
    print(f"\n5. Updating budget {budget_id}...")
    update_data = {
        "income_cents": 550000,  # $5500
        "categories": [
            {"name": "Rent", "allocated_cents": 150000, "order": 0},
            {"name": "Groceries", "allocated_cents": 70000, "order": 1},
            {"name": "Transportation", "allocated_cents": 30000, "order": 2},
            {"name": "Savings", "allocated_cents": 150000, "order": 3},
            {"name": "Entertainment", "allocated_cents": 30000, "order": 4},
            {"name": "Utilities", "allocated_cents": 40000, "order": 5},
            {"name": "Miscellaneous", "allocated_cents": 80000, "order": 6},
        ]
    }
    
    response = requests.put(f"{BASE_URL}/api/budgets/{budget_id}", json=update_data, headers=headers)
    if response.status_code == 200:
        budget = response.json()
        print(f"   ✓ Budget updated")
        print(f"   - New Income: ${budget['budget']['income_cents'] / 100:.2f}")
        print(f"   - Balanced: {budget['is_balanced']}")
    else:
        print(f"   ✗ Failed to update budget: {response.text}")
    
    # 6. Get by period
    print("\n6. Getting budget by period (12/2025)...")
    response = requests.get(f"{BASE_URL}/api/budgets/period/2025/12", headers=headers)
    if response.status_code == 200:
        budget = response.json()
        print(f"   ✓ Budget found for 12/2025")
    else:
        print(f"   ✗ Failed to get budget by period: {response.text}")
    
    # 7. Delete budget
    print(f"\n7. Deleting budget {budget_id}...")
    response = requests.delete(f"{BASE_URL}/api/budgets/{budget_id}", headers=headers)
    if response.status_code == 204:
        print(f"   ✓ Budget deleted")
    else:
        print(f"   ✗ Failed to delete budget: {response.text}")
    
    print("\n✓ All tests completed!")

if __name__ == "__main__":
    try:
        test_budgets()
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to the API. Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"✗ Error: {e}")
