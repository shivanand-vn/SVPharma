const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Customer = require('../models/Customer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    const order = new Order({
        customer: req.user._id,
        items: orderItems,
        totalPrice,
        statusHistory: [{ status: 'pending' }]
    });

    const createdOrder = await order.save();

    // 1. Wallet Credit Logic (Keep for backward compatibility/loyalty)
    const wallet = await Wallet.findOne({ customer: req.user._id });
    if (wallet) {
        if (wallet.walletBalance > 0) {
            const walletUsed = Math.min(totalPrice, wallet.walletBalance);
            wallet.walletBalance -= walletUsed;
            wallet.totalPaid += walletUsed;

            // Store wallet usage in order
            createdOrder.walletAmountUsed = walletUsed;

            // Note: We do NOT update dueAmount here anymore. 
            // It will be updated when order is processed/accepted.

            wallet.walletHistory.push({
                type: 'order_usage',
                amount: walletUsed,
                reference: createdOrder._id.toString(),
                balanceAfter: wallet.walletBalance,
                createdAt: new Date()
            });

            if (walletUsed === totalPrice) {
                createdOrder.paymentStatus = 'paid';
            }
            // Save updated order with wallet info
            await createdOrder.save();
        }
        await wallet.save();
    }

    // Note: We do NOT increment customer.dueAmount here anymore.
    // It is deferred until admin approval.

    res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('customer', 'name email phone type');

    if (order) {
        // Check if admin or owner
        if (req.admin || order.customer._id.toString() === req.user._id.toString()) {
            res.json(order);
        } else {
            res.status(401);
            throw new Error('Not authorized to view this order');
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (Customer)
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('customer', 'id name type email phone').sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(404);
        throw new Error('Order not found');
    }

    // --- Sequential Status Logic ---
    const currentStatus = order.status;

    // Prevent multiple final states
    if (['delivered', 'cancelled'].includes(currentStatus)) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400);
        throw new Error('Order is already in a final state');
    }

    // --- Validate Transitions ---
    if (status === 'processing' && currentStatus !== 'pending') {
        res.status(400); throw new Error('Can only process from pending');
    }
    if (status === 'shipped' && currentStatus !== 'processing') {
        res.status(400); throw new Error('Can only ship from processing');
    }
    if (status === 'delivered' && currentStatus !== 'shipped') {
        res.status(400); throw new Error('Can only deliver from shipped');
    }
    if (status === 'cancelled' && currentStatus !== 'pending') {
        res.status(400); throw new Error('Can only cancel before processing');
    }

    // --- Handle Partial Order Approval (Modifications) ---
    if (status === 'processing' && req.body.modifiedItems) {
        let modifiedItems;
        try {
            modifiedItems = typeof req.body.modifiedItems === 'string'
                ? JSON.parse(req.body.modifiedItems)
                : req.body.modifiedItems;
        } catch (e) {
            res.status(400); throw new Error('Invalid modifiedItems format');
        }

        if (!Array.isArray(modifiedItems)) {
            res.status(400); throw new Error('modifiedItems must be an array');
        }

        if (!order.isAdminModified) {
            order.originalItems = order.items.map(item => ({
                medicine: item.medicine,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));
            order.originalTotalPrice = order.totalPrice;
            order.isAdminModified = true;
        }

        // Update items and recalculate
        order.items = modifiedItems;
        const newTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Update price but DO NOT adjust due amount yet. 
        // It will be handled in the status transition block below.
        order.totalPrice = newTotal;
    }

    // --- Update Due Amount on Acceptance (Pending -> Processing) ---
    if (status === 'processing' && currentStatus === 'pending') {
        const [wallet, customer] = await Promise.all([
            Wallet.findOne({ customer: order.customer }),
            Customer.findById(order.customer)
        ]);

        if (customer) {
            // Calculate final amount to add to due
            // Subtract any amount already paid via wallet
            const amountToAdd = Math.max(0, order.totalPrice - (order.walletAmountUsed || 0));

            customer.dueAmount = (customer.dueAmount || 0) + amountToAdd;
            await customer.save();

            if (wallet) {
                wallet.totalDue += amountToAdd;
                wallet.pendingBalance = customer.dueAmount;
                await wallet.save();
            }
        }
    }


    // --- Handle Specific Status Actions ---
    if (status === 'cancelled') {
        if (!cancellationReason) {
            res.status(400);
            throw new Error('Cancellation reason is required');
        }
        order.cancellationReason = cancellationReason;
    }

    if (status === 'delivered') {
        if (!req.file) {
            res.status(400);
            throw new Error('Delivery slip image is required for delivered status');
        }

        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            if (req.file) fs.unlinkSync(req.file.path);
            res.status(500);
            throw new Error('Cloudinary configuration is missing');
        }

        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'delivery_slips',
            });
            order.deliverySlipUrl = result.secure_url;
            fs.unlinkSync(req.file.path); // Cleanup local file
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            res.status(500);
            throw new Error('Image upload failed');
        }
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date() });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Get orders by customer ID
// @route   GET /api/orders/customer/:customerId
// @access  Private/Admin
const getOrdersByCustomer = asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.params.customerId })
        .populate('customer', 'id name type email phone')
        .sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Process order return
