/**
 * ══════════════════════════════════════════
 *  FashionWear — Coupon Routes
 * ══════════════════════════════════════════
 */
const router = require('express').Router();
const ctrl   = require('../controllers/couponController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public — validate a coupon code
router.post('/apply', asyncHandler(ctrl.applyCoupon));

// Admin — full CRUD
router.get('/',       requireAuth, requireAdmin, asyncHandler(ctrl.listCoupons));
router.post('/',      requireAuth, requireAdmin, asyncHandler(ctrl.createCoupon));
router.put('/:id',    requireAuth, requireAdmin, asyncHandler(ctrl.updateCoupon));
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(ctrl.deleteCoupon));

module.exports = router;
