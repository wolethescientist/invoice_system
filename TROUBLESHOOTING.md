# Troubleshooting Guide

Common issues and their solutions when running the Invoicing Demo.

## Backend Issues

### Issue: `ModuleNotFoundError: No module named 'app'`

**Solution:**
Make sure you're running uvicorn from the backend directory:
```bash
cd backend
uvicorn app.main:app --reload
```

### Issue: `ImportError: cannot import name 'CryptContext' from 'passlib.context'`

**Solution:**
Install passlib with argon2 support:
```bash
pip install passlib[argon2]
```

### Issue: WeasyPrint fails to install or PDF generation errors

**Symptoms:**
- `OSError: cannot load library 'gobject-2.0-0'`
- `OSError: no library called "cairo" was found`

**Solution:**

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info
```

**macOS:**
```bash
brew install pango gdk-pixbuf libffi
```

**Windows:**
Use Docker instead, or install GTK3 runtime from:
https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer

### Issue: `sqlalchemy.exc.OperationalError: no such table`

**Solution:**
The database hasn't been initialized. Run the seed script:
```bash
cd backend
python seed.py
```

### Issue: `401 Unauthorized` on all API requests

**Solution:**
1. Check that you're logged in and have a valid token
2. Check that the Authorization header is being sent
3. Try logging in again
4. Check backend logs for JWT validation errors

### Issue: CORS errors in browser console

**Symptoms:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution:**
1. Check `CORS_ORIGINS` in backend `.env`:
   ```
   CORS_ORIGINS=http://localhost:3000
   ```
2. Restart the backend server
3. Clear browser cache

### Issue: Database is locked

**Symptoms:**
```
sqlite3.OperationalError: database is locked
```

**Solution:**
SQLite doesn't handle concurrent writes well. Either:
1. Stop all backend instances and restart
2. Delete the database file and re-seed:
   ```bash
   rm invoicing.db
   python seed.py
   ```
3. For production, use PostgreSQL instead

## Frontend Issues

### Issue: `Module not found: Can't resolve '@/...'`

**Solution:**
1. Check that `tsconfig.json` has the paths configured:
   ```json
   "paths": {
     "@/*": ["./src/*"]
   }
   ```
2. Restart the Next.js dev server

### Issue: `NEXT_PUBLIC_API_URL is not defined`

**Solution:**
Create `.env.local` in the frontend directory:
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

Restart the dev server after creating the file.

### Issue: Login redirects to login page immediately

**Solution:**
This usually means the token isn't being stored or sent correctly:
1. Check browser console for errors
2. Check Network tab to see if Authorization header is present
3. Try clearing browser storage and logging in again
4. Check that the backend is returning a valid token

### Issue: `npm install` fails with peer dependency errors

**Solution:**
Use the `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

Or use the exact versions specified in `package.json`.

### Issue: Charts not rendering

**Solution:**
1. Check that recharts is installed: `npm list recharts`
2. Check browser console for errors
3. Verify that metrics data is being returned from API
4. Try clearing React Query cache (refresh page)

### Issue: Animations not working

**Solution:**
1. Check that framer-motion is installed: `npm list framer-motion`
2. Check browser console for errors
3. Some browsers may have reduced motion settings enabled

## Docker Issues

### Issue: `docker-compose up` fails with port already in use

**Symptoms:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:8000: bind: address already in use
```

