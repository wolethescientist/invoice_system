# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Backend deployed and accessible (e.g., on Render)

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your repository
   - Select the `frontend` directory as the root directory
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   Add this in the Vercel dashboard under Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://invoice-system-9ft4.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - What's your project's name? invoice-system-frontend
   - In which directory is your code located? ./
   - Want to override settings? No

5. **Set environment variable**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```
   Enter: `https://invoice-system-9ft4.onrender.com`
   Select: Production, Preview, Development

6. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Configuration Files

### vercel.json
Already configured in `frontend/vercel.json` with optimal settings.

### Environment Variables
- `.env.local.example` - Template for local development
- `.env.production` - Production defaults (committed to repo)
- Vercel Dashboard - Override with actual production values

## Post-Deployment

### Update Backend CORS
Make sure your backend (Render) allows requests from your Vercel domain:

In your backend environment variables, update `CORS_ORIGINS`:
```
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

### Custom Domain (Optional)
1. Go to your project in Vercel Dashboard
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches and pull requests

## Local Development

1. **Create `.env.local`**
   ```bash
   cd frontend
   copy .env.local.example .env.local
   ```

2. **Update for local backend**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Requests Fail
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend CORS settings
- Ensure backend is accessible from Vercel's servers

### Environment Variables Not Working
- Environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Redeploy after changing environment variables
- Clear cache: Settings → General → Clear Cache

## Monitoring

- View deployment logs in Vercel Dashboard
- Check Analytics for performance metrics
- Set up Vercel Speed Insights (optional)

## Rollback

If something goes wrong:
1. Go to Deployments in Vercel Dashboard
2. Find a previous working deployment
3. Click "..." → "Promote to Production"
