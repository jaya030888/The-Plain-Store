const db = require('./config/db');

async function comprehensiveAudit() {
  console.log('==============================================');
  console.log('       FULL LOCAL BACKEND & DB AUDIT          ');
  console.log('==============================================\n');

  const BASE_URL = 'http://localhost:5000/api';
  let hasErrors = false;

  // 1. Health check
  try {
    const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
    console.log('[PASS] Health Check:', health);
  } catch (err) {
    console.error('[FAIL] Health Check:', err.message);
    hasErrors = true;
  }

  // 2. Auth: Admin Login
  let adminToken = '';
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@theplainstore.com', password: 'admin123' })
    }).then(r => r.json());
    if (res.token) {
      adminToken = res.token;
      console.log('[PASS] Admin Login (token received)');
    } else {
      throw new Error(res.message || 'No token in response');
    }
  } catch (err) {
    console.error('[FAIL] Admin Login:', err.message);
    hasErrors = true;
  }

  // 3. Auth: Customer Login
  let custToken = '';
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@example.com', password: 'customer123' })
    }).then(r => r.json());
    if (res.token) {
      custToken = res.token;
      console.log('[PASS] Customer Login (token received)');
    } else {
      throw new Error(res.message || 'No token in response');
    }
  } catch (err) {
    console.error('[FAIL] Customer Login:', err.message);
    hasErrors = true;
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const custHeaders = { Authorization: `Bearer ${custToken}` };

  // 4. Products API
  try {
    const prods = await fetch(`${BASE_URL}/products`).then(r => r.json());
    const list = prods.products || prods;
    console.log(`[PASS] Products API: ${list.length} products loaded`);
  } catch (err) {
    console.error('[FAIL] Products API:', err.message);
    hasErrors = true;
  }

  // 5. Categories API
  try {
    const cats = await fetch(`${BASE_URL}/categories`).then(r => r.json());
    console.log(`[PASS] Categories API: ${cats.length} categories loaded`);
  } catch (err) {
    console.error('[FAIL] Categories API:', err.message);
    hasErrors = true;
  }

  // 6. Admin Dashboard Stats
  try {
    const dash = await fetch(`${BASE_URL}/admin/dashboard`, { headers: adminHeaders }).then(r => r.json());
    console.log('[PASS] Admin Dashboard Stats:', dash);
  } catch (err) {
    console.error('[FAIL] Admin Dashboard Stats:', err.message);
    hasErrors = true;
  }

  // 7. Admin Orders API
  try {
    const orders = await fetch(`${BASE_URL}/orders/admin`, { headers: adminHeaders }).then(r => r.json());
    console.log(`[PASS] Admin Orders API: ${orders.length} orders loaded`);
  } catch (err) {
    console.error('[FAIL] Admin Orders API:', err.message);
    hasErrors = true;
  }

  // 8. Admin Returns API
  try {
    const returns = await fetch(`${BASE_URL}/orders/admin/returns`, { headers: adminHeaders }).then(r => r.json());
    console.log(`[PASS] Admin Returns API: ${returns.length} returns loaded`);
  } catch (err) {
    console.error('[FAIL] Admin Returns API:', err.message);
    hasErrors = true;
  }

  // 9. Admin Customers API
  try {
    const custs = await fetch(`${BASE_URL}/customers/admin`, { headers: adminHeaders }).then(r => r.json());
    console.log(`[PASS] Admin Customers API: ${(custs.customers || custs).length} customers loaded`);
  } catch (err) {
    console.error('[FAIL] Admin Customers API:', err.message);
    hasErrors = true;
  }

  // 10. Admin Notifications API
  try {
    const notifs = await fetch(`${BASE_URL}/admin/notifications`, { headers: adminHeaders }).then(r => r.json());
    console.log(`[PASS] Admin Notifications API: ${notifs.notifications?.length} notifications`);
  } catch (err) {
    console.error('[FAIL] Admin Notifications API:', err.message);
    hasErrors = true;
  }

  // 11. Coupons API
  try {
    const coupons = await fetch(`${BASE_URL}/coupons`, { headers: adminHeaders }).then(r => r.json());
    console.log(`[PASS] Coupons API: ${coupons.length} coupons loaded`);
  } catch (err) {
    console.error('[FAIL] Coupons API:', err.message);
    hasErrors = true;
  }

  // 12. Customer Cart API
  try {
    const cart = await fetch(`${BASE_URL}/cart`, { headers: custHeaders }).then(r => r.json());
    console.log(`[PASS] Customer Cart API: ${cart.length} items`);
  } catch (err) {
    console.error('[FAIL] Customer Cart API:', err.message);
    hasErrors = true;
  }

  // 13. Customer Wishlist API
  try {
    const wish = await fetch(`${BASE_URL}/wishlist`, { headers: custHeaders }).then(r => r.json());
    console.log(`[PASS] Customer Wishlist API: ${wish.length} items`);
  } catch (err) {
    console.error('[FAIL] Customer Wishlist API:', err.message);
    hasErrors = true;
  }

  // 14. Customer Addresses API
  try {
    const addrs = await fetch(`${BASE_URL}/addresses`, { headers: custHeaders }).then(r => r.json());
    console.log(`[PASS] Customer Addresses API: ${addrs.length} addresses`);
  } catch (err) {
    console.error('[FAIL] Customer Addresses API:', err.message);
    hasErrors = true;
  }

  console.log('\n==============================================');
  if (hasErrors) {
    console.log('   AUDIT COMPLETED WITH ISSUES TO FIX');
  } else {
    console.log('   ALL 14 AUDIT CHECKS PASSED PERFECTLY!');
  }
  console.log('==============================================');
  process.exit(hasErrors ? 1 : 0);
}

comprehensiveAudit();
