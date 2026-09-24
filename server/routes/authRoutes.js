const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, verifyToken, verifyAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/verify-token', protect, verifyToken);
router.get('/verify-admin', protect, verifyAdmin);

module.exports = router;
