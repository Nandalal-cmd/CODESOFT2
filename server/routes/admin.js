/**
 * ══════════════════════════════════════════
 *  FashionWear — Admin Routes
 * ══════════════════════════════════════════
 */
const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

router.get('/stats',             asyncHandler(ctrl.getDashboardStats));
router.get('/users',             asyncHandler(ctrl.listUsers));
router.patch('/users/:id/role',  asyncHandler(ctrl.updateUserRole));

module.exports = router;
