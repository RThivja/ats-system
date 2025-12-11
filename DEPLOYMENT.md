# 🚀 ATS System - Railway + Vercel Deployment Guide

**No Credit Card Required! Permanent URLs!**

---

## 📋 Prerequisites

- ✅ Code pushed to GitHub: `https://github.com/RThivja/ats-system`
- ✅ GitHub account
- ✅ Email for verification

---

## 🎯 PART 1: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Login"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub
5. ✅ You're in!

---

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **"RThivja/ats-system"**
4. Railway will scan your repo

---

### Step 3: Add PostgreSQL Database

1. In your project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway creates database automatically
5. ✅ Database is ready!

---

### Step 4: Configure Backend Service

1. Click on your **main service** (should auto-detect as Node.js)
2. Go to **"Settings"** tab

#### Root Directory:
```
backend
```

#### Build Command:
```
npm install && npx prisma generate && npm run build
```

#### Start Command:
```
npm start
```

#### Watch Paths:
```
backend/**
```

---

### Step 5: Add Environment Variables

1. Go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Add these one by one:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=ats_super_secret_key_12345_change_in_production
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ats-system.vercel.app
```

**Important Notes:**
- `DATABASE_URL` will auto-populate from PostgreSQL
- Change `FRONTEND_URL` after deploying frontend (Step 8)
- Click **"Add"** after each variable

---

### Step 6: Deploy Backend

1. Go to **"Deployments"** tab
2. Click **"Deploy"**
3. Wait 3-5 minutes for build
4. ✅ Backend is live!

---

### Step 7: Get Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. You'll get: `https://ats-backend-production-XXXX.up.railway.app`
5. **COPY THIS URL** - you'll need it!

**Example:** `https://ats-backend-production-a1b2.up.railway.app`

---

### Step 8: Update FRONTEND_URL

1. Go back to **"Variables"** tab
2. Find `FRONTEND_URL`
3. Update to: `https://ats-system.vercel.app` (we'll create this next)
4. Save
5. Backend will auto-redeploy

---

## 🎨 PART 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel
5. ✅ Account created!

---

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find **"RThivja/ats-system"** in the list
3. Click **"Import"**

---

### Step 3: Configure Project

#### Framework Preset:
```
Vite
```

#### Root Directory:
Click **"Edit"** and select:
```
frontend
```

#### Build Command:
```
npm run build
```

#### Output Directory:
```
dist
```

#### Install Command:
```
npm install
```

---

### Step 4: Add Environment Variable

1. Expand **"Environment Variables"**
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://ats-backend-production-XXXX.up.railway.app/api`
   
   ⚠️ **Replace XXXX with your actual Railway backend URL from Step 7!**
   ⚠️ **Don't forget `/api` at the end!**

3. Click **"Add"**

---

### Step 5: Deploy Frontend

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. ✅ Frontend is live!

---

### Step 6: Get Frontend URL

1. After deployment completes
2. You'll see: **"Congratulations! 🎉"**
3. Your URL: `https://ats-system.vercel.app`
4. Click **"Visit"** to open your site!

---

### Step 7: Update Backend FRONTEND_URL (if needed)

1. Go back to Railway
2. **Variables** tab
3. Update `FRONTEND_URL` to your actual Vercel URL
4. Save

---

## ✅ PART 3: Verify Deployment

### Test Backend Health:

Visit: `https://your-backend.railway.app/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "ATS API is running"
}
```

✅ If you see this, backend is working!

---

### Test Frontend:

1. Visit your Vercel URL
2. Should see the ATS home page
3. Try registering a user
4. If registration works → ✅ Everything connected!

---

## 🐛 Troubleshooting

### Backend Issues:

**Problem:** Build fails
- Check **"Deployments"** → **"View Logs"**
- Look for errors
- Common fix: Ensure `package.json` has all dependencies

**Problem:** Database connection error
- Verify `DATABASE_URL` is set correctly
- Should be: `${{Postgres.DATABASE_URL}}`

**Problem:** Prisma errors
- Ensure build command includes: `npx prisma generate`

---

### Frontend Issues:

**Problem:** API calls fail
- Check `VITE_API_URL` is correct
- Must end with `/api`
- Must be your Railway backend URL

**Problem:** CORS errors
- Check backend `FRONTEND_URL` matches Vercel URL
- Redeploy backend after updating

**Problem:** Blank page
- Check browser console for errors
- Verify build completed successfully

---

## 📊 Monitor Your Deployment

### Railway Dashboard:
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time backend logs
- **Usage:** Hours used (500 free/month)

### Vercel Dashboard:
- **Analytics:** Page views, performance
- **Deployments:** History of all deploys
- **Logs:** Function logs

---

## 🔄 Redeploying After Changes

### Backend Changes:
1. Push to GitHub
2. Railway auto-deploys! ✅

### Frontend Changes:
1. Push to GitHub
2. Vercel auto-deploys! ✅

**Both platforms have automatic deployment from GitHub!**

---

## 🎉 Your Live URLs

After successful deployment:

**Frontend:** `https://ats-system.vercel.app`
**Backend:** `https://ats-backend-production-XXXX.up.railway.app`
**API Health:** `https://ats-backend-production-XXXX.up.railway.app/api/health`

---

## 💡 Important Notes

### Railway Free Tier:
- **500 execution hours/month**
- Backend sleeps after inactivity
- First request after sleep takes 30-60 seconds
- Perfect for demos and assignments!

### Vercel Free Tier:
- **Unlimited** bandwidth
- **Unlimited** deployments
- Always fast, no sleeping
- Perfect for frontend!

### Database:
- **1GB storage** on Railway
- Enough for thousands of users
- Automatic backups

---

## 🔐 Security Checklist

After deployment:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Verify CORS settings (FRONTEND_URL)
- [ ] Test all features work
- [ ] Check no sensitive data in logs
- [ ] Verify HTTPS is enabled (automatic)

---

## 📝 Final Test Checklist

- [ ] Visit frontend URL
- [ ] Register as Recruiter
- [ ] Create a job
- [ ] Logout
- [ ] Register as Applicant
- [ ] Update profile with CV
- [ ] Apply to job
- [ ] Logout
- [ ] Login as Recruiter
- [ ] View application
- [ ] Update status
- [ ] ✅ Everything works!

---

## 🎊 Congratulations!

Your ATS system is now **LIVE** and accessible worldwide! 🌍

**Share your URLs:**
- Frontend: `https://ats-system.vercel.app`
- Backend API: `https://your-backend.railway.app/api`

---

## 📞 Need Help?

**Railway Issues:**
- Railway Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

**Vercel Issues:**
- Vercel Docs: https://vercel.com/docs
- Support: https://vercel.com/support

---

**Deployment Complete! 🚀**

**Your ATS system is production-ready!** 🎉
