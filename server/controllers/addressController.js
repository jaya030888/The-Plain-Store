const db = require('../config/db');

exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL) ORDER BY is_default DESC, id DESC',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error fetching addresses' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, house_flat, street, area, city, state, pincode, is_default } = req.body;

    if (!full_name || !phone || !house_flat || !street || !area || !city || !state || !pincode) {
      return res.status(400).json({ message: 'All address fields are required' });
    }

    if (is_default) {
      // Unset default for other addresses
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const [result] = await db.query(
      'INSERT INTO addresses (user_id, full_name, phone, house_flat, street, area, city, state, pincode, is_default, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)',
      [userId, full_name, phone, house_flat, street, area, city, state, pincode, is_default || false]
    );

    const newId = result?.insertId || result?.[0]?.id || result?.id;
    res.status(201).json({ id: newId, message: 'Address added successfully' });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Server error adding address' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { full_name, phone, house_flat, street, area, city, state, pincode, is_default } = req.body;

    // Verify ownership and not deleted
    const [existing] = await db.query(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL)',
      [id, userId]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Address not found' });

    if (is_default) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    await db.query(
      'UPDATE addresses SET full_name=?, phone=?, house_flat=?, street=?, area=?, city=?, state=?, pincode=?, is_default=? WHERE id=?',
      [full_name, phone, house_flat, street, area, city, state, pincode, is_default || false, id]
    );

    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Server error updating address' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership and not already deleted
    const [existing] = await db.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL)',
      [id, userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = Boolean(existing[0].is_default);

    // Check if any order references this address
    const [ordersUsingAddress] = await db.query(
      'SELECT id FROM orders WHERE address_id = ? LIMIT 1',
      [id]
    );

    if (ordersUsingAddress.length > 0) {
      // Historical orders reference this address: soft delete to protect integrity
      await db.query(
        'UPDATE addresses SET is_deleted = TRUE, is_default = FALSE WHERE id = ?',
        [id]
      );
    } else {
      // No order references: hard delete
      await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
    }

    // If the deleted address was default, set the newest remaining address as default
    if (wasDefault) {
      const [remaining] = await db.query(
        'SELECT id FROM addresses WHERE user_id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL) ORDER BY id DESC LIMIT 1',
        [userId]
      );
      if (remaining.length > 0) {
        await db.query('UPDATE addresses SET is_default = TRUE WHERE id = ?', [remaining[0].id]);
      }
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Server error deleting address' });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership and not deleted
    const [existing] = await db.query(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ? AND (is_deleted IS FALSE OR is_deleted IS NULL)',
      [id, userId]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Address not found' });

    await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    await db.query('UPDATE addresses SET is_default = TRUE WHERE id = ?', [id]);

    res.json({ message: 'Default address updated' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Server error setting default address' });
  }
};
