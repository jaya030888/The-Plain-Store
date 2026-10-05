const db = require('./config/db');

async function testAll() {
  console.log('--- Testing Database Queries ---');
  
  // 1. Products
  const [products] = await db.query('SELECT * FROM products LIMIT 5');
  console.log('[OK] Products query succeeded, fetched:', products.length);

  // 2. Categories
  const [categories] = await db.query('SELECT * FROM categories');
  console.log('[OK] Categories query succeeded, fetched:', categories.length);

  // 3. Coupons
  const [coupons] = await db.query('SELECT * FROM coupons');
  console.log('[OK] Coupons query succeeded, fetched:', coupons.length);

  // 4. Users
  const [users] = await db.query('SELECT id, name, email, role FROM users');
  console.log('[OK] Users query succeeded, fetched:', users.length);

  // 5. Admin Dashboard Stats
  const [revRows] = await db.query("SELECT SUM(total) as total_revenue FROM orders WHERE payment_status = 'paid'");
  const [orderRows] = await db.query("SELECT COUNT(*) as total_orders FROM orders");
  const [custRows] = await db.query("SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'");
  console.log('[OK] Admin stats succeeded:', {
    revenue: revRows[0]?.total_revenue || 0,
    orders: orderRows[0]?.total_orders || 0,
    customers: custRows[0]?.total_customers || 0
  });

  // 6. Admin Orders List Query
  const [orders] = await db.query(`
    SELECT 
      o.id, o.user_id, o.address_id, o.subtotal, o.delivery_fee, o.total, 
      o.coupon_id, o.discount_amount, o.payment_status, o.payment_method, 
      o.order_status, o.tracking_number, o.carrier, o.estimated_delivery, 
      o.return_status, o.return_reason, o.return_requested_at, o.return_notes, 
      o.created_at, o.updated_at,
      COALESCE(u.name, a.full_name, 'Guest Customer') as customer_name, 
      COALESCE(u.email, 'Guest Checkout') as customer_email,
      a.phone as customer_phone,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'order_id', oi.order_id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price_at_purchase', oi.price_at_purchase,
            'title', p.name,
            'image', pimg.image_url
          ) ORDER BY oi.id ASC
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
      ) AS items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN addresses a ON o.address_id = a.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN LATERAL (
      SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1
    ) pimg ON true
    GROUP BY o.id, u.name, a.full_name, u.email, a.phone
    ORDER BY o.created_at DESC
  `);
  console.log('[OK] Admin Orders query succeeded, fetched orders:', orders.length);

  // 7. Admin Notifications Query
  const [notifications] = await db.query('SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 50');
  console.log('[OK] Admin Notifications query succeeded, fetched:', notifications.length);

  // 8. Wishlist & Cart queries
  const [cart] = await db.query('SELECT * FROM cart_items LIMIT 1');
  const [wishlist] = await db.query('SELECT * FROM wishlist_items LIMIT 1');
  console.log('[OK] Cart & Wishlist queries succeeded.');

  console.log('\n ALL LOCAL DATABASE QUERIES WORKING PERFECTLY!');
  process.exit(0);
}

testAll().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
