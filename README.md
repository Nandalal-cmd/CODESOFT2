# 🛍️ FashionWear — Production-Ready Full-Stack Fashion E-Commerce

A **production-grade** fashion e-commerce platform built with **React 18 + Vite** on the frontend and a fully modular **Express.js + MongoDB** backend. Features real authentication, live order management, Paytm payment gateway, coupon validation, and a complete admin dashboard — all connected end-to-end.

---

## ✨ Feature Highlights

### 🛒 Customer Store
- **22 premium clothing products** across Men's, Women's & Unisex
- Filter by category, type & price range — sort by popularity, rating, price
- Product detail page with full description, images & recommendations
- **Wishlist** with heart icon (persisted in localStorage)
- **Cart sidebar** with live quantity controls (persisted in localStorage)
- **Real coupon validation** against MongoDB — server-side discount logic
- Rotating offer ticker banner
- **Light / Dark theme toggle** (saved to localStorage)

### 💳 Checkout (3 Steps)
- Delivery info → Payment method → Review & confirm
- **Paytm Gateway** integration — UPI, Wallet, Cards, Net Banking (real redirect)
- Credit/Debit Card, UPI (GPay / PhonePe / BHIM), Net Banking, Cash on Delivery
- Order created in MongoDB **before** payment redirect
- Paytm callback updates order status automatically
- Fallback simulation when backend is offline (dev mode)

### 👤 Authentication (Real API)
- **Customer registration + login** with JWT (previously blocked — now enabled)
- Passwords hashed with **bcryptjs** (12 rounds)
- JWT stored in localStorage; auto-attached to every API request via Axios interceptor
- **Session blacklisting** on logout (MongoDB `Session` model)
- Token expiry triggers silent logout + toast notification
- Protected routes: checkout, orders, profile → redirect to login

### 👥 User Features
- **My Orders** page — full order history with expandable timeline
- **Profile** page — edit name/phone, view saved addresses, security tab
- Real-time order status tracking with timeline events

### 🛡️ Admin Dashboard

| Page | Features |
|---|---|
| **Overview** | Live stats from API: revenue, orders, customers, products; recent orders table; order status breakdown; top products by sales |
| **Orders** | Real-time list from DB; filter by status; one-click status transitions (pending → processing → shipped → delivered); expandable detail rows; status override dropdown |
| **Products** | Full CRUD via API; seed catalog from static data with one click; stock & badge management; local data fallback when offline |
| **Customers** | Real user list from DB; search; pagination; role promotion (make/revoke admin) |
| **Coupons** | Full CRUD — create, edit, delete, toggle active/inactive; all types: percent, flat, free shipping, buy-2-get-1 |
| **Analytics** | Monthly revenue chart; top-selling products; conversion metrics |
| **Settings** | Store config, Paytm credentials, shipping & notification preferences |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/fashionwear-ecommerce.git
cd fashionwear-ecommerce/fashionwear
npm install        # Frontend dependencies
cd server
npm install        # Backend dependencies
```

### 🌍 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide:
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Render
- **Database**: MongoDB Atlas

Configuration files included:
- `vercel.json` — Vercel frontend config
- `render.yaml` — Render backend + frontend services
- `Procfile` — Alternative for platform-specific deployments

### 2. Configure Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001

MONGODB_URI=mongodb://localhost:27017/fashionwear

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=12h

ADMIN_EMAIL=admin@fashionwear.in
ADMIN_PASSWORD=Admin@123

PAYTM_MID=YOUR_MERCHANT_ID
PAYTM_MERCHANT_KEY=YOUR_SECRET_KEY
PAYTM_WEBSITE=WEBSTAGING
PAYTM_CHANNEL_ID=WEB
PAYTM_INDUSTRY_TYPE=Retail
PAYTM_ENV=test
```

### 3. Configure Frontend

```bash
# In fashionwear/ root — already created:
cat .env
# VITE_API_URL=http://localhost:5001/api
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (auto-seeds admin + coupons on first run)
cd fashionwear/server
npm run dev
# → http://localhost:5001

# Terminal 2 — Frontend
cd fashionwear
npm run dev
# → http://localhost:5173
```

### 5. Access

| URL | Description |
|---|---|
| `http://localhost:5173` | Customer store |
| `http://localhost:5173/admin` | Admin dashboard |
| `http://localhost:5001/api/health` | Backend health check |

**Default Admin:**
```
Email:    admin@fashionwear.in
Password: Admin@123
```

