const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    items: [
        {
            medicine: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Medicine',
                required: true
            },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            image: { type: String }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    walletAmountUsed: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    cancellationReason: {
        type: String
    },
    deliverySlipUrl: {
        type: String
    },
    statusHistory: [
        {
            status: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    originalItems: [
        {
            medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
            name: { type: String },
            quantity: { type: Number },
            price: { type: Number }
        }
    ],
    originalTotalPrice: {
        type: Number
    },
    isAdminModified: {
        type: Boolean,
        default: false
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    returns: [
        {
            medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
            name: { type: String },
            quantity: { type: Number },
            price: { type: Number },
            reason: { type: String },
            financialAdjustment: {
                pendingReduced: { type: Number, default: 0 },
                walletCredited: { type: Number, default: 0 }
            },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
