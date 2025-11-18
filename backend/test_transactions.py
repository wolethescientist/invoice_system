#!/usr/bin/env python3
"""
Test script for transactions API
"""
import requests
import json
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def test_transactions():
    print("=== Testing Transactions API ===\n")
    
    # 1. Register/Login
    print("1. Logging in...")
    login_data = {
        "username": "test@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
    if response.status_code != 200:
        print("Login failed, trying to register...")
        register_data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        if response.status_code != 201:
            print(f"Registration failed: {response.text}")
            return
        
        response = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Logged in successfully\n")
    
    # 2. Create a budget
    print("2. Creating a test budget...")
    budget_data = {
        "month": 11,
        "year": 2025,
        "income_cents": 500000,  # $5000
        "categories": [
            {"name": "Groceries", "allocated_cents": 50000, "order": 0},
            {"name": "Gas", "allocated_cents": 20000, "order": 1},
            {"name": "Entertainment", "allocated_cents": 15000, "order": 2},
        ]
    }
    
    response = requests.post(f"{BASE_URL}/api/budgets", json=budget_data, headers=headers)
    if response.status_code == 400 and "already exists" in response.text:
        print("Budget already exists, fetching it...")
        response = requests.get(f"{BASE_URL}/api/budgets/period/2025/11", headers=headers)
    
    budget = response.json()["budget"]
    budget_id = budget["id"]
    categories = budget["categories"]
    print(f"✓ Budget created/fetched: ID {budget_id}\n")
    
    # 3. Create transactions
    print("3. Creating transactions...")
    transactions = [
        {
            "budget_id": budget_id,
            "category_id": categories[0]["id"],
            "amount_cents": 4599,  # $45.99
            "date": str(date.today() - timedelta(days=2)),
            "notes": "Whole Foods shopping"
        },
        {
            "budget_id": budget_id,
            "category_id": categories[0]["id"],
            "amount_cents": 8250,  # $82.50
            "date": str(date.today() - timedelta(days=1)),
            "notes": "Costco run"
        },
        {
            "budget_id": budget_id,
            "category_id": categories[1]["id"],
            "amount_cents": 5500,  # $55.00
            "date": str(date.today()),
            "notes": "Gas station fill-up"
        },
        {
            "budget_id": budget_id,
            "category_id": categories[2]["id"],
            "amount_cents": 2999,  # $29.99
            "date": str(date.today()),
            "notes": "Movie tickets"
        }
    ]
    
    created_transactions = []
    for trans in transactions:
        response = requests.post(f"{BASE_URL}/api/transactions", json=trans, headers=headers)
        if response.status_code == 201:
            created_transactions.append(response.json())
            print(f"✓ Created transaction: {trans['notes']} - ${trans['amount_cents']/100:.2f}")
        else:
            print(f"✗ Failed to create transaction: {response.text}")
    
    print()
    
    # 4. List all transactions
    print("4. Listing all transactions...")
    response = requests.get(f"{BASE_URL}/api/transactions", headers=headers)
    all_transactions = response.json()
    print(f"✓ Found {len(all_transactions)} total transactions\n")
    
    # 5. Filter by budget
    print("5. Filtering transactions by budget...")
    response = requests.get(f"{BASE_URL}/api/transactions?budget_id={budget_id}", headers=headers)
    budget_transactions = response.json()
    print(f"✓ Found {len(budget_transactions)} transactions for this budget\n")
    
    # 6. Filter by category
    print("6. Filtering transactions by category (Groceries)...")
    response = requests.get(
        f"{BASE_URL}/api/transactions?category_id={categories[0]['id']}", 
        headers=headers
    )
    category_transactions = response.json()
    print(f"✓ Found {len(category_transactions)} transactions for Groceries\n")
    
    # 7. Get budget transaction summary
    print("7. Getting budget transaction summary...")
    response = requests.get(
        f"{BASE_URL}/api/transactions/budget/{budget_id}/summary", 
        headers=headers
    )
    summary = response.json()
    print(f"✓ Budget Summary:")
    for cat in summary["categories"]:
        allocated = cat["allocated_cents"] / 100
        spent = cat["spent_cents"] / 100
        remaining = cat["remaining_cents"] / 100
        percent = (spent / allocated * 100) if allocated > 0 else 0
        print(f"  {cat['category_name']}: ${spent:.2f} / ${allocated:.2f} ({percent:.1f}%) - ${remaining:.2f} remaining")
    print()
    
    # 8. Update a transaction
    if created_transactions:
        print("8. Updating a transaction...")
        trans_id = created_transactions[0]["id"]
        update_data = {
            "amount_cents": 5000,  # Change to $50.00
            "notes": "Whole Foods shopping (updated)"
        }
        response = requests.put(
            f"{BASE_URL}/api/transactions/{trans_id}", 
            json=update_data, 
            headers=headers
        )
        if response.status_code == 200:
            print(f"✓ Updated transaction {trans_id}\n")
        else:
            print(f"✗ Failed to update: {response.text}\n")
    
    # 9. Get single transaction
    if created_transactions:
        print("9. Getting single transaction...")
        trans_id = created_transactions[0]["id"]
        response = requests.get(f"{BASE_URL}/api/transactions/{trans_id}", headers=headers)
        if response.status_code == 200:
            trans = response.json()
            print(f"✓ Transaction {trans_id}: ${trans['amount_cents']/100:.2f} - {trans['notes']}\n")
        else:
            print(f"✗ Failed to get transaction: {response.text}\n")
    
    # 10. Delete a transaction
    if created_transactions and len(created_transactions) > 1:
        print("10. Deleting a transaction...")
        trans_id = created_transactions[-1]["id"]
        response = requests.delete(f"{BASE_URL}/api/transactions/{trans_id}", headers=headers)
        if response.status_code == 204:
            print(f"✓ Deleted transaction {trans_id}\n")
        else:
            print(f"✗ Failed to delete: {response.text}\n")
    
    print("=== All tests completed! ===")

if __name__ == "__main__":
    test_transactions()
