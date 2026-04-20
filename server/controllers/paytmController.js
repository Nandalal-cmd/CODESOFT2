/**
 * ══════════════════════════════════════════
 *  FashionWear — Paytm Controller
 * ══════════════════════════════════════════
 */
const crypto = require('crypto');
const https  = require('https');
const { PAYTM, FRONTEND_URL, BACKEND_URL } = require('../config/env');
const { Order } = require('../models/Order');
const { createError } = require('../middleware/errorHandler');

/** Generate Paytm checksum */
function generateChecksum(params) {
  const sortedKeys = Object.keys(params).sort();
  const paramStr   = sortedKeys.map(k => `${k}=${params[k]}`).join('|');
  const salt       = crypto.randomBytes(4).toString('hex');
  const hash       = crypto.createHash('sha256').update(`${paramStr}|${salt}`).digest('hex');
  return `${hash}${salt}`;
}

/** Verify Paytm checksum */
function verifyChecksum(params, checksum) {
  const salt       = checksum.slice(-8);
  const sortedKeys = Object.keys(params).sort();
  const paramStr   = sortedKeys.map(k => `${k}=${params[k]}`).join('|');
  const hash       = crypto.createHash('sha256').update(`${paramStr}|${salt}`).digest('hex');
  return `${hash}${salt}` === checksum;
}

/** POST /api/paytm/initiate */
async function initiatePayment(req, res) {
  const { orderId, amount, email, phone, name } = req.body;

  const params = {
    MID:              PAYTM.MID,
    ORDER_ID:         orderId,
    CUST_ID:          email || 'customer@fashionwear.in',
    MOBILE_NO:        phone || '9999999999',
    EMAIL:            email || 'customer@fashionwear.in',
    TXN_AMOUNT:       parseFloat(amount).toFixed(2),
    CHANNEL_ID:       PAYTM.CHANNEL_ID,
    WEBSITE:          PAYTM.WEBSITE,
    INDUSTRY_TYPE_ID: PAYTM.INDUSTRY_TYPE,
    CALLBACK_URL:     `${BACKEND_URL}/api/paytm/callback`,
  };

  const checksum = generateChecksum(params);

  res.json({
    success:     true,
    paytmParams: params,
    checksum,
    txnUrl:      PAYTM.TXN_URL,
    orderId,
  });
}

/** POST /api/paytm/callback — Paytm posts here after payment */
async function handleCallback(req, res) {
  const received = { ...req.body };
  const checksum = received.CHECKSUMHASH;
  delete received.CHECKSUMHASH;

  const isValid = verifyChecksum(received, checksum);
  if (!isValid) {
    console.error('[Paytm] Checksum verification failed');
    return res.redirect(`${FRONTEND_URL}?payStatus=checksum_error`);
  }

  const txnStatus = received.STATUS;
  const orderId   = received.ORDER_ID;

  const order = await Order.findOne({ orderId });
  if (order) {
    order.paymentStatus  = txnStatus === 'TXN_SUCCESS' ? 'paid'   : 'failed';
    order.txnId          = received.TXNID;
    order.paytmResponse  = received;
    order.status         = txnStatus === 'TXN_SUCCESS' ? 'processing' : 'payment_failed';
    order.timeline.push({
      status: order.status,
      note:   txnStatus === 'TXN_SUCCESS' ? `Payment received. TXN: ${received.TXNID}` : 'Payment failed',
    });
    await order.save();
  }

  if (txnStatus === 'TXN_SUCCESS') {
    res.redirect(`${FRONTEND_URL}?order=${orderId}&txn=${received.TXNID}&payStatus=success`);
  } else {
    res.redirect(`${FRONTEND_URL}?order=${orderId}&payStatus=failed`);
  }
}

/** POST /api/paytm/verify — verify transaction status with Paytm */
async function verifyTransaction(req, res) {
  const { orderId } = req.body;
  if (!orderId) throw createError(400, 'orderId is required');

  const params   = { MID: PAYTM.MID, ORDERID: orderId };
  const checksum = generateChecksum(params);
  const postData = JSON.stringify({ ...params, CHECKSUMHASH: checksum });

  const options = {
    hostname: PAYTM.HOST,
    path:     '/order/status',
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const paytmReq = https.request(options, (paytmRes) => {
    let data = '';
    paytmRes.on('data', chunk => data += chunk);
    paytmRes.on('end', () => {
      try { res.json(JSON.parse(data)); }
      catch { res.json({ STATUS: 'ERROR', RESPMSG: 'Parse error' }); }
    });
  });

  paytmReq.on('error', err => res.status(500).json({ error: err.message }));
  paytmReq.write(postData);
  paytmReq.end();
}

module.exports = { initiatePayment, handleCallback, verifyTransaction };
