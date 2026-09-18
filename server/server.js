require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { runMigrations } = require('./migrate_pg');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (!origin) {
      return callback(null, true);
    }
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
    if (isAllowed) {
      return callback(null, true);
    }
    console.warn(`CORS rejected origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'The Plain Store API' });
});

app.get('/api/health', async (req, res) => {
  try {
    await db.ping();
    res.json({ status: 'ok', message: 'E-commerce API is running!', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database unavailable', database: 'disconnected' });
  }
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await runMigrations();
    await db.ping();
    console.log('Successfully connected to PostgreSQL database.');
  } catch (error) {
    console.error('Database startup error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
