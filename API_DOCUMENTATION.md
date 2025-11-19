# API Documentation

Complete API reference for the Invoicing Demo backend.

**Base URL:** `http://localhost:8000`

**Interactive Docs:** http://localhost:8000/docs (Swagger UI)

## Authentication

All endpoints except `/api/auth/*` require a valid JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Expiration
- Access Token: 15 minutes
- Refresh Token: 30 days (stored in HttpOnly cookie)

---

## Auth Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `400` - Email already registered

---

### Login

Authenticate and receive access token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Side Effects:**
- Sets `refresh_token` HttpOnly cookie

**Errors:**
- `401` - Incorrect email or password

---

### Logout

Clear refresh token cookie.

**Endpoint:** `POST /api/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Customer Endpoints

### List Customers

Get all customers.

**Endpoint:** `GET /api/customers`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "ACME Corporation",
    "email": "contact@acme.com",
    "phone": "+1-555-0100",
    "address": "456 Corporate Blvd, New York, NY 10001",
    "created_at": "2025-11-13T10:00:00"
  }
]
```

---

### Create Customer

Add a new customer.

**Endpoint:** `POST /api/customers`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Company Inc.",
  "email": "info@newcompany.com",
  "phone": "+1-555-0200",
  "address": "123 Business St, San Francisco, CA 94105"
}
```

**Response:** `200 OK`
```json
{
  "id": 4,
  "name": "New Company Inc.",
  "email": "info@newcompany.com",
  "phone": "+1-555-0200",
  "address": "123 Business St, San Francisco, CA 94105",
  "created_at": "2025-11-13T12:00:00"
}
```

---

### Get Customer

Get customer details by ID.

**Endpoint:** `GET /api/customers/{customer_id}`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "ACME Corporation",
  "email": "contact@acme.com",
  "phone": "+1-555-0100",
  "address": "456 Corporate Blvd, New York, NY 10001",
  "created_at": "2025-11-13T10:00:00"
}
```

**Errors:**
- `404` - Customer not found

---

### Update Customer

Update customer information.

**Endpoint:** `PUT /api/customers/{customer_id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "ACME Corp (Updated)",
  "email": "new-email@acme.com",
  "phone": "+1-555-0199",
  "address": "789 New Address"
}
```

**Response:** `200 OK` (returns updated customer)

**Errors:**
- `404` - Customer not found

---

### Delete Customer

Delete a customer.

**Endpoint:** `DELETE /api/customers/{customer_id}`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Customer deleted"
}
```

**Errors:**
- `404` - Customer not found

---

## Invoice Endpoints

### List Invoices

Get invoices with optional filtering and pagination.

**Endpoint:** `GET /api/invoices`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (draft, sent, paid, overdue)
- `q` (optional): Search by invoice number
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Example:** `GET /api/invoices?status=sent&page=1&limit=10`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "invoice_number": "INV-2025-0001",
    "issue_date": "2025-10-14",
    "due_date": "2025-10-29",
    "status": "paid",
    "subtotal_cents": 500000,
    "tax_cents": 37500,
    "discount_cents": 0,
    "total_cents": 537500,
    "balance_due_cents": 0,
    "pdf_path": "storage/pdfs/invoice_1.pdf",
    "notes": "Thank you for your business!",
    "created_at": "2025-10-14T10:00:00",
    "items": [...]
  }
]
```

---

### Create Invoice

Create a new invoice with line items.

**Endpoint:** `POST /api/invoices`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "customer_id": 1,
  "issue_date": "2025-11-13",
  "due_date": "2025-12-13",
  "notes": "Thank you for your business!",
  "discount_cents": 0,
  "items": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unit_price_cents": 50000,
      "tax_rate": 750
    },
    {
      "description": "Report Writing",
      "quantity": 1,
      "unit_price_cents": 200000,
      "tax_rate": 0
    }
  ]
}
```

**Field Notes:**
- `unit_price_cents`: Price in cents (e.g., $500.00 = 50000)
- `tax_rate`: In basis points (e.g., 7.5% = 750)
- `discount_cents`: Discount amount in cents

**Response:** `200 OK`
```json
{
  "id": 5,
  "customer_id": 1,
  "invoice_number": "INV-2025-0005",
  "issue_date": "2025-11-13",
  "due_date": "2025-12-13",
  "status": "draft",
  "subtotal_cents": 700000,
  "tax_cents": 37500,
  "discount_cents": 0,
  "total_cents": 737500,
  "balance_due_cents": 737500,
  "pdf_path": null,
  "notes": "Thank you for your business!",
  "created_at": "2025-11-13T12:00:00",
  "items": [...]
}
```

---

### Get Invoice

Get invoice details with all line items.

**Endpoint:** `GET /api/invoices/{invoice_id}`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "customer_id": 1,
  "invoice_number": "INV-2025-0001",
  "issue_date": "2025-10-14",
  "due_date": "2025-10-29",
  "status": "paid",
  "subtotal_cents": 500000,
  "tax_cents": 37500,
  "discount_cents": 0,
  "total_cents": 537500,
  "balance_due_cents": 0,
  "pdf_path": "storage/pdfs/invoice_1.pdf",
  "notes": "Thank you for your business!",
  "created_at": "2025-10-14T10:00:00",
  "items": [
    {
      "id": 1,
      "invoice_id": 1,
      "description": "Consulting Services - Q4 2024",
      "quantity": 10,
      "unit_price_cents": 50000,
      "tax_rate": 750,
      "line_total_cents": 537500
    }
  ]
}
```

