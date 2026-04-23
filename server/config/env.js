/**
 * ══════════════════════════════════════════
 *  FashionWear — Environment Configuration
 * ══════════════════════════════════════════
 */
require('dotenv').config();

const env = {
  NODE_ENV:       process.env.NODE_ENV        || 'development',
  PORT:           parseInt(process.env.PORT)   || 5001,

  // URLs
  FRONTEND_URL:   process.env.FRONTEND_URL     || 'http://localhost:3000',
  BACKEND_URL:    process.env.BACKEND_URL      || 'http://localhost:5001',

  // MongoDB
  MONGODB_URI:    process.env.MONGODB_URI      || 'mongodb://localhost:27017/fashionwear',

  // JWT
  JWT_SECRET:     process.env.JWT_SECRET       || 'change_me_in_production_please',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN   || '12h',

  // Admin seed
  ADMIN_EMAIL:    (process.env.ADMIN_EMAIL     || 'admin@fashionwear.in').toLowerCase(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD   || 'admin123',

  // Paytm
  PAYTM: {
    MID:          process.env.PAYTM_MID           || 'YOUR_MID',
    KEY:          process.env.PAYTM_MERCHANT_KEY   || 'YOUR_KEY',
    WEBSITE:      process.env.PAYTM_WEBSITE        || 'WEBSTAGING',
    CHANNEL_ID:   'WEB',
    INDUSTRY_TYPE:'Retail',
    ENV:          process.env.PAYTM_ENV            || 'test',
    get TXN_URL() {
      return this.ENV === 'prod'
        ? 'https://securegw.paytm.in/theia/processTransaction'
        : 'https://securegw-stage.paytm.in/theia/processTransaction';
    },
    get STATUS_URL() {
      return this.ENV === 'prod'
        ? 'https://securegw.paytm.in/order/status'
        : 'https://securegw-stage.paytm.in/order/status';
    },
    get HOST() {
      return this.ENV === 'prod' ? 'securegw.paytm.in' : 'securegw-stage.paytm.in';
    },
  },
};

// Validate critical secrets in production
if (env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  required.forEach(key => {
    if (!process.env[key]) {
      console.error(`  ❌  Missing required env var: ${key}`);
      process.exit(1);
    }
  });

  // Paytm is optional - provide defaults if not set
  if (!process.env.PAYTM_MID) {
    console.log('  ⚠️  PAYTM_MID not set - using demo mode');
    env.PAYTM.MID = 'DEMO_MID';
  }
  if (!process.env.PAYTM_MERCHANT_KEY) {
    console.log('  ⚠️  PAYTM_MERCHANT_KEY not set - using demo mode');
    env.PAYTM.KEY = 'DEMO_KEY';
  }
}

// Export flat for convenience
module.exports = {
  ...env,
  MONGODB_URI: env.MONGODB_URI,
  JWT_SECRET: env.JWT_SECRET,
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
  PAYTM: env.PAYTM,
  FRONTEND_URL: env.FRONTEND_URL,
  BACKEND_URL: env.BACKEND_URL,
  ADMIN_EMAIL: env.ADMIN_EMAIL,
  ADMIN_PASSWORD: env.ADMIN_PASSWORD,
};
