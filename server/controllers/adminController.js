/**
 * ══════════════════════════════════════════
 *  FashionWear — Admin Controller
 * ══════════════════════════════════════════
 */
const User    = require('../models/User');
const { Order } = require('../models/Order');
const Product = require('../models/Product');
const { createError } = require('../middleware/errorHandler');

/** GET /api/admin/stats — dashboard analytics */
async function getDashboardStats(req, res) {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1); // Current month start

  const [
    totalOrders,
    monthOrders,
    totalUsers,
    newUsers,
    totalProducts,
    revenueAgg,
    monthRevenueAgg,
    statusBreakdown,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: start } }),
    User.countDocuments({ role: 'customer', isActive: true }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: start } }),
    Product.countDocuments({ isActive: true }),

    // Total revenue (paid orders)
    Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'cod'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),

    // Monthly revenue
    Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'cod'] }, createdAt: { $gte: start } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),

    // Order status breakdown
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Recent 5 orders
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),

    // Top products by sold count (from orders)
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', sold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const monthRevenue = monthRevenueAgg[0]?.total || 0;

  res.json({
    stats: {
      totalOrders,
      monthOrders,
      totalUsers,
      newUsers,
      totalProducts,
      totalRevenue,
      monthRevenue,
    },
    statusBreakdown: statusBreakdown.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
    recentOrders,
    topProducts,
  });
}

/** GET /api/admin/users */
async function listUsers(req, res) {
  const { page = 1, limit = 20, search, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

/** PATCH /api/admin/users/:id/role */
async function updateUserRole(req, res) {
  const { role } = req.body;
  if (!['admin', 'customer'].includes(role)) {
    throw createError(400, 'Role must be admin or customer');
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, select: '-passwordHash' },
  );
  if (!user) throw createError(404, 'User not found');
  res.json({ user });
}

module.exports = { getDashboardStats, listUsers, updateUserRole };
