const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET all active customers with order counts and spent totals
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email, u.created_at,
             COALESCE(u.is_blocked, FALSE) as is_blocked,
             COUNT(o.id) as number_of_orders,
             COALESCE(SUM(o.total), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer' AND (u.is_deleted IS FALSE OR u.is_deleted IS NULL)
      GROUP BY u.id, u.name, u.email, u.created_at, u.is_blocked
      ORDER BY u.id ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error fetching customers' });
  }
});

// GET complete customer history (orders, returns, addresses, metrics)
router.get('/admin/:id/history', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const [userRows] = await db.query(
      'SELECT id, name, email, role, created_at, COALESCE(is_blocked, FALSE) as is_blocked FROM users WHERE id = ?',
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

    // Fetch all orders by user_id
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
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [id]
    );

    // Fetch items for each order
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, 
                oi.price_at_purchase as price,
                p.name as title, 
                pimg.image_url as image, 
                p.price as current_price
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN LATERAL (
           SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1
         ) pimg ON true
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

// PATCH toggle block / unblock customer
router.patch('/admin/:id/toggle-block', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const [userRows] = await db.query(
      'SELECT id, name, is_blocked FROM users WHERE id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL)',
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const currentStatus = Boolean(userRows[0].is_blocked);
    const newStatus = !currentStatus;

    await db.query('UPDATE users SET is_blocked = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: newStatus ? `Customer ${userRows[0].name} has been blocked.` : `Customer ${userRows[0].name} has been unblocked.`,
      is_blocked: newStatus
    });
  } catch (error) {
    console.error('Error toggling customer blocked status:', error);
    res.status(500).json({ message: 'Server error toggling customer blocked status' });
  }
});

// DELETE customer (soft-deletes if past orders exist, otherwise hard-deletes)
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const [userRows] = await db.query(
      'SELECT id, name FROM users WHERE id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL)',
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customerName = userRows[0].name;

    // Check if customer has orders
    const [orders] = await db.query('SELECT id FROM orders WHERE user_id = ? LIMIT 1', [id]);

    if (orders.length > 0) {
      // Soft-delete: mark is_deleted & is_blocked to keep historical order data intact
      await db.query(
        'UPDATE users SET is_deleted = TRUE, is_blocked = TRUE WHERE id = ?',
        [id]
      );
    } else {
      // Hard delete if no orders exist
      await db.query('DELETE FROM users WHERE id = ?', [id]);
    }

    res.json({
      success: true,
      message: `Customer "${customerName}" was successfully removed.`
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Server error deleting customer' });
  }
});

module.exports = router;
