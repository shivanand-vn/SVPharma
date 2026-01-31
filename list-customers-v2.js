const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function listCustomers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const customers = await mongoose.connection.db.collection('customers').find({}).limit(5).toArray();
        console.log('Customers found:', customers.map(c => ({
            id: c._id,
            name: c.name,
            username: c.username,
            dueAmount: c.dueAmount
        })));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listCustomers();
