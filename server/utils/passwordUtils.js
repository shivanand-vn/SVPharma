// Password validation utility
const validatePassword = (password) => {
    const errors = [];

    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[@#$!%&]/.test(password)) {
        errors.push('Password must contain at least one special character (@#$!%&)');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
    validatePassword,
    generateOTP
};
