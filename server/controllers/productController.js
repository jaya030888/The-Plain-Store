const db = require('../config/db');

// In-memory catalog cache for unparameterized queries
let cachedProductsList = null;
let lastCacheTime = 0;
const CATALOG_CACHE_TTL_MS = 30000; // 30 seconds TTL

function invalidateProductCache() {
  cachedProductsList = null;
  lastCacheTime = 0;
}
exports.invalidateProductCache = invalidateProductCache;

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, onSale } = req.query;
    const hasFilters = search || category || minPrice || maxPrice || sort || onSale;

    // Return cached list if available and no query parameters
    if (!hasFilters && cachedProductsList && (Date.now() - lastCacheTime < CATALOG_CACHE_TTL_MS)) {
      return res.json(cachedProductsList);
    }
    
    let baseQuery = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.discount_price, p.stock, 
             p.rating, p.review_count, p.is_featured, p.is_on_sale, 
             p.is_returnable, p.return_window_days, p.return_policy_type, 
             p.is_open_box_delivery, p.badge, p.created_at,
             c.name as category_name, c.slug as category_slug, 
             pimg.image_url 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN LATERAL (
        SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1
      ) pimg ON true
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
      price: `₹${row.price}`,
      rawPrice: parseFloat(row.price),
      discountPrice: row.discount_price ? `₹${row.discount_price}` : null,
      rawDiscountPrice: row.discount_price ? parseFloat(row.discount_price) : null,
      image: row.image_url,
      category: row.category_name,
      categorySlug: row.category_slug,
      stock: row.stock,
      rating: row.rating,
      reviewCount: row.review_count,
      isFeatured: row.is_featured,
      isOnSale: Boolean(row.is_on_sale || (row.discount_price && parseFloat(row.discount_price) < parseFloat(row.price))),
      is_on_sale: Boolean(row.is_on_sale),
      isReturnable: row.is_returnable !== null && row.is_returnable !== undefined ? Boolean(row.is_returnable) : true,
      is_returnable: row.is_returnable !== null && row.is_returnable !== undefined ? Boolean(row.is_returnable) : true,
      returnWindowDays: row.return_window_days !== null && row.return_window_days !== undefined ? Number(row.return_window_days) : 7,
      return_window_days: row.return_window_days !== null && row.return_window_days !== undefined ? Number(row.return_window_days) : 7,
      returnPolicyType: row.return_policy_type || (row.is_returnable === false ? 'Non-Returnable' : `${row.return_window_days || 7} Days Returnable`),
      return_policy_type: row.return_policy_type || (row.is_returnable === false ? 'Non-Returnable' : `${row.return_window_days || 7} Days Returnable`),
      isOpenBoxDelivery: Boolean(row.is_open_box_delivery),
      is_open_box_delivery: Boolean(row.is_open_box_delivery),
      badge: row.badge || null
    }));

    if (!hasFilters) {
      cachedProductsList = products;
      lastCacheTime = Date.now();
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    }

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
      SELECT p.id, p.name, p.slug, p.description, p.price, p.discount_price, p.stock, 
             p.rating, p.review_count, p.is_featured, p.is_on_sale, 
             p.is_returnable, p.return_window_days, p.return_policy_type, 
             p.is_open_box_delivery, p.badge, p.created_at,
             c.name as category_name, c.slug as category_slug, 
             pimg.image_url 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN LATERAL (
        SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1
      ) pimg ON true
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
      price: `₹${row.price}`,
      rawPrice: parseFloat(row.price),
      discountPrice: row.discount_price ? `₹${row.discount_price}` : null,
      image: row.image_url,
      images: images,
      category: row.category_name,
      categorySlug: row.category_slug,
      stock: row.stock !== null && row.stock !== undefined ? row.stock : 10,
      rating: row.rating,
      reviewCount: row.review_count,
      isFeatured: row.is_featured,
      isOnSale: Boolean(row.is_on_sale || (row.discount_price && parseFloat(row.discount_price) < parseFloat(row.price))),
      isReturnable: row.is_returnable !== null && row.is_returnable !== undefined ? Boolean(row.is_returnable) : true,
      is_returnable: row.is_returnable !== null && row.is_returnable !== undefined ? Boolean(row.is_returnable) : true,
      returnWindowDays: row.return_window_days !== null && row.return_window_days !== undefined ? Number(row.return_window_days) : 7,
      return_window_days: row.return_window_days !== null && row.return_window_days !== undefined ? Number(row.return_window_days) : 7,
      returnPolicyType: row.return_policy_type || (row.is_returnable === false ? 'Non-Returnable' : `${row.return_window_days || 7} Days Returnable`),
      return_policy_type: row.return_policy_type || (row.is_returnable === false ? 'Non-Returnable' : `${row.return_window_days || 7} Days Returnable`),
      isOpenBoxDelivery: Boolean(row.is_open_box_delivery),
      is_open_box_delivery: Boolean(row.is_open_box_delivery),
      badge: row.badge || null
    };

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.name, p.slug, p.description, p.price, p.discount_price, p.stock, 
             p.rating, p.review_count, p.is_featured, p.is_on_sale, 
             p.is_returnable, p.return_window_days, p.return_policy_type, 
             p.is_open_box_delivery, p.badge,
             c.name as category_name, c.slug as category_slug, 
             pimg.image_url 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN LATERAL (
        SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1
      ) pimg ON true
      WHERE p.is_featured = TRUE
      ORDER BY p.rating DESC, p.created_at DESC
      LIMIT 4
    `);
    
    const products = rows.map(row => ({
      id: row.id,
      title: row.name,
      slug: row.slug,
      description: row.description,
      price: `₹${row.price}`,
      rawPrice: parseFloat(row.price),
      discountPrice: row.discount_price ? `₹${row.discount_price}` : null,
      image: row.image_url,
      category: row.category_name,
      categorySlug: row.category_slug,
      stock: row.stock,
      rating: row.rating,
      reviewCount: row.review_count,
      isFeatured: row.is_featured,
      isOnSale: Boolean(row.is_on_sale || (row.discount_price && parseFloat(row.discount_price) < parseFloat(row.price))),
      isReturnable: row.is_returnable !== null && row.is_returnable !== undefined ? Boolean(row.is_returnable) : true,
      returnWindowDays: row.return_window_days !== null && row.return_window_days !== undefined ? Number(row.return_window_days) : 7,
      returnPolicyType: row.return_policy_type || (row.is_returnable === false ? 'Non-Returnable' : `${row.return_window_days || 7} Days Returnable`),
      isOpenBoxDelivery: Boolean(row.is_open_box_delivery),
      badge: row.badge || null
    }));

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=180');
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error fetching featured products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { 
      name, slug, description, price, discount_price, category_id, stock, 
      is_featured, is_on_sale, image_url,
      is_returnable, return_window_days, return_policy_type, is_open_box_delivery, badge
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!slug || !slug.trim()) {
      return res.status(400).json({ message: 'Product slug is required' });
    }

    // Constraint: Image is required when adding product
    if (!image_url || typeof image_url !== 'string' || !image_url.trim()) {
      return res.status(400).json({ message: 'Product image URL is required when creating a product' });
    }

    // Constraint: Item price cannot be negative
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ message: 'Item price cannot be negative' });
    }

    // Constraint: Discount cannot be greater than item price, nor negative
    let numDiscount = null;
    if (discount_price !== undefined && discount_price !== null && discount_price !== '') {
      numDiscount = parseFloat(discount_price);
      if (isNaN(numDiscount) || numDiscount < 0) {
        return res.status(400).json({ message: 'Discount price cannot be negative' });
      }
      if (numDiscount > numPrice) {
        return res.status(400).json({ 
          message: `Discount price (₹${numDiscount}) cannot be greater than item price (₹${numPrice})` 
        });
      }
    }
    
    const isReturnableVal = is_returnable !== undefined ? Boolean(is_returnable) : true;
    const returnWindowVal = return_window_days !== undefined && return_window_days !== '' ? parseInt(return_window_days, 10) : 7;
    const policyTypeVal = return_policy_type || (isReturnableVal ? `${returnWindowVal} Days Returnable` : 'Non-Returnable');
    const openBoxVal = Boolean(is_open_box_delivery);
    const badgeVal = badge && badge.trim() ? badge.trim() : null;

    const [result] = await db.query(
      `INSERT INTO products 
        (name, slug, description, price, discount_price, category_id, stock, is_featured, is_on_sale, is_returnable, return_window_days, return_policy_type, is_open_box_delivery, badge) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(), slug.trim(), description || '', numPrice, numDiscount, category_id || null, stock || 0, 
        is_featured || false, is_on_sale || false, 
        isReturnableVal, returnWindowVal, policyTypeVal, openBoxVal, badgeVal
      ]
    );

    const newProductId = result?.insertId || result?.[0]?.id || result?.id;

    if (image_url && image_url.trim()) {
      await db.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, TRUE)',
        [newProductId, image_url.trim()]
      );
    }

    invalidateProductCache();
    res.status(201).json({ id: newProductId, message: 'Product created successfully' });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message || 'Server error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, slug, description, price, discount_price, category_id, stock, 
      is_featured, is_on_sale, image_url,
      is_returnable, return_window_days, return_policy_type, is_open_box_delivery, badge
    } = req.body;

    // Constraint: Item price cannot be negative
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ message: 'Item price cannot be negative' });
    }

    // Constraint: Discount cannot be greater than item price, nor negative
    let numDiscount = null;
    if (discount_price !== undefined && discount_price !== null && discount_price !== '') {
      numDiscount = parseFloat(discount_price);
      if (isNaN(numDiscount) || numDiscount < 0) {
        return res.status(400).json({ message: 'Discount price cannot be negative' });
      }
      if (numDiscount > numPrice) {
        return res.status(400).json({ 
          message: `Discount price (₹${numDiscount}) cannot be greater than item price (₹${numPrice})` 
        });
      }
    }

    const isReturnableVal = is_returnable !== undefined ? Boolean(is_returnable) : true;
    const returnWindowVal = return_window_days !== undefined && return_window_days !== '' ? parseInt(return_window_days, 10) : 7;
    const policyTypeVal = return_policy_type || (isReturnableVal ? `${returnWindowVal} Days Returnable` : 'Non-Returnable');
    const openBoxVal = Boolean(is_open_box_delivery);
    const badgeVal = badge && badge.trim() ? badge.trim() : null;
    
    await db.query(
      `UPDATE products 
       SET name = ?, slug = ?, description = ?, price = ?, discount_price = ?, 
           category_id = ?, stock = ?, is_featured = ?, is_on_sale = ?,
           is_returnable = ?, return_window_days = ?, return_policy_type = ?, is_open_box_delivery = ?, badge = ?
       WHERE id = ?`,
      [
        name, slug, description, numPrice, numDiscount, 
        category_id || null, stock || 0, is_featured || false, is_on_sale || false,
        isReturnableVal, returnWindowVal, policyTypeVal, openBoxVal, badgeVal,
        id
      ]
    );

    if (image_url && image_url.trim()) {
      const [existingImgs] = await db.query(
        'SELECT id FROM product_images WHERE product_id = ? AND is_primary = TRUE LIMIT 1',
        [id]
      );
      if (existingImgs.length > 0) {
        await db.query('UPDATE product_images SET image_url = ? WHERE id = ?', [image_url.trim(), existingImgs[0].id]);
      } else {
        await db.query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, TRUE)', [id, image_url.trim()]);
      }
    }

    invalidateProductCache();
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message || 'Server error updating product' });
  }
};