// @route   POST /api/orders/:id/return
// @access  Private/Admin
const processOrderReturn = asyncHandler(async (req, res) => {
    const { returnedItems } = req.body; // Array of { name, quantity, reason }
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.status !== 'delivered') {
        res.status(400);
        throw new Error('Returns can only be processed for delivered orders');
    }

    if (!returnedItems || !Array.isArray(returnedItems) || returnedItems.length === 0) {
        res.status(400);
        throw new Error('No items to return');
    }

    let totalReturnValue = 0;
    const returnLogs = [];

    // 1. Validate and Calculate
    for (const returnItem of returnedItems) {
        const orderItem = order.items.find(i => i.name === returnItem.name);
        if (!orderItem) {
            res.status(400);
            throw new Error(`Item ${returnItem.name} not found in order`);
        }

        const previouslyReturned = order.returns
            .filter(r => r.name === returnItem.name)
            .reduce((acc, r) => acc + r.quantity, 0);

        if (previouslyReturned + returnItem.quantity > orderItem.quantity) {
            res.status(400);
            throw new Error(`Return quantity for ${returnItem.name} exceeds delivered quantity`);
        }

        const itemValue = orderItem.price * returnItem.quantity;
        totalReturnValue += itemValue;

        returnLogs.push({
            medicine: orderItem.medicine,
            name: orderItem.name,
            quantity: returnItem.quantity,
            price: orderItem.price,
            reason: returnItem.reason || 'No reason provided',
            createdAt: new Date()
        });
    }

    // 2. Financial Adjustment
    const [wallet, customer] = await Promise.all([
        Wallet.findOne({ customer: order.customer }),
        Customer.findById(order.customer)
    ]);

    if (!wallet || !customer) {
        res.status(404);
        throw new Error('Customer or wallet data missing');
    }

    const pendingAmount = customer.dueAmount;
    let pendingReduced = 0;
    let walletCredited = 0;

    if (pendingAmount > 0) {
        if (totalReturnValue <= pendingAmount) {
            pendingReduced = totalReturnValue;
            customer.dueAmount = Math.max(0, (customer.dueAmount || 0) - totalReturnValue);
            wallet.totalDue -= totalReturnValue;
        } else {
            pendingReduced = pendingAmount;
            walletCredited = totalReturnValue - pendingAmount;
            customer.dueAmount = 0;
            wallet.totalDue -= pendingAmount;
            wallet.walletBalance += walletCredited;
        }
    } else {
        walletCredited = totalReturnValue;
        wallet.walletBalance += totalReturnValue;
    }

    wallet.pendingBalance = customer.dueAmount;
    await customer.save();

    // 3. Log Wallet History
    wallet.walletHistory.push({
        type: 'return_adjustment',
        amount: totalReturnValue,
        reference: order._id.toString(),
        balanceAfter: wallet.walletBalance,
        createdAt: new Date()
    });

    // 4. Update Order Returns
    for (const log of returnLogs) {
        order.returns.push(log);
    }

    await wallet.save();
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Return processed successfully',
        financialAdjustment: { pendingReduced, walletCredited }
    });
});

module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    getOrdersByCustomer,
    processOrderReturn
};
