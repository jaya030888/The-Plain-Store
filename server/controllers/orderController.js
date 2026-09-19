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
      finalAddressId = addrResult?.insertId || addrResult?.[0]?.id || addrResult?.id;
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

    const trackingNumber = `TPS-TRK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const carrier = 'Standard Shipping';
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + 5);

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, address_id, subtotal, delivery_fee, total, coupon_id, discount_amount, payment_status, order_status, tracking_number, carrier, estimated_delivery)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, finalAddressId, subtotal, deliveryFee, total, validCouponId, discountAmount, 'pending', 'pending', trackingNumber, carrier, estDelivery]
    );

    const orderId = orderResult?.insertId || orderResult?.[0]?.id || orderResult?.id;

    for (const item of resolvedItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
    }

    if (userId) {
      await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    }

    await conn.commit();
    res.status(201).json({
      id: orderId,
      total,
      payment_status: 'pending',
      order_status: 'pending',
      tracking_number: trackingNumber,
      carrier,
      estimated_delivery: estDelivery
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
        SELECT oi.*, p.name as title, 
               (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
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
      SELECT oi.*, p.name as title, 
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
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
      SELECT o.*, 
             COALESCE(u.name, a.full_name, 'Guest Customer') as customer_name, 
             COALESCE(u.email, 'Guest Checkout') as customer_email,
             a.phone as customer_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
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
      SELECT o.*, 
             COALESCE(u.name, a.full_name, 'Guest Customer') as customer_name, 
             COALESCE(u.email, 'Guest Checkout') as customer_email,
             a.full_name, a.phone, a.house_flat, a.street, a.area, a.city, a.state, a.pincode
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.id = ?
    `, [id]);

    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    
    const order = orders[0];

    const [items] = await db.query(`
      SELECT oi.*, p.name as title, 
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
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
    const { status, tracking_number, carrier, estimated_delivery } = req.body;

    const updates = [];
    const values = [];

    if (status) {
      updates.push('order_status = ?');
      values.push(status);
    }
    if (tracking_number !== undefined) {
      updates.push('tracking_number = ?');
      values.push(tracking_number);
    }
    if (carrier !== undefined) {
      updates.push('carrier = ?');
      values.push(carrier);
    }
    if (estimated_delivery !== undefined) {
      updates.push('estimated_delivery = ?');
      values.push(estimated_delivery ? estimated_delivery : null);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    if (updates.length > 1) {
      await db.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(Number(id));

    const [orders] = await db.query(`
      SELECT o.id, o.order_status, o.tracking_number, o.carrier, o.estimated_delivery,
             o.created_at, o.updated_at, o.total, o.subtotal, o.delivery_fee, o.discount_amount,
             a.full_name, a.city, a.state, a.pincode
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE ${isNum ? 'o.id = ? OR ' : ''}o.tracking_number = ?
    `, isNum ? [Number(id), id] : [id]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No shipment found for this Order ID or Tracking Number' });
    }

    const order = orders[0];
    const [items] = await db.query(`
      SELECT oi.quantity, oi.price_at_purchase, p.name as title,
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order.id]);
    
    order.items = items;
    res.json(order);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ message: 'Server error tracking order' });
  }
};
