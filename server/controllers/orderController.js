const db = require('../config/db');

exports.createRazorpayOrder = async (req, res) => {
  res.status(501).json({ message: 'Razorpay integration not available in this build' });
};

exports.verifyPaymentAndCreateOrder = async (req, res) => {
  res.status(501).json({ message: 'Razorpay integration not available in this build' });
};

exports.createOrder = async (req, res) => {
  const userId = req.user?.id || null;
  const { addressId, address, couponId, items, paymentMethod, paymentStatus } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let finalAddressId = addressId || null;
    if (finalAddressId && userId) {
      const [owned] = await conn.query(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL)',
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
        return res.status(400).json({ message: `Minimum order amount is ₹${coupon.min_order_amount}` });
      }
      if (coupon.applies_to === 'specific') {
        const [cpRows] = await conn.query(
          'SELECT product_id FROM coupon_products WHERE coupon_id = ?',
          [coupon.id]
        );
        const applicableIds = cpRows.map(r => r.product_id);
        const qualifyingItems = resolvedItems.filter(item => applicableIds.includes(item.productId));
        if (qualifyingItems.length === 0) {
          await conn.rollback();
          return res.status(400).json({ message: 'Coupon is only valid for specific products not present in this order' });
        }
        const qualifyingSubtotal = qualifyingItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        discountAmount = coupon.discount_type === 'percentage'
          ? qualifyingSubtotal * (parseFloat(coupon.discount_value) / 100)
          : Math.min(qualifyingSubtotal, parseFloat(coupon.discount_value));
      } else {
        discountAmount = coupon.discount_type === 'percentage'
          ? subtotal * (parseFloat(coupon.discount_value) / 100)
          : Math.min(subtotal, parseFloat(coupon.discount_value));
      }
      validCouponId = coupon.id;
    }

    const deliveryFee = 15;
    const total = Math.max(0, subtotal + deliveryFee - discountAmount);

    const trackingNumber = `TPS-TRK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const carrier = 'Standard Shipping';
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + 5);

    const chosenMethod = (paymentMethod || 'COD').toUpperCase();
    const initialPaymentStatus = chosenMethod === 'UPI' ? (paymentStatus || 'paid') : 'pending';

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, address_id, subtotal, delivery_fee, total, coupon_id, discount_amount, payment_status, payment_method, order_status, tracking_number, carrier, estimated_delivery)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, finalAddressId, subtotal, deliveryFee, total, validCouponId, discountAmount, initialPaymentStatus, chosenMethod, 'pending', trackingNumber, carrier, estDelivery]
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
    
    // Single consolidated query eliminating N+1 queries with explicit projection
    const [orders] = await db.query(`
      SELECT 
        o.id, o.user_id, o.address_id, o.subtotal, o.delivery_fee, o.total, 
        o.coupon_id, o.discount_amount, o.payment_status, o.payment_method, 
        o.order_status, o.tracking_number, o.carrier, o.estimated_delivery, 
        o.return_status, o.return_reason, o.return_requested_at, o.return_notes, 
        o.created_at, o.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'order_id', oi.order_id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price_at_purchase', oi.price_at_purchase,
              'title', p.name,
              'image', pimg.image_url
            ) ORDER BY oi.id ASC
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN LATERAL (
        SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1
      ) pimg ON true
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);

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
      SELECT 
        o.id, o.user_id, o.address_id, o.subtotal, o.delivery_fee, o.total, 
        o.coupon_id, o.discount_amount, o.payment_status, o.payment_method, 
        o.order_status, o.tracking_number, o.carrier, o.estimated_delivery, 
        o.return_status, o.return_reason, o.return_requested_at, o.return_notes, 
        o.created_at, o.updated_at,
        a.full_name, a.phone, a.house_flat, a.street, a.area, a.city, a.state, a.pincode,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'order_id', oi.order_id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price_at_purchase', oi.price_at_purchase,
              'title', p.name,
              'image', pimg.image_url
            ) ORDER BY oi.id ASC
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
        ) AS items
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN LATERAL (
        SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1
      ) pimg ON true
      WHERE o.id = ? AND o.user_id = ?
      GROUP BY o.id, a.id
    `, [id, userId]);

    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json(orders[0]);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
};

// Admin Endpoints
exports.getAllOrders = async (req, res) => {
  try {
    // Single consolidated query eliminating N+1 queries for all orders
    const [orders] = await db.query(`
      SELECT 
        o.id, o.user_id, o.address_id, o.subtotal, o.delivery_fee, o.total, 
        o.coupon_id, o.discount_amount, o.payment_status, o.payment_method, 
        o.order_status, o.tracking_number, o.carrier, o.estimated_delivery, 
        o.return_status, o.return_reason, o.return_requested_at, o.return_notes, 
        o.created_at, o.updated_at,
        COALESCE(u.name, a.full_name, 'Guest Customer') as customer_name, 
        COALESCE(u.email, 'Guest Checkout') as customer_email,
        a.phone as customer_phone,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'order_id', oi.order_id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price_at_purchase', oi.price_at_purchase,
              'title', p.name,
              'image', pimg.image_url
            ) ORDER BY oi.id ASC
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN LATERAL (
        SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1
      ) pimg ON true
      GROUP BY o.id, u.name, a.full_name, u.email, a.phone
      ORDER BY o.created_at DESC
    `);

    // Ensure tracking number exists
    for (let order of orders) {
      if (!order.tracking_number || !order.tracking_number.trim()) {
        order.tracking_number = `TPS-TRK-${order.id}${Math.floor(1000 + Math.random() * 9000)}`;
        order.carrier = order.carrier || 'Standard Shipping';
        db.query('UPDATE orders SET tracking_number = ?, carrier = COALESCE(carrier, ?) WHERE id = ?', [order.tracking_number, order.carrier, order.id]).catch(() => {});
      }
    }

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
      SELECT 
        o.id, o.user_id, o.address_id, o.subtotal, o.delivery_fee, o.total, 
        o.coupon_id, o.discount_amount, o.payment_status, o.payment_method, 
        o.order_status, o.tracking_number, o.carrier, o.estimated_delivery, 
        o.return_status, o.return_reason, o.return_requested_at, o.return_notes, 
        o.created_at, o.updated_at,
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
    if (!order.tracking_number || !order.tracking_number.trim()) {
      order.tracking_number = `TPS-TRK-${order.id}${Math.floor(1000 + Math.random() * 9000)}`;
      order.carrier = order.carrier || 'Standard Shipping';
      db.query('UPDATE orders SET tracking_number = ?, carrier = COALESCE(carrier, ?) WHERE id = ?', [order.tracking_number, order.carrier, order.id]).catch(() => {});
    }

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
    if (tracking_number !== undefined && tracking_number !== null && String(tracking_number).trim() !== '') {
      updates.push('tracking_number = ?');
      values.push(String(tracking_number).trim());
    }
    if (carrier !== undefined && carrier !== null && String(carrier).trim() !== '') {
      updates.push('carrier = ?');
      values.push(String(carrier).trim());
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

// Customer Return Request
exports.requestReturn = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params; // order id
    const { reason, details } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Return reason is required' });
    }
    if (!details || !details.trim()) {
      return res.status(400).json({ message: 'Additional details / condition of product is required' });
    }

    const [orders] = await db.query(
      'SELECT id, user_id, order_status, return_status FROM orders WHERE id = ?',
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];
    if (userId && order.user_id && order.user_id !== userId) {
      return res.status(403).json({ message: 'You are not authorized to return this order' });
    }

    if (order.return_status && order.return_status !== 'return_rejected') {
      return res.status(400).json({ message: `A return has already been requested (${order.return_status})` });
    }

    // Insert into order_returns
    const [returnResult] = await db.query(
      `INSERT INTO order_returns (order_id, user_id, reason, details, status)
       VALUES (?, ?, ?, ?, 'return_requested')`,
      [id, userId || null, reason.trim(), (details || '').trim()]
    );

    const returnId = returnResult?.insertId || returnResult?.[0]?.id || returnResult?.id;

    // Update order status
    await db.query(
      `UPDATE orders 
       SET order_status = 'return_requested', 
           return_status = 'return_requested', 
           return_reason = ?, 
           return_requested_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [reason.trim(), id]
    );

    res.status(201).json({
      message: 'Return request submitted successfully',
      returnId,
      status: 'return_requested'
    });
  } catch (error) {
    console.error('Error requesting return:', error);
    res.status(500).json({ message: 'Server error processing return request' });
  }
};

