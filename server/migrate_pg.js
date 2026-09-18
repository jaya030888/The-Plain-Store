require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const sql = `
-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses
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

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

-- Products
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

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE
);

-- Coupons
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

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  address_id INTEGER NOT NULL REFERENCES addresses(id),
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL,
  coupon_id INTEGER REFERENCES coupons(id),
  discount_amount NUMERIC(10,2) DEFAULT 0.00,
  payment_status VARCHAR(20) DEFAULT 'pending',
  order_status VARCHAR(20) DEFAULT 'pending',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL
);

-- Cart Items (Persistent Cart)
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- Wishlist Items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Seed Categories
INSERT INTO categories (name, slug) VALUES
  ('Home Decor', 'home-decor'),
  ('Organization', 'organization'),
  ('Wellness', 'wellness')
ON CONFLICT DO NOTHING;

-- Seed Products (example rows)
INSERT INTO products (name, slug, description, price, discount_price, category_id, stock, rating, review_count, is_featured)
VALUES
  ('Wooden Jewellery Box', 'wooden-jewellery-box', 'Handcrafted solid wood jewellery box with brass accents.', 85.00, NULL, 2, 15, 4.8, 24, TRUE),
  ('Minimalist Desk Organizer', 'minimalist-desk-organizer', 'Sleek matte finish desk organizer to keep your workspace clutter-free.', 45.00, 39.99, 2, 30, 4.5, 12, TRUE),
  ('Ceramic Vase Set', 'ceramic-vase-set', 'Set of three minimalist ceramic vases in neutral tones.', 60.00, NULL, 1, 10, 4.9, 45, TRUE),
  ('Handcrafted Incense Holder', 'handcrafted-incense-holder', 'Brass and marble incense holder. Adds a touch of zen to any room.', 25.00, NULL, 3, 50, 4.6, 8, TRUE)
ON CONFLICT DO NOTHING;

-- Seed Product Images (placeholder URLs)
INSERT INTO product_images (product_id, image_url, is_primary)
VALUES
  (1, '/wooden_jewellery_box.jpg', TRUE),
  (2, 'https://images.unsplash.com/photo-1594042898950-c8e4a7c06eb1?w=600&q=80', TRUE),
  (3, 'https://images.unsplash.com/photo-1613564998797-15d97f80f1d0?w=600&q=80', TRUE),
  (4, 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80', TRUE)
ON CONFLICT DO NOTHING;
`;

(async () => {
  try {
    await pool.query(sql);
    console.log('PostgreSQL migrations applied successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
})();
