/**
 * ══════════════════════════════════════════
 *  FashionWear — Auth Controller
 * ══════════════════════════════════════════
 */
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Session = require('../models/Session');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { createError } = require('../middleware/errorHandler');

/** Sign a JWT and persist a session record */
async function signAndPersistToken(user) {
  const token   = jwt.sign(
    { sub: String(user._id), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
  const decoded = jwt.decode(token);
  await Session.create({
    token,
    userId:    user._id,
    expiresAt: new Date(decoded.exp * 1000),
  });
  return token;
}

/** POST /api/auth/register */
async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw createError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name:    name.trim(),
    email:   email.toLowerCase().trim(),
    passwordHash,
    role:    'customer',
    avatar:  name.trim()[0]?.toUpperCase(),
  });

  const token = await signAndPersistToken(user);
  res.status(201).json({ user: user.toPublic(), token });
}

/** POST /api/auth/login */
async function login(req, res) {
  const { email, password } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail, isActive: true });
  if (!user) throw createError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createError(401, 'Invalid email or password');

  const token = await signAndPersistToken(user);
  res.json({ user: user.toPublic(), token });
}

/** POST /api/auth/logout */
async function logout(req, res) {
  await Session.findOneAndUpdate({ token: req.token }, { revokedAt: new Date() });
  res.json({ success: true });
}

/** GET /api/auth/me */
async function me(req, res) {
  const user = await User.findById(req.auth.sub);
  if (!user) throw createError(404, 'User not found');
  res.json({ user: user.toPublic() });
}

/** PATCH /api/auth/me — update profile */
async function updateProfile(req, res) {
  const { name, phone, addresses } = req.body;
  const user = await User.findById(req.auth.sub);
  if (!user) throw createError(404, 'User not found');

  if (name    !== undefined) user.name    = name.trim();
  if (phone   !== undefined) user.phone   = phone;
  if (addresses !== undefined) user.addresses = addresses;

  await user.save();
  res.json({ user: user.toPublic() });
}

module.exports = { register, login, logout, me, updateProfile };