// Admin: Get all returns with full user & product details
exports.getAllReturns = async (req, res) => {
  try {
    const [returns] = await db.query(`
      SELECT r.*,
             o.tracking_number, o.total as order_total, o.created_at as order_date,
             o.order_status,
             COALESCE(u.name, a.full_name, 'Guest Customer') as customer_name,
             COALESCE(u.email, 'Not available') as customer_email,
             a.phone as customer_phone
      FROM order_returns r
      JOIN orders o ON r.order_id = o.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      ORDER BY r.created_at DESC
    `);

    for (let ret of returns) {
      const [items] = await db.query(`
        SELECT oi.*, p.name as title,
               (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [ret.order_id]);
      ret.items = items;
    }

    res.json(returns);
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ message: 'Server error fetching returns' });
  }
};

// Admin: Update return status
exports.updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params; // return id
    const { status, admin_notes } = req.body; // 'return_approved', 'returned', 'return_rejected'

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const [returnRows] = await db.query('SELECT * FROM order_returns WHERE id = ?', [id]);
    if (returnRows.length === 0) {
      return res.status(404).json({ message: 'Return record not found' });
    }

    const ret = returnRows[0];

    await db.query(
      `UPDATE order_returns 
       SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, admin_notes || ret.admin_notes || null, id]
    );

    // Update corresponding order
    await db.query(
      `UPDATE orders 
       SET order_status = ?, return_status = ?, return_notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, status, admin_notes || null, ret.order_id]
    );

    res.json({ message: 'Return status updated successfully' });
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ message: 'Server error updating return status' });
  }
};

// Admin: Delete order completely
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await db.query('DELETE FROM order_returns WHERE order_id = ?', [id]);
    await db.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    await db.query('DELETE FROM orders WHERE id = ?', [id]);

    res.json({ message: `Order #${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

// Admin: Dismiss / Clear return from order
exports.dismissReturn = async (req, res) => {
  try {
    const { id } = req.params; // order id
    await db.query('DELETE FROM order_returns WHERE order_id = ?', [id]);
    await db.query(
      `UPDATE orders 
       SET return_status = NULL, return_reason = NULL, return_requested_at = NULL, return_notes = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [id]
    );

    res.json({ message: `Return for order #${id} dismissed successfully` });
  } catch (error) {
    console.error('Error dismissing return:', error);
    res.status(500).json({ message: 'Failed to dismiss return' });
  }
};

