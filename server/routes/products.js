/**
 * ══════════════════════════════════════════
 *  FashionWear — Product Routes
 * ══════════════════════════════════════════
 */
const router = require('express').Router();
const ctrl   = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public
router.get('/',     asyncHandler(ctrl.listProducts));
router.get('/:id',  asyncHandler(ctrl.getProduct));

// Admin only
router.post('/',         requireAuth, requireAdmin, asyncHandler(ctrl.createProduct));
router.post('/seed',     requireAuth, requireAdmin, asyncHandler(ctrl.seedProducts));
router.put('/:id',       requireAuth, requireAdmin, asyncHandler(ctrl.updateProduct));
router.delete('/:id',    requireAuth, requireAdmin, asyncHandler(ctrl.deleteProduct));

module.exports = router;
