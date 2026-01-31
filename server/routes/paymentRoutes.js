const express = require('express');
const router = express.Router();
const {
    submitPayment,
    reuploadProof,
    submitOfflinePayment,
    getMyPayments,
    getAllPayments,
    approvePayment,
    rejectPayment,
    getWallet
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Customer routes
console.log('Payment routes loaded');
router.post('/', protect, submitPayment);
router.get('/wallet', protect, getWallet);
router.get('/my', protect, getMyPayments);
router.put('/:id/reupload', protect, reuploadProof);

// Admin routes
router.post('/offline', protect, adminOnly, submitOfflinePayment);

// Admin routes
router.get('/admin', protect, adminOnly, getAllPayments);
router.put('/:id/approve', protect, adminOnly, approvePayment);
router.put('/:id/reject', protect, adminOnly, rejectPayment);

module.exports = router;
