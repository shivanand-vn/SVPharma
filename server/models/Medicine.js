const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    mrp: {
        type: Number,
        required: true,
        min: 0
    },
    trp: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ["Ethical", "PCD", "Generic", "Other"]
    },
    type: {
        type: String,
        required: true,
        enum: [
            "Tablet", "Syrup", "Capsule", "Drops", "Pediatric Syrup",
            "Pediatric Drops & Suspentions", "Injection", "Soap",
            "Ointment/Cream", "Protein Powder", "Sachet", "Dental", "ENT"
        ]
    },
    packing: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date
    }
}, { timestamps: true });

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;
