const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
    },
    email: {
        type: String,
        required: true,
        unique: true
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
    type: {
        type: String, // e.g., 'Retailer', 'Hospital', 'Individual'
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    termsAcceptedAt: {
        type: Date
    }
}, { timestamps: true });


// Modern Mongoose middleware - no need for next() callback
customerSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

customerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
