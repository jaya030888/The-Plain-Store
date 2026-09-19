require('dotenv').config();
const { Pool } = require('pg');

function needsSsl(connectionString) {
  if (!connectionString) return false;
  return !/localhost|127\.0\.0\.1/i.test(connectionString);
}

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer',
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
  is_default BOOLEAN DEFAULT FALSE
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  address_id INTEGER NOT NULL REFERENCES addresses(id),
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
`;

const compatibilitySql = `
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE addresses ALTER COLUMN user_id DROP NOT NULL;
`;

const seedSql = `
INSERT INTO categories (name, slug) VALUES
  ('Home Decor', 'home-decor'),
  ('Organization', 'organization'),
  ('Wellness', 'wellness')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, discount_price, category_id, stock, rating, review_count, is_featured)
VALUES
  ('Wooden Jewellery Box', 'wooden-jewellery-box', 'Handcrafted solid wood jewellery box with brass accents. Perfect for organizing rings and small accessories.', 85.00, NULL, (SELECT id FROM categories WHERE slug = 'organization'), 15, 4.8, 24, TRUE),
  ('Minimalist Desk Organizer', 'minimalist-desk-organizer', 'Sleek matte finish desk organizer to keep your workspace clutter-free.', 45.00, 39.99, (SELECT id FROM categories WHERE slug = 'organization'), 30, 4.5, 12, TRUE),
  ('Ceramic Vase Set', 'ceramic-vase-set', 'Set of three minimalist ceramic vases in neutral tones. Ideal for dried flowers.', 60.00, NULL, (SELECT id FROM categories WHERE slug = 'home-decor'), 10, 4.9, 45, TRUE),
  ('Handcrafted Incense Holder', 'handcrafted-incense-holder', 'Brass and marble incense holder. Adds a touch of zen to any room.', 25.00, NULL, (SELECT id FROM categories WHERE slug = 'wellness'), 50, 4.6, 8, TRUE),
  ('Linen Throw Blanket', 'linen-throw-blanket', 'Premium 100% organic linen throw blanket in beige.', 110.00, 89.99, (SELECT id FROM categories WHERE slug = 'home-decor'), 5, 5.0, 3, FALSE),
  ('Concrete Coaster Set', 'concrete-coaster-set', 'Set of four industrial-style concrete coasters with cork bases.', 35.00, NULL, (SELECT id FROM categories WHERE slug = 'home-decor'), 40, 4.7, 18, FALSE),
  ('Aromatherapy Diffuser', 'aromatherapy-diffuser', 'Matte ceramic essential oil diffuser with ambient warm light.', 75.00, 65.00, (SELECT id FROM categories WHERE slug = 'wellness'), 20, 4.4, 31, FALSE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT p.id, v.image_url, TRUE
FROM (VALUES
  ('wooden-jewellery-box', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'),
  ('minimalist-desk-organizer', 'https://images.unsplash.com/photo-1594042898950-c8e4a7c06eb1?w=800&q=80'),
  ('ceramic-vase-set', 'https://images.unsplash.com/photo-1613564998797-15d97f80f1d0?w=800&q=80'),
  ('handcrafted-incense-holder', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80'),
  ('linen-throw-blanket', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'),
  ('concrete-coaster-set', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80'),
  ('aromatherapy-diffuser', 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80')
) AS v(slug, image_url)
JOIN products p ON p.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = TRUE
);
`;

async function runMigrations() {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required to run migrations in production');
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run migrations');
  }

  const pool = new Pool({
    connectionString,
    ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query(sql);
    try {
      await pool.query(compatibilitySql);
    } catch (compatErr) {
      console.warn('Schema compatibility step skipped:', compatErr.message);
    }
    await pool.query(seedSql);
    console.log('PostgreSQL migrations applied successfully.');
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration error:', err.message);
      process.exit(1);
    });
}

module.exports = { runMigrations, needsSsl };
