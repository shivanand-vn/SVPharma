const express = require('express');
const router = express.Router();
const { loginUser, registerAdmin, requestConnection, forgotUsername, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/register-admin', registerAdmin);
router.post('/request-connection', requestConnection);
router.post('/forgot-username', forgotUsername);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.put('/reset-password', resetPassword);

module.exports = router;
