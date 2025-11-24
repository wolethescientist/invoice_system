#!/usr/bin/env python3
"""
Quick script to check what users exist and what data they have
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.budget import Budget
from app.models.sinking_fund import SinkingFund
from app.models.net_worth import Asset, Liability
from app.models.financial_goal import FinancialGoal
from app.models.paycheck import Paycheck

def check_data():
    db = SessionLocal()
    
    try:
        print("\n=== USERS ===")
        users = db.query(User).all()
        for user in users:
            print(f"ID: {user.id}, Email: {user.email}, Name: {user.full_name}")
            
            # Check data for each user
            budgets = db.query(Budget).filter(Budget.user_id == user.id).count()
            sinking_funds = db.query(SinkingFund).filter(SinkingFund.user_id == user.id).count()
            assets = db.query(Asset).filter(Asset.user_id == user.id).count()
            liabilities = db.query(Liability).filter(Liability.user_id == user.id).count()
            goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == user.id).count()
            paychecks = db.query(Paycheck).filter(Paycheck.user_id == user.id).count()
            
            print(f"  - Budgets: {budgets}")
            print(f"  - Sinking Funds: {sinking_funds}")
            print(f"  - Assets: {assets}")
            print(f"  - Liabilities: {liabilities}")
            print(f"  - Goals: {goals}")
            print(f"  - Paychecks: {paychecks}")
            print()
        
        if not users:
            print("No users found in database!")
            print("\nTo create a user, run:")
            print("  python backend/create_test_user.py")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
