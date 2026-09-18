const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

// Customer Routes
router.post('/create-razorpay-order', orderController.createRazorpayOrder);
router.post('/verify-payment', orderController.verifyPaymentAndCreateOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/my-orders/:id', orderController.getMyOrderById);

// Admin Routes
router.get('/admin', adminOnly, orderController.getAllOrders);
router.get('/admin/:id', adminOnly, orderController.getOrderDetails);
router.put('/admin/:id/status', adminOnly, orderController.updateOrderStatus);

module.exports = router;
