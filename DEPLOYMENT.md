# 🚀 FashionWear Deployment Guide

This guide covers deploying FashionWear with **Vercel (frontend)** and **Render (backend)**.

---

## 📦 Architecture Overview

- **Frontend**: React + Vite → Vercel
- **Backend**: Express.js + MongoDB → Render
- **Database**: MongoDB Atlas (shared)

---

## Step 1: MongoDB Atlas Setup

1. **Create Account**: Go to [MongoDB Atlas](https://cloud.mongodb.com) → Sign Up (free)
2. **Create Cluster**: Choose "Free" tier → Create Cluster (takes 3-5 minutes)
3. **Create Database User**:
   - Go to "Database Access" (left menu)
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `admin` (or your choice)
   - Password: `YourStrongPassword123` (save this!)
   - Click "Add User"

4. **Whitelist IP Address**:
   - Go to "Network Access" (left menu)
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" → `0.0.0.0/0`
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Driver: "Node.js", Version: "3.6 or later"
   - **Copy the connection string**
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `fashionwear`

   **Example:**
   ```
   mongodb+srv://admin:YourStrongPassword123@cluster0.abcde.mongodb.net/fashionwear?retryWrites=true&w=majority
   ```

   **Your MONGODB_URI should look like:**
   ```
   MONGODB_URI=mongodb+srv://admin:YourStrongPassword123@cluster0.abcde.mongodb.net/fashionwear?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render

### 2.1. Create Render Account
- Sign up at [render.com](https://render.com)

### 2.2. Create Web Service
- **Service Type**: Web
- **Name**: `fashionwear-backend`
- **Region**: Your preferred region
- **Branch**: `main`
- **Root Directory**: `server` (IMPORTANT!)
- **Runtime**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Plan**: Free

### 2.3. Set Environment Variables
| Variable | Value | Type | Required |
|---|---|---|---|
| `NODE_ENV` | `production` | Plain | ✅ |
| `PORT` | `5000` | Plain | ✅ |
| `MONGODB_URI` | `mongodb+srv://...` | Secret | ✅ |
| `JWT_SECRET` | `your-strong-secret-key` | Secret | ✅ |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Plain | ✅ |
| `BACKEND_URL` | `https://your-backend.onrender.com` | Plain | ✅ |
| `ADMIN_EMAIL` | `admin@fashionwear.in` | Plain | ✅ |
| `ADMIN_PASSWORD` | `your-admin-password` | Secret | ✅ |
| `PAYTM_MID` | `YOUR_MID` | Secret | ❌ (optional) |
| `PAYTM_MERCHANT_KEY` | `YOUR_KEY` | Secret | ❌ (optional) |
| `PAYTM_WEBSITE` | `DEFAULT` | Plain | ❌ (optional) |
| `PAYTM_ENV` | `prod` | Plain | ❌ (optional) |

### 2.4. Deploy
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

## 🚀 Quick Start Deployment (Without Payments)

### Minimal Environment Variables for Render Backend:

**Required Variables:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://admin:password@cluster.mongodb.net/fashionwear
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://fashionwear-backend.onrender.com
ADMIN_EMAIL=admin@fashionwear.in
ADMIN_PASSWORD=your-admin-password
```

**Paytm Variables (Optional - Skip for now):**
```env
# Skip these for basic deployment - payments will use fallback mode
PAYTM_MID=YOUR_MID
PAYTM_MERCHANT_KEY=YOUR_KEY
PAYTM_WEBSITE=DEFAULT
PAYTM_ENV=prod
```

### Frontend Environment (Vercel):
```env
VITE_API_URL=https://fashionwear-backend.onrender.com/api
```

### What works without payments:
- ✅ User registration/login
- ✅ Product browsing
- ✅ Cart functionality
- ✅ Admin dashboard
- ✅ Order management (guest orders)
- ❌ Real payments (will show simulation message)

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
- Verify `FRONTEND_URL` in backend env matches your Vercel URL exactly
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

## 🚀 Alternative: Deploy Both Services to Render

If you prefer to use Render for both frontend and backend:

### Step 1: Deploy Backend to Render (Web Service)
1. **Service Type**: Web
2. **Root Directory**: `server`
3. **Build Command**: `npm install`
4. **Start Command**: `node index.js`
5. Set all backend environment variables

### Step 2: Deploy Frontend to Render (Static Site)
1. **Service Type**: Static Site
2. **Root Directory**: (leave empty)
3. **Build Command**: `npm run build`
4. **Publish Directory**: `dist`
5. Set `VITE_API_URL` environment variable

### Step 3: Update URLs
- Backend: `FRONTEND_URL` → Your Render frontend URL
- Frontend: `VITE_API_URL` → Your Render backend URL + `/api`

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

