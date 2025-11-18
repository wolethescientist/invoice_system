# Deploy Frontend to Render

This guide covers deploying the Next.js frontend to Render as a web service (not static site, due to dynamic routes).

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Render account (https://render.com)
- Backend API deployed and accessible

---

## Why Web Service Instead of Static Site?

Your app uses dynamic routes (`/invoices/[id]`) which require a Node.js server to handle routing properly. Render's Web Service is perfect for this and still very affordable.

---

## Deployment Steps

### 1. Push Code to Git

```bash
git add .
git commit -m "Configure for Render deployment"
git push
```

### 2. Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Configure the service:

   **Basic Settings:**
   - **Name:** `invoicing-frontend` (or your preferred name)
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

   **Instance Type:**
   - Select **"Free"** or **"Starter"** ($7/month for better performance)

   **Environment Variables:**
   - Click **"Advanced"**
   - Add environment variable:
     ```
     Key: NEXT_PUBLIC_API_URL
     Value: https://your-backend-url.onrender.com
     ```
     ```
     Key: NODE_ENV
     Value: production
     ```

5. Click **"Create Web Service"**

### 3. Wait for Deployment

- Render will install dependencies, build, and start your Next.js server
- Build typically takes 3-5 minutes
- Once complete, you'll get a URL like: `https://invoicing-frontend.onrender.com`

### 4. Test Your Deployment

Visit your site and verify:
- [ ] Login page loads
- [ ] Can authenticate with backend
- [ ] Dashboard displays correctly
- [ ] Can create/view invoices
- [ ] Dynamic routes work (e.g., `/invoices/1`)
- [ ] All API calls work

---

## Custom Domain (Optional)

1. Go to your static site dashboard
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain (e.g., `app.yourdomain.com`)
4. Update your DNS records:
   - **Type:** CNAME
   - **Name:** app (or @)
   - **Value:** Your Render URL

---

## Environment Variables

### Required

```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Optional (if you add features)

```bash
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## Updating Your Deployment

Render automatically redeploys when you push to your connected branch:

```bash
git add .
git commit -m "Update frontend"
git push
```

Manual redeploy:
1. Go to your static site dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Troubleshooting

### Build Fails

**Check build logs** in Render dashboard for errors.

Common issues:
- Missing dependencies: Ensure `package.json` is correct
- Build command wrong: Should be `npm install && npm run build`
- Publish directory wrong: Should be `out`

### API Calls Fail

1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check backend CORS settings include your Render URL
3. Ensure backend is running and accessible

### 404 on Routes

- Ensure `trailingSlash: true` is in `next.config.js`
- Static sites need trailing slashes for client-side routing

### Images Not Loading

- Already configured with `unoptimized: true`
- If issues persist, check image paths are relative

---

## Next.js on Render

Your app runs as a Node.js web service with these benefits:

- ✅ Full Next.js features supported
- ✅ Dynamic routes work perfectly
- ✅ Client-side routing works
- ✅ All React features work
- ✅ API calls to external backend work
- ✅ Automatic HTTPS
- ✅ Fast global CDN

---

## Cost

**Render Web Services:**
- **Free tier:** Available (spins down after inactivity, 750 hours/month)
- **Starter:** $7/month (always on, better performance)
- Automatic HTTPS included
- Global CDN included
- Perfect for small to medium traffic

---

## Performance Tips

1. **Enable Caching**
   - Render automatically caches static assets
   - Uses CDN for fast global delivery

2. **Optimize Bundle Size**
   ```bash
   cd frontend
   npm run build
   # Check bundle size in output
   ```

3. **Add Analytics**
   - Use Vercel Analytics or Google Analytics
   - Monitor page load times

---

## Security Checklist

- [x] HTTPS enabled (automatic on Render)
- [x] Environment variables not in code
- [x] API URL configurable
- [ ] Update backend CORS to include Render URL
- [ ] Set secure cookie settings on backend

### Update Backend CORS

In your backend environment variables, add:

```bash
CORS_ORIGINS=https://your-frontend.onrender.com,https://your-custom-domain.com
```

---

## Render Dashboard Features

- **Deploys:** View build history and logs
- **Settings:** Update environment variables
- **Custom Domain:** Add your domain
- **Redirects/Rewrites:** Configure URL rules
- **Headers:** Add custom HTTP headers

---

## Alternative: Deploy to Other Platforms

If you prefer other platforms, the static export works with:

- **Netlify:** Similar process, drag-and-drop `out` folder
- **Cloudflare Pages:** Connect Git, set build command
- **AWS S3 + CloudFront:** Upload `out` folder to S3
- **GitHub Pages:** Push `out` folder to gh-pages branch

---

## Quick Reference

**Service Type:** Web Service (Node)

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NODE_ENV=production
```

---

## Alternative: True Static Site (Advanced)

If you really want a static site, you'd need to:
1. Remove dynamic routes or convert them to query params (e.g., `/invoice?id=1`)
2. Use `output: 'export'` in next.config.js
3. Deploy to Render Static Site with `out` directory

But the Web Service approach is simpler and works perfectly for your use case!

---

**Your frontend is now ready for deployment on Render! 🎉**
