/**
 * ══════════════════════════════════════════
 *  FashionWear — MongoDB Connection
 * ══════════════════════════════════════════
 */
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

let isConnected = false;

async function connectDatabase() {
  if (isConnected) return;

  mongoose.set('strictQuery', true);

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  console.log('  🗄️  MongoDB connected to', mongoose.connection.name);

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('  ⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('  ✅  MongoDB reconnected');
  });
}

module.exports = { connectDatabase };
