"""
Test script for paycheck planning API
"""
import requests
from datetime import date, timedelta
import json

BASE_URL = "http://localhost:8000"

def test_paycheck_planning():
    # Login
    print("1. Logging in...")
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    
    if login_response.status_code != 200:
        print("✗ Login failed. Make sure test user exists.")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Logged in successfully")
    
    # Create a budget first
    print("\n2. Creating test budget...")
    budget_response = requests.post(f"{BASE_URL}/api/budgets", headers=headers, json={
        "month": 12,
        "year": 2025,
        "income_cents": 500000,
        "categories": [
            {"name": "Rent", "allocated_cents": 150000, "order": 0},
            {"name": "Groceries", "allocated_cents": 50000, "order": 1},
            {"name": "Utilities", "allocated_cents": 20000, "order": 2},
            {"name": "Savings", "allocated_cents": 100000, "order": 3}
        ]
    })
    
    if budget_response.status_code != 201:
        print(f"✗ Budget creation failed: {budget_response.text}")
        return
    
    budget = budget_response.json()["budget"]
    print(f"✓ Budget created: {budget['id']}")
    
    # Create a paycheck schedule
    print("\n3. Creating paycheck schedule...")
    next_paycheck = date.today() + timedelta(days=7)
    paycheck_response = requests.post(f"{BASE_URL}/api/paychecks", headers=headers, json={
        "name": "Main Job",
        "amount_cents": 250000,
        "frequency": "biweekly",
        "next_date": next_paycheck.isoformat(),
        "is_active": True,
        "allocations": [
            {"category_id": budget["categories"][0]["id"], "amount_cents": 75000, "order": 0},
            {"category_id": budget["categories"][1]["id"], "amount_cents": 25000, "order": 1},
            {"category_id": budget["categories"][2]["id"], "amount_cents": 10000, "order": 2},
            {"category_id": budget["categories"][3]["id"], "amount_cents": 50000, "order": 3}
        ]
    })
    
    if paycheck_response.status_code != 201:
        print(f"✗ Paycheck creation failed: {paycheck_response.text}")
        return
    
    paycheck = paycheck_response.json()
    print(f"✓ Paycheck created: {paycheck['id']} - {paycheck['name']}")
    
    # Get paycheck schedule
    print("\n4. Getting paycheck schedule...")
    schedule_response = requests.get(
        f"{BASE_URL}/api/paychecks/{paycheck['id']}/schedule?months_ahead=3",
        headers=headers
    )
    
    if schedule_response.status_code == 200:
        schedule = schedule_response.json()
        print(f"✓ Upcoming paycheck dates:")
        for date_str in schedule["upcoming_dates"][:5]:
            print(f"  - {date_str}")
    else:
        print(f"✗ Failed to get schedule: {schedule_response.text}")
    
    # Auto-allocate paychecks to budget
    print("\n5. Auto-allocating paychecks to budget...")
    auto_response = requests.post(
        f"{BASE_URL}/api/paychecks/budget/{budget['id']}/auto-allocate",
        headers=headers
    )
    
    if auto_response.status_code == 200:
        instances = auto_response.json()
        print(f"✓ Created {len(instances)} paycheck instances")
        for inst in instances:
            print(f"  - ${inst['amount_cents']/100:.2f} on {inst['date']}")
    else:
        print(f"✗ Auto-allocation failed: {auto_response.text}")
    
    # Get budget funding plan
    print("\n6. Getting budget funding plan...")
    funding_response = requests.get(
        f"{BASE_URL}/api/paychecks/budget/{budget['id']}/funding-plan",
        headers=headers
    )
    
    if funding_response.status_code == 200:
        plan = funding_response.json()
        print(f"✓ Budget Funding Plan:")
        print(f"  Total Income: ${plan['total_income_cents']/100:.2f}")
        print(f"  Total Allocated: ${plan['total_allocated_cents']/100:.2f}")
        print(f"  Available: ${plan['available_to_allocate_cents']/100:.2f}")
        print(f"  Fully Funded: {plan['is_fully_funded']}")
    else:
        print(f"✗ Failed to get funding plan: {funding_response.text}")
    
    # Get category funding status
    print("\n7. Getting category funding status...")
    category_funding_response = requests.get(
        f"{BASE_URL}/api/paychecks/budget/{budget['id']}/category-funding",
        headers=headers
    )
    
    if category_funding_response.status_code == 200:
        categories = category_funding_response.json()
        print(f"✓ Category Funding Status:")
        for cat in categories:
            print(f"  {cat['category_name']}:")
            print(f"    Allocated: ${cat['allocated_cents']/100:.2f}")
            print(f"    Funded: ${cat['funded_cents']/100:.2f}")
            print(f"    Remaining: ${cat['remaining_cents']/100:.2f}")
            print(f"    Fully Funded: {cat['is_fully_funded']}")
    else:
        print(f"✗ Failed to get category funding: {category_funding_response.text}")
    
    # List all paychecks
    print("\n8. Listing all paychecks...")
    list_response = requests.get(f"{BASE_URL}/api/paychecks", headers=headers)
    
    if list_response.status_code == 200:
        paychecks = list_response.json()
        print(f"✓ Found {len(paychecks)} paychecks")
        for pc in paychecks:
            print(f"  - {pc['name']}: ${pc['amount_cents']/100:.2f} ({pc['frequency']})")
    else:
        print(f"✗ Failed to list paychecks: {list_response.text}")
    
    print("\n✓ All tests completed!")

if __name__ == "__main__":
    test_paycheck_planning()
