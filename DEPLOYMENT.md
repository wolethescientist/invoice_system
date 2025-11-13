# Deployment Guide

Guide for deploying the Invoicing Demo to production.

## Overview

This guide covers deploying:
- **Frontend** to Vercel (recommended) or Netlify
- **Backend** to Railway, Render, or Fly.io
- **Database** upgrade from SQLite to PostgreSQL

---

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Accounts on chosen platforms
- Domain name (optional)

---

## Frontend Deployment (Vercel)

### Why Vercel?
- Zero-config Next.js deployment
- Automatic HTTPS
- Global CDN
- Free tier available
- Built-in CI/CD

### Steps

1. **Push code to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your Git repository
   - Select the `frontend` directory as root

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

## Backend Deployment (Railway)

### Why Railway?
- Easy PostgreSQL setup
- Automatic deployments
- Free tier with $5 credit
- Simple environment variables

### Steps

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically creates and connects it

4. **Configure Backend Service**
   - Click "New" → "GitHub Repo"
   - Select your repo
   - Set root directory to `backend`

5. **Set Environment Variables**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY=your-secret-key-here-use-openssl-rand-hex-32
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_DAYS=30
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   ```

6. **Configure Build**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

7. **Deploy**
   - Railway automatically deploys
   - Get your backend URL from the dashboard

8. **Run Database Migrations**
   - In Railway dashboard, open service shell
   - Run: `python seed.py`

### Alternative: Render

Similar process:
1. Create account at https://render.com
2. New Web Service → Connect Git repo
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

---

## Backend Deployment (Fly.io)

### Why Fly.io?
- Global edge deployment
- Free tier available
- Docker-based
- PostgreSQL included

### Steps

1. **Install Fly CLI**
   ```bash
   # Mac
   brew install flyctl
   
   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   flyctl auth login
   ```

3. **Create App**
   ```bash
   cd backend
   flyctl launch
   ```
   - Choose app name
   - Select region
   - Don't deploy yet

4. **Add PostgreSQL**
   ```bash
   flyctl postgres create
   flyctl postgres attach YOUR_POSTGRES_APP_NAME
   ```

5. **Set Environment Variables**
   ```bash
   flyctl secrets set SECRET_KEY=your-secret-key
   flyctl secrets set CORS_ORIGINS=https://your-frontend.vercel.app
   ```

6. **Deploy**
   ```bash
   flyctl deploy
   ```

7. **Run Seed Script**
   ```bash
   flyctl ssh console
   python seed.py
   exit
   ```

---

## Database Migration (SQLite → PostgreSQL)

### Update Backend Code

1. **Install PostgreSQL Driver**
   
   Add to `requirements.txt`:
   ```
   psycopg2-binary==2.9.9
   ```

2. **Update Database URL**
   
   In `.env` or environment variables:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

3. **No Code Changes Needed**
   
   SQLAlchemy handles the differences automatically!

### Migrate Data (if needed)

If you have existing SQLite data:

```python
# export_data.py
import sqlite3
import json

conn = sqlite3.connect('invoicing.db')
cursor = conn.cursor()

# Export customers
cursor.execute("SELECT * FROM customers")
customers = cursor.fetchall()
with open('customers.json', 'w') as f:
    json.dump(customers, f)

