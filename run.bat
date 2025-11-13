@echo off
echo 🚀 Starting Invoicing Demo
echo.
echo This will start both backend and frontend servers.
echo Make sure you have Python 3.11+ and Node.js 18+ installed.
echo.

REM Check if backend dependencies are installed
if not exist "backend\venv" (
    echo 📦 Setting up backend virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    python seed.py
    cd ..
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Create .env.local if it doesn't exist
if not exist "frontend\.env.local" (
    echo 📝 Creating frontend .env.local...
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > frontend\.env.local
)

echo.
echo ✅ Setup complete!
echo.
echo Starting servers...
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.
echo Demo credentials:
echo   Email: demo@example.com
echo   Password: demo123
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows...
echo.
pause
