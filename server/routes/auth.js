const express = require('express');
const { registerUser, verifyOtp, resendOtp, loginUser, getUserProfile, firebaseLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);
router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, getUserProfile);

module.exports = router;
