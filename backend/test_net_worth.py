#!/usr/bin/env python3
"""
Test script for net worth API endpoints
"""
import requests
from datetime import date, timedelta
import json

BASE_URL = "http://localhost:8000"

def test_net_worth_api():
    """Test net worth API endpoints"""
    
    # Login
    print("1. Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    
    if login_response.status_code != 200:
        print("Login failed. Please ensure test user exists.")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create assets
    print("\n2. Creating assets...")
    assets = [
        {
            "name": "Chase Checking",
            "asset_type": "checking",
            "current_value": 5000.00,
            "institution": "Chase Bank",
            "account_number_last4": "1234",
            "is_liquid": True,
            "is_active": True
        },
        {
            "name": "Vanguard 401k",
            "asset_type": "retirement",
            "current_value": 75000.00,
            "institution": "Vanguard",
            "is_liquid": False,
            "is_active": True
        },
        {
            "name": "Home",
            "asset_type": "real_estate",
            "current_value": 350000.00,
            "notes": "Primary residence",
            "is_liquid": False,
            "is_active": True
        }
    ]
    
    created_assets = []
    for asset in assets:
        response = requests.post(
            f"{BASE_URL}/api/net-worth/assets",
            headers=headers,
            json=asset
        )
        if response.status_code == 200:
            created_asset = response.json()
            created_assets.append(created_asset)
            print(f"   Created asset: {created_asset['name']} - ${created_asset['current_value']:,.2f}")
        else:
            print(f"   Failed to create asset: {response.text}")
    
    # Create liabilities
    print("\n3. Creating liabilities...")
    liabilities = [
        {
            "name": "Mortgage",
            "liability_type": "mortgage",
            "current_balance": 280000.00,
            "interest_rate": 3.5,
            "minimum_payment": 1500.00,
            "institution": "Wells Fargo",
            "is_active": True
        },
        {
            "name": "Car Loan",
            "liability_type": "auto_loan",
            "current_balance": 15000.00,
            "interest_rate": 4.2,
            "minimum_payment": 350.00,
            "institution": "Toyota Financial",
            "is_active": True
        },
        {
            "name": "Credit Card",
            "liability_type": "credit_card",
            "current_balance": 2500.00,
            "interest_rate": 18.9,
            "minimum_payment": 75.00,
            "institution": "Capital One",
            "account_number_last4": "5678",
            "is_active": True
        }
    ]
    
    created_liabilities = []
    for liability in liabilities:
        response = requests.post(
            f"{BASE_URL}/api/net-worth/liabilities",
            headers=headers,
            json=liability
        )
        if response.status_code == 200:
            created_liability = response.json()
            created_liabilities.append(created_liability)
            print(f"   Created liability: {created_liability['name']} - ${created_liability['current_balance']:,.2f}")
        else:
            print(f"   Failed to create liability: {response.text}")
    
    # Get all assets
    print("\n4. Getting all assets...")
    response = requests.get(f"{BASE_URL}/api/net-worth/assets", headers=headers)
    if response.status_code == 200:
        assets = response.json()
        print(f"   Found {len(assets)} assets")
        for asset in assets:
            print(f"   - {asset['name']}: ${asset['current_value']:,.2f} ({asset['asset_type']})")
    
    # Get all liabilities
    print("\n5. Getting all liabilities...")
    response = requests.get(f"{BASE_URL}/api/net-worth/liabilities", headers=headers)
    if response.status_code == 200:
        liabilities = response.json()
        print(f"   Found {len(liabilities)} liabilities")
        for liability in liabilities:
            print(f"   - {liability['name']}: ${liability['current_balance']:,.2f} ({liability['liability_type']})")
    
    # Create snapshot
    print("\n6. Creating net worth snapshot...")
    response = requests.post(f"{BASE_URL}/api/net-worth/snapshots", headers=headers)
    if response.status_code == 200:
        print(f"   {response.json()['message']}")
    
    # Get summary
    print("\n7. Getting net worth summary...")
    response = requests.get(f"{BASE_URL}/api/net-worth/summary", headers=headers)
    if response.status_code == 200:
        summary = response.json()
        print(f"   Current Net Worth: ${summary['current_net_worth']:,.2f}")
        print(f"   Total Assets: ${summary['total_assets']:,.2f}")
        print(f"   Total Liabilities: ${summary['total_liabilities']:,.2f}")
        print(f"   Liquid Assets: ${summary['liquid_assets']:,.2f}")
        print(f"   Asset Count: {summary['asset_count']}")
        print(f"   Liability Count: {summary['liability_count']}")
    
    # Get asset breakdown
    print("\n8. Getting asset breakdown...")
    response = requests.get(f"{BASE_URL}/api/net-worth/breakdown/assets", headers=headers)
    if response.status_code == 200:
        breakdown = response.json()
        print("   Asset Breakdown:")
        for item in breakdown:
            print(f"   - {item['asset_type']}: ${item['total_value']:,.2f} ({item['percentage']:.1f}%)")
    
    # Get liability breakdown
    print("\n9. Getting liability breakdown...")
    response = requests.get(f"{BASE_URL}/api/net-worth/breakdown/liabilities", headers=headers)
    if response.status_code == 200:
        breakdown = response.json()
        print("   Liability Breakdown:")
        for item in breakdown:
            print(f"   - {item['liability_type']}: ${item['total_balance']:,.2f} ({item['percentage']:.1f}%)")
            print(f"     Interest Rate: {item['total_interest_rate']:.2f}%, Min Payment: ${item['total_minimum_payment']:,.2f}")
    
    # Get projection
    print("\n10. Getting 12-month projection...")
    response = requests.get(f"{BASE_URL}/api/net-worth/projection?months=12", headers=headers)
    if response.status_code == 200:
        projection = response.json()
        print(f"   Projected Net Worth (12 months): ${projection['projected_net_worth']:,.2f}")
        print(f"   Projected Assets: ${projection['projected_assets']:,.2f}")
        print(f"   Projected Liabilities: ${projection['projected_liabilities']:,.2f}")
        print(f"   Assumptions: {json.dumps(projection['assumptions'], indent=2)}")
    
    # Get alerts
    print("\n11. Getting alerts...")
    response = requests.get(f"{BASE_URL}/api/net-worth/alerts", headers=headers)
    if response.status_code == 200:
        alerts = response.json()
        if alerts:
            print(f"   Found {len(alerts)} alerts:")
            for alert in alerts:
                print(f"   - [{alert['severity'].upper()}] {alert['message']}")
        else:
            print("   No alerts")
    
    # Update asset value
    if created_assets:
        print("\n12. Updating asset value...")
        asset_id = created_assets[0]['id']
        response = requests.put(
            f"{BASE_URL}/api/net-worth/assets/{asset_id}",
            headers=headers,
            json={"current_value": 5500.00}
        )
        if response.status_code == 200:
            updated_asset = response.json()
            print(f"   Updated {updated_asset['name']} to ${updated_asset['current_value']:,.2f}")
    
    # Get trends
    print("\n13. Getting trends...")
    response = requests.get(f"{BASE_URL}/api/net-worth/trends?months=6", headers=headers)
    if response.status_code == 200:
        trends = response.json()
        print(f"   Found {len(trends)} trend data points")
        for trend in trends[:5]:  # Show first 5
            print(f"   - {trend['date']}: Net Worth ${trend['net_worth']:,.2f}")
    
    print("\n✅ Net worth API tests completed!")

if __name__ == "__main__":
    test_net_worth_api()
