/**
 * ══════════════════════════════════════════
 *  FashionWear — Global Error Handler
 * ══════════════════════════════════════════
 */

/**
 * Wrap async route handlers to catch errors automatically.
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handling middleware.
 * Must be registered LAST in Express app.
 */
function errorHandler(err, req, res, next) {  // eslint-disable-line no-unused-vars
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ error: `${field} already exists` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Default 500
  const statusCode = err.statusCode || err.status || 500;
  const message    = err.expose ? err.message : (statusCode < 500 ? err.message : 'Internal server error');

  res.status(statusCode).json({ error: message });
}

/** Create a typed HTTP error */
function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.expose = true;
  return err;
}

module.exports = { asyncHandler, errorHandler, createError };
