const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');

// @desc    Get customer profile
// @route   GET /api/customers/profile
// @access  Private (Customer)
const getProfile = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.user._id);
    if (customer) {
        res.json({
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            type: customer.type,
            username: customer.username,
            dueAmount: customer.dueAmount || 0,
            role: 'customer'
        });
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
});

// @desc    Update customer profile
// @route   PUT /api/customers/profile
// @access  Private (Customer)
const updateProfile = asyncHandler(async (req, res) => {
    // GUARD: Check authentication
    if (!req.user || req.user.role !== 'customer') {
        res.status(401);
        throw new Error('Unauthorized - Customer authentication required');
    }

    // DEBUG: Log incoming request
    console.log('=== Profile Update Request ===');
    console.log('Customer ID:', req.user._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    const { name, email, phone, address } = req.body;

    // Update name if provided and not empty
    if (name && typeof name === 'string' && name.trim()) {
        customer.name = name.trim();
        console.log('Updated name:', customer.name);
    }

    // Validate and update email if changed
    if (email && typeof email === 'string' && email.trim() && email !== customer.email) {
        const emailExists = await Customer.findOne({ email, _id: { $ne: customer._id } });
        if (emailExists) {
            res.status(400);
            throw new Error('A customer is already registered with this Email');
        }
        customer.email = email.trim();
        console.log('Updated email:', customer.email);
    }

    // Validate and update phone if changed
    if (phone && typeof phone === 'string' && phone.trim() && phone !== customer.phone) {
        const cleanPhone = phone.trim();
        // Strict Mobile Number Validation
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(cleanPhone)) {
            res.status(400);
            throw new Error('Invalid mobile number. Must be exactly 10 digits and start with 6, 7, 8, or 9.');
        }

        const phoneExists = await Customer.findOne({ phone: cleanPhone, _id: { $ne: customer._id } });
        if (phoneExists) {
            res.status(400);
            throw new Error('A customer is already registered with this Mobile Number');
        }
        customer.phone = cleanPhone;
        console.log('Updated phone:', customer.phone);
    }

    // Handle address update with smart merging
    if (address && typeof address === 'object') {
        console.log('Processing address update...');

        // Get current address or empty object
        const currentAddress = customer.address ? customer.address.toObject() : {};
        console.log('Current address:', currentAddress);

        // Merge fields - only update if new value is provided and not empty
        const mergedAddress = {
            shopName: (address.shopName !== undefined && address.shopName !== '')
                ? address.shopName
                : (currentAddress.shopName || ''),
            line1: (address.line1 !== undefined && address.line1 !== '')
                ? address.line1
                : (currentAddress.line1 || ''),
            line2: (address.line2 !== undefined && address.line2 !== '')
                ? address.line2
                : (currentAddress.line2 || ''),
            area: (address.area !== undefined && address.area !== '')
                ? address.area
                : (currentAddress.area || ''),
            city: (address.city !== undefined && address.city !== '')
                ? address.city
                : (currentAddress.city || ''),
            district: (address.district !== undefined && address.district !== '')
                ? address.district
                : (currentAddress.district || ''),
            state: (address.state !== undefined && address.state !== '')
                ? address.state
                : (currentAddress.state || ''),
            pincode: (address.pincode !== undefined && address.pincode !== '')
                ? address.pincode
                : (currentAddress.pincode || ''),
            landmark: (address.landmark !== undefined && address.landmark !== '')
                ? address.landmark
                : (currentAddress.landmark || '')
        };

        console.log('Merged address:', mergedAddress);

        // Validate required fields
        if (!mergedAddress.line1 || !mergedAddress.line1.trim()) {
            res.status(400);
            throw new Error('Address Line 1 is required');
        }
        if (!mergedAddress.city || !mergedAddress.city.trim()) {
            res.status(400);
            throw new Error('City is required');
        }
        if (!mergedAddress.state || !mergedAddress.state.trim()) {
            res.status(400);
            throw new Error('State is required');
        }
        if (!mergedAddress.pincode || !mergedAddress.pincode.trim()) {
            res.status(400);
            throw new Error('Pincode is required');
        }

        customer.address = mergedAddress;
        console.log('Address updated successfully');
    }

    try {
        const updatedCustomer = await customer.save();
        console.log('Customer saved successfully');

        res.json({
            _id: updatedCustomer._id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            address: updatedCustomer.address,
            type: updatedCustomer.type,
            username: updatedCustomer.username,
            role: 'customer'
        });
    } catch (saveError) {
        console.error('Error saving customer:', saveError);
        res.status(500);
        throw new Error(`Failed to save customer profile: ${saveError.message}`);
    }
});

module.exports = {
    getProfile,
    updateProfile
};
