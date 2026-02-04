const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const ShopProfile = require('../models/ShopProfile');
const ConnectionRequest = require('../models/ConnectionRequest');
const Customer = require('../models/Customer');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const sendEmail = require('../utils/sendEmail');
const { generateOTP, storeOTP, verifyOTP } = require('../utils/otpService');
const { sendOTPEmail } = require('../utils/emailService');

// Helper to generate professional username
const genUsername = (name, phone, type, existingCount = 0) => {
    const cleanedName = (name || "USER").replace(/\s+/g, "").toUpperCase();
    const first4 = (cleanedName.slice(0, 4) || cleanedName).padEnd(4, "X");
    const last4 = (phone || "0000").slice(-4);

    // Add a short random suffix if needed
    const randomSuffix = existingCount
        ? crypto.randomBytes(1).toString("hex").toUpperCase()
        : "";

    const baseUsername = type === "Doctor"
        ? `Dr_${first4}${last4}${randomSuffix}`
        : `${first4}${last4}${randomSuffix}`;

    return baseUsername;
};

// Helper to generate password
const genPassword = (name, phone) => {
    const last4 = (phone || "0000").slice(-4);
    const namePart = (name || "user").toLowerCase().slice(0, 4);
    return `SVP${last4}${namePart}`;
};

// Helper for Styled Welcome Email
const getWelcomeEmailTemplate = (name, type, username, password) => {
    const displayNamePrefix = type === "Doctor" ? "Dr. " : "";
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
                .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-top: 40px; }
                .brand-header { padding: 30px 40px; text-align: left; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
                .brand-name { font-size: 20px; font-weight: 800; color: #0d9488; margin: 0; display: inline-block; vertical-align: middle; }
                .logo { height: 40px; vertical-align: middle; margin-right: 12px; }
                .header { background: #0d9488; color: white; padding: 40px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
                .content { padding: 40px; }
                .account-box { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 25px; margin: 30px 0; }
                .info-row { margin-bottom: 15px; }
                .info-label { color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
                .info-value { font-size: 18px; font-weight: 700; color: #115e59; font-family: monospace; }
                .footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 0 20px; }
                .divider { height: 1px; background: #e2e8f0; margin: 30px 100px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="brand-header">
                        <img src="${process.env.LOGO_URL || 'https://svpharma.in/logo.png'}" alt="Logo" class="logo">
                        <span class="brand-name">Shree Veerabhadreshwara Pharma</span>
                    </div>
                    <div class="header">
                        <h1>🎊 Welcome to the Family</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px; margin-top: 0;">Hello <strong>${displayNamePrefix}${name}</strong>,</p>
                        <p>Your partner account has been successfully approved and created at <strong>Shree Veerabhadreshwara Pharma</strong>. You can now access your professional dashboard using the credentials below:</p>
                        
                        <div class="account-box">
                            <div class="info-row">
                                <div class="info-label">Your Username</div>
                                <div class="info-value">${username}</div>
                            </div>
                            <div class="info-row" style="margin-bottom: 0;">
                                <div class="info-label">Initial Password</div>
                                <div class="info-value">${password}</div>
                            </div>
                        </div>

                        <p style="font-size: 14px; color: #64748b;">Please keep this information confidential. You will be asked to change your password upon your first login for security purposes.</p>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${process.env.APP_LINK || '#'}" style="display:inline-block; background: #0d9488; color: white; padding: 14px 30px; border-radius: 8px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Access Your Dashboard</a>
                        </div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="footer">
                    <p style="margin-bottom: 5px;">&copy; 2026 Shree Veerabhadreshwara Pharma. All rights reserved.</p>
                    <p style="margin-top: 0; font-weight: 600; color: #64748b;">This is a system-generated email. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// @desc    Get shop profile
// @route   GET /api/admin/shop-profile
// @access  Private/Admin
const getShopProfile = asyncHandler(async (req, res) => {
    const shop = await ShopProfile.findOne();
    if (shop) {
        res.json(shop);
    } else {
        const newShop = await ShopProfile.create({});
        res.json(newShop);
    }
});

// @desc    Update shop profile
// @route   PUT /api/admin/shop-profile
// @access  Private/Admin
const updateShopProfile = asyncHandler(async (req, res) => {
    const shop = await ShopProfile.findOne();
    if (shop) {
        shop.name = req.body.name || shop.name;
        shop.address = req.body.address || shop.address;
        shop.phone = req.body.phone || shop.phone;
        shop.email = req.body.email || shop.email;
        shop.logo = req.body.logo || shop.logo;

        const updatedShop = await shop.save();
        res.json(updatedShop);
    } else {
        const newShop = await ShopProfile.create(req.body);
        res.json(newShop);
    }
});

// @desc    Get all connection requests
// @route   GET /api/admin/connection-requests
// @access  Private/Admin
const getConnectionRequests = asyncHandler(async (req, res) => {
    const requests = await ConnectionRequest.find({}).sort({ createdAt: -1 });
    res.json(requests);
});

// @desc    Approve/Reject connection request
// @route   PUT /api/admin/connection-requests/:id
// @access  Private/Admin
const updateConnectionRequestStatus = asyncHandler(async (req, res) => {
    const { status, rejectionReason } = req.body;
    const request = await ConnectionRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    request.status = status;
    if (status === 'rejected') {
        request.rejectionReason = rejectionReason;
    }
    await request.save();

    if (status === 'approved') {
        // 1. Generate username & check for collisions
        let username = genUsername(request.name, request.phone, request.type);
        let attempts = 0;
        while (await Customer.findOne({ username })) {
            attempts++;
            username = genUsername(request.name, request.phone, request.type, attempts);
            if (attempts > 5) break;
        }

        // 2. Generate raw password for email
        const rawPassword = genPassword(request.name, request.phone);

        // 3. Create or Update Customer
        let customer = await Customer.findOne({ email: request.email });
        if (!customer) {
            customer = await Customer.create({
                name: request.name,
                email: request.email,
                phone: request.phone,
                address: request.address,
                type: request.type, // Map 'Medical Store' to 'Medical' or keep as is? User registration uses 'medical'
                username,
                password: rawPassword, // will be hashed by pre-save hook
                status: 'approved'
            });

            await Wallet.create({ customer: customer._id });
        } else {
            customer.status = 'approved';
            customer.username = username;
            customer.password = rawPassword;
            await customer.save();
        }

        // 4. Send Welcome Email
        try {
            await sendEmail({
                email: customer.email,
                subject: 'Welcome to Shree Veerabhadreshwara Pharma',
                html: getWelcomeEmailTemplate(customer.name, customer.type, username, rawPassword)
            });
        } catch (error) {
            console.error('Approval Email send failed', error);
        }
    } else if (status === 'rejected') {
        // Send Rejection Email
        try {
            await sendEmail({
                email: request.email,
                subject: 'Account Application Update - SV Pharma',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
                            .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
                            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-top: 40px; }
                            .brand-header { padding: 30px 40px; text-align: left; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
                            .brand-name { font-size: 20px; font-weight: 800; color: #e11d48; margin: 0; display: inline-block; vertical-align: middle; }
                            .logo { height: 40px; vertical-align: middle; margin-right: 12px; }
                            .header { background: #ef4444; color: white; padding: 40px; text-align: center; }
                            .header h2 { margin: 0; font-size: 24px; font-weight: 700; }
                            .content { padding: 40px; }
                            .reason-box { background: #fff1f2; border-left: 4px solid #ef4444; padding: 25px; margin: 30px 0; border-radius: 8px; }
                            .footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 0 20px; }
                            .divider { height: 1px; background: #e2e8f0; margin: 30px 100px; }
                        </style>
                    </head>
                    <body>
                        <div class="wrapper">
                            <div class="container">
                                <div class="brand-header">
                                    <img src="${process.env.LOGO_URL || 'https://svpharma.in/logo.png'}" alt="Logo" class="logo">
                                    <span class="brand-name">Shree Veerabhadreshwara Pharma</span>
                                </div>
                                <div class="header">
                                    <h2>Application Status Update</h2>
                                </div>
                                <div class="content">
                                    <p style="font-size: 16px; margin-top: 0;">Hello <strong>${request.name}</strong>,</p>
                                    <p>We have carefully reviewed your application for a partner account at <strong>Shree Veerabhadreshwara Pharma</strong>.</p>
                                    <p>Regrettably, we are unable to approve your application at this time.</p>
                                    
                                    <div class="reason-box">
                                        <p style="margin: 0; color: #9f1239; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; margin-bottom: 8px;">Rejection Reason</p>
                                        <p style="margin: 0; color: #be123c;">${rejectionReason || 'Your application did not meet our current manual verification criteria.'}</p>
                                    </div>

                                    <p>If you believe this was an error or wish to provide additional documentation, please contact our administrative team.</p>
                                    
                                    <p style="margin-bottom: 0;">Best regards,<br><strong>Verification Team</strong></p>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="footer">
                                <p style="margin-bottom: 5px;">&copy; 2026 Shree Veerabhadreshwara Pharma. All rights reserved.</p>
                                <p style="margin-top: 0; font-weight: 600; color: #64748b;">This is a system-generated email. Please do not reply to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
        } catch (error) {
            console.error('Rejection Email send failed', error);
        }
    }

    res.json(request);
});

// @desc    Add new customer manually (Admin)
// @route   POST /api/admin/customers
// @access  Private/Admin
const addCustomer = asyncHandler(async (req, res) => {
    const { name, phone, email, address, type } = req.body;

    // 1. Validation
    if (!name || !phone || !type) {
        res.status(400);
        throw new Error('Name, phone and type are required');
    }

    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
        res.status(409);
        throw new Error('Customer with this email already exists');
    }

    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
        res.status(409);
        throw new Error('Customer with this mobile number already exists');
    }

    // 2. Generate Credentials
    let username = genUsername(name, phone, type);
    let attempts = 0;
    while (await Customer.findOne({ username })) {
        attempts++;
        username = genUsername(name, phone, type, attempts);
        if (attempts > 5) break;
    }

    const rawPassword = genPassword(name, phone);

    // 3. Create Customer
    const customer = await Customer.create({
        name,
        phone,
        email,
        address,
        type,
        username,
        password: rawPassword,
        status: 'approved'
    });

    await Wallet.create({ customer: customer._id });

    // 4. Send Welcome Email
    if (email) {
        try {
            await sendEmail({
                email: customer.email,
                subject: 'Welcome to Shree Veerabhadreshwara Pharma',
                html: getWelcomeEmailTemplate(customer.name, customer.type, username, rawPassword)
            });
        } catch (error) {
            console.error('Manual Add Email send failed', error);
        }
    }

    // 5. Notify Admin (Optional, in snippet)
    const admin = await Admin.findOne();
    if (admin && admin.email) {
        try {
            await sendEmail({
                email: admin.email,
                subject: 'New Customer Registered',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
                            .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
                            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-top: 40px; }
                            .brand-header { padding: 30px 40px; text-align: left; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
                            .brand-name { font-size: 20px; font-weight: 800; color: #0d9488; margin: 0; display: inline-block; vertical-align: middle; }
                            .logo { height: 40px; vertical-align: middle; margin-right: 12px; }
                            .header { background: #334155; color: white; padding: 40px; text-align: center; }
                            .header h2 { margin: 0; font-size: 24px; font-weight: 700; }
                            .content { padding: 40px; }
                            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            .info-table td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                            .label { color: #64748b; font-weight: 700; width: 120px; text-transform: uppercase; font-size: 11px; }
                            .value { color: #334155; font-weight: 500; }
                            .footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 0 20px; }
                            .divider { height: 1px; background: #e2e8f0; margin: 30px 100px; }
                        </style>
                    </head>
                    <body>
                        <div class="wrapper">
                            <div class="container">
                                <div class="brand-header">
                                    <img src="${process.env.LOGO_URL || 'https://svpharma.in/logo.png'}" alt="Logo" class="logo">
                                    <span class="brand-name">Shree Veerabhadreshwara Pharma</span>
                                </div>
                                <div class="header">
                                    <h2>New Customer Registered</h2>
                                </div>
                                <div class="content">
                                    <p style="font-size: 16px; margin-top: 0;">Hello Admin,</p>
                                    <p>A new customer has been successfully added to the system via manual registration. Details are below:</p>
                                    
                                    <table class="info-table">
                                        <tr>
                                            <td class="label">Name</td>
                                            <td class="value">${customer.name}</td>
                                        </tr>
                                        <tr>
                                            <td class="label">Phone</td>
                                            <td class="value">${customer.phone}</td>
                                        </tr>
                                        <tr>
                                            <td class="label">Type</td>
                                            <td class="value">${customer.type}</td>
                                        </tr>
                                    </table>

                                    <p>Please check the admin dashboard for full verification and management.</p>
                                    
                                    <p style="margin-bottom: 0;">Best regards,<br><strong>System Monitor</strong></p>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="footer">
                                <p style="margin-bottom: 5px;">&copy; 2026 Shree Veerabhadreshwara Pharma. All rights reserved.</p>
                                <p style="margin-top: 0; font-weight: 600; color: #64748b;">This is a system-generated email. Please do not reply to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
        } catch (error) {
            console.error('Admin Notification failed', error);
        }
    }

    res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        customer: {
            id: customer._id,
            name: customer.name,
            username: customer.username,
            email: customer.email
        }
    });
});

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAllCustomers = asyncHandler(async (req, res) => {
    const customers = await Customer.find({}).sort({ createdAt: -1 });

    // Fetch pendingBalance for each customer
    const customersWithBalance = await Promise.all(customers.map(async (customer) => {
        const wallet = await Wallet.findOne({ customer: customer._id });
        return {
            ...customer.toObject(),
            pendingBalance: wallet ? wallet.pendingBalance : 0
        };
    }));

    res.json(customersWithBalance);
});

// @desc    Request OTP for customer deletion
// @route   POST /api/admin/customers/:id/request-delete-otp
// @access  Private/Admin
const requestCustomerDeleteOTP = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    // find admin (using the one who is logged in or first admin as per your snippet)
    const admin = await Admin.findOne();
    if (!admin || !admin.email) {
        res.status(404);
        throw new Error('Admin email not found in records');
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with customer ID as identifier
    const identifier = `delete_customer_${req.params.id}`;
    storeOTP(identifier, otp);

    // Send OTP to admin email
    try {
        await sendOTPEmail(
            admin.email, // Send to admin's email from database
            otp,
            `Customer Deletion (${customer.name})`
        );

        res.json({
            success: true,
            message: 'OTP sent to admin email',
            customerName: customer.name
        });
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        res.status(500);
        throw new Error('Failed to send OTP email. Please ensure your email credentials are set up correctly in the .env file.');
    }
});

// @desc    Verify OTP and delete customer
// @route   POST /api/admin/customers/:id/verify-delete-otp
// @access  Private/Admin
const verifyOTPAndDeleteCustomer = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const customerId = req.params.id;

    if (!otp) {
        res.status(400);
        throw new Error('OTP is required');
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    // Verify OTP
    const identifier = `delete_customer_${customerId}`;
    const verification = verifyOTP(identifier, otp);

    if (!verification.valid) {
        res.status(400);
        throw new Error(verification.message);
    }

    // OTP is valid, proceed with deletion
    try {
        // Delete associated wallet
        await Wallet.deleteOne({ customer: customerId });

        // Delete customer
        await Customer.findByIdAndDelete(customerId);

        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete customer:', error);
        res.status(500);
        throw new Error('Failed to delete customer');
    }
});

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getDashboardAnalytics = asyncHandler(async (req, res) => {
    // 1. Sales Analytics (Total revenue and order count)
    const orders = await Order.find({ status: { $ne: 'cancelled' } });

    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalOrders = orders.length;

    // 2. Sales by Date (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        last7Days.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: date,
            revenue: 0,
            orders: 0
        });
    }

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        const dayMatch = last7Days.find(d => d.fullDate.getTime() === orderDate.getTime());
        if (dayMatch) {
            dayMatch.revenue += order.totalPrice;
            dayMatch.orders += 1;
        }
    });

    // 3. Top Customers (by total spend)
    const customerSpend = {};
    orders.forEach(order => {
        const customerId = order.customer.toString();
        customerSpend[customerId] = (customerSpend[customerId] || 0) + order.totalPrice;
    });

    const topCustomersRaw = Object.entries(customerSpend)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const topCustomers = await Promise.resolve(
        Promise.all(topCustomersRaw.map(async ([id, spend]) => {
            const customer = await Customer.findById(id).select('name');
            return {
                name: customer ? customer.name : 'Unknown',
                spend: Math.round(spend * 100) / 100
            };
        }))
    );

    // 4. Best Selling Products (by quantity)
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const productName = item.name;
            productSales[productName] = (productSales[productName] || 0) + item.quantity;
        });
    });

    const bestSellingProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }));

    // 5. Category Analytics
    const categorySales = {};
    const medicines = await Medicine.find({});
    const medicineToCategory = {};
    medicines.forEach(med => {
        medicineToCategory[med.name] = med.category;
    });

    orders.forEach(order => {
        order.items.forEach(item => {
            const category = medicineToCategory[item.name] || 'Other';
            categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
        });
    });

    const salesByCategory = Object.entries(categorySales).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100
    }));

    res.json({
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        salesTrends: last7Days.map(({ date, revenue, orders }) => ({ date, revenue, orders })),
        topCustomers,
        bestSellingProducts,
        salesByCategory
    });
});

module.exports = {
    getShopProfile,
    updateShopProfile,
    getConnectionRequests,
    updateConnectionRequestStatus,
    getAllCustomers,
    requestCustomerDeleteOTP,
    verifyOTPAndDeleteCustomer,
    getDashboardAnalytics,
    addCustomer
};
