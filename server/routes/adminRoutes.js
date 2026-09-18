const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [[{ total_revenue }]] = await db.query("SELECT SUM(total) as total_revenue FROM orders WHERE payment_status = 'paid'");
    const [[{ total_orders }]] = await db.query("SELECT COUNT(*) as total_orders FROM orders");
    const [[{ pending_orders }]] = await db.query("SELECT COUNT(*) as pending_orders FROM orders WHERE order_status = 'pending'");
    const [[{ total_products }]] = await db.query("SELECT COUNT(*) as total_products FROM products");
    const [[{ low_stock_products }]] = await db.query("SELECT COUNT(*) as low_stock_products FROM products WHERE stock < 10");
    const [[{ total_customers }]] = await db.query("SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'");

    res.json({
      totalRevenue: total_revenue || 0,
      totalOrders: total_orders || 0,
      pendingOrders: pending_orders || 0,
      totalProducts: total_products || 0,
      lowStockProducts: low_stock_products || 0,
      totalCustomers: total_customers || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
