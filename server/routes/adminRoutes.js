const express = require('express');
const router = express.Router();
const {
    getShopProfile,
    updateShopProfile,
    getConnectionRequests,
    updateConnectionRequestStatus,
    getAllCustomers,
    requestCustomerDeleteOTP,
    verifyOTPAndDeleteCustomer,
    getDashboardAnalytics,
    addCustomer
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/shop-profile')
    .get(protect, adminOnly, getShopProfile)
    .put(protect, adminOnly, updateShopProfile);

router.route('/connection-requests')
    .get(protect, adminOnly, getConnectionRequests);

router.route('/connection-requests/:id')
    .put(protect, adminOnly, updateConnectionRequestStatus);

router.route('/customers')
    .get(protect, adminOnly, getAllCustomers)
    .post(protect, adminOnly, addCustomer);

router.route('/customers/:id/request-delete-otp')
    .post(protect, adminOnly, requestCustomerDeleteOTP);

router.route('/customers/:id/verify-delete-otp')
    .post(protect, adminOnly, verifyOTPAndDeleteCustomer);

router.route('/analytics')
    .get(protect, adminOnly, getDashboardAnalytics);

module.exports = router;
