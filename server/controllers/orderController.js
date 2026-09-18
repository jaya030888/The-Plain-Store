const db = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mocked_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mocked_secret'
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in rupees, need to convert to paise for razorpay
    
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.includes('mocked')) {
      return res.json({
        id: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
        status: 'created'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ message: 'Error creating razorpay order' });

    res.json(order);
  } catch (error) {
    console.error('Error in createRazorpayOrder:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

exports.verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      addressId, 
      couponId, 
      subtotal, 
      deliveryFee, 
      total, 
      discountAmount,
      items 
    } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_ID.includes('mocked')) {
      // Verify signature
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    // Begin transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Create order
      const [orderResult] = await connection.query(`
        INSERT INTO orders (user_id, address_id, subtotal, delivery_fee, total, coupon_id, discount_amount, payment_status, order_status, razorpay_order_id, razorpay_payment_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', 'confirmed', ?, ?)
      `, [userId, addressId, subtotal, deliveryFee, total, couponId || null, discountAmount || 0, razorpay_order_id, razorpay_payment_id]);

      const newOrderId = orderResult.insertId;

      // 2. Insert items and decrease stock
      for (let item of items) {
        await connection.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
          VALUES (?, ?, ?, ?)
        `, [newOrderId, item.id, item.quantity, item.rawPrice]);

        // Decrease stock
        await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
      }

      // 3. Clear user's cart
      await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

      await connection.commit();
      res.json({ message: 'Order created successfully', orderId: newOrderId });
    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error processing payment' });
  }
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
