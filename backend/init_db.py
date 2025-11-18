"""
Initialize database tables without seeding data.
Users will register themselves via the /api/auth/register endpoint.
"""
from app.core.database import engine, Base
from app.models import User, Customer, Invoice, InvoiceItem, Payment, Settings

def init_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")
    print("\nUsers can now register at /auth/register")

if __name__ == "__main__":
    init_database()
