const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, orderController.createOrder);
router.post('/create-razorpay-order', protect, orderController.createRazorpayOrder);
router.post('/verify-payment', protect, orderController.verifyPaymentAndCreateOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/my-orders/:id', protect, orderController.getMyOrderById);

// Public Track Route
router.get('/track/:id', orderController.trackOrder);

// Customer Return Route
router.post('/:id/return', protect, orderController.requestReturn);

// Admin Routes
router.get('/admin', protect, adminOnly, orderController.getAllOrders);
router.get('/admin/returns', protect, adminOnly, orderController.getAllReturns);
router.put('/admin/returns/:id/status', protect, adminOnly, orderController.updateReturnStatus);
router.get('/admin/:id', protect, adminOnly, orderController.getOrderDetails);
router.put('/admin/:id/status', protect, adminOnly, orderController.updateOrderStatus);

module.exports = router;
