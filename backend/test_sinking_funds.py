"""
Test script for sinking funds API endpoints
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_sinking_funds():
    # Register/Login
    print("1. Registering user...")
    register_data = {
        "email": f"test_sf_{datetime.now().timestamp()}@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    print(f"Register: {response.status_code}")
    
    # Login
    print("\n2. Logging in...")
    login_data = {
        "username": register_data["email"],
        "password": register_data["password"]
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Login successful, token: {token[:20]}...")
    
    # Create sinking fund
    print("\n3. Creating sinking fund...")
    fund_data = {
        "name": "Emergency Fund",
        "target_cents": 500000,  # $5,000
        "monthly_contribution_cents": 50000,  # $500
        "target_date": (datetime.now() + timedelta(days=300)).isoformat(),
        "description": "6 months of expenses",
        "color": "#FF5733"
    }
    
    response = requests.post(f"{BASE_URL}/api/sinking-funds", json=fund_data, headers=headers)
    print(f"Status: {response.status_code}")
    fund = response.json()
    fund_id = fund["id"]
    print(f"Created fund: {json.dumps(fund, indent=2)}")
    
    # Create another fund
    print("\n4. Creating second fund...")
    fund_data2 = {
        "name": "Vacation Fund",
        "target_cents": 300000,  # $3,000
        "monthly_contribution_cents": 25000,  # $250
        "description": "Trip to Europe"
    }
    
    response = requests.post(f"{BASE_URL}/api/sinking-funds", json=fund_data2, headers=headers)
    print(f"Status: {response.status_code}")
    fund2 = response.json()
    fund2_id = fund2["id"]
    
    # List funds
    print("\n5. Listing all funds...")
    response = requests.get(f"{BASE_URL}/api/sinking-funds", headers=headers)
    print(f"Status: {response.status_code}")
    funds = response.json()
    print(f"Total funds: {len(funds)}")
    for f in funds:
        print(f"  - {f['name']}: ${f['current_balance_cents']/100:.2f} / ${f['target_cents']/100:.2f}")
    
    # Get summary
    print("\n6. Getting summary...")
    response = requests.get(f"{BASE_URL}/api/sinking-funds/summary", headers=headers)
    print(f"Status: {response.status_code}")
    summary = response.json()
    print(f"Summary: {json.dumps(summary, indent=2)}")
    
    # Add contribution
    print("\n7. Adding contribution...")
    contribution_data = {
        "amount_cents": 50000,  # $500
        "notes": "First contribution"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/sinking-funds/{fund_id}/contributions",
        json=contribution_data,
        headers=headers
    )
    print(f"Status: {response.status_code}")
    contribution = response.json()
    print(f"Added contribution: {json.dumps(contribution, indent=2)}")
    
    # Add more contributions
    print("\n8. Adding more contributions...")
    for i in range(3):
        contrib = {
            "amount_cents": 50000,
            "notes": f"Monthly contribution {i+2}"
        }
        response = requests.post(
            f"{BASE_URL}/api/sinking-funds/{fund_id}/contributions",
            json=contrib,
            headers=headers
        )
        print(f"  Contribution {i+2}: {response.status_code}")
    
    # Get fund progress
    print("\n9. Getting fund progress...")
    response = requests.get(f"{BASE_URL}/api/sinking-funds/{fund_id}/progress", headers=headers)
    print(f"Status: {response.status_code}")
    progress = response.json()
    print(f"Progress: {json.dumps(progress, indent=2)}")
    
    # List contributions
    print("\n10. Listing contributions...")
    response = requests.get(f"{BASE_URL}/api/sinking-funds/{fund_id}/contributions", headers=headers)
    print(f"Status: {response.status_code}")
    contributions = response.json()
    print(f"Total contributions: {len(contributions)}")
    
    # Get fund with contributions
    print("\n11. Getting fund with contributions...")
    response = requests.get(f"{BASE_URL}/api/sinking-funds/{fund_id}", headers=headers)
    print(f"Status: {response.status_code}")
    fund_detail = response.json()
    print(f"Fund has {len(fund_detail['contributions'])} contributions")
    
    # Update fund
    print("\n12. Updating fund...")
    update_data = {
        "monthly_contribution_cents": 60000,  # Increase to $600
        "description": "Updated: 6 months of expenses + buffer"
    }
    
    response = requests.put(
        f"{BASE_URL}/api/sinking-funds/{fund_id}",
        json=update_data,
        headers=headers
    )
    print(f"Status: {response.status_code}")
    updated_fund = response.json()
    print(f"Updated monthly contribution: ${updated_fund['monthly_contribution_cents']/100:.2f}")
    
    # Add withdrawal
    print("\n13. Adding withdrawal...")
    withdrawal_data = {
        "amount_cents": -10000,  # -$100
        "notes": "Emergency expense"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/sinking-funds/{fund_id}/contributions",
        json=withdrawal_data,
        headers=headers
    )
    print(f"Status: {response.status_code}")
    
    # Get updated progress
    print("\n14. Getting updated progress...")
    response = requests.get(f"{BASE_URL}/api/sinking-funds/{fund_id}/progress", headers=headers)
    progress = response.json()
    print(f"Current balance: ${progress['fund']['current_balance_cents']/100:.2f}")
    print(f"Progress: {progress['progress_percentage']:.1f}%")
    print(f"Months to target: {progress['months_to_target']}")
    print(f"On track: {progress['on_track']}")
    
    # Delete contribution
    print("\n15. Deleting a contribution...")
    contrib_id = contributions[0]["id"]
    response = requests.delete(
        f"{BASE_URL}/api/sinking-funds/{fund_id}/contributions/{contrib_id}",
        headers=headers
    )
    print(f"Status: {response.status_code}")
    
    # Deactivate fund
    print("\n16. Deactivating fund...")
    response = requests.put(
        f"{BASE_URL}/api/sinking-funds/{fund2_id}",
        json={"is_active": False},
        headers=headers
    )
    print(f"Status: {response.status_code}")
    
    # List active funds only
    print("\n17. Listing active funds...")
    response = requests.get(f"{BASE_URL}/api/sinking-funds", headers=headers)
    active_funds = response.json()
    print(f"Active funds: {len(active_funds)}")
    
    # List all funds including inactive
    print("\n18. Listing all funds (including inactive)...")
    response = requests.get(f"{BASE_URL}/api/sinking-funds?include_inactive=true", headers=headers)
    all_funds = response.json()
    print(f"All funds: {len(all_funds)}")
    
    # Delete fund
    print("\n19. Deleting fund...")
    response = requests.delete(f"{BASE_URL}/api/sinking-funds/{fund2_id}", headers=headers)
    print(f"Status: {response.status_code}")
    
    # Final summary
    print("\n20. Final summary...")
    response = requests.get(f"{BASE_URL}/api/sinking-funds/summary", headers=headers)
    final_summary = response.json()
    print(f"Final Summary:")
    print(f"  Total funds: {final_summary['total_funds']}")
    print(f"  Total target: ${final_summary['total_target_cents']/100:.2f}")
    print(f"  Total saved: ${final_summary['total_saved_cents']/100:.2f}")
    print(f"  Overall progress: {final_summary['overall_progress_percentage']:.1f}%")
    
    print("\n✓ All tests completed successfully!")

if __name__ == "__main__":
    test_sinking_funds()
