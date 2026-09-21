const db = require('./config/db');

async function migrateProductPolicies() {
  try {
    console.log('Adding product policy columns to products table in PostgreSQL...');
    await db.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS is_returnable BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS return_window_days INTEGER DEFAULT 7,
      ADD COLUMN IF NOT EXISTS return_policy_type VARCHAR(100) DEFAULT '7 Days Returnable',
      ADD COLUMN IF NOT EXISTS is_open_box_delivery BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS badge VARCHAR(100) DEFAULT NULL;
    `);

    // Set sample badges & policies on existing products for immediate rich display
    await db.query(`
      UPDATE products SET is_returnable = TRUE, return_window_days = 7, return_policy_type = '7 Days Returnable', is_open_box_delivery = TRUE WHERE is_returnable IS NULL;
    `);

    // Set Open box delivery on select fragile/ceramic products
    await db.query(`
      UPDATE products SET is_open_box_delivery = TRUE WHERE category_id = (SELECT id FROM categories WHERE slug = 'home-decor' LIMIT 1);
    `);

    // Set badges on a few popular items
    await db.query(`
      UPDATE products SET badge = 'Best Seller' WHERE id IN (1, 3);
      UPDATE products SET badge = 'Top Rated' WHERE id IN (2, 5);
      UPDATE products SET badge = 'New Arrival' WHERE id IN (6, 8);
    `);

    console.log('Product policies and badges migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateProductPolicies();