---

## 📁 Project Structure

```
fashionwear/
├── .env                          ← Frontend env (VITE_API_URL)
├── index.html                    ← SEO meta, OG tags, Google Fonts
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                  ← App entry point
│   ├── App.jsx                   ← View router & shell
│   ├── styles/
│   │   └── globals.css           ← Design system, CSS tokens, animations
│   ├── context/
│   │   └── AppContext.jsx        ← Global state: real API auth, cart, orders
│   ├── data/
│   │   └── products.js           ← 22 products, coupon fallback data
│   ├── utils/
│   │   ├── api.js                ← Axios client + typed API helpers
│   │   └── paytm.js              ← Payment method config
│   ├── components/
│   │   ├── Navbar.jsx            ← Nav with user dropdown, role badge, admin link
│   │   ├── CartSidebar.jsx       ← Sliding cart panel
│   │   ├── ProductCard.jsx       ← Card + detail modal
│   │   ├── SkeletonLoader.jsx    ← Shimmer loading states
│   │   └── UI.jsx                ← Shared UI (Toast, Loader, Labels)
│   └── pages/
│       ├── HomePage.jsx          ← Hero, filters, product grid
│       ├── CheckoutPage.jsx      ← 3-step checkout → real Paytm redirect
│       ├── ProductDescriptionPage.jsx ← Full product detail + recommendations
│       ├── ExtraPages.jsx        ← Auth, Wishlist, Order History, Profile
│       └── admin/
│           ├── AdminDashboard.jsx  ← Sidebar shell with 7 tabs
│           ├── AdminOverview.jsx   ← Live stats, recent orders, top products
│           ├── AdminOrders.jsx     ← Real CRUD, expandable rows, status update
│           ├── AdminProducts.jsx   ← Real CRUD + seed button + fallback
│           ├── AdminCustomers.jsx  ← Real user list, role promotion
│           ├── AdminCoupons.jsx    ← Full coupon CRUD + toggle
│           ├── AdminSettings.jsx   ← Store & payment config
│           └── AdminAnalytics.jsx  ← Revenue chart + metrics
└── server/
    ├── index.js                  ← Express entry, seeds admin + coupons
    ├── package.json
    ├── .env.example
    ├── config/
    │   ├── db.js                 ← Mongoose connection
    │   └── env.js                ← Centralized env vars
    ├── models/
    │   ├── User.js               ← Auth, address book, role
    │   ├── Product.js            ← Full catalog model
    │   ├── Order.js              ← Order + timeline + Paytm response
    │   ├── Coupon.js             ← Discount model (4 types)
    │   └── Session.js            ← JWT blacklisting on logout
    ├── middleware/
    │   ├── auth.js               ← requireAuth, optionalAuth, requireAdmin
    │   ├── errorHandler.js       ← Global error handler + asyncHandler wrapper
    │   └── validate.js           ← Request validation middleware
    ├── controllers/
    │   ├── authController.js     ← register, login, logout, me, updateProfile
    │   ├── productController.js  ← list, get, create, update, delete, seed
    │   ├── orderController.js    ← create, myOrders, get, list (admin), updateStatus
    │   ├── couponController.js   ← apply, list, create, update, delete
    │   ├── paytmController.js    ← initiate, callback, verify
    │   └── adminController.js    ← stats, users, updateUserRole
    ├── routes/
    │   ├── auth.js               ← /api/auth/*
    │   ├── products.js           ← /api/products/*
    │   ├── orders.js             ← /api/orders/*
    │   ├── coupons.js            ← /api/coupons/*
    │   ├── paytm.js              ← /api/paytm/*
    │   └── admin.js              ← /api/admin/*
    └── data/
        └── seedProducts.js       ← 22-product seed data for DB
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create customer account |
| `POST` | `/api/auth/login` | — | Login, returns JWT |
| `POST` | `/api/auth/logout` | ✅ | Revoke session |
| `GET`  | `/api/auth/me` | ✅ | Get current user |
| `PATCH`| `/api/auth/me` | ✅ | Update name/phone/addresses |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | — | List with filters, sort, pagination |
| `GET` | `/api/products/:id` | — | Single product |
| `POST`| `/api/products` | 🛡️ Admin | Create product |
| `PUT` | `/api/products/:id` | 🛡️ Admin | Update product |
| `DELETE` | `/api/products/:id` | 🛡️ Admin | Soft delete |
| `POST`| `/api/products/seed` | 🛡️ Admin | Seed 22 products from catalog |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Optional | Create (guest or logged-in) |
| `GET`  | `/api/orders/my` | ✅ | Current user's orders |
| `GET`  | `/api/orders/:orderId` | ✅ | Order detail (owner or admin) |
| `GET`  | `/api/orders` | 🛡️ Admin | All orders with filters |
| `PATCH`| `/api/orders/:orderId/status` | 🛡️ Admin | Update status |
| `PATCH`| `/api/orders/:orderId/payment` | 🛡️ Admin | Update payment status |

### Coupons
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/coupons/apply` | — | Validate & get discount info |
| `GET`  | `/api/coupons` | 🛡️ Admin | List all coupons |
| `POST` | `/api/coupons` | 🛡️ Admin | Create coupon |
| `PUT`  | `/api/coupons/:id` | 🛡️ Admin | Update coupon |
| `DELETE`| `/api/coupons/:id` | 🛡️ Admin | Delete coupon |

