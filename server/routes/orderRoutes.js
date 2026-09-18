const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, orderController.createOrder);
router.post('/create-razorpay-order', protect, orderController.createRazorpayOrder);
router.post('/verify-payment', protect, orderController.verifyPaymentAndCreateOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/my-orders/:id', protect, orderController.getMyOrderById);

// Admin Routes
router.get('/admin', adminOnly, orderController.getAllOrders);
router.get('/admin/:id', adminOnly, orderController.getOrderDetails);
router.put('/admin/:id/status', adminOnly, orderController.updateOrderStatus);

module.exports = router;
