"""
Migration script to add budget tables to the database.
Run this after updating the models to create the new tables.
"""
from app.core.database import engine, Base
from app.models.budget import Budget, BudgetCategory
from app.models.user import User
from app.models.customer import Customer
from app.models.invoice import Invoice, InvoiceItem
from app.models.payment import Payment

def migrate():
    print("Creating budget tables...")
    Base.metadata.create_all(bind=engine)
    print("Budget tables created successfully!")

if __name__ == "__main__":
    migrate()
