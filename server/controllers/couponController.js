const db = require('../config/db');

exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const [coupons] = await db.query('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE', [code]);
    
    if (coupons.length === 0) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }
    
    const coupon = coupons[0];
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    res.json(coupon);
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Server error validating coupon' });
  }
};

// Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Server error fetching coupons' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, expiry_date, is_active } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [code, discount_type, discount_value, min_order_amount || 0, expiry_date || null, is_active]
    );

    res.status(201).json({ id: result.insertId, message: 'Coupon created' });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Server error creating coupon' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount_type, discount_value, min_order_amount, expiry_date, is_active } = req.body;

    await db.query(
      'UPDATE coupons SET code=?, discount_type=?, discount_value=?, min_order_amount=?, expiry_date=?, is_active=? WHERE id=?',
      [code, discount_type, discount_value, min_order_amount, expiry_date || null, is_active, id]
    );

    res.json({ message: 'Coupon updated' });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Server error updating coupon' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Server error deleting coupon' });
  }
};
