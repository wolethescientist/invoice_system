"""
Test suite for Financial Roadmap API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from datetime import date, timedelta
from app.main import app

client = TestClient(app)

# Test data
TEST_USER = {
    "email": "roadmap_test@example.com",
    "password": "testpass123"
}

def get_auth_headers():
    """Register and login to get auth token"""
    # Register
    client.post("/api/auth/register", json=TEST_USER)
    
    # Login
    response = client.post("/api/auth/login", json=TEST_USER)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_goal():
    """Test creating a new financial goal"""
    headers = get_auth_headers()
    
    goal_data = {
        "name": "Emergency Fund",
        "description": "6 months of expenses",
        "goal_type": "emergency_fund",
        "target_amount": 15000.00,
        "monthly_contribution": 500.00,
        "target_date": (date.today() + timedelta(days=730)).isoformat(),
        "start_date": date.today().isoformat(),
        "priority": 1
    }
    
    response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "Emergency Fund"
    assert data["goal_type"] == "emergency_fund"
    assert data["target_amount"] == 15000.00
    assert data["current_amount"] == 0.0
    assert data["status"] == "active"
    assert "id" in data


def test_get_goals():
    """Test retrieving all goals"""
    headers = get_auth_headers()
    
    # Create a goal first
    goal_data = {
        "name": "Test Goal",
        "goal_type": "savings",
        "target_amount": 5000.00,
        "monthly_contribution": 200.00,
        "target_date": (date.today() + timedelta(days=365)).isoformat(),
        "start_date": date.today().isoformat()
    }
    client.post("/api/financial-goals", json=goal_data, headers=headers)
    
    # Get all goals
    response = client.get("/api/financial-goals", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_goal_by_id():
    """Test retrieving a specific goal"""
    headers = get_auth_headers()
    
    # Create a goal
    goal_data = {
        "name": "House Down Payment",
        "goal_type": "home_purchase",
        "target_amount": 50000.00,
        "monthly_contribution": 1000.00,
        "target_date": (date.today() + timedelta(days=1095)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    # Get the goal
    response = client.get(f"/api/financial-goals/{goal_id}", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == goal_id
    assert data["name"] == "House Down Payment"


def test_update_goal():
    """Test updating a goal"""
    headers = get_auth_headers()
    
    # Create a goal
    goal_data = {
        "name": "Original Name",
        "goal_type": "savings",
        "target_amount": 5000.00,
        "monthly_contribution": 200.00,
        "target_date": (date.today() + timedelta(days=365)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    # Update the goal
    update_data = {
        "name": "Updated Name",
        "monthly_contribution": 300.00
    }
    response = client.put(f"/api/financial-goals/{goal_id}", json=update_data, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["monthly_contribution"] == 300.00


def test_delete_goal():
    """Test deleting a goal"""
    headers = get_auth_headers()
    
    # Create a goal
    goal_data = {
        "name": "To Be Deleted",
        "goal_type": "savings",
        "target_amount": 1000.00,
        "monthly_contribution": 100.00,
        "target_date": (date.today() + timedelta(days=365)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    # Delete the goal
    response = client.delete(f"/api/financial-goals/{goal_id}", headers=headers)
    assert response.status_code == 200
    
    # Verify it's deleted
    get_response = client.get(f"/api/financial-goals/{goal_id}", headers=headers)
    assert get_response.status_code == 404


def test_add_contribution():
    """Test adding a contribution to a goal"""
    headers = get_auth_headers()
    
    # Create a goal
    goal_data = {
        "name": "Contribution Test",
        "goal_type": "savings",
        "target_amount": 5000.00,
        "monthly_contribution": 200.00,
        "target_date": (date.today() + timedelta(days=365)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    # Add contribution
    contribution_data = {
        "amount": 500.00,
        "contribution_date": date.today().isoformat(),
        "notes": "First contribution"
    }
    response = client.post(
        f"/api/financial-goals/{goal_id}/contributions",
        json=contribution_data,
        headers=headers
    )
    assert response.status_code == 200
    
    data = response.json()
    assert data["amount"] == 500.00
    assert data["notes"] == "First contribution"
    
    # Verify goal current_amount updated
    goal_response = client.get(f"/api/financial-goals/{goal_id}", headers=headers)
    assert goal_response.json()["current_amount"] == 500.00


def test_get_contributions():
    """Test retrieving contributions for a goal"""
    headers = get_auth_headers()
    
    # Create goal and add contributions
    goal_data = {
        "name": "Contributions List Test",
        "goal_type": "savings",
        "target_amount": 5000.00,
        "monthly_contribution": 200.00,
        "target_date": (date.today() + timedelta(days=365)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    # Add multiple contributions
    for i in range(3):
        contribution_data = {
            "amount": 100.00 * (i + 1),
            "contribution_date": date.today().isoformat()
        }
        client.post(
            f"/api/financial-goals/{goal_id}/contributions",
            json=contribution_data,
            headers=headers
        )
    
    # Get contributions
    response = client.get(f"/api/financial-goals/{goal_id}/contributions", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 3


def test_create_milestone():
    """Test creating a milestone"""
    headers = get_auth_headers()
    
    # Create a goal
    goal_data = {
        "name": "Milestone Test",
        "goal_type": "savings",
        "target_amount": 10000.00,
        "monthly_contribution": 500.00,
        "target_date": (date.today() + timedelta(days=730)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    # Create milestone
    milestone_data = {
        "name": "First $5,000",
        "target_amount": 5000.00,
        "target_date": (date.today() + timedelta(days=365)).isoformat()
    }
    response = client.post(
        f"/api/financial-goals/{goal_id}/milestones",
        json=milestone_data,
        headers=headers
    )
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "First $5,000"
    assert data["target_amount"] == 5000.00
    assert data["achieved"] == False


def test_update_milestone():
    """Test updating a milestone"""
    headers = get_auth_headers()
    
    # Create goal and milestone
    goal_data = {
        "name": "Milestone Update Test",
        "goal_type": "savings",
        "target_amount": 10000.00,
        "monthly_contribution": 500.00,
        "target_date": (date.today() + timedelta(days=730)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    milestone_data = {
        "name": "Test Milestone",
        "target_amount": 5000.00,
        "target_date": (date.today() + timedelta(days=365)).isoformat()
    }
    milestone_response = client.post(
        f"/api/financial-goals/{goal_id}/milestones",
        json=milestone_data,
        headers=headers
    )
    milestone_id = milestone_response.json()["id"]
    
    # Update milestone to achieved
    update_data = {"achieved": True}
    response = client.put(
        f"/api/financial-goals/{goal_id}/milestones/{milestone_id}",
        json=update_data,
        headers=headers
    )
    assert response.status_code == 200
    
    data = response.json()
    assert data["achieved"] == True
    assert data["achieved_date"] is not None


def test_get_projection():
    """Test getting goal projection"""
    headers = get_auth_headers()
    
    # Create a goal
    goal_data = {
        "name": "Projection Test",
        "goal_type": "savings",
        "target_amount": 12000.00,
        "monthly_contribution": 500.00,
        "target_date": (date.today() + timedelta(days=730)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    # Get projection
    response = client.get(f"/api/financial-goals/{goal_id}/projection", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert "projected_completion_date" in data
    assert "months_remaining" in data
    assert "on_track" in data
    assert "required_monthly_contribution" in data
    assert data["months_remaining"] > 0


def test_get_projection_with_override():
    """Test projection with custom monthly contribution"""
    headers = get_auth_headers()
    
    # Create a goal
    goal_data = {
        "name": "Projection Override Test",
        "goal_type": "savings",
        "target_amount": 12000.00,
        "monthly_contribution": 500.00,
        "target_date": (date.today() + timedelta(days=730)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    # Get projection with higher contribution
    response = client.get(
        f"/api/financial-goals/{goal_id}/projection?monthly_contribution=1000",
        headers=headers
    )
    assert response.status_code == 200
    
    data = response.json()
    # With higher contribution, should complete faster
    assert data["months_remaining"] < 24


def test_get_summary():
    """Test getting goals summary"""
    headers = get_auth_headers()
    
    # Create multiple goals
    for i in range(3):
        goal_data = {
            "name": f"Summary Test Goal {i}",
            "goal_type": "savings",
            "target_amount": 5000.00 * (i + 1),
            "monthly_contribution": 200.00,
            "target_date": (date.today() + timedelta(days=365)).isoformat(),
            "start_date": date.today().isoformat()
        }
        client.post("/api/financial-goals", json=goal_data, headers=headers)
    
    # Get summary
    response = client.get("/api/financial-goals/summary", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert "total_goals" in data
    assert "active_goals" in data
    assert "total_target_amount" in data
    assert "total_monthly_contributions" in data
    assert data["total_goals"] >= 3


def test_auto_complete_goal():
    """Test that goal auto-completes when target is reached"""
    headers = get_auth_headers()
    
    # Create a small goal
    goal_data = {
        "name": "Auto Complete Test",
        "goal_type": "savings",
        "target_amount": 1000.00,
        "monthly_contribution": 500.00,
        "target_date": (date.today() + timedelta(days=365)).isoformat(),
        "start_date": date.today().isoformat()
    }
    create_response = client.post("/api/financial-goals", json=goal_data, headers=headers)
    goal_id = create_response.json()["id"]
    
    # Add contribution that reaches target
    contribution_data = {
        "amount": 1000.00,
        "contribution_date": date.today().isoformat()
    }
    client.post(
        f"/api/financial-goals/{goal_id}/contributions",
        json=contribution_data,
        headers=headers
    )
    
    # Check goal status
    response = client.get(f"/api/financial-goals/{goal_id}", headers=headers)
    data = response.json()
    assert data["status"] == "completed"
    assert data["current_amount"] >= data["target_amount"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
