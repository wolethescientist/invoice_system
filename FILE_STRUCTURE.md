# Complete File Structure

This document lists all files in the project with brief descriptions.

## Root Directory

```
/
├── README.md                      # Main project documentation
├── QUICKSTART.md                  # Quick setup guide
├── PROJECT_SUMMARY.md             # Architecture and feature overview
├── DESIGN_TOKENS.md               # UI design specifications
├── FEATURES_CHECKLIST.md          # Complete feature checklist
├── TROUBLESHOOTING.md             # Common issues and solutions
├── API_DOCUMENTATION.md           # Complete API reference
├── FILE_STRUCTURE.md              # This file
├── docker-compose.yml             # Docker Compose configuration
├── Makefile                       # Common development commands
├── run.sh                         # Unix/Mac startup script
├── run.bat                        # Windows startup script
└── .gitignore                     # Git ignore rules
```

## Backend Directory

```
backend/
├── app/
│   ├── __init__.py               # Python package marker
│   ├── main.py                   # FastAPI application entry point
│   │
│   ├── api/                      # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── customers.py          # Customer CRUD endpoints
│   │   ├── invoices.py           # Invoice CRUD endpoints
│   │   ├── payments.py           # Payment recording endpoints
│   │   ├── metrics.py            # Dashboard metrics endpoints
│   │   └── deps.py               # Dependency injection (auth)
│   │
│   ├── core/                     # Core functionality
│   │   ├── __init__.py
│   │   ├── config.py             # Configuration and settings
│   │   ├── database.py           # Database connection and session
│   │   └── security.py           # JWT and password hashing
│   │
│   ├── models/                   # SQLAlchemy database models
│   │   ├── __init__.py
│   │   ├── user.py               # User model
│   │   ├── customer.py           # Customer model
│   │   ├── invoice.py            # Invoice and InvoiceItem models
│   │   ├── payment.py            # Payment model
│   │   └── settings.py           # Settings model
│   │
│   ├── schemas/                  # Pydantic validation schemas
│   │   ├── __init__.py
│   │   ├── user.py               # User schemas (login, register, token)
│   │   ├── customer.py           # Customer schemas (CRUD)
│   │   ├── invoice.py            # Invoice schemas (CRUD, items)
│   │   ├── payment.py            # Payment schemas
│   │   └── metrics.py            # Metrics response schemas
│   │
│   ├── services/                 # Business logic services
│   │   ├── __init__.py
│   │   └── pdf.py                # PDF generation service
│   │
│   └── templates/                # Jinja2 templates
│       └── invoice.html          # Invoice PDF template
│
├── storage/
│   └── pdfs/
│       └── .gitkeep              # Keep directory in git
│
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Docker image for backend
├── .env.example                  # Example environment variables
├── seed.py                       # Database seeding script
└── test_api.py                   # Integration test script
```

