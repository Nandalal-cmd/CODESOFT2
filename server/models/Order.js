/**
 * ══════════════════════════════════════════
 *  FashionWear — Order Model
 * ══════════════════════════════════════════
 */
const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed'];

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  imageUrl:  { type: String },
  size:      { type: String },
  color:     { type: String },
  qty:       { type: Number, required: true, min: 1 },
}, { _id: false });

const timelineEntrySchema = new mongoose.Schema({
  status:  { type: String },
  time:    { type: Date, default: Date.now },
  note:    { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId:       { type: String, required: true, unique: true, index: true },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },  // null for guest
  customer:      { type: String, required: true },
  email:         { type: String, required: true, lowercase: true },
  phone:         { type: String },
  address:       { type: String },                 // Flat formatted string
  items:         [orderItemSchema],
  subtotal:      { type: Number, required: true },
  discount:      { type: Number, default: 0 },
  couponCode:    { type: String, default: '' },
  shipping:      { type: Number, default: 0 },
  total:         { type: Number, required: true },
  paymentMethod: { type: String, default: 'paytm' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'cod'], default: 'pending' },
  status:        { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
  txnId:         { type: String },
  paytmResponse: { type: mongoose.Schema.Types.Mixed },
  timeline:      [timelineEntrySchema],
}, { timestamps: true });

orderSchema.index({ email: 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = { Order: mongoose.model('Order', orderSchema), ORDER_STATUSES };
