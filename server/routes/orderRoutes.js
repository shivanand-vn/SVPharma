const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    getOrdersByCustomer,
    processOrderReturn
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, adminOnly, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/status').put(protect, adminOnly, upload.single('deliverySlip'), updateOrderStatus);

router.route('/:id/return').post(protect, adminOnly, processOrderReturn);
router.route('/customer/:customerId').get(protect, adminOnly, getOrdersByCustomer);

module.exports = router;
