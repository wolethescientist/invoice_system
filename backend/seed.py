import sys
from datetime import date, datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import User, Customer, Invoice, InvoiceItem, Payment, Settings
from app.models.invoice import InvoiceStatus

def seed_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already seeded. Skipping...")
            return
        
        print("Seeding database...")
        
        # Create demo user
        user = User(
            email="demo@example.com",
            password_hash=get_password_hash("demo123")
        )
        db.add(user)
        
        # Create settings
        settings = Settings(
            company_name="Demo Company Inc.",
            address="123 Business St, Suite 100, San Francisco, CA 94105",
            email="billing@democompany.com",
            default_tax=750,  # 7.5%
            currency="USD",
            invoice_prefix="INV",
            last_sequence=0
        )
        db.add(settings)
        
        # Create customers
        customers_data = [
            {"name": "ACME Corporation", "email": "contact@acme.com", "phone": "+1-555-0100", "address": "456 Corporate Blvd, New York, NY 10001"},
            {"name": "TechStart LLC", "email": "billing@techstart.io", "phone": "+1-555-0200", "address": "789 Innovation Dr, Austin, TX 78701"},
            {"name": "Global Solutions", "email": "accounts@globalsolutions.com", "phone": "+1-555-0300", "address": "321 Enterprise Way, Seattle, WA 98101"},
        ]
        
        customers = []
        for data in customers_data:
            customer = Customer(**data)
            db.add(customer)
            customers.append(customer)
        
        db.flush()
        
        # Create invoices
        today = date.today()
        
        # Invoice 1 - Paid
        inv1 = Invoice(
            customer_id=customers[0].id,
            invoice_number="INV-2025-0001",
            issue_date=today - timedelta(days=30),
            due_date=today - timedelta(days=15),
            status=InvoiceStatus.PAID,
            subtotal_cents=500000,
            tax_cents=37500,
            discount_cents=0,
            total_cents=537500,
            balance_due_cents=0,
            notes="Thank you for your business!"
        )
        db.add(inv1)
        db.flush()
        
        db.add(InvoiceItem(
            invoice_id=inv1.id,
            description="Consulting Services - Q4 2024",
            quantity=10,
            unit_price_cents=50000,
            tax_rate=750,
            line_total_cents=537500
        ))
        
        db.add(Payment(
            invoice_id=inv1.id,
            amount_cents=537500,
            paid_at=today - timedelta(days=10),
            method="bank transfer"
        ))
        
        # Invoice 2 - Sent (due soon)
        inv2 = Invoice(
            customer_id=customers[1].id,
            invoice_number="INV-2025-0002",
            issue_date=today - timedelta(days=5),
            due_date=today + timedelta(days=10),
            status=InvoiceStatus.SENT,
            subtotal_cents=300000,
            tax_cents=22500,
            discount_cents=10000,
            total_cents=312500,
            balance_due_cents=312500,
            notes="Payment terms: Net 15"
        )
        db.add(inv2)
        db.flush()
        
        db.add(InvoiceItem(
            invoice_id=inv2.id,
            description="Website Development",
            quantity=1,
            unit_price_cents=250000,
            tax_rate=750,
            line_total_cents=268750
        ))
        
        db.add(InvoiceItem(
            invoice_id=inv2.id,
            description="SEO Optimization",
            quantity=1,
            unit_price_cents=50000,
            tax_rate=750,
            line_total_cents=53750
        ))
        
        # Invoice 3 - Overdue
        inv3 = Invoice(
            customer_id=customers[2].id,
            invoice_number="INV-2025-0003",
            issue_date=today - timedelta(days=45),
            due_date=today - timedelta(days=30),
            status=InvoiceStatus.OVERDUE,
            subtotal_cents=150000,
            tax_cents=11250,
            discount_cents=0,
            total_cents=161250,
            balance_due_cents=161250,
            notes="Please remit payment at your earliest convenience."
        )
        db.add(inv3)
        db.flush()
        
        db.add(InvoiceItem(
            invoice_id=inv3.id,
            description="Monthly Retainer - October",
            quantity=1,
            unit_price_cents=150000,
            tax_rate=750,
            line_total_cents=161250
        ))
        
        # Invoice 4 - Draft
        inv4 = Invoice(
            customer_id=customers[0].id,
            invoice_number="INV-2025-0004",
            issue_date=today,
            due_date=today + timedelta(days=30),
            status=InvoiceStatus.DRAFT,
            subtotal_cents=200000,
            tax_cents=15000,
            discount_cents=0,
            total_cents=215000,
            balance_due_cents=215000,
            notes=""
        )
        db.add(inv4)
        db.flush()
        
        db.add(InvoiceItem(
            invoice_id=inv4.id,
            description="Design Services",
            quantity=20,
            unit_price_cents=10000,
            tax_rate=750,
            line_total_cents=215000
        ))
        
        settings.last_sequence = 4
        
        db.commit()
        print("✓ Database seeded successfully!")
        print("\nDemo credentials:")
        print("  Email: demo@example.com")
        print("  Password: demo123")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
