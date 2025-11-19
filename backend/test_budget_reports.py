#!/usr/bin/env python3
"""
Test script for budget reports API
"""
import requests
import json
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def test_reports():
    # Login
    print("1. Logging in...")
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    
    if login_response.status_code != 200:
        print("✗ Login failed")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Login successful")
    
    # Set date range
    end_date = date.today()
    start_date = end_date - timedelta(days=90)
    
    # Test spending report
    print("\n2. Testing spending report...")
    spending_response = requests.post(
        f"{BASE_URL}/api/reports/spending",
        headers=headers,
        json={
            "report_type": "spending",
            "date_range_start": start_date.isoformat(),
            "date_range_end": end_date.isoformat(),
            "group_by": "month"
        }
    )
    
    if spending_response.status_code == 200:
        data = spending_response.json()
        print(f"✓ Spending report generated")
        print(f"  Total spent: ${data['total_spent_cents'] / 100:.2f}")
        print(f"  Transactions: {data['transaction_count']}")
        print(f"  Categories: {len(data['by_category'])}")
    else:
        print(f"✗ Failed: {spending_response.text}")
    
    # Test income report
    print("\n3. Testing income report...")
    income_response = requests.post(
        f"{BASE_URL}/api/reports/income",
        headers=headers,
        json={
            "report_type": "income",
            "date_range_start": start_date.isoformat(),
            "date_range_end": end_date.isoformat()
        }
    )
    
    if income_response.status_code == 200:
        data = income_response.json()
        print(f"✓ Income report generated")
        print(f"  Total income: ${data['total_income_cents'] / 100:.2f}")
        print(f"  Budgets: {data['budget_count']}")
    else:
        print(f"✗ Failed: {income_response.text}")
    
    # Test category report
    print("\n4. Testing category report...")
    category_response = requests.post(
        f"{BASE_URL}/api/reports/category",
        headers=headers,
        json={
            "report_type": "category",
            "date_range_start": start_date.isoformat(),
            "date_range_end": end_date.isoformat()
        }
    )
    
    if category_response.status_code == 200:
        data = category_response.json()
        print(f"✓ Category report generated")
        print(f"  Categories analyzed: {len(data)}")
        if data:
            print(f"  Sample: {data[0]['category_name']} - {data[0]['utilization_percentage']:.1f}% utilized")
    else:
        print(f"✗ Failed: {category_response.text}")
    
    # Test trend report
    print("\n5. Testing trend report...")
    trend_response = requests.post(
        f"{BASE_URL}/api/reports/trends",
        headers=headers,
        json={
            "report_type": "trend",
            "date_range_start": start_date.isoformat(),
            "date_range_end": end_date.isoformat(),
            "group_by": "month"
        }
    )
    
    if trend_response.status_code == 200:
        data = trend_response.json()
        print(f"✓ Trend report generated")
        print(f"  Growth rate: {data['growth_rate']:.1f}%")
        print(f"  Periods: {len(data['trends'])}")
        if data.get('forecast'):
            print(f"  Forecast periods: {len(data['forecast'])}")
    else:
        print(f"✗ Failed: {trend_response.text}")
    
    # Test comparison report
    print("\n6. Testing comparison report...")
    comparison_response = requests.post(
        f"{BASE_URL}/api/reports/comparison",
        headers=headers,
        json={
            "report_type": "comparison",
            "date_range_start": start_date.isoformat(),
            "date_range_end": end_date.isoformat()
        }
    )
    
    if comparison_response.status_code == 200:
        data = comparison_response.json()
        print(f"✓ Comparison report generated")
        print(f"  Budgets compared: {len(data['budgets'])}")
        print(f"  Avg utilization: {data['avg_utilization']:.1f}%")
    else:
        print(f"✗ Failed: {comparison_response.text}")
    
    # Test dashboard summary
    print("\n7. Testing dashboard summary...")
    dashboard_response = requests.get(
        f"{BASE_URL}/api/reports/dashboard?months=3",
        headers=headers
    )
    
    if dashboard_response.status_code == 200:
        data = dashboard_response.json()
        print(f"✓ Dashboard summary retrieved")
        print(f"  Total spent: ${data['total_spent_cents'] / 100:.2f}")
        print(f"  Total income: ${data['total_income_cents'] / 100:.2f}")
        print(f"  Top categories: {len(data['top_categories'])}")
    else:
        print(f"✗ Failed: {dashboard_response.text}")
    
    # Test saved reports
    print("\n8. Testing saved reports...")
    save_response = requests.post(
        f"{BASE_URL}/api/reports/saved",
        headers=headers,
        json={
            "name": "Monthly Spending Report",
            "report_type": "spending",
            "date_range_start": start_date.isoformat(),
            "date_range_end": end_date.isoformat()
        }
    )
    
    if save_response.status_code == 201:
        saved_report = save_response.json()
        print(f"✓ Report saved (ID: {saved_report['id']})")
        
        # List saved reports
        list_response = requests.get(f"{BASE_URL}/api/reports/saved", headers=headers)
        if list_response.status_code == 200:
            reports = list_response.json()
            print(f"✓ Found {len(reports)} saved reports")
        
        # Run saved report
        run_response = requests.post(
            f"{BASE_URL}/api/reports/saved/{saved_report['id']}/run",
            headers=headers
        )
        if run_response.status_code == 200:
            print(f"✓ Saved report executed successfully")
        
        # Delete saved report
        delete_response = requests.delete(
            f"{BASE_URL}/api/reports/saved/{saved_report['id']}",
            headers=headers
        )
        if delete_response.status_code == 204:
            print(f"✓ Saved report deleted")
    else:
        print(f"✗ Failed to save report: {save_response.text}")
    
    print("\n✓ All tests completed!")

if __name__ == "__main__":
    test_reports()
