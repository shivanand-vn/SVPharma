const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminExists = await Admin.findOne({ email: 'admin@svpharma.in' });
        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new Admin({
            username: 'SuperAdmin',
            email: 'admin@svpharma.in',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin created successfully');
        console.log('Email: admin@svpharma.in');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
