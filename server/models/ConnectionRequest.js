const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: {
        type: String,
        required: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
    },
    address: {
        shopName: String,
        line1: { type: String },
        line2: String,
        area: String,
        city: { type: String, required: true },
        district: String,
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        landmark: String
    },
    type: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: { type: String }
}, { timestamps: true });

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);
module.exports = ConnectionRequest;
