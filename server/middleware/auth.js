/**
 * ══════════════════════════════════════════
 *  FashionWear — Auth Middleware
 * ══════════════════════════════════════════
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const Session = require('../models/Session');

/** Require valid JWT — attaches req.auth & req.token */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Check session is still active (not revoked, not expired)
    const session = await Session.findOne({
      token,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ error: 'Session expired or revoked. Please log in again.' });
    }

    req.auth  = payload;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Optional auth — attaches req.auth if valid token provided, continues either way */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next();  // No token — proceed as guest
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const session = await Session.findOne({
      token,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (session) {
      req.auth  = payload;
      req.token = token;
    }
  } catch {
    // Bad token — continue as guest
  }

  next();
}

/** Require admin role (must come after requireAuth) */
function requireAdmin(req, res, next) {
  if (req.auth?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin };
