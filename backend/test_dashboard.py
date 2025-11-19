"""
Test the dashboard metrics endpoint
Run with: python test_dashboard.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_dashboard_metrics():
    print("🧪 Testing Dashboard Metrics API\n")
    
    # 1. Login
    print("1. Logging in...")
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "demo@example.com",
        "password": "demo123"
    })
    
    if response.status_code != 200:
        print(f"   ✗ Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   ✓ Login successful\n")
    
    # 2. Get dashboard metrics
    print("2. Fetching dashboard metrics...")
    response = requests.get(f"{BASE_URL}/api/metrics/dashboard", headers=headers)
    
    if response.status_code != 200:
        print(f"   ✗ Failed to fetch metrics: {response.text}")
        return
    
    metrics = response.json()
    print("   ✓ Dashboard metrics retrieved\n")
    
    # 3. Display metrics
    print("📊 Dashboard Metrics:\n")
    
    if metrics.get("budget"):
        budget = metrics["budget"]
        print(f"💰 Budget:")
        print(f"   Income: ${budget['income_cents'] / 100:.2f}")
        print(f"   Allocated: ${budget['allocated_cents'] / 100:.2f}")
        print(f"   Spent: ${budget['spent_cents'] / 100:.2f}")
        print(f"   Available: ${budget['available_cents'] / 100:.2f}\n")
    else:
        print("💰 Budget: No budget for current month\n")
    
    if metrics.get("net_worth"):
        nw = metrics["net_worth"]
        print(f"📈 Net Worth:")
        print(f"   Total: ${nw['net_worth_cents'] / 100:.2f}")
        print(f"   Assets: ${nw['total_assets_cents'] / 100:.2f} ({nw['asset_count']} items)")
        print(f"   Liabilities: ${nw['total_liabilities_cents'] / 100:.2f} ({nw['liability_count']} items)\n")
    
    if metrics.get("goals"):
        goals = metrics["goals"]
        print(f"🎯 Financial Goals:")
        print(f"   Total: {goals['total_goals']}")
        print(f"   Active: {goals['active_goals']}")
        print(f"   Completed: {goals['completed_goals']}")
        print(f"   Progress: ${goals['total_saved_cents'] / 100:.2f} / ${goals['total_target_cents'] / 100:.2f}\n")
    
    if metrics.get("sinking_funds"):
        sf = metrics["sinking_funds"]
        print(f"🏦 Sinking Funds:")
        print(f"   Total Saved: ${sf['total_saved_cents'] / 100:.2f}")
        print(f"   Total Goal: ${sf['total_goal_cents'] / 100:.2f}")
        print(f"   Active Funds: {sf['fund_count']}\n")
    
    if metrics.get("paychecks") and metrics["paychecks"].get("next_paycheck"):
        pc = metrics["paychecks"]["next_paycheck"]
        print(f"💵 Next Paycheck:")
        print(f"   Amount: ${pc['amount_cents'] / 100:.2f}")
        print(f"   Date: {pc['pay_date']}\n")
    
    if metrics.get("transactions"):
        print(f"📝 Transactions This Month: {metrics['transactions']['count_this_month']}\n")
    
    print("✅ All dashboard metrics retrieved successfully!")

if __name__ == "__main__":
    test_dashboard_metrics()
