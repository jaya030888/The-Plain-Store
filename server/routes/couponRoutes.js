const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public/Customer
router.post('/validate', couponController.validateCoupon);

// Admin
router.get('/', protect, adminOnly, couponController.getAllCoupons);
router.post('/', protect, adminOnly, couponController.createCoupon);
router.put('/:id', protect, adminOnly, couponController.updateCoupon);
router.delete('/:id', protect, adminOnly, couponController.deleteCoupon);

module.exports = router;
