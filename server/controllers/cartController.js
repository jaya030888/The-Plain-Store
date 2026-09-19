const db = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT ci.id, ci.product_id, ci.quantity, p.name as title, p.price, p.discount_price, p.stock,
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [userId]);

    const formattedCart = rows.map(item => ({
      id: item.product_id, // Map product_id to id so context matches
      cartItemId: item.id,
      title: item.title,
      price: item.discount_price ? `$${item.discount_price}` : `$${item.price}`,
      rawPrice: parseFloat(item.discount_price || item.price),
      quantity: item.quantity,
      image: item.image,
      stock: item.stock
    }));

    res.json(formattedCart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (productRows[0].stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const [existing] = await db.query('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + (quantity || 1);
      if (newQuantity > productRows[0].stock) {
        return res.status(400).json({ message: 'Cannot add more than available stock' });
      }
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, existing[0].id]);
    } else {
      await db.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity || 1]);
    }

    res.json({ message: 'Added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (quantity > productRows[0].stock) {
      return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
    }

    if (quantity <= 0) {
      await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
    } else {
      await db.query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);
    }

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: productId } = req.params;

    await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};
