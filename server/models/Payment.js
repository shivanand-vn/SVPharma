const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be greater than 0']
    },
    originalDueAmount: {
        type: Number
    },
    remainingDueAmount: {
        type: Number
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['ONLINE', 'CASH'],
        default: 'ONLINE'
    },
    transactionId: {
        type: String,
        trim: true
    },
    proofUrl: {
        type: String,
        required: function () { return this.paymentMethod === 'ONLINE'; }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    canReupload: {
        type: Boolean,
        default: false
    },
    adminComment: {
        type: String,
        trim: true
    },
    auditLogs: [
        {
            action: { type: String, required: true }, // 'created', 'approved', 'rejected'
            performedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'auditLogs.performerModel' },
            performerModel: { type: String, required: true, enum: ['Admin', 'Customer'] },
            timestamp: { type: Date, default: Date.now },
            details: { type: String }
        }
    ]
}, { timestamps: true });

// Optimize query performance
paymentSchema.index({ customer: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
