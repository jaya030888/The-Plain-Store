const db = require('./config/db');

async function createIndexes() {
  console.log('--- Applying Targeted PostgreSQL Indexes ---');
  
  const indexQueries = [
    // Products table indexes
    { name: 'idx_products_category_id', sql: 'CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);' },
    { name: 'idx_products_slug', sql: 'CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);' },
    { name: 'idx_products_featured', sql: 'CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;' },
    { name: 'idx_products_on_sale', sql: 'CREATE INDEX IF NOT EXISTS idx_products_on_sale ON products(is_on_sale) WHERE is_on_sale = TRUE;' },
    { name: 'idx_products_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);' },
    
    // Product images
    { name: 'idx_product_images_product_id', sql: 'CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);' },

    // Orders table indexes
    { name: 'idx_orders_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);' },
    { name: 'idx_orders_status', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);' },
    { name: 'idx_orders_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);' },
    { name: 'idx_orders_tracking', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);' },

    // Order items indexes
    { name: 'idx_order_items_order_id', sql: 'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);' },
    { name: 'idx_order_items_product_id', sql: 'CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);' },

    // Cart & Wishlist indexes
    { name: 'idx_cart_items_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);' },
    { name: 'idx_wishlist_items_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);' },

    // Coupons indexes
    { name: 'idx_coupons_code_upper', sql: 'CREATE INDEX IF NOT EXISTS idx_coupons_code_upper ON coupons(UPPER(code));' },
    { name: 'idx_coupon_products_coupon_id', sql: 'CREATE INDEX IF NOT EXISTS idx_coupon_products_coupon_id ON coupon_products(coupon_id);' },
    { name: 'idx_coupon_products_product_id', sql: 'CREATE INDEX IF NOT EXISTS idx_coupon_products_product_id ON coupon_products(product_id);' }
  ];

  for (const { name, sql } of indexQueries) {
    try {
      await db.query(sql);
      console.log(`[OK] Index created / verified: ${name}`);
    } catch (err) {
      console.warn(`[WARN] Could not create index ${name}: ${err.message}`);
    }
  }

  console.log('--- Database Indexing Complete ---');
  process.exit(0);
}

createIndexes().catch(err => {
  console.error('Fatal error applying indexes:', err);
  process.exit(1);
});
