const crypto = require('crypto');

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Store OTP with expiration (5 minutes)
const storeOTP = (identifier, otp) => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing OTPs for this email
    otpStore.set(identifier, { otp, expiresAt });

    // Auto-cleanup after expiration
    setTimeout(() => {
        otpStore.delete(identifier);
    }, 5 * 60 * 1000);
};

// Verify OTP
const verifyOTP = (identifier, otp) => {
    const stored = otpStore.get(identifier);

    if (!stored) {
        return { valid: false, message: 'OTP not found or expired' };
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(identifier);
        return { valid: false, message: 'OTP has expired' };
    }

    if (stored.otp !== otp) {
        return { valid: false, message: 'Invalid OTP' };
    }

    // OTP is valid, remove it
    otpStore.delete(identifier);
    return { valid: true, message: 'OTP verified successfully' };
};

// Clear OTP
const clearOTP = (identifier) => {
    otpStore.delete(identifier);
};

module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP,
    clearOTP
};
