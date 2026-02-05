const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const ConnectionRequest = require('../models/ConnectionRequest');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const { sendUsernameEmail, sendPasswordResetOTP } = require('../utils/emailService');
const { validatePassword, generateOTP } = require('../utils/passwordUtils');

// @desc    Request new connection (Public)
// @route   POST /api/auth/request-connection
// @access  Public
const requestConnection = asyncHandler(async (req, res) => {
    const { name, email, phone, address, type } = req.body;

    // Strict Mobile Number Validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        res.status(400);
        throw new Error('Invalid mobile number. Must be exactly 10 digits and start with 6, 7, 8, or 9.');
    }


    // 1. Check if a request already exists
    const emailRequestExists = await ConnectionRequest.findOne({ email });
    if (emailRequestExists) {
        res.status(400);
        throw new Error('A connection request for this Email already exists');
    }

    const phoneRequestExists = await ConnectionRequest.findOne({ phone });
    if (phoneRequestExists) {
        res.status(400);
        throw new Error('A connection request for this Mobile Number already exists');
    }

    // 2. Check if a customer is already registered
    const emailCustomerExists = await Customer.findOne({ email });
    if (emailCustomerExists) {
        res.status(400);
        throw new Error('A customer is already registered with this Email');
    }

    const phoneCustomerExists = await Customer.findOne({ phone });
    if (phoneCustomerExists) {
        res.status(400);
        throw new Error('A customer is already registered with this Mobile Number');
    }

    const request = await ConnectionRequest.create({
        name,
        email,
        phone,
        address,
        type,
        status: 'pending'
    });

    if (request) {
        res.status(201).json({
            message: 'Connection request submitted successfully',
            request
        });
    } else {
        res.status(400);
        throw new Error('Invalid request data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check Admin
    const admin = await Admin.findOne({ username });
    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id),
        });
        return;
    }

    // Check Customer
    const customer = await Customer.findOne({ username });
    if (customer && (await customer.matchPassword(password))) {
        if (customer.status !== 'approved') {
            res.status(401);
            throw new Error('Account not approved yet');
        }

        res.json({
            _id: customer._id,
            username: customer.username,
            name: customer.name,
            role: 'customer',
            token: generateToken(customer._id),
            walletBalance: 0, // Need to fetch wallet
        });
        return;
    }

    res.status(401);
    throw new Error('Invalid username or password');
});

// @desc    Register Admin (Initial Setup)
// @route   POST /api/auth/register-admin
// @access  Public (Should be protected or removed in prod)
const registerAdmin = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const userExists = await Admin.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const admin = await Admin.create({
        username,
        email,
        password,
    });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Forgot Username - Send username to email
// @route   POST /api/auth/forgot-username
// @access  Public
const forgotUsername = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Validate email format
    if (!email || !email.trim()) {
        res.status(400);
        throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Invalid email format');
    }

    // Search for user with this email (Customer first, then Admin)
    let user = await Customer.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
        user = await Admin.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user) {
        // Email doesn't exist - return 404 with clear message
        console.log(`Username recovery attempted for non-existent email: ${email}`);
        res.status(404);
        throw new Error('No account is registered with this email address.');
    }

    // Email exists - send username
    try {
        await sendUsernameEmail(user.email, user.username);
        console.log(`Username recovery email sent to: ${user.email}`);

        res.status(200).json({
            message: 'Username has been sent to your registered email.'
        });
    } catch (emailError) {
        console.error('Failed to send username email:', emailError);
        res.status(500);
        throw new Error('Failed to send email. Please try again later.');
    }
});

// @desc    Forgot Password - Send OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Validate email
    if (!email || !email.trim()) {
        res.status(400);
        throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Invalid email format');
    }

    // Check if user exists (Customer or Admin)
    let user = await Customer.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
        user = await Admin.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user) {
        res.status(404);
        throw new Error('No account found with this email address.');
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    console.log(`Generated OTP for ${email}: ${otp}`); // For development - remove in production

    // Hash OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    // Set expiry time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.trim().toLowerCase() });

    // Create new OTP record
    await OTP.create({
        email: email.trim().toLowerCase(),
        otp: hashedOTP,
        expiresAt,
        used: false
    });

    // Send OTP email
    try {
        await sendPasswordResetOTP(user.email, otp);
        console.log(`Password reset OTP sent to: ${user.email}`);

        res.status(200).json({
            message: 'OTP has been sent to your registered email.'
        });
    } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        res.status(500);
        throw new Error('Failed to send OTP email. Please try again later.');
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and OTP are required');
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        res.status(400);
        throw new Error('OTP must be a 6-digit number');
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
        email: email.trim().toLowerCase(),
        used: false
    }).sort({ createdAt: -1 }); // Get the most recent OTP

    if (!otpRecord) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
        res.status(400);
        throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    // Delete OTP immediately after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
        message: 'OTP verified successfully'
    });
});

// @desc    Reset Password
// @route   PUT /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
        res.status(400);
        throw new Error('Email, OTP, and new password are required');
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        res.status(400);
        throw new Error(passwordValidation.errors.join('. '));
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
        email: email.trim().toLowerCase(),
        used: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
        res.status(400);
        throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    // Find user (Customer or Admin)
    let targetUser = await Customer.findOne({ email: email.trim().toLowerCase() });
    let isCustomer = true;

    if (!targetUser) {
        targetUser = await Admin.findOne({ email: email.trim().toLowerCase() });
        isCustomer = false;
    }

    if (!targetUser) {
        res.status(404);
        throw new Error('User not found');
    }

    // Hash the new password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password directly
    if (isCustomer) {
        await Customer.findOneAndUpdate(
            { email: email.trim().toLowerCase() },
            { password: hashedPassword },
            { runValidators: false }
        );
    } else {
        await Admin.findOneAndUpdate(
            { email: email.trim().toLowerCase() },
            { password: hashedPassword },
            { runValidators: false }
        );
    }

    // Delete OTP immediately after successful password reset
    await OTP.deleteOne({ _id: otpRecord._id });

    console.log(`Password reset successful for: ${targetUser.email}`);

    res.status(200).json({
        message: 'Password reset successfully. You can now login with your new password.'
    });
});

module.exports = {
    loginUser,
    registerAdmin,
    requestConnection,
    forgotUsername,
    forgotPassword,
    verifyOTP,
    resetPassword
};
