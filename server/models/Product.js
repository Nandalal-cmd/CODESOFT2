/**
 * ══════════════════════════════════════════
 *  FashionWear — Product Model
 * ══════════════════════════════════════════
 */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },        // op (before discount)
  category:      { type: String, required: true, enum: ['Men', 'Women', 'Unisex'], index: true },
  type:          { type: String, required: true, index: true }, // T-Shirts, Shirts, etc.
  sizes:         [{ type: String }],
  colors:        [{ type: String }],
  imageUrl:      { type: String, default: '' },
  rating:        { type: Number, default: 4.0, min: 0, max: 5 },
  reviewCount:   { type: Number, default: 0, min: 0 },
  badge:         { type: String, enum: ['SALE', 'HOT', 'NEW', ''], default: '' },
  stock:         { type: Number, default: 0, min: 0 },
  sold:          { type: Number, default: 0, min: 0 },
  description:   { type: String, default: '' },
  isActive:      { type: Boolean, default: true, index: true },
}, { timestamps: true });

// Text search index
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, type: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
