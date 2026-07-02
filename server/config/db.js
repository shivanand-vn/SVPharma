const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'svpharma'
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Run GST migration for existing medicines
        const Medicine = require('../models/Medicine');
        await Medicine.updateMany({ gst: { $exists: false } }, { $set: { gst: 0 } });
        console.log('Database Migration: Set GST to 0 for any existing medicines without it.');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
