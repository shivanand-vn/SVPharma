const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config({ path: 'server/.env' });

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const admins = db.collection('admins');

        const developerUsername = 'Shivanand_VN';
        const developerPassword = 'Shivu@788197';
        const developerEmail = 'shivu.naganur@example.com';

        const existingDev = await admins.findOne({ username: developerUsername });

        if (existingDev) {
            console.log(`Developer ${developerUsername} already exists.`);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(developerPassword, salt);

            await admins.insertOne({
                username: developerUsername,
                password: hashedPassword,
                email: developerEmail,
                role: 'developer',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`Developer ${developerUsername} created successfully.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seed();