**Errors:**
- `404` - Invoice not found

---

### Update Invoice

Update invoice and optionally replace line items.

**Endpoint:** `PUT /api/invoices/{invoice_id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "customer_id": 1,
  "issue_date": "2025-11-13",
  "due_date": "2025-12-13",
  "notes": "Updated notes",
  "discount_cents": 5000,
  "items": [
    {
      "description": "Updated Service",
      "quantity": 5,
      "unit_price_cents": 100000,
      "tax_rate": 750
    }
  ]
}
```

**Notes:**
- All fields are optional
- If `items` is provided, all existing items are replaced
- Totals are recalculated automatically

**Response:** `200 OK` (returns updated invoice)

**Errors:**
- `404` - Invoice not found

---

### Send Invoice

Generate PDF and mark invoice as sent.

**Endpoint:** `POST /api/invoices/{invoice_id}/send`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Invoice sent, PDF generation in progress",
  "status": "accepted"
}
```

**Side Effects:**
- Invoice status changed to "sent"
- PDF generated in background
- `pdf_path` field updated

**Errors:**
- `404` - Invoice not found

---

### Download PDF

Download invoice PDF.

**Endpoint:** `GET /api/invoices/{invoice_id}/pdf`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="INV-2025-0001.pdf"`
- Binary PDF data

**Notes:**
- If PDF doesn't exist, it will be generated on-the-fly
- PDF is cached for subsequent requests

**Errors:**
- `404` - Invoice not found or PDF generation failed

---

## Payment Endpoints

### Record Payment

Record a payment against an invoice.

**Endpoint:** `POST /api/invoices/{invoice_id}/payments`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount_cents": 300000,
  "method": "bank transfer",
  "paid_at": "2025-11-13T14:30:00"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "invoice_id": 1,
  "amount_cents": 300000,
  "paid_at": "2025-11-13T14:30:00",
  "method": "bank transfer",
  "created_at": "2025-11-13T14:30:00"
}
```

**Side Effects:**
- Invoice `balance_due_cents` reduced by payment amount
- If balance reaches zero, invoice status changed to "paid"

**Errors:**
- `404` - Invoice not found

---

## Metrics Endpoints

### Get Summary Metrics

Get dashboard metrics including outstanding, overdue, revenue, and top customers.

**Endpoint:** `GET /api/metrics/summary`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "outstanding_count": 5,
  "outstanding_total_cents": 450000,
  "overdue_count": 2,
  "overdue_total_cents": 150000,
  "monthly_revenue": [
    {
      "month": "2025-09",
      "revenue_cents": 600000
    },
    {
      "month": "2025-10",
      "revenue_cents": 750000
    }
  ],
  "top_customers": [
    {
      "id": 1,
      "name": "ACME Corporation",
      "total_paid_cents": 1200000
    },
    {
      "id": 2,
      "name": "TechStart LLC",
      "total_paid_cents": 800000
    }
  ]
}
```

**Notes:**
- `outstanding`: Invoices with balance > 0 (not paid)
- `overdue`: Outstanding invoices past due date
- `monthly_revenue`: Last 6 months of payment data
- `top_customers`: Top 5 customers by total payments

---

## Health Check Endpoints

### Root

API information.

**Endpoint:** `GET /`

**Response:** `200 OK`
```json
{
  "message": "Invoicing API",
  "docs": "/docs"
}
```

---

### Health Check

