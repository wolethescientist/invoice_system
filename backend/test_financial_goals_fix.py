"""
Test script to verify financial goals API fix
"""
import requests
import json
from datetime import date, timedelta

# Configuration
BASE_URL = "http://localhost:8000"  # Change if your backend runs on a different port
API_URL = f"{BASE_URL}/api"

def test_create_goal():
    """Test creating a financial goal with the fixed schema"""
    
    # First, login to get a token (adjust credentials as needed)
    login_data = {
        "username": "test@example.com",  # Change to your test user
        "password": "testpassword"
    }
    
    print("1. Logging in...")
    login_response = requests.post(f"{API_URL}/auth/login", data=login_data)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # Create a test goal
    goal_data = {
        "name": "Emergency Fund",
        "description": "Build 6 months of expenses",
        "goal_type": "emergency_fund",
        "target_amount": 10000.00,  # Sending as dollars
        "monthly_contribution": 500.00,  # Sending as dollars
        "target_date": (date.today() + timedelta(days=365)).isoformat(),
        "start_date": date.today().isoformat(),
        "priority": 1,
        "notes": "High priority savings goal"
    }
    
    print("\n2. Creating financial goal...")
    print(f"Request data: {json.dumps(goal_data, indent=2)}")
    
    create_response = requests.post(
        f"{API_URL}/financial-goals/",
        json=goal_data,
        headers=headers
    )
    
    print(f"\nResponse status: {create_response.status_code}")
    
    if create_response.status_code == 200:
        print("✅ Goal created successfully!")
        goal = create_response.json()
        print(f"\nCreated goal:")
        print(f"  ID: {goal['id']}")
        print(f"  Name: {goal['name']}")
        print(f"  Target Amount: ${goal['target_amount']:.2f}")
        print(f"  Monthly Contribution: ${goal['monthly_contribution']:.2f}")
        print(f"  Current Amount: ${goal['current_amount']:.2f}")
        return goal['id']
    else:
        print(f"❌ Failed to create goal: {create_response.status_code}")
        print(create_response.text)
        return None

if __name__ == "__main__":
    print("Testing Financial Goals API Fix")
    print("=" * 50)
    test_create_goal()
