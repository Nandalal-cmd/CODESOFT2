/**
 * ══════════════════════════════════════════════════════════════
 *  FASHIONWEAR — EXPRESS BACKEND SERVER  v2.0
 *  Production-ready, modular architecture
 *
 *  SETUP:
 *    cd server && npm install && cp .env.example .env
 *    (fill in your credentials, then:)
 *    npm run dev
 * ══════════════════════════════════════════════════════════════
 */

const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');

const { connectDatabase } = require('./config/db');
const env = require('./config/env');

// Models (must be imported to register schemas before seeding)
const User    = require('./models/User');
const Coupon  = require('./models/Coupon');

// Routes
const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const orderRoutes    = require('./routes/orders');
const couponRoutes   = require('./routes/coupons');
const paytmRoutes    = require('./routes/paytm');
const adminRoutes    = require('./routes/admin');

const { errorHandler } = require('./middleware/errorHandler');

// ── App Setup ──────────────────────────────────────────────
const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    version:   '2.0.0',
    env:       env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Mount Routes ───────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/coupons',  couponRoutes);
app.use('/api/paytm',    paytmRoutes);
app.use('/api/admin',    adminRoutes);

// ── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ───────────────────────────────────
app.use(errorHandler);

// ── Seed Admin User & Default Coupons ─────────────────────
async function seedData() {
  // Admin user
  const existing = await User.findOne({ email: env.ADMIN_EMAIL });
  if (!existing) {
    const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await User.create({
      name:         'Admin',
      email:        env.ADMIN_EMAIL,
      passwordHash: hash,
      role:         'admin',
    });
    console.log(`  👤  Admin seeded: ${env.ADMIN_EMAIL}`);
  }

  // Default coupons
  const defaultCoupons = [
    { code:'SUMMER50', type:'percent',  value:0.50, label:'50% OFF',      minOrder:0,    isActive:true },
    { code:'B2G1TEE',  type:'b2g1',     value:0,    label:'Buy 2 Get 1',  minOrder:0,    isActive:true },
    { code:'FREESHIP', type:'freeship', value:0,    label:'Free Shipping', minOrder:0,   isActive:true },
    { code:'FLAT300',  type:'flat',     value:300,  label:'₹300 OFF',     minOrder:2499, isActive:true },
    { code:'NEWSTYLE', type:'percent',  value:0.10, label:'10% OFF',      minOrder:0,    isActive:true },
  ];

  for (const c of defaultCoupons) {
    await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true });
  }
  console.log('  🎟️  Default coupons seeded');
}

// ── Start Server ───────────────────────────────────────────
async function startServer() {
  try {
    await connectDatabase();
    await seedData();

    app.listen(env.PORT, () => {
      console.log('\n══════════════════════════════════════════');
      console.log('  🛍️  FashionWear Backend  v2.0');
      console.log(`  ✅  Running on http://localhost:${env.PORT}`);
      console.log(`  🌏  Frontend: ${env.FRONTEND_URL}`);
      console.log(`  💳  Paytm ENV: ${env.PAYTM.ENV.toUpperCase()}`);
      console.log('══════════════════════════════════════════\n');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
