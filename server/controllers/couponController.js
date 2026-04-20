/**
 * ══════════════════════════════════════════
 *  FashionWear — Coupon Controller
 * ══════════════════════════════════════════
 */
const Coupon = require('../models/Coupon');
const { createError } = require('../middleware/errorHandler');

/** POST /api/coupons/apply — validate coupon & return discount info */
async function applyCoupon(req, res) {
  const { code, cartSubtotal = 0 } = req.body;

  if (!code) throw createError(400, 'Coupon code is required');

  const coupon = await Coupon.findOne({
    code:     code.toUpperCase().trim(),
    isActive: true,
  });

  if (!coupon) throw createError(400, 'Invalid coupon code');

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw createError(400, 'This coupon has expired');
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    throw createError(400, 'This coupon has reached its usage limit');
  }

  if (cartSubtotal < coupon.minOrder) {
    throw createError(400, `Minimum order of ₹${coupon.minOrder} required for this coupon`);
  }

  res.json({
    success: true,
    coupon: {
      code:      coupon.code,
      type:      coupon.type,
      value:     coupon.value,
      label:     coupon.label,
      minOrder:  coupon.minOrder,
    },
  });
}

/** GET /api/coupons — admin */
async function listCoupons(req, res) {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json({ coupons, total: coupons.length });
}

/** POST /api/coupons — admin */
async function createCoupon(req, res) {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ coupon });
}

/** PUT /api/coupons/:id — admin */
async function updateCoupon(req, res) {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw createError(404, 'Coupon not found');
  res.json({ coupon });
}

/** DELETE /api/coupons/:id — admin */
async function deleteCoupon(req, res) {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw createError(404, 'Coupon not found');
  res.json({ success: true });
}

module.exports = { applyCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon };
