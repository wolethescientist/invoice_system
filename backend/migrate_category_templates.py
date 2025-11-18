#!/usr/bin/env python3
"""
Migration script to add category_templates table and seed with default categories
"""
from app.core.database import engine, Base
from app.models.category_template import CategoryTemplate
from app.models.user import User
from sqlalchemy.orm import sessionmaker

def migrate():
    """Create category_templates table and add default templates"""
    print("Creating category_templates table...")
    
    # Create all tables (will only create missing ones)
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if we already have templates
        existing_count = db.query(CategoryTemplate).count()
        if existing_count > 0:
            print(f"Found {existing_count} existing category templates. Skipping seed.")
            return
        
        # Get all users to create default templates for each
        users = db.query(User).all()
        
        # Default category templates
        default_templates = [
            # Income categories
            {"name": "Salary", "category_type": "income", "icon": "💰", "color": "#10B981", "default_allocation_cents": 0, "order": 1},
            {"name": "Freelance", "category_type": "income", "icon": "💼", "color": "#059669", "default_allocation_cents": 0, "order": 2},
            {"name": "Investment Returns", "category_type": "income", "icon": "📈", "color": "#047857", "default_allocation_cents": 0, "order": 3},
            
            # Essential expense categories
            {"name": "Housing", "category_type": "expense", "icon": "🏠", "color": "#DC2626", "default_allocation_cents": 120000, "order": 10},
            {"name": "Utilities", "category_type": "expense", "icon": "⚡", "color": "#B91C1C", "default_allocation_cents": 15000, "order": 11},
            {"name": "Groceries", "category_type": "expense", "icon": "🛒", "color": "#991B1B", "default_allocation_cents": 40000, "order": 12},
            {"name": "Transportation", "category_type": "expense", "icon": "🚗", "color": "#7F1D1D", "default_allocation_cents": 30000, "order": 13},
            {"name": "Insurance", "category_type": "expense", "icon": "🛡️", "color": "#EF4444", "default_allocation_cents": 20000, "order": 14},
            
            # Lifestyle expense categories
            {"name": "Dining Out", "category_type": "expense", "icon": "🍽️", "color": "#F97316", "default_allocation_cents": 15000, "order": 20},
            {"name": "Entertainment", "category_type": "expense", "icon": "🎬", "color": "#EA580C", "default_allocation_cents": 10000, "order": 21},
            {"name": "Shopping", "category_type": "expense", "icon": "🛍️", "color": "#C2410C", "default_allocation_cents": 8000, "order": 22},
            {"name": "Health & Fitness", "category_type": "expense", "icon": "💪", "color": "#9A3412", "default_allocation_cents": 5000, "order": 23},
            {"name": "Personal Care", "category_type": "expense", "icon": "💅", "color": "#7C2D12", "default_allocation_cents": 3000, "order": 24},
            
            # Savings categories
            {"name": "Emergency Fund", "category_type": "savings", "icon": "🚨", "color": "#2563EB", "default_allocation_cents": 25000, "order": 30},
            {"name": "Retirement", "category_type": "savings", "icon": "🏖️", "color": "#1D4ED8", "default_allocation_cents": 50000, "order": 31},
            {"name": "Vacation", "category_type": "savings", "icon": "✈️", "color": "#1E40AF", "default_allocation_cents": 10000, "order": 32},
            {"name": "Home Down Payment", "category_type": "savings", "icon": "🏡", "color": "#1E3A8A", "default_allocation_cents": 20000, "order": 33},
            {"name": "Car Fund", "category_type": "savings", "icon": "🚙", "color": "#312E81", "default_allocation_cents": 15000, "order": 34},
        ]
        
        # Create templates for each user
        for user in users:
            print(f"Creating default category templates for user {user.email}...")
            
            for template_data in default_templates:
                template = CategoryTemplate(
                    user_id=user.id,
                    **template_data
                )
                db.add(template)
        
        db.commit()
        print(f"Successfully created default category templates for {len(users)} users")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate()