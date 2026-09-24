const db = require('../config/db');

exports.validateCoupon = async (req, res) => {
  try {
    const { code, items, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const [coupons] = await db.query(
      'SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = TRUE', 
      [code.trim()]
    );
    
    if (coupons.length === 0) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }
    
    const coupon = coupons[0];
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    const cartSubtotal = Number(subtotal) || 0;
    if (coupon.min_order_amount && cartSubtotal < Number(coupon.min_order_amount)) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.min_order_amount} required to use this coupon` 
      });
    }

    const appliesTo = coupon.applies_to || 'all';
    let applicableProductIds = [];
    let applicableProducts = [];

    if (appliesTo === 'specific') {
      const [prodRows] = await db.query(
        `SELECT cp.product_id, p.name, p.price, p.discount_price 
         FROM coupon_products cp 
         JOIN products p ON cp.product_id = p.id 
         WHERE cp.coupon_id = ?`,
        [coupon.id]
      );
      applicableProducts = prodRows;
      applicableProductIds = prodRows.map(p => Number(p.product_id));

      if (items && Array.isArray(items)) {
        // Filter items that qualify for this coupon
        const qualifyingItems = items.filter(item => {
          const pId = Number(item.id || item.product_id || item.productId);
          return applicableProductIds.includes(pId);
        });

        if (qualifyingItems.length === 0) {
          const names = prodRows.map(p => p.name).slice(0, 3).join(', ');
          const more = prodRows.length > 3 ? ` and ${prodRows.length - 3} more` : '';
          return res.status(400).json({
            message: `Coupon "${coupon.code}" only applies to specific items (${names}${more}) which are not in your cart.`
          });
        }

        const qualifyingSubtotal = qualifyingItems.reduce((acc, item) => {
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 1;
          return acc + (price * qty);
        }, 0);

        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') {
          discountAmount = qualifyingSubtotal * (Number(coupon.discount_value) / 100);
        } else {
          discountAmount = Math.min(qualifyingSubtotal, Number(coupon.discount_value));
        }

        return res.json({
          ...coupon,
          applies_to: 'specific',
          applicable_product_ids: applicableProductIds,
          applicable_products: applicableProducts,
          qualifying_subtotal: Number(qualifyingSubtotal.toFixed(2)),
          discount_amount: Number(discountAmount.toFixed(2))
        });
      }
    }

    // Standard / All products calculation
    let calculatedDiscount = 0;
    if (cartSubtotal > 0) {
      if (coupon.discount_type === 'percentage') {
        calculatedDiscount = cartSubtotal * (Number(coupon.discount_value) / 100);
      } else {
        calculatedDiscount = Math.min(cartSubtotal, Number(coupon.discount_value));
      }
    }

    res.json({
      ...coupon,
      applies_to: appliesTo,
      applicable_product_ids: applicableProductIds,
      applicable_products: applicableProducts,
      discount_amount: Number(calculatedDiscount.toFixed(2))
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Server error validating coupon' });
  }
};

// Admin: Get all coupons with product associations
exports.getAllCoupons = async (req, res) => {
  try {
    const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    
    // Fetch coupon products for all coupons
    const [assoc] = await db.query(`
      SELECT cp.coupon_id, cp.product_id, p.name as product_name, p.price, p.image_url
      FROM coupon_products cp
      JOIN products p ON cp.product_id = p.id
    `);

    const couponProductsMap = {};
    for (const row of assoc) {
      if (!couponProductsMap[row.coupon_id]) {
        couponProductsMap[row.coupon_id] = [];
      }
      couponProductsMap[row.coupon_id].push({
        id: row.product_id,
        name: row.product_name,
        price: row.price,
        image_url: row.image_url
      });
    }

    const enhancedCoupons = coupons.map(c => ({
      ...c,
      applies_to: c.applies_to || 'all',
      products: couponProductsMap[c.id] || []
    }));

    res.json(enhancedCoupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Server error fetching coupons' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { 
      code, 
      discount_type, 
      discount_value, 
      min_order_amount, 
      expiry_date, 
      is_active, 
      applies_to = 'all',
      product_ids = [] 
    } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({ message: 'Coupon code and discount value are required' });
    }

    const upperCode = code.trim().toUpperCase();

    // Check duplicate code
    const [existing] = await db.query('SELECT id FROM coupons WHERE UPPER(code) = UPPER(?)', [upperCode]);
    if (existing.length > 0) {
      return res.status(400).json({ message: `Coupon code "${upperCode}" already exists` });
    }

    const [result] = await db.query(
      'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, is_active, applies_to) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [upperCode, discount_type, discount_value, min_order_amount || 0, expiry_date || null, is_active !== false, applies_to]
    );

    const couponId = result.insertId;

    if (applies_to === 'specific' && Array.isArray(product_ids) && product_ids.length > 0) {
      for (const pId of product_ids) {
        await db.query(
          'INSERT INTO coupon_products (coupon_id, product_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
          [couponId, pId]
        );
      }
    }

    res.status(201).json({ id: couponId, message: 'Coupon created successfully' });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Server error creating coupon' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, 
      discount_type, 
      discount_value, 
      min_order_amount, 
      expiry_date, 
      is_active, 
      applies_to = 'all',
      product_ids = [] 
    } = req.body;

    const upperCode = code.trim().toUpperCase();

    // Check duplicate code excluding current
    const [existing] = await db.query(
      'SELECT id FROM coupons WHERE UPPER(code) = UPPER(?) AND id != ?', 
      [upperCode, id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: `Coupon code "${upperCode}" is already in use by another coupon` });
    }

    await db.query(
      'UPDATE coupons SET code=?, discount_type=?, discount_value=?, min_order_amount=?, expiry_date=?, is_active=?, applies_to=? WHERE id=?',
      [upperCode, discount_type, discount_value, min_order_amount || 0, expiry_date || null, is_active, applies_to, id]
    );

    // Update coupon_products
    await db.query('DELETE FROM coupon_products WHERE coupon_id = ?', [id]);
    if (applies_to === 'specific' && Array.isArray(product_ids) && product_ids.length > 0) {
      for (const pId of product_ids) {
        await db.query(
          'INSERT INTO coupon_products (coupon_id, product_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
          [id, pId]
        );
      }
    }

    res.json({ message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Server error updating coupon' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM coupon_products WHERE coupon_id = ?', [id]);
    await db.query('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Server error deleting coupon' });
  }
};
