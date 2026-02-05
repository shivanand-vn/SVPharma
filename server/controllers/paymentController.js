const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
// sendPaymentStatusEmail import removed as per strict email control rules
const Customer = require('../models/Customer');
const Wallet = require('../models/Wallet');
const SiteSettings = require('../models/SiteSettings');

// @desc    Submit a manual payment
// @route   POST /api/payments
// @access  Private (Customer)
const submitPayment = asyncHandler(async (req, res) => {
    const { amount, transactionId, proofUrl } = req.body;

    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('Valid amount is required');
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    if (amount > customer.dueAmount) {
        res.status(400);
        throw new Error(`Entered amount (₹${amount}) exceeds your total due balance (₹${customer.dueAmount})`);
    }

    if (!proofUrl) {
        res.status(400);
        throw new Error('Payment proof is required');
    }

    const payment = await Payment.create({
        customer: req.user._id,
        amount,
        transactionId,
        proofUrl,
        paymentMethod: 'ONLINE',
        status: 'pending',
        auditLogs: [{
            action: 'created',
            performerModel: 'Customer',
            performedBy: req.user._id,
            details: `Payment request of ₹${amount} submitted`
        }]
    });

    res.status(201).json(payment);
});

// @desc    Re-upload proof for rejected payment
// @route   PUT /api/payments/:id/reupload
// @access  Private (Customer)
const reuploadProof = asyncHandler(async (req, res) => {
    const { proofUrl, transactionId } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    if (payment.status !== 'rejected') {
        res.status(400);
        throw new Error('Only rejected payments can be re-uploaded');
    }

    payment.proofUrl = proofUrl || payment.proofUrl;
    payment.transactionId = transactionId || payment.transactionId;
    payment.status = 'pending';
    payment.rejectionReason = undefined;
    payment.canReupload = false;

    payment.auditLogs.push({
        action: 'reuploaded',
        performerModel: 'Customer',
        performedBy: req.user._id,
        details: 'Proof re-uploaded, status reset to pending'
    });

    await payment.save();
    res.json(payment);
});

// @desc    Get my payments
// @route   GET /api/payments/my
// @access  Private (Customer)
const getMyPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ customer: req.user._id })
        .sort({ createdAt: -1 });
    res.json(payments);
});

// @desc    Get customer due amount (Wallet)
// @route   GET /api/payments/wallet
// @access  Private (Customer)
const getWallet = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.user._id).select('dueAmount');

    // We still return a wallet-like object for frontend compatibility or fetch/create wallet record
    let wallet = await Wallet.findOne({ customer: req.user._id });
    if (!wallet) {
        wallet = await Wallet.create({ customer: req.user._id });
    }

    // Sync
    wallet.pendingBalance = customer.dueAmount;
    res.json(wallet);
});

// @desc    Get all payments (Admin)
// @route   GET /api/payments/admin
// @access  Private (Admin)
const getAllPayments = asyncHandler(async (req, res) => {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
        .populate('customer', 'name email phone username dueAmount')
        .sort({ createdAt: -1 });

    res.json(payments);
});

// @desc    Submit offline payment (Admin)
// @route   POST /api/payments/offline
// @access  Private (Admin)
const submitOfflinePayment = asyncHandler(async (req, res) => {
    const { customerId, amount } = req.body;

    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('Valid amount is required');
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    if (amount > customer.dueAmount) {
        res.status(400);
        throw new Error(`Entered amount (₹${amount}) exceeds customer's due balance (₹${customer.dueAmount})`);
    }

    const originalDue = customer.dueAmount;

    // Create Payment Record (Auto-Approved)
    const payment = await Payment.create({
        customer: customerId,
        amount,
        paymentMethod: 'CASH',
        status: 'approved',
        proofUrl: 'offline_payment',
        originalDueAmount: originalDue,
        remainingDueAmount: originalDue - amount,
        auditLogs: [{
            action: 'created_offline',
            performerModel: 'Admin',
            performedBy: req.admin._id,
            details: `Offline cash payment of ₹${amount} recorded by admin`
        }]
    });

    // 1. Reduce Customer Due Amount
    customer.dueAmount = Math.max(0, (customer.dueAmount || 0) - amount);
    await customer.save();

    // 2. Sync Wallet & History
    const wallet = await Wallet.findOne({ customer: customerId });
    if (wallet) {
        wallet.pendingBalance = customer.dueAmount;
        wallet.totalPaid += amount;
        wallet.walletHistory.push({
            type: 'payment',
            amount,
            reference: `Cash Payment ID: ${payment._id}`,
            balanceAfter: wallet.pendingBalance
        });
        await wallet.save();
    }

    res.status(201).json(payment);
});

// @desc    Approve a payment
// @route   PUT /api/payments/:id/approve
// @access  Private (Admin)
const approvePayment = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    if (payment.status !== 'pending') {
        res.status(400);
        throw new Error(`Payment is already ${payment.status}`);
    }

    const customer = await Customer.findById(payment.customer);
    if (!customer) {
        res.status(404);
        throw new Error('Customer associated with this payment not found');
    }

    const originalDue = customer.dueAmount;

    // 1. Update Payment
    payment.status = 'approved';
    payment.originalDueAmount = originalDue;
    payment.remainingDueAmount = Math.max(0, originalDue - payment.amount);
    payment.auditLogs.push({
        action: 'approved',
        performerModel: 'Admin',
        performedBy: req.admin._id,
        details: 'Payment approved by admin'
    });
    await payment.save();

    // 2. Update Customer Balance
    customer.dueAmount = Math.max(0, (customer.dueAmount || 0) - payment.amount);
    await customer.save();

    // 3. Sync Wallet
    const wallet = await Wallet.findOne({ customer: customer._id });
    if (wallet) {
        wallet.pendingBalance = customer.dueAmount;
        wallet.totalPaid += payment.amount;
        wallet.walletHistory.push({
            type: 'payment',
            amount: payment.amount,
            reference: `Payment ID: ${payment._id}`,
            balanceAfter: wallet.pendingBalance
        });
        await wallet.save();
    }

    // Email sending removed as per strict email control rules

    res.json({ message: 'Payment approved', payment });
});

// @desc    Reject a payment
// @route   PUT /api/payments/:id/reject
// @access  Private (Admin)
const rejectPayment = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        res.status(400);
        throw new Error('Rejection reason is required');
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    if (payment.status !== 'pending') {
        res.status(400);
        throw new Error(`Payment is already ${payment.status}`);
    }

    payment.status = 'rejected';
    payment.rejectionReason = reason;
    payment.canReupload = true;
    payment.auditLogs.push({
        action: 'rejected',
        performerModel: 'Admin',
        performedBy: req.admin._id,
        details: `Rejected: ${reason}`
    });

    await payment.save();

    // Email sending removed as per strict email control rules

    res.json({ message: 'Payment rejected', payment });
});

module.exports = {
    submitPayment,
    reuploadProof,
    submitOfflinePayment,
    getMyPayments,
    getAllPayments,
    approvePayment,
    rejectPayment,
    getWallet
};
