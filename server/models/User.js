/**
 * ══════════════════════════════════════════
 *  FashionWear — User Model
 * ══════════════════════════════════════════
 */
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label:   { type: String, default: 'Home' },  // Home, Work, Other
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  line1:   { type: String, required: true },
  city:    { type: String, required: true },
  state:   { type: String, required: true },
  pin:     { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['admin', 'customer'], default: 'customer', index: true },
  phone:        { type: String, default: '' },
  avatar:       { type: String, default: '' },   // Initials or URL
  addresses:    [addressSchema],
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

// Indexes
userSchema.index({ email: 1, role: 1 });

// Virtual: public profile (never expose passwordHash)
userSchema.methods.toPublic = function () {
  return {
    id:        this._id,
    name:      this.name,
    email:     this.email,
    role:      this.role,
    phone:     this.phone,
    avatar:    this.avatar || this.name[0]?.toUpperCase(),
    addresses: this.addresses,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