Check API health status.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "healthy"
}
```

---

## Error Responses

### Standard Error Format

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

### Validation Errors (422)

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- Rate limiting per IP or user
- Different limits for authenticated vs unauthenticated requests
- Implement using middleware or API gateway

---

## Pagination

List endpoints support pagination via query parameters:

- `page`: Page number (1-indexed)
- `limit`: Items per page (default: 50, max: 100)

**Example:**
```
GET /api/invoices?page=2&limit=20
```

**Note:** Response doesn't include pagination metadata (total count, pages). This can be added if needed.

---

## Data Types

### Money (Cents)

All monetary values are stored and transmitted as integers in cents:
- $100.00 = 10000 cents
- $1,234.56 = 123456 cents

**Why?** Avoids floating-point precision issues.

### Tax Rate (Basis Points)

Tax rates are stored as integers in basis points:
- 7.5% = 750 basis points
- 10% = 1000 basis points
- 0% = 0 basis points

**Conversion:** `percentage * 100 = basis points`

### Dates

All dates use ISO 8601 format:
- Date only: `YYYY-MM-DD` (e.g., "2025-11-13")
- DateTime: `YYYY-MM-DDTHH:MM:SS` (e.g., "2025-11-13T14:30:00")

---

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'

# Get invoices (with token)
curl http://localhost:8000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Python

```python
import requests

# Login
response = requests.post('http://localhost:8000/api/auth/login', json={
    'email': 'demo@example.com',
    'password': 'demo123'
})
token = response.json()['access_token']

