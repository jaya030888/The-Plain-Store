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

    console.log('Coupons schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating coupons schema:', error);
    process.exit(1);
  }
}

initCouponsDb();
