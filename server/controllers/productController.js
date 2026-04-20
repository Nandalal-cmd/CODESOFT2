/**
 * ══════════════════════════════════════════
 *  FashionWear — Product Controller
 * ══════════════════════════════════════════
 */
const Product = require('../models/Product');
const { createError } = require('../middleware/errorHandler');

/** GET /api/products — list with filtering, sorting, pagination */
async function listProducts(req, res) {
  const {
    category, type, minPrice, maxPrice, search,
    sort = 'popular', page = 1, limit = 50,
    badge,
  } = req.query;

  const filter = { isActive: true };
  if (category && category !== 'All') filter.category = category;
  if (type && type !== 'All')         filter.type = type;
  if (badge)                          filter.badge = badge;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortMap = {
    popular: { sold: -1 },
    rating:  { rating: -1 },
    low:     { price: 1 },
    high:    { price: -1 },
    newest:  { createdAt: -1 },
  };
  const sortOption = sortMap[sort] || sortMap.popular;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

/** GET /api/products/:id */
async function getProduct(req, res) {
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).lean();
  if (!product) throw createError(404, 'Product not found');
  res.json({ product });
}

/** POST /api/products — admin */
async function createProduct(req, res) {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
}

/** PUT /api/products/:id — admin */
async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!product) throw createError(404, 'Product not found');
  res.json({ product });
}

/** DELETE /api/products/:id — admin (soft delete) */
async function deleteProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!product) throw createError(404, 'Product not found');
  res.json({ success: true });
}

/** POST /api/products/seed — admin: seed from static data */
async function seedProducts(req, res) {
  const PRODUCTS = require('../data/seedProducts');
  let seeded = 0;
  for (const p of PRODUCTS) {
    await Product.findOneAndUpdate(
      { name: p.name },
      p,
      { upsert: true, new: true, runValidators: true },
    );
    seeded++;
  }
  res.json({ success: true, seeded });
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct, seedProducts };
