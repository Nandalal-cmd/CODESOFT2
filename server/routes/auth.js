/**
 * ══════════════════════════════════════════
 *  FashionWear — Auth Routes
 * ══════════════════════════════════════════
 */
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl      = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validateAuthPayload, validateRegisterPayload } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many auth attempts. Please try again later.' },
});

router.post('/register', authLimiter, validateRegisterPayload, asyncHandler(ctrl.register));
router.post('/login',    authLimiter, validateAuthPayload,     asyncHandler(ctrl.login));
router.post('/logout',   requireAuth,                          asyncHandler(ctrl.logout));
router.get('/me',        requireAuth,                          asyncHandler(ctrl.me));
router.patch('/me',      requireAuth,                          asyncHandler(ctrl.updateProfile));

module.exports = router;
