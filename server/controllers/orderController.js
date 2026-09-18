const db = require('../config/db');
// Razorpay integration disabled for now – placeholder stub
const razorpay = null;

exports.createRazorpayOrder = async (req, res) => {
  res.status(501).json({ message: 'Razorpay integration not available in this build' });
};

exports.verifyPaymentAndCreateOrder = async (req, res) => {
  res.status(501).json({ message: 'Razorpay integration not available in this build' });
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [orders] = await db.query(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `, [userId]);

    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name as title, pi.image_url as image 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

exports.getMyOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [orders] = await db.query(`
      SELECT o.*, 
             a.full_name, a.phone, a.house_flat, a.street, a.area, a.city, a.state, a.pincode
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      WHERE o.id = ? AND o.user_id = ?
    `, [id, userId]);

    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    
    const order = orders[0];

    const [items] = await db.query(`
      SELECT oi.*, p.name as title, pi.image_url as image 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE oi.order_id = ?
    `, [id]);
    
    order.items = items;
    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
};

// Admin Endpoints
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email,
             a.full_name, a.phone, a.house_flat, a.street, a.area, a.city, a.state, a.pincode
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN addresses a ON o.address_id = a.id
      WHERE o.id = ?
    `, [id]);

    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    
    const order = orders[0];

    const [items] = await db.query(`
      SELECT oi.*, p.name as title, pi.image_url as image 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE oi.order_id = ?
    `, [id]);
    
    order.items = items;

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
};
