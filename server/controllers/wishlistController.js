const db = require('../config/db');

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT w.id as wishlist_item_id, p.id, p.name as title, p.price, p.discount_price, p.stock,
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
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
      
      // Notify Admin
      try {
        const [userRows] = await db.query('SELECT name, email FROM users WHERE id = ?', [userId]);
        const userName = userRows[0]?.name ? `${userRows[0].name} (${userRows[0].email})` : (userRows[0]?.email || 'Registered User');
        const [prodRows] = await db.query('SELECT name FROM products WHERE id = ?', [productId]);
        const productName = prodRows[0]?.name || `Product #${productId}`;
        
        await db.query(
          'INSERT INTO admin_notifications (type, title, message, user_id, user_name, product_id, product_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            'wishlist_added',
            'Wishlist Item Added',
            `User ${userName} added "${productName}" to their wishlist.`,
            userId,
            userName,
            productId,
            productName
          ]
        );
      } catch (notifErr) {
        console.warn('Could not record admin notification:', notifErr.message);
      }

      res.json({ message: 'Added to wishlist', isWished: true });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ message: 'Server error toggling wishlist' });
  }
};

exports.guestWishlistNotify = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });
    
    const [prodRows] = await db.query('SELECT name FROM products WHERE id = ?', [productId]);
    const productName = prodRows[0]?.name || `Product #${productId}`;

    await db.query(
      'INSERT INTO admin_notifications (type, title, message, user_id, user_name, product_id, product_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        'wishlist_added',
        'Guest Added to Wishlist',
        `A visitor added "${productName}" to their wishlist.`,
        null,
        'Guest Visitor',
        productId,
        productName
      ]
    );

    res.json({ success: true, message: 'Notification logged' });
  } catch (error) {
    console.error('Error in guestWishlistNotify:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
