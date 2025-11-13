.PHONY: help install dev build test clean

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies for both frontend and backend"
	@echo "  make dev        - Run both frontend and backend in development mode"
	@echo "  make build      - Build the project"
	@echo "  make test       - Run API integration tests"
	@echo "  make clean      - Clean build artifacts and dependencies"
	@echo "  make docker-up  - Start with Docker Compose"
	@echo "  make docker-down - Stop Docker Compose"

install:
	@echo "Installing backend dependencies..."
	cd backend && python -m pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:8000"
	@echo "Frontend will run on http://localhost:3000"
	@echo ""
	@echo "Run these in separate terminals:"
	@echo "  Terminal 1: cd backend && python seed.py && uvicorn app.main:app --reload"
	@echo "  Terminal 2: cd frontend && npm run dev"

build:
	@echo "Building frontend..."
	cd frontend && npm run build

test:
	@echo "Running API tests..."
	cd backend && python test_api.py

clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/__pycache__ backend/app/__pycache__
	rm -rf backend/*.db backend/storage/pdfs/*.pdf
	rm -rf frontend/.next frontend/node_modules

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down
