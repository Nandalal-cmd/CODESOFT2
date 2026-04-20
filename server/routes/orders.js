/**
 * ══════════════════════════════════════════
 *  FashionWear — Order Routes
 * ══════════════════════════════════════════
 */
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl      = require('../controllers/orderController');
const { requireAuth, optionalAuth, requireAdmin } = require('../middleware/auth');
const { validateOrderCreate, validateOrderStatus } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests. Please slow down.' },
});

// Customer (optional auth for guest checkout)
router.post('/',            orderLimiter, optionalAuth, validateOrderCreate, asyncHandler(ctrl.createOrder));
router.get('/my',           requireAuth,                                     asyncHandler(ctrl.getMyOrders));
router.get('/:orderId',     requireAuth,                                     asyncHandler(ctrl.getOrder));

// Admin
router.get('/',             requireAuth, requireAdmin,                                        asyncHandler(ctrl.listOrders));
router.patch('/:orderId/status',  requireAuth, requireAdmin, validateOrderStatus,            asyncHandler(ctrl.updateOrderStatus));
router.patch('/:orderId/payment', requireAuth, requireAdmin,                                  asyncHandler(ctrl.updatePaymentStatus));

module.exports = router;
