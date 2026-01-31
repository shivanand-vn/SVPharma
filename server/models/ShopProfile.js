const mongoose = require('mongoose');

const shopProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'My Pharma Shop'
    },
    address: {
        line1: { type: String, default: 'Shop Address Line 1' },
        line2: { type: String, default: '' },
        area: { type: String, default: '' },
        city: { type: String, default: 'City' },
        state: { type: String, default: 'State' },
        pincode: { type: String, default: '000000' },
        landmark: { type: String, default: '' }
    },
    phone: {
        type: String,
        required: true,
        default: '000-000-0000'
    },
    email: {
        type: String,
        required: true,
        default: 'admin@pharma.com'
    },
    logo: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const ShopProfile = mongoose.model('ShopProfile', shopProfileSchema);
module.exports = ShopProfile;
