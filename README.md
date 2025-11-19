# Invoicing Demo

A modern single-user invoicing application with Next.js frontend and FastAPI backend.

## Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Query (TanStack Query)
- Axios

**Backend:**
- FastAPI
- SQLite + SQLAlchemy
- JWT Authentication
- Jinja2 + WeasyPrint (PDF generation)

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optional)

**Windows Users:** See `WINDOWS_SETUP.md` for Windows-specific instructions.

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py  # Create demo data
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Demo Credentials

- Email: `demo@example.com`
- Password: `demo123`

## Project Structure

```
/backend          # FastAPI application
  /app
    /api          # API routes
    /core         # Config, security, database
    /models       # SQLAlchemy models
    /schemas      # Pydantic schemas
    /templates    # Jinja2 invoice templates
  /storage        # Generated PDFs
  seed.py         # Demo data seeder

/frontend         # Next.js application
  /src
    /app          # App Router pages
    /components   # React components
    /lib          # API client, utils
    /hooks        # Custom hooks
```

## Features

### Core Features
- JWT authentication with refresh tokens
- Customer management (CRUD)
- Invoice creation with line items
- Payment recording
- PDF generation and download
- Dashboard with metrics and charts
- Status tracking (Draft/Sent/Paid/Overdue)
- Search, filter, pagination
- Responsive design with animations
- Skeleton loaders

### Budget Management
- Monthly budget creation and tracking
- Unlimited budget categories with grouping
- Category templates for quick setup
- Budget allocation and balance tracking
- Transaction recording and categorization
- Spending analysis and reports

### Sinking Funds / Savings Goals
- Create savings goals with target amounts
- Track progress with visual indicators
- Monthly contribution planning
- Deposit and withdrawal tracking
- Multiple funds management
- Progress calculations and projections
- On-track status monitoring
- Contribution history

See `SINKING_FUNDS_QUICKSTART.md` for getting started with sinking funds.

## Environment Variables

**Backend (.env):**
```
DATABASE_URL=sqlite:///./invoicing.db
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

## Development

The app uses:
- React Query for server state management
- Optimistic updates for instant UI feedback
- Skeleton loaders for all async operations
- Framer Motion for smooth animations
- Tailwind CSS custom theme (blue/white palette)

## Production Notes

- Use PostgreSQL instead of SQLite
- Store PDFs in S3/object storage
- Use Redis + background workers for PDF generation
- Enable HTTPS and secure cookies
- Set strong JWT secrets
- Configure CORS for production domain