**Solution:**
1. Stop any running backend/frontend servers
2. Check what's using the port:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Mac/Linux
   lsof -i :8000
   ```
3. Kill the process or change the port in `docker-compose.yml`

### Issue: Backend container exits immediately

**Solution:**
1. Check logs: `docker-compose logs backend`
2. Common causes:
   - Missing dependencies (rebuild: `docker-compose up --build`)
   - Database initialization failed
   - Environment variables not set

### Issue: Frontend container shows "Module not found"

**Solution:**
Rebuild the containers:
```bash
docker-compose down
docker-compose up --build
```

### Issue: Changes not reflected in Docker containers

**Solution:**
1. For backend: Container should auto-reload with volume mounts
2. For frontend: Same, but you may need to rebuild:
   ```bash
   docker-compose restart frontend
   ```
3. If still not working, rebuild:
   ```bash
   docker-compose up --build
   ```

## API Issues

### Issue: PDF download returns 404

**Solution:**
1. Check that the invoice has been "sent" (PDF generated)
2. Click "Send Invoice" button first
3. Check backend logs for PDF generation errors
4. Check that `storage/pdfs/` directory exists and is writable

### Issue: Invoice creation fails with validation error

**Solution:**
Check the request payload:
1. `unit_price_cents` should be in cents (multiply dollars by 100)
2. `tax_rate` should be in basis points (7.5% = 750)
3. All required fields must be present
4. Dates should be in ISO format (YYYY-MM-DD)

### Issue: Metrics endpoint returns empty data

**Solution:**
1. Make sure you have invoices and payments in the database
2. Run the seed script to create demo data:
   ```bash
   cd backend
   python seed.py
   ```

## Authentication Issues

### Issue: "Invalid authentication credentials" error

**Solution:**
1. Token may have expired (15 min default)
2. Log out and log back in
3. Check that SECRET_KEY is the same between restarts
4. Clear browser cookies and try again

### Issue: Can't log in with demo credentials

**Solution:**
1. Make sure the database is seeded:
   ```bash
   cd backend
   python seed.py
   ```
2. Check that the user exists:
   ```bash
   sqlite3 invoicing.db "SELECT * FROM users;"
   ```
3. Try registering a new user instead

## Performance Issues

### Issue: API requests are slow

**Solution:**
1. Check backend logs for slow queries
2. For SQLite, performance is limited - consider PostgreSQL
3. Check that indexes exist on frequently queried columns
4. Enable React Query devtools to see cache hits/misses

### Issue: Frontend feels sluggish

**Solution:**
1. Check browser console for errors
2. Disable React Strict Mode if in development
3. Check Network tab for slow API requests
4. Clear browser cache
5. Check that skeleton loaders are showing (not just blank)

## Development Issues

### Issue: Hot reload not working

**Backend:**
```bash
# Make sure you're using --reload flag
uvicorn app.main:app --reload
```

**Frontend:**
```bash
# Try deleting .next folder
rm -rf .next
npm run dev
```

### Issue: TypeScript errors in IDE but code runs fine

**Solution:**
1. Restart TypeScript server in your IDE
2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Check `tsconfig.json` is correct

### Issue: Git shows too many changes

**Solution:**
Make sure `.gitignore` is working:
```bash
git rm -r --cached .
git add .
git commit -m "Fix gitignore"
```

## Testing Issues

### Issue: `test_api.py` fails with connection error

**Solution:**
1. Make sure backend is running on http://localhost:8000
2. Check that you've seeded the database
3. Check that demo user exists

### Issue: Tests pass but PDF download fails

**Solution:**
1. Check that WeasyPrint is installed correctly
2. Check system dependencies (see WeasyPrint section above)
3. Check that `storage/pdfs/` directory exists and is writable

## Production Issues

### Issue: Environment variables not loading

**Solution:**
1. Check that `.env` file exists (backend) or `.env.local` (frontend)
2. Restart the server after changing env vars
3. In production, set env vars through your hosting platform

### Issue: HTTPS/SSL errors in production

**Solution:**
1. Update cookie settings in `backend/app/api/auth.py`:
   ```python
   response.set_cookie(
       key="refresh_token",
       value=refresh_token,
       httponly=True,
       secure=True,  # Set to True in production
       samesite="none",  # For cross-origin
       max_age=30 * 24 * 60 * 60
   )
   ```
2. Update CORS settings for production domain

## Getting Help

If you're still stuck:

1. **Check the logs:**
   - Backend: Terminal where uvicorn is running
   - Frontend: Browser console (F12)
   - Docker: `docker-compose logs`

2. **Check the documentation:**
   - README.md - Overview and setup
   - QUICKSTART.md - Detailed setup instructions
   - API docs: http://localhost:8000/docs

3. **Common debugging steps:**
   - Clear browser cache and cookies
   - Restart both servers
   - Delete database and re-seed
   - Rebuild Docker containers
   - Check all environment variables

4. **Verify the basics:**
   - Python 3.11+ installed: `python --version`
   - Node.js 18+ installed: `node --version`
   - Dependencies installed: `pip list` and `npm list`
   - Correct directory: `pwd` or `cd`

5. **Still not working?**
   - Check GitHub issues (if applicable)
   - Review error messages carefully
   - Try the Docker setup if local setup fails
   - Start fresh with a clean clone