exports.quickUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, is_on_sale, discount_price, is_returnable, return_window_days, return_policy_type, is_open_box_delivery, badge } = req.body;
    const updates = [];
    const params = [];

    if (stock !== undefined) {
      const numStock = parseInt(stock, 10);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({ message: 'Stock cannot be negative' });
      }
      updates.push('stock = ?');
      params.push(numStock);
    }
    if (is_on_sale !== undefined) {
      updates.push('is_on_sale = ?');
      params.push(Boolean(is_on_sale));
    }
    if (discount_price !== undefined) {
      if (discount_price === '' || discount_price === null) {
        updates.push('discount_price = ?');
        params.push(null);
      } else {
        const numDiscount = parseFloat(discount_price);
        if (isNaN(numDiscount) || numDiscount < 0) {
          return res.status(400).json({ message: 'Discount price cannot be negative' });
        }
        const [pRows] = await db.query('SELECT price FROM products WHERE id = ?', [id]);
        if (pRows.length > 0) {
          const itemPrice = parseFloat(pRows[0].price);
          if (numDiscount > itemPrice) {
            return res.status(400).json({ 
              message: `Discount price (₹${numDiscount}) cannot be greater than item price (₹${itemPrice})` 
            });
          }
        }
        updates.push('discount_price = ?');
        params.push(numDiscount);
      }
    }
    if (is_returnable !== undefined) {
      updates.push('is_returnable = ?');
      params.push(Boolean(is_returnable));
    }
    if (return_window_days !== undefined) {
      updates.push('return_window_days = ?');
      params.push(parseInt(return_window_days, 10));
    }
    if (return_policy_type !== undefined) {
      updates.push('return_policy_type = ?');
      params.push(return_policy_type);
    }
    if (is_open_box_delivery !== undefined) {
      updates.push('is_open_box_delivery = ?');
      params.push(Boolean(is_open_box_delivery));
    }
    if (badge !== undefined) {
      updates.push('badge = ?');
      params.push(badge && badge.trim() ? badge.trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    params.push(id);
    await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);

    invalidateProductCache();
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
    invalidateProductCache();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};
