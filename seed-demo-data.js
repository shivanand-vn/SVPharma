const mongoose = require('./server/node_modules/mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: 'server/.env' });

const connectDB = require('./server/config/db');

// Load models
const Customer = require('./server/models/Customer');
const Medicine = require('./server/models/Medicine');
const Order = require('./server/models/Order');
const Payment = require('./server/models/Payment');
const Wallet = require('./server/models/Wallet');
const ConnectionRequest = require('./server/models/ConnectionRequest');
const Admin = require('./server/models/Admin');

// Helper to generate items for an order to match a target price exactly using available medicines
function generateOrderItems(medicines, targetPrice) {
    // Select 1 to 3 random medicines
    const numItems = Math.min(medicines.length, Math.floor(Math.random() * 3) + 1);
    const selected = [];
    const tempMedicines = [...medicines];
    for (let i = 0; i < numItems; i++) {
        const idx = Math.floor(Math.random() * tempMedicines.length);
        selected.push(tempMedicines.splice(idx, 1)[0]);
    }

    const items = [];
    let remaining = targetPrice;

    for (let i = 0; i < selected.length; i++) {
        const med = selected[i];
        if (i === selected.length - 1) {
            // Last item gets the remaining amount
            const qty = Math.max(1, Math.floor(Math.random() * 5) + 1);
            const price = Math.round((remaining / qty) * 100) / 100;
            items.push({
                medicine: med._id,
                name: med.name,
                quantity: qty,
                price: price,
                image: med.imageUrl || ''
            });
        } else {
            // Allocate a portion of the remaining price
            // Ensure at least 50 is left for subsequent items
            const minLeft = (selected.length - 1 - i) * 50;
            const maxAlloc = remaining - minLeft;
            const alloc = Math.max(50, Math.floor(Math.random() * (maxAlloc - 50)) + 50);
            const qty = Math.max(1, Math.floor(Math.random() * 5) + 1);
            const price = Math.round((alloc / qty) * 100) / 100;
            items.push({
                medicine: med._id,
                name: med.name,
                quantity: qty,
                price: price,
                image: med.imageUrl || ''
            });
            remaining -= (price * qty);
        }
    }

    // Verify and adjust for any small rounding error
    let sum = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    if (Math.abs(sum - targetPrice) > 0.01) {
        const last = items[items.length - 1];
        const diff = targetPrice - sum;
        last.price = Math.round((last.price + diff / last.quantity) * 100) / 100;
    }

    return items;
}

// Generate a status history array for orders based on their status and date
function generateStatusHistory(status, orderDate) {
    const history = [{ status: 'pending', timestamp: orderDate }];
    
    if (status === 'pending') return history;
    
    // Add processing status after 1 day
    const processingDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
    history.push({ status: 'processing', timestamp: processingDate });
    if (status === 'processing') return history;

    // Add shipped status after 2 days
    const shippedDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    history.push({ status: 'shipped', timestamp: shippedDate });
    if (status === 'shipped') return history;

    // Add delivered status after 3 days
    const deliveredDate = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    history.push({ status: 'delivered', timestamp: deliveredDate });
    if (status === 'delivered') return history;

    // Add cancelled status (e.g. 6 hours after pending)
    if (status === 'cancelled') {
        const cancelledDate = new Date(orderDate.getTime() + 6 * 60 * 60 * 1000);
        history.push({ status: 'cancelled', timestamp: cancelledDate });
    }
    return history;
}

async function seed() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'svpharma' });
        console.log('Connected.');

        // Get admin user for audit log referencing
        let adminUser = await Admin.findOne({ role: 'admin' });
        if (!adminUser) {
            adminUser = await Admin.findOne({});
        }
        const adminId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
        console.log(`Using Admin ID: ${adminId} for auditing.`);

        // Fetch medicines
        const medicines = await Medicine.find({});
        if (medicines.length === 0) {
            console.error('No medicines found. Please run the medicine seed script first.');
            process.exit(1);
        }
        console.log(`Fetched ${medicines.length} medicines.`);

        // Clear existing collections
        await Order.deleteMany({});
        await Payment.deleteMany({});
        await Wallet.deleteMany({});
        await Customer.deleteMany({});
        await ConnectionRequest.deleteMany({});
        console.log('Cleared existing Orders, Payments, Wallets, Customers, and ConnectionRequests.');

        // Define Customer Data
        const customersData = [
            // Shivu Naganur (Index 0) - Special Demo Customer
            {
                name: 'Shivu Naganur',
                email: 'demo788197@gmail.com',
                phone: '9197682353',
                type: 'Doctor',
                username: 'shivu_naganur',
                password: 'password123',
                address: {
                    shopName: 'Shivu Naganur Clinic',
                    line1: '12th Main Road, Sector 3',
                    line2: 'Near Central Park',
                    area: 'HSR Layout',
                    city: 'Bangalore',
                    district: 'Bangalore Urban',
                    state: 'Karnataka',
                    pincode: '560102',
                    landmark: 'Central Library'
                },
                status: 'approved',
                dateOffsetDays: 30
            },
            // Doctors
            {
                name: 'Dr. Rajesh Sharma',
                email: 'rajesh.sharma.clinic@gmail.com',
                phone: '9876543210',
                type: 'Doctor',
                username: 'dr_rajesh',
                password: 'password123',
                address: {
                    shopName: 'Sharma Health Clinic',
                    line1: 'A-201, Green Heights',
                    line2: 'Link Road',
                    area: 'Andheri West',
                    city: 'Mumbai',
                    district: 'Mumbai Suburb',
                    state: 'Maharashtra',
                    pincode: '400053',
                    landmark: 'Near Metro Station'
                },
                status: 'approved',
                dateOffsetDays: 28
            },
            {
                name: 'Dr. Priya Patil',
                email: 'priya.patil.health@gmail.com',
                phone: '9876543211',
                type: 'Doctor',
                username: 'dr_priya',
                password: 'password123',
                address: {
                    shopName: 'Patil Women and Child Care',
                    line1: 'Shop No. 12, Sunrise Plaza',
                    line2: 'Shivaji Road',
                    area: 'Deccan',
                    city: 'Pune',
                    district: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411004',
                    landmark: 'Opposite Cafe Goodluck'
                },
                status: 'approved',
                dateOffsetDays: 26
            },
            {
                name: 'Dr. Vivek Reddy',
                email: 'vivek.reddy.med@gmail.com',
                phone: '9876543212',
                type: 'Doctor',
                username: 'dr_vivek',
                password: 'password123',
                address: {
                    shopName: 'Reddy Multi-Specialty Clinic',
                    line1: 'Flat 405, Sapphire Block',
                    line2: 'Madhapur Main Road',
                    area: 'HITEC City',
                    city: 'Hyderabad',
                    district: 'Hyderabad',
                    state: 'Telangana',
                    pincode: '500081',
                    landmark: 'Beside Cyber Towers'
                },
                status: 'approved',
                dateOffsetDays: 24
            },
            {
                name: 'Dr. Sneha Deshmukh',
                email: 'sneha.deshmukh.care@gmail.com',
                phone: '9876543213',
                type: 'Doctor',
                username: 'dr_sneha',
                password: 'password123',
                address: {
                    shopName: 'Deshmukh Clinic',
                    line1: 'Plot 45, Sector 15',
                    line2: 'Near CIDCO Office',
                    area: 'CBD Belapur',
                    city: 'Navi Mumbai',
                    district: 'Thane',
                    state: 'Maharashtra',
                    pincode: '400614',
                    landmark: 'Near Station'
                },
                status: 'approved',
                dateOffsetDays: 22
            },
            {
                name: 'Dr. Anil Kulkarni',
                email: 'anil.kulkarni.rx@gmail.com',
                phone: '9876543214',
                type: 'Doctor',
                username: 'dr_anil',
                password: 'password123',
                address: {
                    shopName: 'Kulkarni Heart Care',
                    line1: '14/B, Sahakar Nagar',
                    line2: 'Parvati',
                    area: 'Sahakar Nagar',
                    city: 'Pune',
                    district: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411009',
                    landmark: 'Near Taljai Hills'
                },
                status: 'approved',
                dateOffsetDays: 20
            },
            // Medical Stores
            {
                name: 'Sai Medical Stores',
                email: 'saimedicals@gmail.com',
                phone: '9876543215',
                type: 'Medical',
                username: 'sai_medicals',
                password: 'password123',
                address: {
                    shopName: 'Sai Medical Stores',
                    line1: 'Shop No. 2, Mahatma Gandhi Rd',
                    line2: 'Near SBI Bank',
                    area: 'Mulund West',
                    city: 'Mumbai',
                    district: 'Mumbai Suburb',
                    state: 'Maharashtra',
                    pincode: '400080',
                    landmark: 'Opposite Railway Station'
                },
                status: 'approved',
                dateOffsetDays: 18
            },
            {
                name: 'Shree Medical & General Stores',
                email: 'shreemedicalstores@gmail.com',
                phone: '9876543216',
                type: 'Medical',
                username: 'shree_medicals',
                password: 'password123',
                address: {
                    shopName: 'Shree Medical & General Stores',
                    line1: 'Shop No. 8, Golden Arc',
                    line2: 'FC Road',
                    area: 'Shivajinagar',
                    city: 'Pune',
                    district: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411005',
                    landmark: 'Near Fergusson College'
                },
                status: 'approved',
                dateOffsetDays: 17
            },
            {
                name: 'Lakshmi Medicals',
                email: 'lakshmimedicals@gmail.com',
                phone: '9876543217',
                type: 'Medical',
                username: 'lakshmi_medicals',
                password: 'password123',
                address: {
                    shopName: 'Lakshmi Medicals',
                    line1: 'Building 45, 1st Cross',
                    line2: 'Wilson Garden',
                    area: 'Wilson Garden',
                    city: 'Bangalore',
                    district: 'Bangalore Urban',
                    state: 'Karnataka',
                    pincode: '560027',
                    landmark: 'Near Lakkasandra Bus Stop'
                },
                status: 'approved',
                dateOffsetDays: 16
            },
            {
                name: 'Shree Guru Krupa Medical',
                email: 'apollomedicalagency@gmail.com',
                phone: '9876543218',
                type: 'Medical',
                username: 'shree_guru_krupa',
                password: 'password123',
                address: {
                    shopName: 'Shree Guru Krupa Medical',
                    line1: 'Plot 78, Phase 2',
                    line2: 'Gachibowli Road',
                    area: 'Gachibowli',
                    city: 'Hyderabad',
                    district: 'Rangareddy',
                    state: 'Telangana',
                    pincode: '500032',
                    landmark: 'Near IIIT Junction'
                },
                status: 'approved',
                dateOffsetDays: 15
            },
            {
                name: 'HealthCare Pharma Distributors',
                email: 'healthcarepharmadist@gmail.com',
                phone: '9876543219',
                type: 'Medical',
                username: 'healthcare_pharma',
                password: 'password123',
                address: {
                    shopName: 'HealthCare Pharma Store',
                    line1: 'Plot No. 11, Industrial Area',
                    line2: 'Phase 1',
                    area: 'Yelahanka',
                    city: 'Bangalore',
                    district: 'Bangalore Urban',
                    state: 'Karnataka',
                    pincode: '560064',
                    landmark: 'Near Police Station'
                },
                status: 'approved',
                dateOffsetDays: 15
            }
        ];

        // Save Customers
        const createdCustomers = [];
        for (const data of customersData) {
            const customer = new Customer(data);
            await customer.save();
            const pastDate = new Date(Date.now() - data.dateOffsetDays * 24 * 60 * 60 * 1000);
            
            // Bypass Mongoose timestamps for historical look
            await mongoose.connection.db.collection('customers').updateOne(
                { _id: customer._id },
                { $set: { createdAt: pastDate, updatedAt: pastDate } }
            );
            
            createdCustomers.push(customer);
        }
        console.log(`Created ${createdCustomers.length} customers.`);

        // Define Order Plans
        const orderPlans = [
            // Shivu Naganur (Index 0) - exactly 3 orders (completed, completed, processing)
            { customerIndex: 0, targetPrice: 2450, status: 'delivered', dateOffsetDays: 12 },
            { customerIndex: 0, targetPrice: 1780, status: 'delivered', dateOffsetDays: 6 },
            { customerIndex: 0, targetPrice: 975, status: 'processing', dateOffsetDays: 2 },

            // Dr. Rajesh Sharma (Index 1) - 2 orders (completed, shipped)
            { customerIndex: 1, targetPrice: 3200, status: 'delivered', dateOffsetDays: 18 },
            { customerIndex: 1, targetPrice: 1800, status: 'shipped', dateOffsetDays: 4 },

            // Dr. Priya Patil (Index 2) - 2 orders (completed, completed)
            { customerIndex: 2, targetPrice: 2200, status: 'delivered', dateOffsetDays: 22 },
            { customerIndex: 2, targetPrice: 1500, status: 'delivered', dateOffsetDays: 10 },

            // Dr. Vivek Reddy (Index 3) - 2 orders (completed, processing)
            { customerIndex: 3, targetPrice: 4500, status: 'delivered', dateOffsetDays: 15 },
            { customerIndex: 3, targetPrice: 2500, status: 'processing', dateOffsetDays: 3 },

            // Dr. Sneha Deshmukh (Index 4) - 2 orders (completed, processing)
            { customerIndex: 4, targetPrice: 3800, status: 'delivered', dateOffsetDays: 14 },
            { customerIndex: 4, targetPrice: 1900, status: 'processing', dateOffsetDays: 2 },

            // Dr. Anil Kulkarni (Index 5) - 2 orders (completed, processing)
            { customerIndex: 5, targetPrice: 11200, status: 'delivered', dateOffsetDays: 25 },
            { customerIndex: 5, targetPrice: 3800, status: 'processing', dateOffsetDays: 1 },

            // Sai Medical Stores (Index 6) - 2 orders (completed, shipped)
            { customerIndex: 6, targetPrice: 5600, status: 'delivered', dateOffsetDays: 20 },
            { customerIndex: 6, targetPrice: 2400, status: 'shipped', dateOffsetDays: 5 },

            // Shree Medical & General Stores (Index 7) - 2 orders (completed, processing)
            // Adjusted order 2 to 12 days ago to keep runningDue > payment on day 10
            { customerIndex: 7, targetPrice: 3500, status: 'delivered', dateOffsetDays: 16 },
            { customerIndex: 7, targetPrice: 1800, status: 'processing', dateOffsetDays: 12 },

            // Lakshmi Medicals (Index 8) - 2 orders (completed, processing)
            { customerIndex: 8, targetPrice: 6000, status: 'delivered', dateOffsetDays: 11 },
            { customerIndex: 8, targetPrice: 1500, status: 'processing', dateOffsetDays: 1 },

            // Apollo Medical Agencies (Index 9) - 2 orders (completed, shipped)
            // Adjusted order 2 to 15 days ago to keep runningDue > payment on day 12
            { customerIndex: 9, targetPrice: 9500, status: 'delivered', dateOffsetDays: 21 },
            { customerIndex: 9, targetPrice: 3500, status: 'shipped', dateOffsetDays: 15 },

            // HealthCare Pharma Distributors (Index 10) - 4 orders (1 completed, 2 pending, 1 cancelled)
            { customerIndex: 10, targetPrice: 1200, status: 'delivered', dateOffsetDays: 14 },
            { customerIndex: 10, targetPrice: 800, status: 'pending', dateOffsetDays: 2 },
            { customerIndex: 10, targetPrice: 950, status: 'pending', dateOffsetDays: 1 },
            { customerIndex: 10, targetPrice: 1500, status: 'cancelled', dateOffsetDays: 8 }
        ];

        // Construct Orders
        const createdOrders = [];
        for (let i = 0; i < orderPlans.length; i++) {
            const plan = orderPlans[i];
            const customer = createdCustomers[plan.customerIndex];
            const orderDate = new Date(Date.now() - plan.dateOffsetDays * 24 * 60 * 60 * 1000);
            
            const items = generateOrderItems(medicines, plan.targetPrice);
            
            const orderObj = new Order({
                customer: customer._id,
                items: items,
                totalPrice: plan.targetPrice,
                status: plan.status,
                paymentStatus: plan.status === 'delivered' ? 'paid' : 'pending',
                statusHistory: generateStatusHistory(plan.status, orderDate),
                cancellationReason: plan.status === 'cancelled' ? 'Incorrect item quantities ordered' : undefined,
                deliverySlipUrl: plan.status === 'delivered' ? 'https://res.cloudinary.com/dpzsihgk4/image/upload/v1700000000/delivery_slips/sample.jpg' : undefined
            });

            // Simulate Admin Modification on 5 orders
            if (i === 3 || i === 7 || i === 11 || i === 15 || i === 19) {
                orderObj.isAdminModified = true;
                orderObj.originalTotalPrice = plan.targetPrice + 350;
                orderObj.originalItems = items.map((it, idx) => {
                    if (idx === 0) {
                        return {
                            medicine: it.medicine,
                            name: it.name,
                            quantity: it.quantity + 2,
                            price: it.price
                        };
                    }
                    return {
                        medicine: it.medicine,
                        name: it.name,
                        quantity: it.quantity,
                        price: it.price
                    };
                });
            }

            await orderObj.save();
            await mongoose.connection.db.collection('orders').updateOne(
                { _id: orderObj._id },
                { $set: { createdAt: orderDate, updatedAt: orderDate } }
            );

            // Add index tag for mapping in event simulator
            orderObj._tempIndex = i;
            createdOrders.push(orderObj);
        }
        console.log(`Created ${createdOrders.length} orders.`);

        // Define Payment Plans
        const paymentPlans = [
            // Shivu Naganur (Index 0) - Total Paid = 3500
            { customerIndex: 0, amount: 2000, method: 'ONLINE', status: 'approved', dateOffsetDays: 5, txnType: 'UPI', txnId: 'UPI9083109283' },
            { customerIndex: 0, amount: 1500, method: 'CASH', status: 'approved', dateOffsetDays: 2, txnType: 'CASH', txnId: 'CASH78819' },

            // Dr. Rajesh Sharma (Index 1) - Total Paid = 5000
            { customerIndex: 1, amount: 3200, method: 'ONLINE', status: 'approved', dateOffsetDays: 10, txnType: 'UPI', txnId: 'UPI9081273918' },
            { customerIndex: 1, amount: 1800, method: 'CASH', status: 'approved', dateOffsetDays: 3, txnType: 'CASH', txnId: 'CASH12781' },

            // Dr. Priya Patil (Index 2) - Total Paid = 3700
            { customerIndex: 2, amount: 3700, method: 'ONLINE', status: 'approved', dateOffsetDays: 8, txnType: 'BANK_TRANSFER', txnId: 'NEFT839102839' },
            { customerIndex: 2, amount: 1000, method: 'ONLINE', status: 'pending', dateOffsetDays: 1, txnType: 'UPI', txnId: 'UPI8391028312' },

            // Dr. Vivek Reddy (Index 3) - Total Paid = 3500
            { customerIndex: 3, amount: 3500, method: 'ONLINE', status: 'approved', dateOffsetDays: 7, txnType: 'UPI', txnId: 'UPI2098492083' },
            { customerIndex: 3, amount: 2500, method: 'ONLINE', status: 'rejected', dateOffsetDays: 2, txnType: 'UPI', txnId: 'UPI2098492044', rejectionReason: 'Transaction failed at bank gateway' },

            // Dr. Sneha Deshmukh (Index 4) - Total Paid = 4000
            { customerIndex: 4, amount: 2500, method: 'ONLINE', status: 'approved', dateOffsetDays: 9, txnType: 'UPI', txnId: 'UPI9203810293' },
            { customerIndex: 4, amount: 1500, method: 'CASH', status: 'approved', dateOffsetDays: 2, txnType: 'CASH', txnId: 'CASH90283' },

            // Dr. Anil Kulkarni (Index 5) - Total Paid = 4000
            { customerIndex: 5, amount: 4000, method: 'ONLINE', status: 'approved', dateOffsetDays: 15, txnType: 'BANK_TRANSFER', txnId: 'RTGS920381023' },

            // Sai Medical Stores (Index 6) - Total Paid = 8000
            { customerIndex: 6, amount: 5600, method: 'ONLINE', status: 'approved', dateOffsetDays: 14, txnType: 'UPI', txnId: 'UPI9028310293' },
            { customerIndex: 6, amount: 2400, method: 'ONLINE', status: 'approved', dateOffsetDays: 4, txnType: 'UPI', txnId: 'UPI9028310245' },
            { customerIndex: 6, amount: 1500, method: 'ONLINE', status: 'pending', dateOffsetDays: 1, txnType: 'UPI', txnId: 'UPI9028310277' },

            // Shree Medical & General Stores (Index 7) - Total Paid = 4000
            { customerIndex: 7, amount: 4000, method: 'ONLINE', status: 'approved', dateOffsetDays: 10, txnType: 'UPI', txnId: 'UPI9028310211' },

            // Lakshmi Medicals (Index 8) - Total Paid = 7500
            { customerIndex: 8, amount: 7500, method: 'ONLINE', status: 'approved', dateOffsetDays: 6, txnType: 'BANK_TRANSFER', txnId: 'NEFT9203810212' },

            // Apollo Medical Agencies (Index 9) - Total Paid = 10000
            { customerIndex: 9, amount: 10000, method: 'ONLINE', status: 'approved', dateOffsetDays: 12, txnType: 'BANK_TRANSFER', txnId: 'NEFT9203810299' },

            // HealthCare Pharma Distributors (Index 10) - Total Paid = 1200
            { customerIndex: 10, amount: 1200, method: 'ONLINE', status: 'approved', dateOffsetDays: 10, txnType: 'UPI', txnId: 'UPI9028310200' }
        ];

        // Process Wallets, running dues, and Payments chronologically per customer
        for (let custIdx = 0; custIdx < createdCustomers.length; custIdx++) {
            const customer = createdCustomers[custIdx];
            const custOrders = createdOrders.filter(o => o.customer.toString() === customer._id.toString());
            const custPaymentPlans = paymentPlans.filter(p => p.customerIndex === custIdx);

            // Gather all chronological events
            const events = [];
            for (const order of custOrders) {
                // Only orders accepted/processed affect wallet dues
                if (['processing', 'shipped', 'delivered'].includes(order.status)) {
                    events.push({
                        type: 'order',
                        amount: order.totalPrice,
                        date: new Date(Date.now() - orderPlans[order._tempIndex].dateOffsetDays * 24 * 60 * 60 * 1000),
                        reference: order
                    });
                }
            }

            const mockPayments = [];
            for (const pPlan of custPaymentPlans) {
                const paymentDate = new Date(Date.now() - pPlan.dateOffsetDays * 24 * 60 * 60 * 1000);
                const auditLogs = [{
                    action: 'created',
                    performerModel: 'Customer',
                    performedBy: customer._id,
                    timestamp: paymentDate,
                    details: `Payment request of ₹${pPlan.amount} submitted`
                }];

                if (pPlan.status === 'approved') {
                    auditLogs.push({
                        action: 'approved',
                        performerModel: 'Admin',
                        performedBy: adminId,
                        timestamp: new Date(paymentDate.getTime() + 2 * 60 * 60 * 1000), // Approved after 2 hours
                        details: `Payment approved by admin`
                    });
                } else if (pPlan.status === 'rejected') {
                    auditLogs.push({
                        action: 'rejected',
                        performerModel: 'Admin',
                        performedBy: adminId,
                        timestamp: new Date(paymentDate.getTime() + 2 * 60 * 60 * 1000),
                        details: `Payment rejected by admin. Reason: ${pPlan.rejectionReason}`
                    });
                }

                const payment = new Payment({
                    customer: customer._id,
                    amount: pPlan.amount,
                    paymentMethod: pPlan.method,
                    transactionId: pPlan.txnId,
                    proofUrl: pPlan.method === 'CASH' ? 'offline_payment' : 'https://res.cloudinary.com/dpzsihgk4/image/upload/v1700000000/payments/proof.jpg',
                    status: pPlan.status,
                    rejectionReason: pPlan.rejectionReason,
                    adminComment: pPlan.status === 'approved' ? (pPlan.method === 'CASH' ? 'Cash payment collected & verified' : 'UPI/Online transaction verified') : undefined,
                    auditLogs: auditLogs
                });

                mockPayments.push(payment);
                events.push({
                    type: 'payment',
                    amount: pPlan.amount,
                    status: pPlan.status,
                    date: paymentDate,
                    reference: payment
                });
            }

            // Sort events chronologically
            events.sort((a, b) => a.date - b.date);

            let runningDue = 0;
            let totalDue = 0;
            let totalPaid = 0;
            const walletHistory = [];

            // Simulate events
            for (const ev of events) {
                if (ev.type === 'order') {
                    runningDue += ev.amount;
                    totalDue += ev.amount;
                } else if (ev.type === 'payment') {
                    const paymentDoc = ev.reference;
                    paymentDoc.originalDueAmount = runningDue;
                    
                    if (ev.status === 'approved') {
                        runningDue = Math.max(0, Math.round((runningDue - ev.amount) * 100) / 100);
                        paymentDoc.remainingDueAmount = runningDue;
                        totalPaid += ev.amount;

                        walletHistory.push({
                            type: 'payment',
                            amount: ev.amount,
                            reference: paymentDoc.paymentMethod === 'CASH' 
                                ? `Cash Payment ID: ${paymentDoc._id}`
                                : `Payment ID: ${paymentDoc._id}`,
                            balanceAfter: runningDue,
                            createdAt: ev.date
                        });
                    } else {
                        // Pending/Rejected doesn't reduce running due
                        paymentDoc.remainingDueAmount = runningDue;
                    }
                }
            }

            // Save payments in DB and fix timestamps
            for (let i = 0; i < mockPayments.length; i++) {
                const paymentDoc = mockPayments[i];
                const pPlan = custPaymentPlans[i];
                await paymentDoc.save();
                const paymentDate = new Date(Date.now() - pPlan.dateOffsetDays * 24 * 60 * 60 * 1000);
                await mongoose.connection.db.collection('payments').updateOne(
                    { _id: paymentDoc._id },
                    { $set: { createdAt: paymentDate, updatedAt: paymentDate, paymentDate: paymentDate } }
                );
            }

            // Update Customer's final due amount
            customer.dueAmount = runningDue;
            await customer.save();

            // Create Wallet Document
            const wallet = new Wallet({
                customer: customer._id,
                totalDue: totalDue,
                totalPaid: totalPaid,
                pendingBalance: runningDue,
                walletBalance: 0,
                walletHistory: walletHistory
            });
            await wallet.save();

            // Set Wallet timestamps (matching the latest customer update)
            const walletDate = new Date(Date.now() - customer.dateOffsetDays * 24 * 60 * 60 * 1000);
            await mongoose.connection.db.collection('wallets').updateOne(
                { _id: wallet._id },
                { $set: { createdAt: walletDate, updatedAt: new Date() } }
            );
        }
        console.log('Seeded Payments and Wallets in perfect sync.');

        // Define Connection Requests
        const connectionRequestsData = [
            {
                name: 'Dr. Kiran Joshi',
                email: 'kiran.joshi@gmail.com',
                phone: '9876543201',
                type: 'Doctor',
                status: 'pending',
                address: {
                    shopName: 'Joshi Pediatric Clinic',
                    line1: '15, Shivaji Road',
                    city: 'Kolhapur',
                    state: 'Maharashtra',
                    pincode: '416001'
                },
                message: 'We are establishing a new pediatric clinic in Kolhapur and want to request a dealer account for procuring vaccines and generic medicines at wholesale distribution rates.'
            },
            {
                name: 'Dr. Rohit Patil',
                email: 'rohit.patil@gmail.com',
                phone: '9876543202',
                type: 'Doctor',
                status: 'pending',
                address: {
                    shopName: 'Patil Orthopedic Center',
                    line1: 'G-24, Market Yard Road',
                    city: 'Satara',
                    state: 'Maharashtra',
                    pincode: '415001'
                },
                message: "Hello Team, I am an orthopedic surgeon in Satara. I would like to establish an account for my clinic's internal pharmacy to purchase surgical supplies and medications. Please contact me."
            },
            {
                name: 'Ganesh Medicals',
                email: 'ganeshmedicals@gmail.com',
                phone: '9876543203',
                type: 'Medical',
                status: 'pending',
                address: {
                    shopName: 'Ganesh Medicals',
                    line1: 'Shop No. 5, Station Road',
                    city: 'Solapur',
                    state: 'Maharashtra',
                    pincode: '413001'
                },
                message: 'Dear Sir/Madam, we are Ganesh Medicals, a new retail drugstore in Solapur. We want to partner with SV Pharma for daily supplies of ethical medicines. Kindly approve our dealership access.'
            },
            {
                name: 'Om Pharma Agencies',
                email: 'ompharma@gmail.com',
                phone: '9876543204',
                type: 'Medical',
                status: 'pending',
                address: {
                    shopName: 'Om Pharma Agencies',
                    line1: 'Plot 104, MIDC Area',
                    city: 'Latur',
                    state: 'Maharashtra',
                    pincode: '413512'
                },
                message: "We are wholesale pharma distributors in Latur. We are interested in getting sub-dealership/agency authorization for SV Pharma's PCD range. Looking forward to your call."
            },
            {
                name: 'CarePlus Medical Store',
                email: 'careplus@gmail.com',
                phone: '9876543205',
                type: 'Medical',
                status: 'pending',
                address: {
                    shopName: 'CarePlus 24/7 Medical Store',
                    line1: 'Near Civil Hospital',
                    city: 'Sangli',
                    state: 'Maharashtra',
                    pincode: '416416'
                },
                message: 'We are setting up a 24/7 medical store near the civil hospital in Sangli. We want to check pricing and request credit accounts for medicine distribution. Please approve.'
            }
        ];

        // Save Connection Requests
        for (let i = 0; i < connectionRequestsData.length; i++) {
            const reqData = connectionRequestsData[i];
            const request = new ConnectionRequest(reqData);
            await request.save();
            const requestDate = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000); // 1 to 5 days ago
            await mongoose.connection.db.collection('connectionrequests').updateOne(
                { _id: request._id },
                { $set: { createdAt: requestDate, updatedAt: requestDate } }
            );
        }
        console.log(`Created 5 pending connection requests.`);

        console.log('\n================ SEEDING COMPLETE ================');
        
        // Print Summary Counts
        const customerCount = await Customer.countDocuments({});
        const orderCount = await Order.countDocuments({});
        const paymentCount = await Payment.countDocuments({});
        const walletCount = await Wallet.countDocuments({});
        const requestCount = await ConnectionRequest.countDocuments({});

        console.log(`Customers: ${customerCount}`);
        console.log(`Orders: ${orderCount}`);
        console.log(`Payments: ${paymentCount}`);
        console.log(`Wallets: ${walletCount}`);
        console.log(`Connection Requests: ${requestCount}`);

        // Verify Shivu Naganur's Wallet
        const shivu = await Customer.findOne({ email: 'demo788197@gmail.com' });
        const shivuWallet = await Wallet.findOne({ customer: shivu._id });
        console.log('\n--- Special Demo Customer Check (Shivu Naganur) ---');
        console.log(`Total Purchase (totalDue): ₹${shivuWallet.totalDue}`);
        console.log(`Total Paid: ₹${shivuWallet.totalPaid}`);
        console.log(`Pending Balance: ₹${shivuWallet.pendingBalance}`);
        console.log(`Customer dueAmount: ₹${shivu.dueAmount}`);

        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

seed();