# Get invoices
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/invoices', headers=headers)
invoices = response.json()
```

### Using the Test Script

```bash
cd backend
python test_api.py
```

---

## Interactive Documentation

Visit http://localhost:8000/docs for:
- Interactive API explorer
- Try out endpoints directly
- View request/response schemas
- See all available endpoints

Alternative docs: http://localhost:8000/redoc


---

## Budget Endpoints

### Create Budget

Create a new monthly zero-based budget.

**Endpoint:** `POST /api/budgets`

**Authentication:** Required

**Request Body:**
```json
{
  "month": 12,
  "year": 2025,
  "income_cents": 500000,
  "categories": [
    {
      "name": "Rent",
      "allocated_cents": 150000,
      "order": 0
    },
    {
      "name": "Groceries",
      "allocated_cents": 60000,
      "order": 1
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "budget": {
    "id": 1,
    "user_id": 1,
    "month": 12,
    "year": 2025,
    "income_cents": 500000,
    "categories": [
      {
        "id": 1,
        "budget_id": 1,
        "name": "Rent",
        "allocated_cents": 150000,
        "order": 0,
        "created_at": "2025-11-18T10:00:00"
      }
    ],
    "created_at": "2025-11-18T10:00:00",
    "updated_at": "2025-11-18T10:00:00"
  },
  "total_allocated_cents": 210000,
  "remaining_cents": 290000,
  "is_balanced": false
}
```

**Errors:**
- `400` - Budget for this month/year already exists
- `401` - Unauthorized

---

### List Budgets

Get all budgets for the authenticated user.

**Endpoint:** `GET /api/budgets`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "month": 12,
    "year": 2025,
    "income_cents": 500000,
    "categories": [...],
    "created_at": "2025-11-18T10:00:00",
    "updated_at": "2025-11-18T10:00:00"
  }
]
```

---

### Get Budget

Get a specific budget with summary.

**Endpoint:** `GET /api/budgets/{budget_id}`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "budget": {
    "id": 1,
    "user_id": 1,
    "month": 12,
    "year": 2025,
    "income_cents": 500000,
    "categories": [...]
  },
  "total_allocated_cents": 500000,
  "remaining_cents": 0,
  "is_balanced": true
}
```

**Errors:**
- `404` - Budget not found
- `401` - Unauthorized

---

### Get Budget by Period

Get a budget for a specific month and year. Useful for accessing the current month's budget across devices.

**Endpoint:** `GET /api/budgets/period/{year}/{month}`

**Authentication:** Required

**Example:** `GET /api/budgets/period/2025/12`

**Response:** `200 OK`
```json
{
  "budget": {...},
  "total_allocated_cents": 500000,
  "remaining_cents": 0,
  "is_balanced": true
}
```

**Use Cases:**
- Quick access to current month's budget
- Cross-device synchronization
- Dashboard widgets

**Errors:**
- `404` - Budget not found for this period
- `401` - Unauthorized

---

### Update Budget

Update an existing budget's income and/or categories.

**Endpoint:** `PUT /api/budgets/{budget_id}`

**Authentication:** Required

**Request Body:**
```json
{
  "income_cents": 550000,
  "categories": [
    {
      "name": "Rent",
      "allocated_cents": 150000,
      "order": 0
    },
    {
      "name": "Groceries",
      "allocated_cents": 70000,
      "order": 1
    }
  ]
}
```

**Note:** When updating categories, all existing categories are replaced with the new list.

**Response:** `200 OK`
```json
{
  "budget": {...},
  "total_allocated_cents": 550000,
  "remaining_cents": 0,
  "is_balanced": true
}
```

**Errors:**
- `404` - Budget not found
- `401` - Unauthorized

---

### Delete Budget

Delete a budget and all its categories.

**Endpoint:** `DELETE /api/budgets/{budget_id}`

**Authentication:** Required

**Response:** `204 No Content`

**Errors:**
- `404` - Budget not found
- `401` - Unauthorized

---

## Budget Data Models

### Budget Object

```typescript
{
  id: number
  user_id: number
  month: number          // 1-12
  year: number           // 2000-2100
  income_cents: number   // Amount in cents
  categories: BudgetCategory[]
  created_at: string     // ISO 8601 datetime
  updated_at: string     // ISO 8601 datetime
}
```

### BudgetCategory Object

```typescript
{
  id: number
  budget_id: number
  name: string
  allocated_cents: number  // Amount in cents
  order: number            // Display order
  created_at: string       // ISO 8601 datetime
}
```

### BudgetSummary Object

```typescript
{
  budget: Budget
  total_allocated_cents: number
  remaining_cents: number
  is_balanced: boolean
}
```

---

## Budget Validation Rules

1. **Income**: Must be >= 0
2. **Month**: Must be between 1 and 12
3. **Year**: Must be between 2000 and 2100
4. **Category Allocations**: Must be >= 0
5. **Uniqueness**: One budget per user per month/year
6. **Zero-Based**: For a balanced budget, `income_cents` must equal `total_allocated_cents`

---


---

## Financial Roadmap Endpoints

### Get All Goals

Retrieve all financial goals for the authenticated user.

**Endpoint:** `GET /api/financial-goals`

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `completed`, `paused`, `cancelled`)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Emergency Fund",
    "description": "6 months of expenses",
    "goal_type": "emergency_fund",
    "target_amount": 15000.00,
    "current_amount": 5000.00,
    "monthly_contribution": 500.00,
    "target_date": "2026-12-31",
    "start_date": "2025-01-01",
    "status": "active",
    "priority": 1,
    "notes": "Top priority",
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-15T00:00:00",
    "contributions": [],
    "milestones": []
  }
]
```

---

### Get Goal Summary

Get summary statistics for all goals.

**Endpoint:** `GET /api/financial-goals/summary`

**Response:** `200 OK`
```json
{
  "total_goals": 5,
  "active_goals": 3,
  "completed_goals": 2,
  "total_target_amount": 75000.00,
  "total_current_amount": 25000.00,
  "total_monthly_contributions": 1500.00,
  "overall_progress_percentage": 33.33
}
```

---

### Get Goal by ID

Retrieve a specific financial goal with all contributions and milestones.

**Endpoint:** `GET /api/financial-goals/{goal_id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Emergency Fund",
  "description": "6 months of expenses",
  "goal_type": "emergency_fund",
  "target_amount": 15000.00,
  "current_amount": 5000.00,
  "monthly_contribution": 500.00,
  "target_date": "2026-12-31",
  "start_date": "2025-01-01",
  "status": "active",
  "priority": 1,
  "notes": "Top priority",
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-15T00:00:00",
  "contributions": [
    {
      "id": 1,
      "goal_id": 1,
      "amount": 500.00,
      "contribution_date": "2025-01-15",
      "notes": "First contribution",
      "created_at": "2025-01-15T00:00:00"
    }
  ],
  "milestones": [
    {
      "id": 1,
      "goal_id": 1,
      "name": "First $5,000",
      "target_amount": 5000.00,
      "target_date": "2025-06-30",
      "achieved": true,
      "achieved_date": "2025-06-15",
      "created_at": "2025-01-01T00:00:00"
    }
  ]
}
```

**Errors:**
- `404` - Goal not found

---

### Create Goal

Create a new financial goal.

**Endpoint:** `POST /api/financial-goals`

**Request Body:**
```json
{
  "name": "House Down Payment",
  "description": "Save for first home",
  "goal_type": "home_purchase",
  "target_amount": 50000.00,
  "monthly_contribution": 1000.00,
  "target_date": "2028-06-30",
  "start_date": "2025-01-01",
  "priority": 2,
  "notes": "Focus after emergency fund"
}
```

**Goal Types:**
- `savings` - General savings
- `debt_repayment` - Pay off debt
- `investment` - Investment goal
- `emergency_fund` - Emergency fund
- `retirement` - Retirement savings
- `education` - Education fund
- `home_purchase` - Home down payment
- `vehicle` - Vehicle purchase
- `vacation` - Vacation fund
- `other` - Custom goal

**Response:** `200 OK`
```json
{
  "id": 2,
  "user_id": 1,
  "name": "House Down Payment",
  "description": "Save for first home",
  "goal_type": "home_purchase",
  "target_amount": 50000.00,
  "current_amount": 0.00,
  "monthly_contribution": 1000.00,
  "target_date": "2028-06-30",
  "start_date": "2025-01-01",
  "status": "active",
  "priority": 2,
  "notes": "Focus after emergency fund",
  "created_at": "2025-01-15T00:00:00",
  "updated_at": "2025-01-15T00:00:00",
  "contributions": [],
  "milestones": []
}
```

---

### Update Goal

Update an existing financial goal.

**Endpoint:** `PUT /api/financial-goals/{goal_id}`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "monthly_contribution": 1200.00,
  "status": "paused",
  "priority": 1
}
```

**Response:** `200 OK` (returns updated goal)

**Errors:**
- `404` - Goal not found

---

### Delete Goal

Delete a financial goal and all associated contributions and milestones.

**Endpoint:** `DELETE /api/financial-goals/{goal_id}`

**Response:** `200 OK`
```json
{
  "message": "Goal deleted successfully"
}
```

**Errors:**
- `404` - Goal not found

---

### Get Goal Projection

Calculate projection for goal completion with optional contribution override.

**Endpoint:** `GET /api/financial-goals/{goal_id}/projection`

**Query Parameters:**
- `monthly_contribution` (optional): Override monthly contribution for simulation

**Response:** `200 OK`
```json
{
  "goal_id": 1,
  "projected_completion_date": "2026-10-15",
  "months_remaining": 20,
  "on_track": true,
  "required_monthly_contribution": 500.00,
  "projected_final_amount": 15000.00,
  "shortfall": 0.00
}
```

**Errors:**
- `404` - Goal not found

---

### Add Contribution

Add a contribution to a goal. Automatically updates goal's current amount.

**Endpoint:** `POST /api/financial-goals/{goal_id}/contributions`

**Request Body:**
```json
{
  "amount": 500.00,
  "contribution_date": "2025-01-15",
  "notes": "Monthly contribution"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "goal_id": 1,
  "amount": 500.00,
  "contribution_date": "2025-01-15",
  "notes": "Monthly contribution",
  "created_at": "2025-01-15T00:00:00"
}
```

**Errors:**
- `404` - Goal not found

---

### Get Contributions

Retrieve all contributions for a goal.

**Endpoint:** `GET /api/financial-goals/{goal_id}/contributions`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "goal_id": 1,
    "amount": 500.00,
    "contribution_date": "2025-01-15",
    "notes": "Monthly contribution",
    "created_at": "2025-01-15T00:00:00"
  }
]
```

