"""
Simple integration test for the invoicing API
Run with: python test_api.py
"""

import requests
import json
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def test_full_flow():
    print("🧪 Testing Invoicing API\n")
    
    # 1. Login
    print("1. Logging in...")
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "demo@example.com",
        "password": "demo123"
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   ✓ Login successful\n")
    
    # 2. Get customers
    print("2. Fetching customers...")
    response = requests.get(f"{BASE_URL}/api/customers", headers=headers)
    assert response.status_code == 200
    customers = response.json()
    assert len(customers) > 0, "No customers found"
    customer_id = customers[0]["id"]
    print(f"   ✓ Found {len(customers)} customers\n")
    
    # 3. Create invoice
    print("3. Creating invoice...")
    today = date.today()
    invoice_data = {
        "customer_id": customer_id,
        "issue_date": str(today),
        "due_date": str(today + timedelta(days=30)),
        "notes": "Test invoice",
        "discount_cents": 0,
        "items": [
            {
                "description": "Test Service",
                "quantity": 2,
                "unit_price_cents": 10000,
                "tax_rate": 750
            }
        ]
    }
    response = requests.post(f"{BASE_URL}/api/invoices", json=invoice_data, headers=headers)
    assert response.status_code == 200, f"Invoice creation failed: {response.text}"
    invoice = response.json()
    invoice_id = invoice["id"]
    print(f"   ✓ Invoice created: {invoice['invoice_number']}\n")
    
    # 4. Get invoice details
    print("4. Fetching invoice details...")
    response = requests.get(f"{BASE_URL}/api/invoices/{invoice_id}", headers=headers)
    assert response.status_code == 200
    invoice_detail = response.json()
    assert len(invoice_detail["items"]) == 1
    print(f"   ✓ Invoice has {len(invoice_detail['items'])} items\n")
    
    # 5. Send invoice (generate PDF)
    print("5. Sending invoice (generating PDF)...")
    response = requests.post(f"{BASE_URL}/api/invoices/{invoice_id}/send", headers=headers)
    assert response.status_code == 200
    print("   ✓ Invoice sent\n")
    
    # 6. Download PDF
    print("6. Downloading PDF...")
    response = requests.get(f"{BASE_URL}/api/invoices/{invoice_id}/pdf", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    print(f"   ✓ PDF downloaded ({len(response.content)} bytes)\n")
    
    # 7. Record payment
    print("7. Recording payment...")
    payment_data = {
        "amount_cents": 21500,
        "method": "test payment",
        "paid_at": str(today)
    }
    response = requests.post(
        f"{BASE_URL}/api/invoices/{invoice_id}/payments",
        json=payment_data,
        headers=headers
    )
    assert response.status_code == 200
    print("   ✓ Payment recorded\n")
    
    # 8. Get metrics
    print("8. Fetching metrics...")
    response = requests.get(f"{BASE_URL}/api/metrics/summary", headers=headers)
    assert response.status_code == 200
    metrics = response.json()
    print(f"   ✓ Outstanding: ${metrics['outstanding_total_cents']/100:.2f}")
    print(f"   ✓ Overdue: ${metrics['overdue_total_cents']/100:.2f}\n")
    
    print("✅ All tests passed!")

if __name__ == "__main__":
    try:
        test_full_flow()
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to API. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
