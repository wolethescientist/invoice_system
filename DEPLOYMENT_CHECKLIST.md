# Deployment Checklist

## Backend (Render)

### 1. Update Environment Variables
Go to Render Dashboard → Your Service → Environment

```bash
DATABASE_URL=postgresql://postgres.twfzdqtxulbawjecdrvv:[YOUR_PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
SECRET_KEY=your-production-secret-key-change-this
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
```

### 2. Update Start Command
```bash
python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

This creates tables and seeds dummy data (customers/invoices only, no users).

### 3. Deploy
- Push to git or trigger manual deploy
- Wait for build to complete
- Check logs for "Database seeded successfully"

## Frontend (Vercel)

### 1. Update Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### 2. Deploy
- Push to git or trigger manual deploy
- Vercel will auto-deploy

## Test Registration Flow

1. Visit your Vercel URL
2. Click "Create one" or go to `/auth/register`
3. Register with a new email
4. Should redirect to login with success message
5. Log in with new credentials
6. Should land on dashboard

## First User

After deployment, register your first user at `/auth/register`

## Troubleshooting

### Backend 401 Errors on Login
- Make sure you've registered a user first at `/auth/register`
- Check DATABASE_URL is correct with password
- Verify tables were created (check Render logs for "Creating database tables")

### Frontend Can't Connect
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check backend CORS_ORIGINS includes your Vercel domain
- Test backend directly: `https://your-backend.onrender.com/docs`

### Registration Not Working
- Check browser console for errors
- Verify API endpoint: POST `/api/auth/register`
- Check backend logs for errors
