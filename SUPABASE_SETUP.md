# Supabase PostgreSQL Setup

## Database Configuration

Your backend is now configured to use Supabase PostgreSQL instead of SQLite.

### Connection String
```
postgresql://postgres.twfzdqtxulbawjecdrvv:[password]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```

## Setup Steps

### 1. Update Backend Environment Variables

On Render, update your environment variables:

```bash
DATABASE_URL=postgresql://postgres.twfzdqtxulbawjecdrvv:[password]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
SECRET_KEY=your-production-secret-key
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

### 2. Deploy Backend

The backend will automatically:
- Install `psycopg2-binary` for PostgreSQL support
- Create all tables on first run
- Run the seed script to create demo data

### 3. Manual Deployment (if needed)

If you need to redeploy:

```bash
# On Render, trigger a manual deploy
# Or push to your git repository
git add .
git commit -m "Switch to Supabase PostgreSQL"
git push
```

### 4. Start Command

Use this start command on Render:
```bash
python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

This will:
- Create all database tables
- Seed dummy customers and invoices (no users)
- Start the API server

## What Changed

### Backend Changes:
1. Added `psycopg2-binary` to requirements.txt
2. Updated database.py with PostgreSQL optimizations
3. Added pool_pre_ping for connection health checks
4. Created .env.example with PostgreSQL connection string

### Frontend Changes:
1. Created `/auth/register` page
2. Updated login page with success message after registration
3. Added link to register from login page

## Features

### Registration Flow:
1. User visits `/auth/register`
2. Fills out email, password, confirm password
3. On success, redirected to `/auth/login?registered=true`
4. Login page shows success message
5. User logs in with new credentials

### First User:
Register your first user at `/auth/register` - no demo account needed!

## Supabase Dashboard

Access your database at: https://supabase.com/dashboard

You can:
- View tables and data
- Run SQL queries
- Monitor connections
- Set up backups
- Configure security rules

## Troubleshooting

### Connection Issues
- Verify the password in your connection string
- Check Supabase dashboard for connection pooler status
- Ensure your Render IP isn't blocked

### Tables Not Created
Tables are created automatically on app startup. If issues persist:
1. Check Render logs for errors
2. Verify DATABASE_URL is correct
3. Check Supabase connection pooler status

## Security Notes

- Never commit the actual password to git
- Use environment variables for all sensitive data
- Rotate SECRET_KEY in production
- Enable SSL in production (Supabase uses SSL by default)
