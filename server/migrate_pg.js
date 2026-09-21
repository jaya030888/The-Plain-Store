const net = require('net');
const dns = require('dns');
if (net.setDefaultAutoSelectFamily) {
  net.setDefaultAutoSelectFamily(false);
}
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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

const compatibilitySql = `
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE addresses ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
UPDATE orders
SET tracking_number = 'TPS-TRK-' || id || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'),
    carrier = COALESCE(NULLIF(carrier, ''), 'Standard Shipping'),
    estimated_delivery = COALESCE(estimated_delivery, (created_at + INTERVAL '5 days')::date)
WHERE tracking_number IS NULL OR tracking_number = '';
`;

const seedSql = `
INSERT INTO categories (name, slug) VALUES
  ('Home Decor', 'home-decor'),
  ('Organization', 'organization'),
  ('Wellness', 'wellness'),
  ('Kitchen & Dining', 'kitchen-dining')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, discount_price, category_id, stock, rating, review_count, is_featured, is_on_sale)
VALUES
  ('Wooden Jewellery Box', 'wooden-jewellery-box', 'Handcrafted solid wood jewellery box with brass accents. Perfect for organizing rings and small accessories.', 85.00, NULL, (SELECT id FROM categories WHERE slug = 'organization'), 15, 4.8, 24, TRUE, FALSE),
  ('Minimalist Desk Organizer', 'minimalist-desk-organizer', 'Sleek matte finish desk organizer to keep your workspace clutter-free.', 45.00, 39.99, (SELECT id FROM categories WHERE slug = 'organization'), 30, 4.5, 12, TRUE, TRUE),
  ('Ceramic Vase Set', 'ceramic-vase-set', 'Set of three minimalist ceramic vases in neutral tones. Ideal for dried flowers.', 60.00, NULL, (SELECT id FROM categories WHERE slug = 'home-decor'), 10, 4.9, 45, TRUE, FALSE),
  ('Handcrafted Incense Holder', 'handcrafted-incense-holder', 'Brass and marble incense holder. Adds a touch of zen to any room.', 25.00, NULL, (SELECT id FROM categories WHERE slug = 'wellness'), 50, 4.6, 8, TRUE, FALSE),
  ('Linen Throw Blanket', 'linen-throw-blanket', 'Premium 100% organic linen throw blanket in beige.', 110.00, 89.99, (SELECT id FROM categories WHERE slug = 'home-decor'), 5, 5.0, 3, FALSE, TRUE),
  ('Concrete Coaster Set', 'concrete-coaster-set', 'Set of four industrial-style concrete coasters with cork bases.', 35.00, NULL, (SELECT id FROM categories WHERE slug = 'home-decor'), 40, 4.7, 18, FALSE, FALSE),
  ('Aromatherapy Diffuser', 'aromatherapy-diffuser', 'Matte ceramic essential oil diffuser with ambient warm light.', 75.00, 65.00, (SELECT id FROM categories WHERE slug = 'wellness'), 20, 4.4, 31, FALSE, TRUE),
  ('Stoneware Matte Teapot', 'stoneware-matte-teapot', 'Handcrafted Japanese-inspired stoneware teapot with a textured matte ceramic finish and heat-resistant brass handle.', 58.00, NULL, (SELECT id FROM categories WHERE slug = 'kitchen-dining'), 22, 4.85, 34, FALSE, FALSE),
  ('Woven Rattan Storage Basket', 'woven-rattan-storage-basket', 'Artisanal hand-woven natural rattan basket with fitted handles. Ideal for blankets, magazines, or everyday essentials.', 42.00, 34.99, (SELECT id FROM categories WHERE slug = 'organization'), 18, 4.70, 21, FALSE, TRUE),
  ('Walnut Wood Coffee Scoop', 'walnut-wood-coffee-scoop', 'Carved from sustainably harvested North American walnut wood. Ergonomic handle and precise single-cup measurement.', 18.00, NULL, (SELECT id FROM categories WHERE slug = 'kitchen-dining'), 45, 4.90, 52, FALSE, FALSE),
  ('Pure Beeswax Pillar Candle', 'pure-beeswax-pillar-candle', '100% natural, unscented beeswax candle with an unbleached organic cotton wick. Burns cleanly with a gentle honey aroma.', 28.00, 22.50, (SELECT id FROM categories WHERE slug = 'wellness'), 30, 4.80, 19, FALSE, TRUE),
  ('Brushed Brass Table Lamp', 'brushed-brass-table-lamp', 'Minimalist mid-century modern accent lamp in brushed satin brass with a frosted spherical glass shade.', 120.00, 99.00, (SELECT id FROM categories WHERE slug = 'home-decor'), 12, 4.95, 28, TRUE, TRUE),
  ('Handmade Ceramic Pour-Over Dripper', 'handmade-ceramic-pour-over-dripper', 'Ribbed interior slow-drip coffee brewer made of high-fired speckled stoneware. Fits standard cone coffee filters.', 32.00, NULL, (SELECT id FROM categories WHERE slug = 'kitchen-dining'), 25, 4.75, 40, FALSE, FALSE),
  ('Organic Cotton Bath Towel Set', 'organic-cotton-bath-towel-set', 'Set of two ultra-soft plush bath towels made from 700 GSM GOTS-certified organic Turkish cotton in oatmeal beige.', 65.00, 52.00, (SELECT id FROM categories WHERE slug = 'wellness'), 16, 4.85, 33, FALSE, TRUE),
  ('Solid Oak Floating Wall Shelf', 'solid-oak-floating-wall-shelf', 'Seamless concealed-mount floating shelf crafted from white European oak with an organic matte wax finish.', 72.00, NULL, (SELECT id FROM categories WHERE slug = 'home-decor'), 20, 4.90, 15, FALSE, FALSE),
  ('Travertine Stone Trinket Dish', 'travertine-stone-trinket-dish', 'Natural honed Italian travertine catchall tray for rings, keys, and bedside accessories with unique natural veining.', 38.00, NULL, (SELECT id FROM categories WHERE slug = 'organization'), 28, 4.70, 22, FALSE, FALSE),
  ('Botanical Linen Cushion Cover', 'botanical-linen-cushion-cover', '100% pre-washed French flax linen throw pillow cover with subtle earth-tone piping and a hidden zipper closure.', 34.00, 28.00, (SELECT id FROM categories WHERE slug = 'home-decor'), 35, 4.65, 17, FALSE, TRUE)
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
  is_on_sale = EXCLUDED.is_on_sale;

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT p.id, v.image_url, TRUE
FROM (VALUES
  ('wooden-jewellery-box', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'),
  ('minimalist-desk-organizer', 'https://images.unsplash.com/photo-1594042898950-c8e4a7c06eb1?w=800&q=80'),
  ('ceramic-vase-set', 'https://images.unsplash.com/photo-1613564998797-15d97f80f1d0?w=800&q=80'),
  ('handcrafted-incense-holder', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80'),
  ('linen-throw-blanket', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'),
  ('concrete-coaster-set', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80'),
  ('aromatherapy-diffuser', 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80'),
  ('stoneware-matte-teapot', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80'),
  ('woven-rattan-storage-basket', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80'),
  ('walnut-wood-coffee-scoop', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'),
  ('pure-beeswax-pillar-candle', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80'),
  ('brushed-brass-table-lamp', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'),
  ('handmade-ceramic-pour-over-dripper', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80'),
  ('organic-cotton-bath-towel-set', 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&q=80'),
  ('solid-oak-floating-wall-shelf', 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=800&q=80'),
  ('travertine-stone-trinket-dish', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80'),
  ('botanical-linen-cushion-cover', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80')
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
