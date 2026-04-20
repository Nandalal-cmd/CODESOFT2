/**
 * ══════════════════════════════════════════
 *  FashionWear — Coupon Model
 * ══════════════════════════════════════════
 */
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:      { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  type:      { type: String, enum: ['percent', 'flat', 'freeship', 'b2g1'], required: true },
  value:     { type: Number, default: 0 },         // 0.50 for 50%, 300 for flat ₹300
  label:     { type: String, required: true },     // Display label e.g. "50% OFF"
  minOrder:  { type: Number, default: 0 },         // Minimum cart value to apply
  maxUses:   { type: Number, default: 0 },         // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },                       // null = no expiry
  isActive:  { type: Boolean, default: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
