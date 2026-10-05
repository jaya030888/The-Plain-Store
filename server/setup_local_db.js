const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'plainstore';

async function setup() {
  console.log('=== Step 1: Connecting to postgres system DB to create plainstore if needed ===');
  const rootPool = new Pool({
    connectionString: `postgres://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/postgres`
  });

  try {
    const res = await rootPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
    if (res.rowCount === 0) {
      console.log(`Creating database "${DB_NAME}"...`);
      await rootPool.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database "${DB_NAME}" created successfully.`);
    } else {
      console.log(`Database "${DB_NAME}" already exists.`);
    }
  } finally {
    await rootPool.end();
  }

  console.log('\n=== Step 2: Connecting to plainstore database ===');
  const pool = new Pool({
    connectionString: `postgres://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
  });

  try {
    console.log('Creating tables...');
    const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'customer',
      is_blocked BOOLEAN DEFAULT FALSE,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      house_flat VARCHAR(255) NOT NULL,
      street VARCHAR(255) NOT NULL,
      area VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      is_deleted BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      price NUMERIC(10,2) NOT NULL,
      discount_price NUMERIC(10,2),
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      rating NUMERIC(3,2) DEFAULT 0.00,
      review_count INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      is_on_sale BOOLEAN DEFAULT FALSE,
      is_returnable BOOLEAN DEFAULT TRUE,
      return_window_days INTEGER DEFAULT 7,
      return_policy_type VARCHAR(100) DEFAULT '7 Days Returnable',
      is_open_box_delivery BOOLEAN DEFAULT FALSE,
      badge VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      discount_type VARCHAR(20) NOT NULL,
      discount_value NUMERIC(10,2) NOT NULL,
      min_order_amount NUMERIC(10,2) DEFAULT 0.00,
      expiry_date DATE,
      is_active BOOLEAN DEFAULT TRUE,
      applies_to VARCHAR(20) DEFAULT 'all',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupon_products (
      coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      PRIMARY KEY (coupon_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      address_id INTEGER REFERENCES addresses(id),
      subtotal NUMERIC(10,2) NOT NULL,
      delivery_fee NUMERIC(10,2) DEFAULT 0.00,
      total NUMERIC(10,2) NOT NULL,
      coupon_id INTEGER REFERENCES coupons(id),
      discount_amount NUMERIC(10,2) DEFAULT 0.00,
      payment_status VARCHAR(20) DEFAULT 'pending',
      order_status VARCHAR(20) DEFAULT 'pending',
      tracking_number VARCHAR(100),
      carrier VARCHAR(100),
      estimated_delivery DATE,
      razorpay_order_id VARCHAR(255),
      razorpay_payment_id VARCHAR(255),
      return_status VARCHAR(50) DEFAULT NULL,
      return_reason TEXT DEFAULT NULL,
      return_requested_at TIMESTAMP DEFAULT NULL,
      return_notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_returns (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      reason VARCHAR(255) NOT NULL,
      details TEXT,
      status VARCHAR(50) DEFAULT 'return_requested',
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      price_at_purchase NUMERIC(10,2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS admin_notifications (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      user_name VARCHAR(255),
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(255),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    await pool.query(schemaSql);
    console.log('Tables verified/created successfully.');

    console.log('\n=== Step 3: Seeding categories, products, images, coupons & admin ===');
    
    // Seed Categories
    await pool.query(`
      INSERT INTO categories (name, slug) VALUES
        ('Home Decor', 'home-decor'),
        ('Organization', 'organization'),
        ('Wellness', 'wellness'),
        ('Kitchen & Dining', 'kitchen-dining')
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Seed Coupons
    await pool.query(`
      INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, is_active, applies_to)
      VALUES 
        ('PLAIN20', 'percentage', 20.00, 0.00, '2035-12-31', TRUE, 'all'),
        ('WELCOME10', 'percentage', 10.00, 0.00, '2035-12-31', TRUE, 'all'),
        ('FLAT50', 'fixed', 50.00, 100.00, '2035-12-31', TRUE, 'all')
      ON CONFLICT (code) DO UPDATE SET 
        discount_type = EXCLUDED.discount_type,
        discount_value = EXCLUDED.discount_value,
        is_active = TRUE,
        applies_to = EXCLUDED.applies_to;
    `);

    // Seed Admin User
    const salt = await bcrypt.genSalt(10);
    const adminPassHash = await bcrypt.hash('admin123', salt);
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Admin User', 'admin@theplainstore.com', $1, 'admin')
      ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'admin';
    `, [adminPassHash]);

    // Seed Demo Customer User
    const custPassHash = await bcrypt.hash('customer123', salt);
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Demo Customer', 'customer@example.com', $1, 'customer')
      ON CONFLICT (email) DO NOTHING;
    `, [custPassHash]);

    // Seed Products
    const products = [
      { name: 'Wooden Jewellery Box', slug: 'wooden-jewellery-box', description: 'Handcrafted solid wood jewellery box with brass accents. Perfect for organizing rings and small accessories.', price: 85.00, discount_price: null, catSlug: 'organization', stock: 15, rating: 4.8, review_count: 24, is_featured: true, is_on_sale: false, badge: 'Best Seller', is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: true, image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80' },
      { name: 'Minimalist Desk Organizer', slug: 'minimalist-desk-organizer', description: 'Sleek matte finish desk organizer to keep your workspace clutter-free.', price: 45.00, discount_price: 39.99, catSlug: 'organization', stock: 30, rating: 4.5, review_count: 12, is_featured: true, is_on_sale: true, badge: 'Top Rated', is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1594042898950-c8e4a7c06eb1?w=800&q=80' },
      { name: 'Ceramic Vase Set', slug: 'ceramic-vase-set', description: 'Set of three minimalist ceramic vases in neutral tones. Ideal for dried flowers.', price: 60.00, discount_price: null, catSlug: 'home-decor', stock: 10, rating: 4.9, review_count: 45, is_featured: true, is_on_sale: false, badge: 'Best Seller', is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: true, image_url: 'https://images.unsplash.com/photo-1613564998797-15d97f80f1d0?w=800&q=80' },
      { name: 'Handcrafted Incense Holder', slug: 'handcrafted-incense-holder', description: 'Brass and marble incense holder. Adds a touch of zen to any room.', price: 25.00, discount_price: null, catSlug: 'wellness', stock: 50, rating: 4.6, review_count: 8, is_featured: true, is_on_sale: false, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80' },
      { name: 'Linen Throw Blanket', slug: 'linen-throw-blanket', description: 'Premium 100% organic linen throw blanket in beige.', price: 110.00, discount_price: 89.99, catSlug: 'home-decor', stock: 5, rating: 5.0, review_count: 3, is_featured: false, is_on_sale: true, badge: 'Top Rated', is_returnable: true, return_window_days: 10, return_policy_type: '10 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80' },
      { name: 'Concrete Coaster Set', slug: 'concrete-coaster-set', description: 'Set of four industrial-style concrete coasters with cork bases.', price: 35.00, discount_price: null, catSlug: 'home-decor', stock: 40, rating: 4.7, review_count: 18, is_featured: false, is_on_sale: false, badge: 'New Arrival', is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80' },
      { name: 'Aromatherapy Diffuser', slug: 'aromatherapy-diffuser', description: 'Matte ceramic essential oil diffuser with ambient warm light.', price: 75.00, discount_price: 65.00, catSlug: 'wellness', stock: 20, rating: 4.4, review_count: 31, is_featured: false, is_on_sale: true, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80' },
      { name: 'Stoneware Matte Teapot', slug: 'stoneware-matte-teapot', description: 'Handcrafted Japanese-inspired stoneware teapot with a textured matte ceramic finish and heat-resistant brass handle.', price: 58.00, discount_price: null, catSlug: 'kitchen-dining', stock: 22, rating: 4.85, review_count: 34, is_featured: false, is_on_sale: false, badge: 'New Arrival', is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: true, image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80' },
      { name: 'Woven Rattan Storage Basket', slug: 'woven-rattan-storage-basket', description: 'Artisanal hand-woven natural rattan basket with fitted handles. Ideal for blankets, magazines, or everyday essentials.', price: 42.00, discount_price: 34.99, catSlug: 'organization', stock: 18, rating: 4.70, review_count: 21, is_featured: false, is_on_sale: true, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80' },
      { name: 'Walnut Wood Coffee Scoop', slug: 'walnut-wood-coffee-scoop', description: 'Carved from sustainably harvested North American walnut wood. Ergonomic handle and precise single-cup measurement.', price: 18.00, discount_price: null, catSlug: 'kitchen-dining', stock: 45, rating: 4.90, review_count: 52, is_featured: false, is_on_sale: false, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80' },
      { name: 'Pure Beeswax Pillar Candle', slug: 'pure-beeswax-pillar-candle', description: '100% natural, unscented beeswax candle with an unbleached organic cotton wick. Burns cleanly with a gentle honey aroma.', price: 28.00, discount_price: 22.50, catSlug: 'wellness', stock: 30, rating: 4.80, review_count: 19, is_featured: false, is_on_sale: true, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80' },
      { name: 'Brushed Brass Table Lamp', slug: 'brushed-brass-table-lamp', description: 'Minimalist mid-century modern accent lamp in brushed satin brass with a frosted spherical glass shade.', price: 120.00, discount_price: 99.00, catSlug: 'home-decor', stock: 12, rating: 4.95, review_count: 28, is_featured: true, is_on_sale: true, badge: 'Best Seller', is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: true, image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80' },
      { name: 'Handmade Ceramic Pour-Over Dripper', slug: 'handmade-ceramic-pour-over-dripper', description: 'Ribbed interior slow-drip coffee brewer made of high-fired speckled stoneware. Fits standard cone coffee filters.', price: 32.00, discount_price: null, catSlug: 'kitchen-dining', stock: 25, rating: 4.75, review_count: 40, is_featured: false, is_on_sale: false, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80' },
      { name: 'Organic Cotton Bath Towel Set', slug: 'organic-cotton-bath-towel-set', description: 'Set of two ultra-soft plush bath towels made from 700 GSM GOTS-certified organic Turkish cotton in oatmeal beige.', price: 65.00, discount_price: 52.00, catSlug: 'wellness', stock: 16, rating: 4.85, review_count: 33, is_featured: false, is_on_sale: true, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&q=80' },
      { name: 'Solid Oak Floating Wall Shelf', slug: 'solid-oak-floating-wall-shelf', description: 'Seamless concealed-mount floating shelf crafted from white European oak with an organic matte wax finish.', price: 72.00, discount_price: null, catSlug: 'home-decor', stock: 20, rating: 4.90, review_count: 15, is_featured: false, is_on_sale: false, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=800&q=80' },
      { name: 'Travertine Stone Trinket Dish', slug: 'travertine-stone-trinket-dish', description: 'Natural honed Italian travertine catchall tray for rings, keys, and bedside accessories with unique natural veining.', price: 38.00, discount_price: null, catSlug: 'organization', stock: 28, rating: 4.70, review_count: 22, is_featured: false, is_on_sale: false, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80' },
      { name: 'Botanical Linen Cushion Cover', slug: 'botanical-linen-cushion-cover', description: '100% pre-washed French flax linen throw pillow cover with subtle earth-tone piping and a hidden zipper closure.', price: 34.00, discount_price: 28.00, catSlug: 'home-decor', stock: 35, rating: 4.65, review_count: 17, is_featured: false, is_on_sale: true, badge: null, is_returnable: true, return_window_days: 7, return_policy_type: '7 Days Returnable', is_open_box_delivery: false, image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80' }
    ];

    const catRes = await pool.query('SELECT id, slug FROM categories');
    const catMap = {};
    catRes.rows.forEach(r => { catMap[r.slug] = r.id; });

    for (const p of products) {
      const catId = catMap[p.catSlug] || null;
      const res = await pool.query(`
        INSERT INTO products (name, slug, description, price, discount_price, category_id, stock, rating, review_count, is_featured, is_on_sale, badge, is_returnable, return_window_days, return_policy_type, is_open_box_delivery)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          discount_price = EXCLUDED.discount_price,
          category_id = EXCLUDED.category_id,
          stock = EXCLUDED.stock,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          is_featured = EXCLUDED.is_featured,
          is_on_sale = EXCLUDED.is_on_sale,
          badge = EXCLUDED.badge,
          is_returnable = EXCLUDED.is_returnable,
          return_window_days = EXCLUDED.return_window_days,
          return_policy_type = EXCLUDED.return_policy_type,
          is_open_box_delivery = EXCLUDED.is_open_box_delivery
        RETURNING id;
      `, [
        p.name, p.slug, p.description, p.price, p.discount_price, catId,
        p.stock, p.rating, p.review_count, p.is_featured, p.is_on_sale,
        p.badge, p.is_returnable, p.return_window_days, p.return_policy_type, p.is_open_box_delivery
      ]);

      const productId = res.rows[0].id;
      if (productId && p.image_url) {
        await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
        await pool.query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, TRUE)', [productId, p.image_url]);
      }
    }

    console.log('\n=== Step 4: Creating PostgreSQL Performance Indexes ===');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)',
      'CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)',
      'CREATE INDEX IF NOT EXISTS idx_products_category_sale ON products(category_id, is_on_sale)',
      'CREATE INDEX IF NOT EXISTS idx_products_name_lower ON products(LOWER(name))',
      'CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE',
      'CREATE INDEX IF NOT EXISTS idx_products_on_sale ON products(is_on_sale) WHERE is_on_sale = TRUE',
      'CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number)',
      'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_coupons_code_upper ON coupons(UPPER(code))',
      'CREATE INDEX IF NOT EXISTS idx_coupon_products_coupon_id ON coupon_products(coupon_id)',
      'CREATE INDEX IF NOT EXISTS idx_coupon_products_product_id ON coupon_products(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(user_id, is_default DESC)',
      'CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked)',
      'CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted)'
    ];

    for (const idxSql of indexes) {
      await pool.query(idxSql);
    }

    const countRes = await pool.query('SELECT COUNT(*) as total FROM products');
    console.log(`\n Local Database Initialized Successfully! Total products: ${countRes.rows[0].total}`);
  } finally {
    await pool.end();
  }
}

setup().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
