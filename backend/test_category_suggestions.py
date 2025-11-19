#!/usr/bin/env python3
"""
Test script for Category Suggestions feature
Tests the smart categorization API endpoints
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_category_suggestions():
    """Test the category suggestions feature"""
    
    print_section("Category Suggestions Feature Test")
    
    # Step 1: Login
    print("\n1. Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    
    if login_response.status_code != 200:
        print("❌ Login failed. Please ensure user exists.")
        print(f"   Response: {login_response.text}")
        return False
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Login successful")
    
    # Step 2: Get budgets
    print("\n2. Fetching budgets...")
    budgets_response = requests.get(f"{BASE_URL}/api/budgets", headers=headers)
    
    if budgets_response.status_code != 200 or not budgets_response.json():
        print("❌ No budgets found. Please create a budget first.")
        return False
    
    budget = budgets_response.json()[0]
    budget_id = budget["id"]
    print(f"✓ Using budget: {budget['month']}/{budget['year']} (ID: {budget_id})")
    
    # Step 3: Get budget details with categories
    print("\n3. Fetching categories...")
    budget_detail_response = requests.get(
        f"{BASE_URL}/api/budgets/{budget_id}",
        headers=headers
    )
    
    if budget_detail_response.status_code != 200:
        print("❌ Failed to fetch budget details")
        return False
    
    categories = budget_detail_response.json()["budget"]["categories"]
    if not categories:
        print("❌ No categories found. Please add categories to the budget.")
        return False
    
    print(f"✓ Found {len(categories)} categories")
    for cat in categories[:3]:
        print(f"   - {cat['name']} (ID: {cat['id']})")
    
    # Step 4: Create some test transactions to build history
    print("\n4. Creating test transactions to build history...")
    test_transactions = [
        {"notes": "Grocery shopping at Walmart", "amount": 50.00, "category": categories[0]["id"]},
        {"notes": "Walmart groceries", "amount": 45.00, "category": categories[0]["id"]},
        {"notes": "Coffee at Starbucks", "amount": 5.50, "category": categories[1]["id"] if len(categories) > 1 else categories[0]["id"]},
        {"notes": "Starbucks morning coffee", "amount": 6.00, "category": categories[1]["id"] if len(categories) > 1 else categories[0]["id"]},
    ]
    
    created_transactions = []
    for trans in test_transactions:
        trans_response = requests.post(
            f"{BASE_URL}/api/transactions",
            headers=headers,
            json={
                "budget_id": budget_id,
                "category_id": trans["category"],
                "amount_cents": int(trans["amount"] * 100),
                "date": datetime.now().strftime("%Y-%m-%d"),
                "notes": trans["notes"],
                "is_split": False,
                "splits": []
            }
        )
        
        if trans_response.status_code == 201:
            created_transactions.append(trans_response.json()["id"])
            print(f"✓ Created: {trans['notes']}")
        else:
            print(f"⚠ Failed to create: {trans['notes']}")
    
    # Step 5: Test suggestions with exact match
    print("\n5. Testing suggestions (exact match)...")
    suggestion_request = {
        "budget_id": budget_id,
        "notes": "Grocery shopping at Walmart",
        "amount_cents": 5000
    }
    
    suggestions_response = requests.post(
        f"{BASE_URL}/api/category-suggestions/suggest?limit=3",
        headers=headers,
        json=suggestion_request
    )
    
    if suggestions_response.status_code != 200:
        print(f"❌ Failed to get suggestions: {suggestions_response.text}")
        return False
    
    suggestions = suggestions_response.json()["suggestions"]
    print(f"✓ Received {len(suggestions)} suggestions:")
    for i, sug in enumerate(suggestions, 1):
        print(f"   {i}. {sug['category_name']} ({sug['confidence']*100:.0f}% - {sug['reason']})")
    
    # Step 6: Test suggestions with keyword match
    print("\n6. Testing suggestions (keyword match)...")
    suggestion_request = {
        "budget_id": budget_id,
        "notes": "Shopping at Walmart for food",
        "amount_cents": 4500
    }
    
    suggestions_response = requests.post(
        f"{BASE_URL}/api/category-suggestions/suggest?limit=3",
        headers=headers,
        json=suggestion_request
    )
    
    if suggestions_response.status_code == 200:
        suggestions = suggestions_response.json()["suggestions"]
        print(f"✓ Received {len(suggestions)} suggestions:")
        for i, sug in enumerate(suggestions, 1):
            print(f"   {i}. {sug['category_name']} ({sug['confidence']*100:.0f}% - {sug['reason']})")
    
    # Step 7: Test feedback submission
    print("\n7. Testing feedback submission...")
    if suggestions:
        feedback = {
            "transaction_id": created_transactions[0] if created_transactions else None,
            "suggested_category_id": suggestions[0]["category_id"],
            "actual_category_id": suggestions[0]["category_id"],
            "pattern_text": "shopping at walmart for food"
        }
        
        feedback_response = requests.post(
            f"{BASE_URL}/api/category-suggestions/feedback",
            headers=headers,
            json=feedback
        )
        
        if feedback_response.status_code == 204:
            print("✓ Feedback submitted successfully")
        else:
            print(f"⚠ Feedback submission failed: {feedback_response.text}")
    
    # Step 8: Test statistics
    print("\n8. Testing statistics endpoint...")
    stats_response = requests.get(
        f"{BASE_URL}/api/category-suggestions/stats?days=30",
        headers=headers
    )
    
    if stats_response.status_code != 200:
        print(f"❌ Failed to get statistics: {stats_response.text}")
        return False
    
    stats = stats_response.json()
    print("✓ Statistics retrieved:")
    print(f"   Total suggestions: {stats['total_suggestions']}")
    print(f"   Accepted: {stats['accepted']}")
    print(f"   Rejected: {stats['rejected']}")
    print(f"   Accuracy: {stats['accuracy']:.2f}%")
    
    # Step 9: Cleanup (optional)
    print("\n9. Cleaning up test transactions...")
    for trans_id in created_transactions:
        delete_response = requests.delete(
            f"{BASE_URL}/api/transactions/{trans_id}",
            headers=headers
        )
        if delete_response.status_code == 204:
            print(f"✓ Deleted transaction {trans_id}")
    
    print_section("All Tests Passed! ✓")
    return True

if __name__ == "__main__":
    try:
        success = test_category_suggestions()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
