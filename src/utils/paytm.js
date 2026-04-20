/**
 * ══════════════════════════════════════════════════════════════
 *  FASHIONWEAR — PAYTM PAYMENT GATEWAY INTEGRATION
 * ══════════════════════════════════════════════════════════════
 *
 *  PRODUCTION SETUP GUIDE:
 *  ─────────────────────────────────────────────────────────────
 *  1. Register at: https://business.paytm.com
 *  2. Get credentials from Dashboard → Developer → API Keys:
 *     - MID (Merchant ID)
 *     - MERCHANT_KEY (Secret Key)
 *     - WEBSITE (WEBSTAGING for test, DEFAULT for prod)
 *     - CHANNEL_ID (WEB)
 *     - INDUSTRY_TYPE_ID (Retail)
 *  3. Install backend SDK:  npm install paytmchecksum
 *  4. Set ENV vars in .env:
 *     PAYTM_MID=YOUR_MID
 *     PAYTM_KEY=YOUR_MERCHANT_KEY
 *     PAYTM_ENV=TEST   (or PROD)
 *  5. Use the Node.js backend (server/paytm.js) to generate checksum
 *  ─────────────────────────────────────────────────────────────
 *
 *  FLOW:
 *  Frontend → POST /api/paytm/initiate → Backend generates checksum
 *  → Redirect to Paytm payment page
 *  → Paytm calls your CALLBACK_URL on success/failure
 *  → Backend verifies response checksum → Update order status
 */

export const PAYTM_CONFIG = {
  MID: 'YOUR_PAYTM_MID_HERE',
  WEBSITE: 'WEBSTAGING',           // 'DEFAULT' for production
  CHANNEL_ID: 'WEB',
  INDUSTRY_TYPE: 'Retail',
  CALLBACK_URL: 'http://localhost:3000/paytm/callback',
  TRANSACTION_URL_TEST: 'https://securegw-stage.paytm.in/theia/processTransaction',
  TRANSACTION_URL_PROD: 'https://securegw.paytm.in/theia/processTransaction',
  STATUS_URL_TEST: 'https://securegw-stage.paytm.in/order/status',
  STATUS_URL_PROD: 'https://securegw.paytm.in/order/status',
};

/**
 * Initiate Paytm payment — calls your backend to get checksum
 * then redirects to Paytm gateway
 */
export async function initiatePaytmPayment({ orderId, amount, email, phone, name }) {
  // In production: call your backend API to generate checksum
  // const response = await fetch('/api/paytm/initiate', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ orderId, amount, email, phone, name }),
  // });
  // const { checksum, paytmParams } = await response.json();
  // submitPaytmForm(paytmParams, checksum);

  // ── SIMULATION for development ──
  return simulatePayment(orderId, amount);
}

/** Simulate Paytm payment flow (demo only) */
export function simulatePayment(orderId, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate simulation
      resolve({
        success,
        txnId: 'TXN' + Date.now(),
        orderId,
        amount,
        status: success ? 'TXN_SUCCESS' : 'TXN_FAILURE',
        message: success ? 'Transaction Successful' : 'Transaction Failed',
        bankTxnId: 'BANK' + Math.random().toString(36).substr(2,12).toUpperCase(),
        paymentMode: 'PPI',
        currency: 'INR',
        txnDate: new Date().toISOString(),
      });
    }, 2000);
  });
}

/**
 * Build and submit the Paytm form (production use)
 * Called after getting checksum from backend
 */
export function submitPaytmForm(params, checksum) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = PAYTM_CONFIG.TRANSACTION_URL_TEST;
  const allParams = { ...params, CHECKSUMHASH: checksum };
  Object.entries(allParams).forEach(([key, val]) => {
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = key; input.value = val;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

/** Build Paytm request params */
export function buildPaytmParams({ orderId, amount, email, phone }) {
  return {
    MID: PAYTM_CONFIG.MID,
    ORDER_ID: orderId,
    CUST_ID: email,
    MOBILE_NO: phone,
    EMAIL: email,
    TXN_AMOUNT: amount.toString(),
    CHANNEL_ID: PAYTM_CONFIG.CHANNEL_ID,
    WEBSITE: PAYTM_CONFIG.WEBSITE,
    INDUSTRY_TYPE_ID: PAYTM_CONFIG.INDUSTRY_TYPE,
    CALLBACK_URL: PAYTM_CONFIG.CALLBACK_URL,
  };
}

/**
 * Verify transaction status — call your backend
 * Backend uses Paytm SDK to verify checksum & transaction
 */
export async function verifyTransaction(orderId) {
  // In production:
  // const response = await fetch('/api/paytm/verify', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ orderId }),
  // });
  // return response.json();
  return { status: 'TXN_SUCCESS', orderId };
}

export const PAYMENT_METHODS = [
  {
    id: 'paytm',
    label: 'Paytm',
    icon: '💳',
    badge: 'paytm',
    desc: 'UPI, Wallet, Cards & Net Banking',
    popular: true,
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    icon: '💳',
    desc: 'Visa, Mastercard, RuPay',
    popular: false,
  },
  {
    id: 'upi',
    label: 'UPI',
    icon: '📱',
    desc: 'Google Pay, PhonePe, BHIM',
    popular: false,
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    icon: '🏦',
    desc: 'All major banks supported',
    popular: false,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: '💵',
    desc: 'Pay when you receive',
    popular: false,
  },
];
