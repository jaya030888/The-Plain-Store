const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateQuantity);
router.delete('/remove/:id', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;
