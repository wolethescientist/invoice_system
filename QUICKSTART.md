# Quick Start Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Docker** (optional, for containerized setup)

## Option 1: Docker Compose (Easiest)

```bash
# Start everything with one command
docker-compose up --build
```

Wait for both services to start, then:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Demo credentials:**
- Email: `demo@example.com`
- Password: `demo123`

## Option 2: Manual Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed database with demo data
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend will run on http://localhost:8000

### Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

## First Steps

1. **Login** at http://localhost:3000/auth/login
   - Use demo credentials: `demo@example.com` / `demo123`

2. **Explore Dashboard** - View metrics, charts, and recent activity

3. **View Invoices** - See pre-seeded invoices with different statuses

4. **Create Invoice**:
   - Go to Invoices → Create Invoice
   - Select a customer
   - Add line items
   - Save and view

5. **Download PDF**:
   - Open any invoice
   - Click "Download PDF"
   - PDF is generated on-the-fly

6. **Manage Customers**:
   - Go to Customers
   - Add, edit, or delete customers

## Testing the API

```bash
cd backend
python test_api.py
```

This runs a full integration test:
- Login
- Create invoice
- Generate PDF
- Record payment
- Fetch metrics

## Project Structure

```
/backend
  /app
    /api          # API endpoints
    /core         # Config, security, database
    /models       # SQLAlchemy models
    /schemas      # Pydantic schemas
    /services     # Business logic (PDF generation)
    /templates    # Jinja2 invoice template
  seed.py         # Demo data seeder
  test_api.py     # Integration tests

/frontend
  /src
    /app          # Next.js pages (App Router)
    /components   # React components
    /lib          # API client, auth, utilities
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./invoicing.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Common Issues

### Backend won't start
- Make sure Python 3.11+ is installed
- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Make sure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check `.env.local` exists with correct API URL

### PDF generation fails
- WeasyPrint requires system dependencies
- On Ubuntu/Debian: `apt-get install libpango-1.0-0 libpangoft2-1.0-0`
- On Mac: `brew install pango`
- On Windows: Use Docker

### CORS errors
- Check `CORS_ORIGINS` in backend `.env`
- Make sure frontend URL matches (default: http://localhost:3000)

## Next Steps

- Customize the invoice PDF template in `backend/app/templates/invoice.html`
- Modify design tokens in `frontend/tailwind.config.ts`
- Add more features: email sending, recurring invoices, reports
- Deploy to production (Vercel for frontend, Railway/Render for backend)

## Production Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

Set environment variable:
- `NEXT_PUBLIC_API_URL`: Your backend URL

### Backend (Railway/Render)
- Connect your Git repository
- Set environment variables from `.env.example`
- Use PostgreSQL instead of SQLite
- Store PDFs in S3/object storage

## Support

For issues or questions:
- Check API docs: http://localhost:8000/docs
- Review `README.md` for detailed information
- Check `DESIGN_TOKENS.md` for UI customization
