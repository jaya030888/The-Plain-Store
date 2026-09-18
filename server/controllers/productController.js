const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    
    let baseQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             pi.image_url 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
      baseQuery += ' AND p.name LIKE ?';
      queryParams.push(`%${search}%`);
    }
    if (category) {
      baseQuery += ' AND c.slug = ?';
      queryParams.push(category);
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
      image: row.image_url,
      category: row.category_name,
      categorySlug: row.category_slug,
      stock: row.stock,
      rating: row.rating,
      reviewCount: row.review_count
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
             pi.image_url 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE p.id = ? OR p.slug = ?
    `, [id, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const row = rows[0];
    const product = {
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
      reviewCount: row.review_count
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
             pi.image_url 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
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
      isFeatured: row.is_featured
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error fetching featured products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, discount_price, category_id, stock, is_featured } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO products (name, slug, description, price, discount_price, category_id, stock, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description, price, discount_price, category_id, stock, is_featured || false]
    );

    res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, discount_price, category_id, stock, is_featured } = req.body;
    
    await db.query(
      'UPDATE products SET name = ?, slug = ?, description = ?, price = ?, discount_price = ?, category_id = ?, stock = ?, is_featured = ? WHERE id = ?',
      [name, slug, description, price, discount_price, category_id, stock, is_featured, id]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
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
