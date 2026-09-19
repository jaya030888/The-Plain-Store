const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, onSale } = req.query;
    
    let baseQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image_url 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
      baseQuery += ' AND p.name ILIKE ?';
      queryParams.push(`%${search}%`);
    }
    if (category) {
      baseQuery += ' AND c.slug = ?';
      queryParams.push(category);
    }
    if (onSale === 'true') {
      baseQuery += ' AND (p.is_on_sale = TRUE OR (p.discount_price IS NOT NULL AND p.discount_price < p.price))';
    }
    if (minPrice) {
      baseQuery += ' AND (p.discount_price >= ? OR (p.discount_price IS NULL AND p.price >= ?))';
      queryParams.push(minPrice, minPrice);
    }
    if (maxPrice) {
      baseQuery += ' AND (p.discount_price <= ? OR (p.discount_price IS NULL AND p.price <= ?))';
      queryParams.push(maxPrice, maxPrice);
    }

    if (sort === 'price-low-high') {
      baseQuery += ' ORDER BY COALESCE(p.discount_price, p.price) ASC';
    } else if (sort === 'price-high-low') {
      baseQuery += ' ORDER BY COALESCE(p.discount_price, p.price) DESC';
    } else if (sort === 'newest') {
      baseQuery += ' ORDER BY p.created_at DESC';
    }

    const [rows] = await db.query(baseQuery, queryParams);
    
    // Format products to match existing frontend structure
    const products = rows.map(row => ({
      id: row.id,
      title: row.name,
      slug: row.slug,
      description: row.description,
      price: `$${row.price}`,
      rawPrice: parseFloat(row.price),
      discountPrice: row.discount_price ? `$${row.discount_price}` : null,
      rawDiscountPrice: row.discount_price ? parseFloat(row.discount_price) : null,
      image: row.image_url,
      category: row.category_name,
      categorySlug: row.category_slug,
      stock: row.stock,
      rating: row.rating,
      reviewCount: row.review_count,
      isFeatured: row.is_featured,
      isOnSale: Boolean(row.is_on_sale || (row.discount_price && parseFloat(row.discount_price) < parseFloat(row.price))),
      is_on_sale: Boolean(row.is_on_sale)
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image_url 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? OR p.slug = ?
    `, [id, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const row = rows[0];
    
    // Fetch all images for this product to support multi-image gallery
    let images = [];
    try {
      const [imageRows] = await db.query(
        'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC',
        [row.id]
      );
      if (imageRows && imageRows.length > 0) {
        images = imageRows.map(r => r.image_url);
      }
    } catch (e) {
      console.warn('Could not load additional product images:', e.message);
    }
    if (images.length === 0 && row.image_url) {
      images = [row.image_url];
    }

    const product = {
      id: row.id,
      title: row.name,
      slug: row.slug,
      description: row.description,
      price: `$${row.price}`,
      rawPrice: parseFloat(row.price),
      discountPrice: row.discount_price ? `$${row.discount_price}` : null,
      image: row.image_url,
      images: images,
      category: row.category_name,
      categorySlug: row.category_slug,
      stock: row.stock !== null && row.stock !== undefined ? row.stock : 10,
      rating: row.rating,
      reviewCount: row.review_count,
      isFeatured: row.is_featured,
      isOnSale: Boolean(row.is_on_sale || (row.discount_price && parseFloat(row.discount_price) < parseFloat(row.price)))
    };

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image_url 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = TRUE
      LIMIT 4
    `);
    
    const products = rows.map(row => ({
      id: row.id,
      title: row.name,
      slug: row.slug,
      description: row.description,
      price: `$${row.price}`,
      rawPrice: parseFloat(row.price),
      discountPrice: row.discount_price ? `$${row.discount_price}` : null,
      image: row.image_url,
      category: row.category_name,
      categorySlug: row.category_slug,
      stock: row.stock,
      rating: row.rating,
      reviewCount: row.review_count,
      isFeatured: row.is_featured,
      isOnSale: Boolean(row.is_on_sale || (row.discount_price && parseFloat(row.discount_price) < parseFloat(row.price)))
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error fetching featured products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, discount_price, category_id, stock, is_featured, is_on_sale, image_url } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO products (name, slug, description, price, discount_price, category_id, stock, is_featured, is_on_sale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description, price, discount_price, category_id, stock, is_featured || false, is_on_sale || false]
    );

    if (image_url) {
      await db.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, TRUE)',
        [result.insertId, image_url]
      );
    }

    res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, discount_price, category_id, stock, is_featured, is_on_sale } = req.body;
    
    await db.query(
      'UPDATE products SET name = ?, slug = ?, description = ?, price = ?, discount_price = ?, category_id = ?, stock = ?, is_featured = ?, is_on_sale = ? WHERE id = ?',
      [name, slug, description, price, discount_price, category_id, stock, is_featured, is_on_sale || false, id]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

exports.quickUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, is_on_sale, discount_price } = req.body;
    const updates = [];
    const params = [];

    if (stock !== undefined) {
      updates.push('stock = ?');
      params.push(parseInt(stock, 10));
    }
    if (is_on_sale !== undefined) {
      updates.push('is_on_sale = ?');
      params.push(Boolean(is_on_sale));
    }
    if (discount_price !== undefined) {
      updates.push('discount_price = ?');
      params.push(discount_price === '' || discount_price === null ? null : parseFloat(discount_price));
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    params.push(id);
    await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error quick updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};
