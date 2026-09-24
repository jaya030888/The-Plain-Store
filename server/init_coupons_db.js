const db = require('./config/db');

async function initCouponsDb() {
  try {
    console.log('Ensuring coupons schema supports specific products...');
    
    // Check/add applies_to column on coupons table
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'coupons' AND column_name = 'applies_to'
        ) THEN
          ALTER TABLE coupons ADD COLUMN applies_to VARCHAR(20) DEFAULT 'all';
        END IF;
      END $$;
    `);

    // Create coupon_products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS coupon_products (
        coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (coupon_id, product_id)
      );
    `);

    // Seed default coupons including PLAIN20
    await db.query(`
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

    console.log('Coupons schema and default coupons (PLAIN20) initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating coupons schema:', error);
    process.exit(1);
  }
}

initCouponsDb();
