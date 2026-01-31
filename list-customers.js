const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

const Customer = require('./server/models/Customer');

async function checkCustomers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const customers = await Customer.find({}).limit(5);
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

checkCustomers();
