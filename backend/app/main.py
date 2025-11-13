from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, customers, invoices, payments, metrics

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Invoicing API",
    description="Single-user invoicing demo API",
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

@app.get("/")
def root():
    return {"message": "Invoicing API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}
