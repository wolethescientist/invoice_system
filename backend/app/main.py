from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, customers, invoices, payments, metrics, budgets, transactions, category_templates, sinking_funds, paychecks, financial_goals, category_suggestions, budget_reports

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hikey API",
    description="Invoice management API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(invoices.router)
app.include_router(payments.router)
app.include_router(metrics.router)
app.include_router(budgets.router)
app.include_router(transactions.router)
app.include_router(category_templates.router)
app.include_router(sinking_funds.router)
app.include_router(paychecks.router)
app.include_router(financial_goals.router)
app.include_router(category_suggestions.router)
app.include_router(budget_reports.router)

@app.get("/")
def root():
    return {"message": "Hikey API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}
