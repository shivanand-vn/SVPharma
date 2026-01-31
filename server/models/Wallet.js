const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        unique: true
    },
    totalDue: {
        type: Number,
        required: true,
        default: 0
    },
    totalPaid: {
        type: Number,
        required: true,
        default: 0
    },
    pendingBalance: {
        type: Number,
        required: true,
        default: 0
    },
    walletBalance: {
        type: Number,
        required: true,
        default: 0
    },
    walletHistory: [
        {
            type: { type: String, enum: ['return_adjustment', 'payment', 'order_usage'], required: true },
            amount: { type: Number, required: true },
            reference: { type: String }, // e.g. orderId or paymentId
            balanceAfter: { type: Number, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

// Middleware to calculate pendingBalance before saving if needed,
// but usually handled by business logic updates.

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
