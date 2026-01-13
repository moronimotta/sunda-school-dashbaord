# Vercel Deployment Guide

## Prerequisites
1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Neon PostgreSQL database (already configured)

## Step-by-Step Deployment

### 1. Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Prepare for Vercel deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/sunday-school-dashboard.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

**Option A: Using Vercel Dashboard (Easiest)**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Configure Environment Variables (see below)
6. Click "Deploy"

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from root directory
vercel

# For production deployment
vercel --prod
```

### 3. Configure Environment Variables in Vercel Dashboard

Go to Project Settings → Environment Variables and add:

**Required Variables:**
- `DATABASE_URL` = `postgresql://neondb_owner:npg_ApMWtrSc4iP0@ep-cool-glitter-ahgh0yk3-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
- `JWT_SECRET` = `your_secure_random_secret_key_change_this`
- `GEMINI_API_KEY` = `AIzaSyBuEK5t8p0ZR_U5mJAphaeOdRf5hXBW2r0`
- `GOOGLE_SERVICE_ACCOUNT_JSON` = (paste the entire JSON object from .env)

**Note:** For `GOOGLE_SERVICE_ACCOUNT_JSON`, paste the entire JSON as a single line or use Vercel's text editor for multiline values.

### 4. Database Migrations

Your Neon PostgreSQL database is already set up, but if you need to run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migrations using Vercel env
vercel env pull .env.local
cd backend
npx prisma migrate deploy
```

### 5. Verify Deployment

After deployment:
1. Visit your Vercel URL (e.g., `https://sunday-school-dashboard.vercel.app`)
2. Test login functionality
3. Test API endpoints: `https://your-app.vercel.app/api/health`
4. Upload a PDF to test file processing
5. Export to Google Sheets

## Project Structure for Vercel

```
sunday-school-dashboard/
├── api/
│   └── index.js              # Serverless function entry point
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── lib/
│   ├── services/
│   ├── server.js             # Express app (exported for serverless)
│   └── package.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── vercel.json               # Vercel configuration
├── package.json              # Root package.json
└── .vercelignore             # Files to ignore during deployment
```

## How It Works

1. **Frontend**: Vite builds the React app to `frontend/dist`
2. **Backend**: Express app runs as a serverless function in `/api`
3. **Routing**: 
   - All `/api/*` requests → serverless function
   - All other requests → static frontend files
4. **Database**: Connects to Neon PostgreSQL (already configured)

## Troubleshooting

### File Upload Issues
Vercel serverless functions have a 4.5MB request body limit. If PDFs are larger:
- Consider using Vercel Blob for file storage
- Or deploy backend separately to Railway/Render

### Cold Starts
First request after inactivity may be slow (~1-2 seconds). This is normal for serverless.

### Environment Variables Not Working
- Make sure all env vars are set in Vercel Dashboard
- Redeploy after adding/changing env vars
- Check logs: `vercel logs`

### Prisma Issues
If Prisma doesn't work:
```bash
# Add to backend/package.json scripts:
"vercel-build": "prisma generate"
```

## Alternative: Split Deployment

If you encounter issues with serverless functions (file uploads, cold starts), consider:

**Frontend**: Vercel (current setup)
**Backend**: Railway or Render
- Deploy backend as a regular Node.js app
- Update frontend `VITE_API_URL` to point to Railway/Render URL

### Railway Deployment (Backend Only)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
cd backend
railway login
railway init
railway up
```

Then update Vercel env: `VITE_API_URL=https://your-backend.railway.app/api`

## Post-Deployment

### Custom Domain (Optional)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

### Enable Google Sheets API for Production
Make sure your service account has access to create spreadsheets in production.

## Monitoring

- View logs: `vercel logs` or in Vercel Dashboard
- Check function usage in Vercel Dashboard → Analytics
- Monitor Neon database in Neon Dashboard

## Cost Estimate

- **Vercel**: Free tier (100GB bandwidth, unlimited requests)
- **Neon PostgreSQL**: Free tier (0.5GB storage, 1 compute unit)
- **Google APIs**: Free (within quota)
- **Total**: $0/month for typical usage

---

**Ready to Deploy?** Push to GitHub and import to Vercel! 🚀
