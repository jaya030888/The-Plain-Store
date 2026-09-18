const db = require('../config/db');

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT w.id as wishlist_item_id, p.id, p.name as title, p.price, p.discount_price, p.stock, pi.image_url as image
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE w.user_id = ?
    `, [userId]);

    const formattedWishlist = rows.map(item => ({
      id: item.id, // product id
      title: item.title,
      price: item.discount_price ? `$${item.discount_price}` : `$${item.price}`,
      rawPrice: parseFloat(item.discount_price || item.price),
      image: item.image,
      stock: item.stock
    }));

    res.json(formattedWishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const [existing] = await db.query('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?', [userId, productId]);

    if (existing.length > 0) {
      await db.query('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
      res.json({ message: 'Removed from wishlist', isWished: false });
    } else {
      await db.query('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)', [userId, productId]);
      res.json({ message: 'Added to wishlist', isWished: true });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ message: 'Server error toggling wishlist' });
  }
};
