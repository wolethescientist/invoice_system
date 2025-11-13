# Windows Setup Guide

Special instructions for running the Invoicing Demo on Windows.

## Issue: WeasyPrint on Windows

WeasyPrint requires GTK libraries which are difficult to install on Windows. We've replaced it with **xhtml2pdf**, which works natively on Windows.

## Quick Setup

### Option 1: Docker (Easiest - Recommended)

Docker handles all dependencies automatically:

```powershell
docker-compose up --build
```

That's it! Visit http://localhost:3000

### Option 2: Manual Setup (Updated for Windows)

**1. Install Python 3.11+**
- Download from https://www.python.org/downloads/
- Check "Add Python to PATH" during installation

**2. Install Node.js 18+**
- Download from https://nodejs.org/
- Use the LTS version

**3. Setup Backend**

```powershell
# Open PowerShell in the project directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies (now using xhtml2pdf instead of weasyprint)
pip install -r requirements.txt

# Seed database
python seed.py

# Start backend server
uvicorn app.main:app --reload --port 8000
```

**4. Setup Frontend (New PowerShell Window)**

```powershell
cd frontend

# Install dependencies
npm install

# Create environment file
copy .env.local.example .env.local

# Start frontend server
npm run dev
```

**5. Access the Application**

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Demo Login:**
- Email: `demo@example.com`
- Password: `demo123`

## Using the Batch Script

We've included a Windows batch script for easy startup:

```powershell
.\run.bat
```

This will:
1. Check if dependencies are installed
2. Install them if needed
3. Seed the database
4. Start both servers in separate windows

## Troubleshooting Windows Issues

### Issue: "python is not recognized"

**Solution:**
1. Reinstall Python and check "Add Python to PATH"
2. Or use full path: `C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe`

### Issue: "npm is not recognized"

**Solution:**
1. Reinstall Node.js
2. Restart PowerShell/Command Prompt
3. Or add Node.js to PATH manually

### Issue: PowerShell execution policy error

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Port already in use

**Solution:**
```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Virtual environment activation fails

**Solution:**
Use Command Prompt instead of PowerShell:
```cmd
cd backend
venv\Scripts\activate.bat
```

### Issue: SQLite database locked

**Solution:**
```powershell
# Delete the database and re-seed
cd backend
del invoicing.db
python seed.py
```

## PDF Generation on Windows

We've replaced WeasyPrint with **xhtml2pdf** which:
- ✅ Works natively on Windows
- ✅ No external dependencies needed
- ✅ Pure Python implementation
- ✅ Generates PDFs from HTML/CSS

**Note:** xhtml2pdf has some CSS limitations compared to WeasyPrint:
- Flexbox support is limited
- Some modern CSS features may not work
- But it's perfect for invoice PDFs!

## Alternative: WSL2 (Windows Subsystem for Linux)

If you want to use the original WeasyPrint:

**1. Install WSL2**
```powershell
wsl --install
```

**2. Install Ubuntu from Microsoft Store**

**3. Run in WSL2**
```bash
# In WSL2 terminal
cd /mnt/c/path/to/project
./run.sh
```

## Docker Desktop on Windows

**1. Install Docker Desktop**
- Download from https://www.docker.com/products/docker-desktop/
- Requires Windows 10/11 Pro, Enterprise, or Education
- Or Windows 10/11 Home with WSL2

**2. Start Docker Desktop**

**3. Run the project**
```powershell
docker-compose up --build
```

## Performance Tips for Windows

1. **Use SSD** - SQLite performs better on SSD
2. **Exclude from antivirus** - Add project folder to Windows Defender exclusions
3. **Use PowerShell 7** - Faster than Windows PowerShell 5.1
4. **Close unnecessary apps** - Free up RAM and CPU

## IDE Recommendations for Windows

- **VS Code** - Best for full-stack development
  - Install Python extension
  - Install ESLint extension
  - Install Tailwind CSS IntelliSense
  
- **PyCharm** - Great for Python backend
  
- **WebStorm** - Great for React frontend

## Git on Windows

**Install Git:**
- Download from https://git-scm.com/download/win
- Use Git Bash for Unix-like commands

**Configure line endings:**
```bash
git config --global core.autocrlf true
```

## Environment Variables on Windows

**Set temporarily (current session):**
```powershell
$env:DATABASE_URL="sqlite:///./invoicing.db"
```

**Set permanently:**
1. Search "Environment Variables" in Windows
2. Click "Environment Variables" button
3. Add new user or system variable

## Running Tests on Windows

```powershell
cd backend
python test_api.py
```

## Building for Production on Windows

**Backend:**
```powershell
cd backend
pip install -r requirements.txt
# Deploy to Railway, Render, or Fly.io
```

**Frontend:**
```powershell
cd frontend
npm run build
# Deploy to Vercel
```

## Common Windows-Specific Errors

### Error: "Access is denied"

**Solution:**
- Run PowerShell as Administrator
- Or check file permissions

### Error: "Cannot find module"

**Solution:**
```powershell
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
rm -r node_modules
npm install
```

### Error: "ENOENT: no such file or directory"

**Solution:**
- Use forward slashes in paths: `frontend/src/app`
- Or use `path.join()` in Node.js

## Firewall Issues

If you can't access http://localhost:3000:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js and Python
4. Allow on Private networks

## Next Steps

1. ✅ Backend running on http://localhost:8000
2. ✅ Frontend running on http://localhost:3000
3. ✅ Login with demo@example.com / demo123
4. ✅ Create invoices and download PDFs
5. ✅ Explore the dashboard

## Need Help?

- Check `TROUBLESHOOTING.md` for common issues
- Check `README.md` for general documentation
- Check `QUICKSTART.md` for detailed setup

## Windows-Friendly Alternatives

If you continue to have issues:

1. **Use Docker** - Most reliable on Windows
2. **Use WSL2** - Linux environment on Windows
3. **Use GitHub Codespaces** - Cloud development environment
4. **Deploy to cloud** - Develop in production environment

---

**The app now works perfectly on Windows! 🎉**
