/**
 * ══════════════════════════════════════════
 *  FashionWear — Order Controller
 * ══════════════════════════════════════════
 */
const crypto = require('crypto');
const { Order, ORDER_STATUSES } = require('../models/Order');
const { createError } = require('../middleware/errorHandler');

/** Generate guaranteed unique order ID: FW + timestamp + random */
function genOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `FW${timestamp}${random}`;
}

/** POST /api/orders */
async function createOrder(req, res) {
  const {
    customer, email, phone, address, items,
    subtotal, discount, couponCode, shipping, total,
    paymentMethod,
  } = req.body;

  const orderId = genOrderId();

  const order = await Order.create({
    orderId,
    userId:        req.auth?.sub || null,
    customer:      customer || 'Guest',
    email:         email || '',
    phone:         phone || '',
    address:       address || '',
    items:         (items || []).map(i => ({
      productId: i.productId || null,
      name:      i.name || i.item?.name || '',
      price:     i.price || i.item?.price || 0,
      imageUrl:  i.imageUrl || i.item?.img || '',
      size:      i.sz || i.size || '',
      color:     i.col || i.color || '',
      qty:       i.qty || 1,
    })),
    subtotal:      subtotal || 0,
    discount:      discount || 0,
    couponCode:    couponCode || '',
    shipping:      shipping || 0,
    total:         total || 0,
    paymentMethod: paymentMethod || 'paytm',
    paymentStatus: paymentMethod === 'cod' ? 'cod' : 'pending',
    status:        'pending',
    timeline: [{ status: 'pending', note: 'Order placed successfully' }],
  });

  res.status(201).json({ success: true, order, orderId });
}

/** GET /api/orders/my — logged-in customer's orders */
async function getMyOrders(req, res) {
  const orders = await Order.find({
    $or: [
      { userId: req.auth.sub },
      { email: req.auth.email },
    ],
  }).sort({ createdAt: -1 }).lean();

  res.json({ orders, total: orders.length });
}

/** GET /api/orders/:orderId — owner or admin */
async function getOrder(req, res) {
  const order = await Order.findOne({ orderId: req.params.orderId }).lean();
  if (!order) throw createError(404, 'Order not found');

  // Allow: admin OR the order owner
  const isOwner = req.auth?.sub && (
    String(order.userId) === req.auth.sub ||
    order.email === req.auth.email
  );

  if (req.auth?.role !== 'admin' && !isOwner) {
    throw createError(403, 'Access denied');
  }

  res.json({ order });
}

/** GET /api/orders — admin: all orders */
async function listOrders(req, res) {
  const { status, page = 1, limit = 20, search } = req.query;
  const filter = {};

  if (status && status !== 'all') filter.status = status;
  if (search) {
    filter.$or = [
      { orderId:  { $regex: search, $options: 'i' } },
      { customer: { $regex: search, $options: 'i' } },
      { email:    { $regex: search, $options: 'i' } },
    ];
  }

  const skip   = (Number(page) - 1) * Number(limit);
  const total  = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

/** PATCH /api/orders/:orderId/status — admin */
async function updateOrderStatus(req, res) {
  const { status, note } = req.body;
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) throw createError(404, 'Order not found');

  order.status = status;
  order.timeline.push({ status, note: note || '' });
  await order.save();

  res.json({ success: true, order });
}

/** PATCH /api/orders/:orderId/payment — called after Paytm callback */
async function updatePaymentStatus(req, res) {
  const { paymentStatus, txnId, paytmResponse } = req.body;
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) throw createError(404, 'Order not found');

  order.paymentStatus = paymentStatus;
  if (txnId) order.txnId = txnId;
  if (paytmResponse) order.paytmResponse = paytmResponse;

  if (paymentStatus === 'paid' && order.status === 'pending') {
    order.status = 'processing';
    order.timeline.push({ status: 'processing', note: 'Payment received' });
  } else if (paymentStatus === 'failed') {
    order.status = 'payment_failed';
    order.timeline.push({ status: 'payment_failed', note: 'Payment failed' });
  }

  await order.save();
  res.json({ success: true, order });
}

/** GET /api/orders/track/:orderId — guest tracking by order ID + email */
async function trackOrder(req, res) {
  const { email } = req.query;
  const order = await Order.findOne({ orderId: req.params.orderId }).lean();
  if (!order) throw createError(404, 'Order not found');
  if (email && order.email?.toLowerCase() !== email.toLowerCase()) {
    throw createError(403, 'Email does not match this order');
  }
  res.json({ order });
}

module.exports = {
  createOrder, getMyOrders, getOrder,
  listOrders, updateOrderStatus, updatePaymentStatus,
  trackOrder,
};