### Paytm
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/paytm/initiate` | Generate checksum + params |
| `POST` | `/api/paytm/callback` | Paytm posts here after payment |
| `POST` | `/api/paytm/verify` | Query transaction status |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Dashboard analytics |
| `GET` | `/api/admin/users` | All users with search/page |
| `PATCH`| `/api/admin/users/:id/role` | Promote/demote user role |

---

## 🎫 Coupon Codes

| Code | Type | Discount |
|---|---|---|
| `SUMMER50` | Percent | 50% off everything |
| `B2G1TEE` | Buy 2 Get 1 | Cheapest item free |
| `FREESHIP` | Free shipping | Free delivery |
| `FLAT300` | Flat amount | ₹300 off on orders ≥ ₹2,499 |
| `NEWSTYLE` | Percent | 10% off everything |

Coupons are seeded automatically on server start and can be managed via Admin → Coupons.

---

## 💳 Paytm Production Setup

1. Register at [business.paytm.com](https://business.paytm.com)
2. Get credentials: **Dashboard → Developer → API Keys**
3. Update `server/.env`:
   ```env
   PAYTM_MID=YOUR_MERCHANT_ID
   PAYTM_MERCHANT_KEY=YOUR_SECRET_KEY
   PAYTM_WEBSITE=DEFAULT
   PAYTM_ENV=prod
   ```
4. Set `CALLBACK_URL` to your live domain — the backend handles checksum generation & verification server-side

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 6, React Router |
| **State** | React Context + `useReducer` (cart), real API for auth/orders |
| **HTTP Client** | Axios with JWT interceptors |
| **Styling** | Pure CSS + CSS Variables (zero dependencies) |
| **Backend** | Node.js 18, Express.js (modular architecture) |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcryptjs + session blacklisting |
| **Payment** | Paytm Payment Gateway (checksum, callback, verify) |
| **Rate Limiting** | express-rate-limit on auth, order, payment routes |
| **CI/CD** | GitHub Actions |

---

## 🗃️ MongoDB Setup

### Option A: Local
```bash
MONGODB_URI=mongodb://localhost:27017/fashionwear
```

### Option B: MongoDB Atlas (recommended for production)
1. Create a cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a DB user, whitelist your IP
3. Copy the connection string:
   ```bash
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/fashionwear
   ```

---

## 🚀 Deployment

### Backend (Render / Railway / Fly.io)

Set these environment variables on your hosting provider:

```env
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.onrender.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=12h
ADMIN_EMAIL=admin@yourstore.com
ADMIN_PASSWORD=<strong-password>
PAYTM_MID=...
PAYTM_MERCHANT_KEY=...
PAYTM_WEBSITE=DEFAULT
PAYTM_ENV=prod
```

### Frontend (Vercel / Netlify)

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### GitHub Actions CI

CI runs on every push and PR:
- ✅ Frontend `vite build`
- ✅ Backend syntax check

Workflow: `.github/workflows/ci.yml`

---

## 🛡️ Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT **session blacklisting** — logout actually invalidates tokens
- **Rate limiting** — 15 auth attempts / 15 min; 30 orders / 10 min
- **Input validation middleware** on all mutation routes
- Paytm **checksum verified server-side** on every callback
- CORS restricted to `FRONTEND_URL` only
- Admin routes require both valid JWT `AND` `role === 'admin'`

---

*Built with ❤️ — FashionWear v2.0*
