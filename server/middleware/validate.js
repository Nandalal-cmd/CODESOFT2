/**
 * ══════════════════════════════════════════
 *  FashionWear — Request Validation Helpers
 * ══════════════════════════════════════════
 */
const { ORDER_STATUSES } = require('../models/Order');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function isValidPhone(phone) {
  return /^[0-9]{10,15}$/.test(String(phone || ''));
}

/** Validate login / register body */
function validateAuthPayload(req, res, next) {
  const { email, password } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be 6–72 characters' });
  }
  next();
}

/** Validate register body (name required) */
function validateRegisterPayload(req, res, next) {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }
  validateAuthPayload(req, res, next);
}

/** Validate order creation body */
function validateOrderCreate(req, res, next) {
  const { total, email, items } = req.body || {};
  if (typeof total !== 'number' || isNaN(total) || total <= 0) {
    return res.status(400).json({ error: 'Order total must be a positive number' });
  }
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid customer email' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }
  next();
}

/** Validate order status update */
function validateOrderStatus(req, res, next) {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status must be one of: ${ORDER_STATUSES.join(', ')}`,
    });
  }
  next();
}

/** Validate Paytm initiate payload */
function validatePaytmInitiate(req, res, next) {
  const { orderId, amount, email, phone } = req.body || {};
  if (!orderId || typeof orderId !== 'string' || orderId.length > 64) {
    return res.status(400).json({ error: 'Valid orderId is required' });
  }
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Phone must be 10–15 digits' });
  }
  next();
}

module.exports = {
  isValidEmail,
  isValidPhone,
  validateAuthPayload,
  validateRegisterPayload,
  validateOrderCreate,
  validateOrderStatus,
  validatePaytmInitiate,
};
