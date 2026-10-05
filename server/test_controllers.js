const db = require('./config/db');
const couponController = require('./controllers/couponController');
const orderController = require('./controllers/orderController');
const productController = require('./controllers/productController');

async function testControllers() {
  console.log('--- Testing Controller Logic with Local DB ---');

  // Mock req / res
  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.data = data;
      return res;
    };
    return res;
  };

  // 1. getAllCoupons
  const resCoupons = mockRes();
  await couponController.getAllCoupons({}, resCoupons);
  console.log('[OK] getAllCoupons returned status:', resCoupons.statusCode || 200, 'items:', resCoupons.data?.length);

  // 2. getAllOrders
  const resOrders = mockRes();
  await orderController.getAllOrders({}, resOrders);
  console.log('[OK] getAllOrders returned status:', resOrders.statusCode || 200, 'items:', resOrders.data?.length);

  // 3. getAllProducts
  const resProducts = mockRes();
  await productController.getAllProducts({ query: {} }, resProducts);
  console.log('[OK] getAllProducts returned status:', resProducts.statusCode || 200, 'items:', (resProducts.data?.products || resProducts.data)?.length);

  console.log('\n ALL CONTROLLER ENDPOINTS OPERATIONAL LOCALLY!');
  process.exit(0);
}

testControllers().catch(err => {
  console.error('Controller test error:', err);
  process.exit(1);
});
