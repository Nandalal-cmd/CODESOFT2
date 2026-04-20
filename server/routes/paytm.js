/**
 * ══════════════════════════════════════════
 *  FashionWear — Paytm Routes
 * ══════════════════════════════════════════
 */
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl   = require('../controllers/paytmController');
const { validatePaytmInitiate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

const payLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many payment requests. Please try again later.' },
});

router.post('/initiate',  payLimiter, validatePaytmInitiate, asyncHandler(ctrl.initiatePayment));
router.post('/callback',                                      asyncHandler(ctrl.handleCallback));
router.post('/verify',    payLimiter,                         asyncHandler(ctrl.verifyTransaction));

module.exports = router;