**Errors:**
- `404` - Goal not found

---

### Create Milestone

Create a milestone for a goal.

**Endpoint:** `POST /api/financial-goals/{goal_id}/milestones`

**Request Body:**
```json
{
  "name": "First $5,000",
  "target_amount": 5000.00,
  "target_date": "2025-06-30"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "goal_id": 1,
  "name": "First $5,000",
  "target_amount": 5000.00,
  "target_date": "2025-06-30",
  "achieved": false,
  "achieved_date": null,
  "created_at": "2025-01-15T00:00:00"
}
```

**Errors:**
- `404` - Goal not found

---

### Get Milestones

Retrieve all milestones for a goal.

**Endpoint:** `GET /api/financial-goals/{goal_id}/milestones`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "goal_id": 1,
    "name": "First $5,000",
    "target_amount": 5000.00,
    "target_date": "2025-06-30",
    "achieved": true,
    "achieved_date": "2025-06-15",
    "created_at": "2025-01-15T00:00:00"
  }
]
```

**Errors:**
- `404` - Goal not found

---

### Update Milestone

Update a milestone (typically to mark as achieved).

**Endpoint:** `PUT /api/financial-goals/{goal_id}/milestones/{milestone_id}`

**Request Body:** (all fields optional)
```json
{
  "achieved": true
}
```

**Response:** `200 OK` (returns updated milestone)

**Errors:**
- `404` - Goal or milestone not found

---

### Delete Milestone

Delete a milestone.

**Endpoint:** `DELETE /api/financial-goals/{goal_id}/milestones/{milestone_id}`

**Response:** `200 OK`
```json
{
  "message": "Milestone deleted successfully"
}
```

**Errors:**
- `404` - Goal or milestone not found

---
