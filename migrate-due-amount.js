const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('customers').updateMany(
            { dueAmount: { $exists: false } },
            { $set: { dueAmount: 0 } }
        );

        console.log(`Updated ${result.modifiedCount} customers.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

migrate();
