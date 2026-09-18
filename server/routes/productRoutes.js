const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET all products
router.get('/', productController.getAllProducts);

// GET featured products
router.get('/featured', productController.getFeaturedProducts);

// GET single product by ID or slug
router.get('/:id', productController.getProductById);

// Admin Routes
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, productController.createProduct);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;