## Frontend Directory

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── providers.tsx         # React Query and Auth providers
│   │   ├── globals.css           # Global styles and Tailwind
│   │   │
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── page.tsx      # Login page
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard with metrics
│   │   │
│   │   ├── invoices/
│   │   │   ├── page.tsx          # Invoice list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create invoice
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Invoice detail
│   │   │
│   │   └── customers/
│   │       └── page.tsx          # Customer management
│   │
│   ├── components/               # Reusable React components
│   │   ├── Badge.tsx             # Status badge component
│   │   ├── Button.tsx            # Button with animations
│   │   ├── Card.tsx              # Card container with hover
│   │   ├── DashboardLayout.tsx   # Layout with navigation
│   │   └── Skeleton.tsx          # Loading skeletons
│   │
│   └── lib/                      # Utilities and helpers
│       ├── api.ts                # Axios instance and interceptors
│       ├── auth-context.tsx      # Auth context provider
│       ├── types.ts              # TypeScript type definitions
│       └── utils.ts              # Utility functions
│
├── public/                       # Static assets (empty for now)
│
├── package.json                  # Node.js dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── next.config.js                # Next.js configuration
├── Dockerfile                    # Docker image for frontend
├── .env.local.example            # Example environment variables
└── .gitignore                    # Frontend-specific git ignores
```

## File Count Summary

- **Total Files:** 70+
- **Backend Files:** 30+
- **Frontend Files:** 25+
- **Documentation Files:** 8
- **Configuration Files:** 7

## Key Files by Purpose

### Getting Started
1. `README.md` - Start here
2. `QUICKSTART.md` - Setup instructions
3. `docker-compose.yml` - One-command startup

### Development
1. `backend/seed.py` - Create demo data
2. `backend/test_api.py` - Test the API
3. `Makefile` - Common commands
4. `run.sh` / `run.bat` - Quick start scripts

### Documentation
1. `API_DOCUMENTATION.md` - Complete API reference
2. `DESIGN_TOKENS.md` - UI design system
3. `PROJECT_SUMMARY.md` - Architecture overview
4. `FEATURES_CHECKLIST.md` - Feature tracking
5. `TROUBLESHOOTING.md` - Problem solving

### Configuration
1. `backend/.env.example` - Backend environment variables
2. `frontend/.env.local.example` - Frontend environment variables
3. `tailwind.config.ts` - Design system configuration
4. `backend/app/core/config.py` - Backend settings

### Core Backend Files
1. `backend/app/main.py` - Application entry point
2. `backend/app/core/security.py` - Authentication logic
3. `backend/app/services/pdf.py` - PDF generation
4. `backend/app/templates/invoice.html` - Invoice template

### Core Frontend Files
1. `frontend/src/app/layout.tsx` - Root layout
2. `frontend/src/lib/api.ts` - API client
3. `frontend/src/lib/auth-context.tsx` - Auth state
4. `frontend/src/components/DashboardLayout.tsx` - Main layout

## Lines of Code

Approximate line counts:

### Backend
- Models: ~200 lines
- Schemas: ~250 lines
- API Routes: ~600 lines
- Services: ~100 lines
- Core: ~150 lines
- **Total Backend:** ~1,500 lines

### Frontend
- Pages: ~1,200 lines
- Components: ~400 lines
- Lib/Utils: ~300 lines
- **Total Frontend:** ~2,000 lines

### Documentation
- **Total Documentation:** ~2,500 lines

### Configuration
- **Total Config:** ~300 lines

**Grand Total:** ~6,300 lines of code and documentation

## File Naming Conventions

### Backend (Python)
- `snake_case.py` for all Python files
- Models: Singular nouns (user.py, invoice.py)
- Schemas: Match model names
- API routes: Plural nouns (customers.py, invoices.py)

### Frontend (TypeScript/React)
- `PascalCase.tsx` for React components
- `camelCase.ts` for utilities
- `kebab-case` for directories
- Page files: `page.tsx` (Next.js convention)

### Documentation
- `SCREAMING_SNAKE_CASE.md` for important docs
- `PascalCase.md` for supplementary docs

## Dependencies

### Backend (Python)
- fastapi - Web framework
- uvicorn - ASGI server
- sqlalchemy - ORM
- pydantic - Validation
- python-jose - JWT
- passlib - Password hashing
- jinja2 - Templating
- weasyprint - PDF generation

### Frontend (Node.js)
- next - React framework
- react - UI library
- typescript - Type safety
- tailwindcss - Styling
- framer-motion - Animations
- @tanstack/react-query - Data fetching
- axios - HTTP client
- recharts - Charts

## Generated Files (Not in Git)

These files are generated during development:

### Backend
- `invoicing.db` - SQLite database
- `storage/pdfs/*.pdf` - Generated PDFs
- `__pycache__/` - Python bytecode
- `venv/` - Virtual environment

### Frontend
- `node_modules/` - Dependencies
- `.next/` - Build output
- `out/` - Static export

## Environment Files (Not in Git)

These files contain secrets and should not be committed:

- `backend/.env` - Backend environment variables
- `frontend/.env.local` - Frontend environment variables

Use the `.example` versions as templates.

## Docker Files

- `backend/Dockerfile` - Backend container image
- `frontend/Dockerfile` - Frontend container image
- `docker-compose.yml` - Multi-container orchestration

## Scripts

- `run.sh` - Unix/Mac startup script (bash)
- `run.bat` - Windows startup script (batch)
- `Makefile` - Development commands (make)
- `backend/seed.py` - Database seeding (Python)
- `backend/test_api.py` - API testing (Python)

## Templates

- `backend/app/templates/invoice.html` - Invoice PDF template (Jinja2)

## Static Assets

Currently minimal. Can add:
- Logos
- Favicons
- Images
- Fonts

## Future Files (Not Yet Implemented)

Potential additions:
- `backend/tests/` - Unit tests
- `frontend/cypress/` - E2E tests
- `.github/workflows/` - CI/CD
- `docs/` - Extended documentation
- `scripts/` - Deployment scripts
- `migrations/` - Database migrations
