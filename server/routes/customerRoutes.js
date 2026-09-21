const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email, u.created_at,
             COUNT(o.id) as number_of_orders,
             SUM(o.total) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id, u.name, u.email, u.created_at
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error fetching customers' });
  }
});

router.get('/admin/:id/history', protect, adminOnly, async (req, res) => {

  try {
    const { id } = req.params;
    const [userRows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const customer = userRows[0];

    // Fetch customer addresses
    const [addresses] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL) ORDER BY is_default DESC, id DESC',
      [id]
    );

    // Fetch all orders by user_id OR matching customer email
    const [orders] = await db.query(
      `SELECT o.*,
              COALESCE(a.phone, '') as shipping_phone,
              COALESCE(a.full_name, '') as shipping_name,
              COALESCE(a.house_flat, '') as house_flat,
              COALESCE(a.street, '') as street,
              COALESCE(a.city, '') as city,
              COALESCE(a.state, '') as state,
              COALESCE(a.pincode, '') as pincode
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.user_id = ? OR (LOWER(COALESCE(o.customer_email, '')) = LOWER(?))
       ORDER BY o.created_at DESC`,
      [id, customer.email]
    );

    // Fetch items for each order
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.title, p.image, p.price as current_price
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    // Filter returns
    const returns = orders.filter(o => o.return_status || (o.order_status && o.order_status.startsWith('return')));

    // Calculate aggregated stats
    const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalOrders = orders.length;
    const totalItemsPurchased = orders.reduce((sum, o) => sum + (o.items ? o.items.reduce((iSum, i) => iSum + i.quantity, 0) : 0), 0);
    const totalReturns = returns.length;

    res.json({
      customer,
      addresses,
      stats: {
        totalSpent,
        totalOrders,
        totalItemsPurchased,
        totalReturns
      },
      orders,
      returns
    });
  } catch (error) {
    console.error('Error fetching customer history:', error);
    res.status(500).json({ message: 'Server error fetching customer history' });
  }
});

module.exports = router;

