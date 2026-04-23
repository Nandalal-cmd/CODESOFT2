# 🚀 FashionWear Deployment Guide

This guide covers deploying FashionWear with **Vercel (frontend)** and **Render (backend)**.

---

## 📦 Architecture Overview

- **Frontend**: React + Vite → Vercel
- **Backend**: Express.js + MongoDB → Render
- **Database**: MongoDB Atlas (shared)

---

## Step 1: MongoDB Atlas Setup

1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user with read/write permissions
3. Whitelist IP `0.0.0.0/0` (or your Render/Vercel IPs)
4. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/fashionwear`

---

## Step 2: Deploy Backend to Render

### 2.1. Create Render Account
- Sign up at [render.com](https://render.com)

### 2.2. Create Web Service
- **Service Type**: Web
- **Name**: `fashionwear-backend`
- **Region**: Your preferred region
- **Branch**: `main`
- **Root Directory**: `server`

### 2.3. Configure Build & Start
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Plan**: Free

### 2.4. Set Environment Variables
| Variable | Value | Type |
|---|---|---|
| `NODE_ENV` | `production` | Plain |
| `PORT` | `5000` | Plain |
| `MONGODB_URI` | `mongodb+srv://...` | Secret |
| `JWT_SECRET` | `your-strong-secret-key` | Secret |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Plain |
| `BACKEND_URL` | `https://your-backend.onrender.com` | Plain |
| `ADMIN_EMAIL` | `admin@fashionwear.in` | Plain |
| `ADMIN_PASSWORD` | `your-admin-password` | Secret |
| `PAYTM_MID` | `YOUR_MID` | Secret |
| `PAYTM_MERCHANT_KEY` | `YOUR_KEY` | Secret |
| `PAYTM_WEBSITE` | `DEFAULT` | Plain |
| `PAYTM_ENV` | `prod` | Plain |

### 2.5. Deploy
- Click **Create Web Service**
- Render will auto-build and deploy
- Your backend URL: `https://fashionwear-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1. Install Vercel CLI (optional)
```bash
npm install -g vercel
```

### 3.1. Create Vercel Project
```bash
cd fashionwear
vercel
```

Or use the web dashboard:
- Import your Git repository
- Select the `fashionwear` directory (root, not `/server`)

### 3.2. Configure Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: (leave empty)
- **Install Command**: `npm install`

### 3.3. Set Environment Variables
| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |

### 3.4. Deploy
- Click **Deploy**
- Your frontend URL: `https://fashionwear-frontend.vercel.app`

---

## Step 4: Update URLs

After deployment, update these values:

### Backend (in Render env vars):
```env
FRONTEND_URL=https://fashionwear-frontend.vercel.app
BACKEND_URL=https://fashionwear-backend.onrender.com
```

### Frontend (in Vercel env vars):
```env
VITE_API_URL=https://fashionwear-backend.onrender.com/api
```

---

## Step 5: Test Deployment

### Backend Health Check
```bash
curl https://fashionwear-backend.onrender.com/api/health
```
Expected: `{"status":"ok","version":"2.0.0",...}`

### Frontend
Visit: `https://fashionwear-frontend.vercel.app`
- Should load the store
- Products should display
- Admin dashboard at `/admin`

---

## 🔧 Troubleshooting

### CORS Issues
If frontend can't reach backend:
- Verify `FRONTEND_URL` in backend env matches exactly
- Check CORS config in `server/index.js` (line 37-40)

### MongoDB Connection
- Verify MongoDB Atlas connection string
- Check Atlas IP whitelist (use `0.0.0.0/0` for testing)
- Username/password must be URL-encoded if special chars exist

### Static Files Not Loading (Vercel)
- Verify `vercel.json` routes config
- Ensure `dist` folder is built correctly
- Check Vercel build logs for errors

### Render Timeout
- Increase timeout in Render settings (default 300s)
- Check server logs for startup errors
- Verify `PORT` is set (Render provides `$PORT` env)

---

## 🔄 CI/CD (Optional)

### Automatic Deploy on Push

**Vercel**: Auto-connected to your Git repo → deploys on push to `main`

**Render**: 
- In service settings → "Auto-Deploy" → enable
- Or add webhook to your Git repo

---

## 📝 Environment Variable Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fashionwear
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://fashionwear-frontend.vercel.app
BACKEND_URL=https://fashionwear-backend.onrender.com
ADMIN_EMAIL=admin@fashionwear.in
ADMIN_PASSWORD=your-admin-password
PAYTM_MID=YOUR_MERCHANT_ID
PAYTM_MERCHANT_KEY=YOUR_SECRET_KEY
PAYTM_WEBSITE=DEFAULT
PAYTM_ENV=prod
```

### Frontend (Vercel)
```env
VITE_API_URL=https://fashionwear-backend.onrender.com/api
```

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Render backend deployed and healthy (`/api/health`)
- [ ] Vercel frontend deployed and loading
- [ ] Environment variables configured on both platforms
- [ ] CORS configured correctly (frontend → backend)
- [ ] Admin user seeded (check backend logs)
- [ ] Products visible on frontend
- [ ] Admin dashboard accessible at `/admin`
- [ ] Test product purchase flow (guest checkout)
- [ ] Paytm credentials configured (for production)

---

## 💡 Production Tips

1. **Use Strong Secrets**: Generate random JWT secrets
2. **MongoDB Atlas**: Use dedicated cluster, not shared
3. **Paytm**: Only switch to `prod` after testing in `test` mode
4. **Monitoring**: Enable logs on both Render and Vercel
5. **Backups**: Regular MongoDB Atlas backups
6. **Rate Limits**: Upgrade Render plan if hitting free tier limits
7. **HTTPS**: Both platforms provide automatic SSL

---

## 🆘 Support

- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- FashionWear issues: Check browser console and network tabs