# Repeat for other tables
```

Then import to PostgreSQL using seed script or SQL.

---

## Environment Variables

### Backend (Production)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
SECRET_KEY=use-openssl-rand-hex-32-to-generate-this
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com

# Optional: Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Frontend (Production)

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## PDF Storage (Production)

### Option 1: Local Storage (Simple)

Keep PDFs on the server filesystem:
- Works for Railway, Render, Fly.io
- Limited by disk space
- Lost on container restart (use volumes)

### Option 2: S3 / Object Storage (Recommended)

Use AWS S3, Cloudflare R2, or DigitalOcean Spaces:

1. **Install boto3**
   ```bash
   pip install boto3
   ```

2. **Update PDF Service**
   ```python
   import boto3
   
   s3 = boto3.client('s3',
       aws_access_key_id=settings.AWS_ACCESS_KEY,
       aws_secret_access_key=settings.AWS_SECRET_KEY
   )
   
   def generate_invoice_pdf(invoice_id: int, db: Session):
       # ... generate PDF ...
       
       # Upload to S3
       s3.upload_file(
           local_path,
           settings.S3_BUCKET,
           f'invoices/{invoice_id}.pdf'
       )
       
       # Save S3 URL
       invoice.pdf_path = f'https://{settings.S3_BUCKET}.s3.amazonaws.com/invoices/{invoice_id}.pdf'
   ```

3. **Environment Variables**
   ```bash
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   S3_BUCKET=your-bucket-name
   ```

---

## Security Checklist

### Before Production

- [ ] Change SECRET_KEY to strong random value
- [ ] Set secure=True for cookies (HTTPS only)
- [ ] Update CORS_ORIGINS to production domains only
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set strong database password
- [ ] Don't commit .env files
- [ ] Review all environment variables
- [ ] Enable rate limiting (optional)
- [ ] Set up monitoring (Sentry, etc.)

### Cookie Settings for Production

Update `backend/app/api/auth.py`:

```python
response.set_cookie(
    key="refresh_token",
    value=refresh_token,
    httponly=True,
    secure=True,  # HTTPS only
    samesite="none",  # For cross-origin
    max_age=30 * 24 * 60 * 60
)
```

---

## Monitoring & Logging

### Sentry (Error Tracking)

1. **Install Sentry**
   ```bash
   pip install sentry-sdk[fastapi]
   ```

2. **Initialize in main.py**
   ```python
   import sentry_sdk
   
   sentry_sdk.init(
       dsn="your-sentry-dsn",
       traces_sample_rate=1.0,
   )
   ```

### Logging

Add structured logging:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

---

## Performance Optimization

### Backend

1. **Add Redis for Caching**
   ```bash
   pip install redis
   ```

2. **Use Background Workers**
   ```bash
   pip install celery
   ```

3. **Enable Gzip Compression**
   ```python
   from fastapi.middleware.gzip import GZipMiddleware
   app.add_middleware(GZipMiddleware, minimum_size=1000)
   ```

### Frontend

1. **Enable Image Optimization**
   - Use Next.js Image component
   - Configure image domains in next.config.js

2. **Add Analytics**
   ```bash
   npm install @vercel/analytics
   ```

3. **Enable Caching**
   - Configure in next.config.js
   - Use ISR for static pages

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd backend
          pip install -r requirements.txt
          python test_api.py

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: echo "Railway auto-deploys on push"
```

---

## Backup Strategy

### Database Backups

**Railway:**
- Automatic daily backups included
- Manual backup: Dashboard → Database → Backups

**Fly.io:**
```bash
flyctl postgres backup create
```

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore from Backup

```bash
psql $DATABASE_URL < backup.sql
```

---

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (Railway/Fly.io handle this)
- Stateless backend (no local sessions)
- Shared database (PostgreSQL)
- Shared file storage (S3)

### Vertical Scaling

- Upgrade server resources
- Optimize database queries
- Add indexes
- Use connection pooling

---

## Cost Estimates

### Free Tier (Development)

- **Vercel:** Free for personal projects
- **Railway:** $5 free credit/month
- **Render:** Free tier available
- **Total:** $0-5/month

### Production (Small Scale)

- **Vercel Pro:** $20/month
- **Railway:** ~$10-20/month
- **PostgreSQL:** Included
- **S3 Storage:** ~$1-5/month
- **Total:** ~$30-50/month

### Production (Medium Scale)

- **Vercel Pro:** $20/month
- **Railway/Render:** ~$50-100/month
- **PostgreSQL:** ~$25/month
- **S3 + CloudFront:** ~$10-20/month
- **Monitoring:** ~$10/month
- **Total:** ~$115-175/month

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Seed data prepared
- [ ] Security review complete
- [ ] Performance testing done

### Deployment

- [ ] Backend deployed and accessible
- [ ] Database created and seeded
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)

### Post-Deployment

- [ ] Test all features in production
- [ ] Verify PDF generation works
- [ ] Check authentication flow
- [ ] Test payment recording
- [ ] Monitor error logs
- [ ] Set up alerts
- [ ] Document production URLs

---

## Rollback Plan

If deployment fails:

1. **Vercel:** Revert to previous deployment in dashboard
2. **Railway:** Rollback in deployments tab
3. **Database:** Restore from backup
4. **DNS:** Update to previous backend URL

---

## Support & Maintenance

### Regular Tasks

- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Backup database weekly
- Review security quarterly

### Updates

```bash
# Backend
pip list --outdated
pip install --upgrade package-name

# Frontend
npm outdated
npm update
```

---

## Troubleshooting Production Issues

### Backend Not Responding

1. Check logs in hosting dashboard
2. Verify environment variables
3. Check database connection
4. Restart service

### CORS Errors

1. Verify CORS_ORIGINS includes frontend URL
2. Check cookie settings (secure, samesite)
3. Ensure HTTPS on both frontend and backend

### PDF Generation Fails

1. Check WeasyPrint dependencies installed
2. Verify storage/S3 configuration
3. Check file permissions
4. Review error logs

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Fly.io Documentation](https://fly.io/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Ready to deploy! 🚀**
