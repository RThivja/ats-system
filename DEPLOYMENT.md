# 🚀 ATS System - Complete Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Backend running locally
- [x] Frontend running locally  
- [x] All features working
- [x] CV upload working
- [x] Profile system working
- [x] Application system working

---

## 📦 Step 1: Prepare for Deployment

### Create GitHub Repository

1. Go to https://github.com/new
2. Create new repository: `ats-system`
3. **Don't** initialize with README (we have code already)

### Push Code to GitHub

```bash
cd e:\assignment
git init
git add .
git commit -m "Complete ATS System with all features"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ats-system.git
git push -u origin main
```

---

## 🗄️ Step 2: Deploy Database (Render PostgreSQL)

1. Go to https://render.com
2. Sign up / Login
3. Click **"New +"** → **"PostgreSQL"**
4. Settings:
   - Name: `ats-database`
   - Database: `ats_db`
   - User: `ats_user`
   - Region: Singapore (closest to you)
   - Plan: **Free**
5. Click **"Create Database"**
6. **COPY** the **"Internal Database URL"** - you'll need this!

---

## 🔧 Step 3: Deploy Backend (Render Web Service)

1. In Render, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Settings:
   - **Name:** `ats-backend`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Region:** Singapore
   - **Branch:** main
   - **Build Command:** 
     ```
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command:**
     ```
     npm start
     ```
   - **Plan:** Free

4. **Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   DATABASE_URL=<paste your Internal Database URL from Step 2>
   JWT_SECRET=your_super_secret_key_change_this_in_production
   FRONTEND_URL=https://ats-frontend.vercel.app
   PORT=5000
   NODE_ENV=production
   ```

5. Click **"Create Web Service"**
6. Wait 5-10 minutes for deployment
7. **COPY** your backend URL: `https://ats-backend-XXXX.onrender.com`

---

## 🎨 Step 4: Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Sign up / Login with GitHub
3. Click **"Add New"** → **"Project"**
4. Import your `ats-system` repository
5. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. **Environment Variables:**
   ```
   VITE_API_URL=https://ats-backend-XXXX.onrender.com/api
   ```
   (Replace XXXX with your actual backend URL from Step 3)

7. Click **"Deploy"**
8. Wait 2-3 minutes
9. **COPY** your frontend URL: `https://ats-frontend.vercel.app`

---

## 🔄 Step 5: Update Backend FRONTEND_URL

1. Go back to Render → Your backend service
2. Go to **"Environment"** tab
3. Update `FRONTEND_URL` to your actual Vercel URL
4. Click **"Save Changes"**
5. Backend will auto-redeploy (wait 2-3 minutes)

---

## ✅ Step 6: Test Deployment

### Test Recruiter Flow:
1. Visit your frontend URL
2. Click **"Sign Up"**
3. Register as **Recruiter**
4. Login
5. Go to Dashboard
6. Click **"Post Job"**
7. Create a job
8. Verify job appears in "My Jobs"

### Test Applicant Flow:
1. Logout
2. Register as **Applicant**
3. Go to Profile → Upload CV
4. Browse Jobs
5. Apply to a job
6. Check "My Applications"

### Test Recruiter Review:
1. Logout
2. Login as Recruiter
3. Dashboard → See pending applications
4. Click "Review Now"
5. View applicant CV
6. Update status

---

## 📝 Important Notes

### Free Tier Limitations:
- **Render Free:** Backend sleeps after 15 mins of inactivity (first request takes 30-60 seconds to wake up)
- **Vercel Free:** Unlimited bandwidth
- **PostgreSQL Free:** 1GB storage

### If Backend Sleeps:
- First page load will be slow (30-60 seconds)
- Subsequent requests will be fast
- This is normal for free tier!

### File Uploads:
- CV uploads are stored in backend `/uploads` folder
- On Render free tier, files are **ephemeral** (deleted on redeploy)
- For production, use Cloudinary or AWS S3

---

## 🎉 Your Public URLs

After deployment, you'll have:

- **Frontend:** `https://ats-frontend-XXXX.vercel.app`
- **Backend:** `https://ats-backend-XXXX.onrender.com`
- **Database:** Managed by Render

---

## 🐛 Troubleshooting

### Backend not working?
1. Check Render logs: Dashboard → Logs
2. Verify DATABASE_URL is correct
3. Check all environment variables are set

### Frontend not connecting?
1. Check VITE_API_URL is correct
2. Verify backend is running
3. Check browser console for errors

### Database errors?
1. Ensure DATABASE_URL is the **Internal** URL
2. Check Prisma migrations ran during build
3. Try manual migration: Render Shell → `npx prisma db push`

---

## 🔐 Security Checklist

Before going live:
- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS only (Render/Vercel do this automatically)
- [ ] Review CORS settings
- [ ] Add rate limiting (optional)
- [ ] Set up monitoring (optional)

---

## 📊 Monitoring

### Check if services are up:
- Frontend: Visit URL
- Backend: Visit `https://your-backend.onrender.com/api/health`
- Should return: `{"status":"OK","message":"ATS API is running"}`

---

**DEPLOYMENT COMPLETE!** 🎊

Your ATS system is now live and accessible worldwide! 🌍
