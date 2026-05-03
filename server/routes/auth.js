const express = require('express');
const { registerUser, loginUser, getUserProfile, sendOtp, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getUserProfile);

module.exports = router;
