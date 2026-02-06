const Admin = require('../models/Admin');
const SiteSettings = require('../models/SiteSettings');
const asyncHandler = require('express-async-handler');
const { sendUpiChangeOTP } = require('../utils/emailService');
const bcrypt = require('bcryptjs');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
    let settings = await SiteSettings.findOne();
    if (!settings) {
        settings = await SiteSettings.create({}); // Create default if not exists
    }

    // Migration Logic: If contacts is empty but phone exists, migrate it
    if ((!settings.contacts || settings.contacts.length === 0) && settings.phone) {
        settings.contacts = [{ name: 'Primary', phone: settings.phone }];
        await settings.save();
    }

    // Mask email/phone in public response if needed, but for now we send all
    // EXCEPT OTP hash inside Admin model (temp storage)
    res.json(settings);
});

// @desc    Update shop settings (Admin Only)
// @route   PUT /api/settings/shop
// @access  Private/Admin
const updateShopSettings = asyncHandler(async (req, res) => {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    settings.appName = req.body.appName || settings.appName;
    settings.email = req.body.email || settings.email;
    settings.phone = req.body.phone || settings.phone; // Keep syncing for now

    if (req.body.contacts) {
        settings.contacts = req.body.contacts;
    }

    if (req.body.address) {
        settings.address = { ...settings.address, ...req.body.address };
    }

    settings.facebook = req.body.facebook || settings.facebook;
    settings.twitter = req.body.twitter || settings.twitter;
    settings.instagram = req.body.instagram || settings.instagram;
    settings.whatsapp = req.body.whatsapp || settings.whatsapp;
    settings.linkedin = req.body.linkedin || settings.linkedin;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

// @desc    Update developer settings (Developer Only)
// @route   PUT /api/settings/developer
// @access  Private/Developer
const updateDeveloperSettings = asyncHandler(async (req, res) => {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    settings.developerName = req.body.developerName || settings.developerName;
    settings.developerDescription = req.body.developerDescription || settings.developerDescription;
    settings.developerRoleName = req.body.developerRoleName || settings.developerRoleName;
    settings.developerLink = req.body.developerLink || settings.developerLink;
    settings.developerProfileLink = req.body.developerProfileLink || settings.developerProfileLink;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

// @desc    Update site settings (Legacy/Bulk - restricted)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    // Only allow Admin to update non-developer fields via this route
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    const adminFields = ['appName', 'email', 'phone', 'contacts', 'address', 'facebook', 'twitter', 'instagram', 'whatsapp', 'linkedin'];

    adminFields.forEach(field => {
        if (req.body[field] !== undefined) {
            settings[field] = req.body[field];
        }
    });

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

// @desc    Request UPI Change (Send OTP)
// @route   POST /api/settings/upi/request
// @access  Private/Admin
const requestUpiChange = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    // Store hashed OTP and expiry in Admin document (or separate Store)
    // We'll add temporary fields to Admin model or use a cache. 
    // Since schema update wasn't planned for Admin, let's use a simpler in-memory valid approach if scaled, 
    // but for persistence, let's update Admin model schema dynamically or rely on a new field if strict.
    // BETTER APPROACH: Use the SITE SETTINGS itself to store the temporary OTP hash? No, Admin is performing it.
    // Let's assume we can update Admin model. Wait, I shouldn't change Admin schema without plan.
    // ALTERNATIVE: Use the `OTP` model we already have! It has an Email field.
    // We can reuse the OTP model. Perfect.

    const OTP = require('../models/OTP');

    // expiry 10 mins
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete existing OTPs for this purpose/admin email
    await OTP.deleteMany({ email: admin.email }); // Assuming admins have emails and unique

    await OTP.create({
        email: admin.email,
        otp: hashedOTP,
        expiresAt,
        used: false
    });

    await sendUpiChangeOTP(admin.email, otp);

    res.json({ message: `OTP sent to ${admin.email}` });
});

// @desc    Verify OTP and Update UPI
// @route   PUT /api/settings/upi/verify
// @access  Private/Admin
const verifyUpiUpdate = asyncHandler(async (req, res) => {
    const { otp, newUpiId } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (!otp || !newUpiId) {
        res.status(400);
        throw new Error('OTP and New UPI ID are required');
    }

    const OTP = require('../models/OTP');

    const otpRecord = await OTP.findOne({
        email: admin.email,
        used: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    if (new Date() > otpRecord.expiresAt) {
        res.status(400);
        throw new Error('OTP has expired');
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    // Delete OTP immediately after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    // Update UPI ID
    let settings = await SiteSettings.findOne();
    if (!settings) {
        // Should exist, but handle edge case
        settings = await SiteSettings.create({ upiId: newUpiId });
    } else {
        settings.upiId = newUpiId;
        await settings.save();
    }

    res.json({ message: 'UPI ID updated successfully', upiId: newUpiId });
});

module.exports = { getSettings, updateSettings, updateShopSettings, updateDeveloperSettings, requestUpiChange, verifyUpiUpdate };

