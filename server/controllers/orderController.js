const db = require('../config/db');

exports.createRazorpayOrder = async (req, res) => {
  res.status(501).json({ message: 'Razorpay integration not available in this build' });
};

exports.verifyPaymentAndCreateOrder = async (req, res) => {
  res.status(501).json({ message: 'Razorpay integration not available in this build' });
};

exports.createOrder = async (req, res) => {
  const userId = req.user?.id || null;
  const { addressId, address, couponId, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let finalAddressId = addressId || null;
    if (finalAddressId && userId) {
      const [owned] = await conn.query(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
        [finalAddressId, userId]
      );
      if (owned.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'Invalid address' });
      }
    }

    if (!finalAddressId) {
      if (!address || !address.full_name || !address.phone || !address.house_flat || !address.street || !address.area || !address.city || !address.state || !address.pincode) {
        await conn.rollback();
        return res.status(400).json({ message: 'Shipping address is required' });
      }
      const [addrResult] = await conn.query(
        'INSERT INTO addresses (user_id, full_name, phone, house_flat, street, area, city, state, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, address.full_name, address.phone, address.house_flat, address.street, address.area, address.city, address.state, address.pincode, false]
      );
      finalAddressId = addrResult.insertId;
    }

    let subtotal = 0;
    const resolvedItems = [];
    for (const item of items) {
      const productId = item.productId || item.id;
      const qty = Number(item.quantity) || 1;
      if (!productId || qty <= 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'Each item needs a product id and quantity' });
      }

      const [rows] = await conn.query(
        'SELECT id, price, discount_price, stock FROM products WHERE id = ?',
        [productId]
      );
      if (rows.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: `Product not found: ${productId}` });
      }

      const product = rows[0];
      if (Number(product.stock) < qty) {
        await conn.rollback();
        return res.status(400).json({ message: `Insufficient stock for product ${productId}` });
      }

      const unit = parseFloat(product.discount_price || product.price);
      subtotal += unit * qty;
      resolvedItems.push({ productId: product.id, quantity: qty, price: unit });
    }

    let discountAmount = 0;
    let validCouponId = null;
    if (couponId) {
      const [coupons] = await conn.query(
        'SELECT * FROM coupons WHERE id = ? AND is_active = TRUE',
        [couponId]
      );
      if (coupons.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'Invalid coupon' });
      }
      const coupon = coupons[0];
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        await conn.rollback();
        return res.status(400).json({ message: 'Coupon has expired' });
      }
      if (subtotal < parseFloat(coupon.min_order_amount || 0)) {
        await conn.rollback();
        return res.status(400).json({ message: `Minimum order amount is $${coupon.min_order_amount}` });
      }
      discountAmount = coupon.discount_type === 'percentage'
        ? subtotal * (parseFloat(coupon.discount_value) / 100)
        : parseFloat(coupon.discount_value);
      validCouponId = coupon.id;
    }

    const deliveryFee = 15;
    const total = Math.max(0, subtotal + deliveryFee - discountAmount);

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, address_id, subtotal, delivery_fee, total, coupon_id, discount_amount, payment_status, order_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, finalAddressId, subtotal, deliveryFee, total, validCouponId, discountAmount, 'pending', 'pending']
    );

    for (const item of resolvedItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.productId, item.quantity, item.price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
    }

    if (userId) {
      await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    }

    await conn.commit();
    res.status(201).json({
      id: orderResult.insertId,
      total,
      payment_status: 'pending',
      order_status: 'pending'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error creating order' });
  } finally {
    conn.release();
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
