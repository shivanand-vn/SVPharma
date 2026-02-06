const sendEmail = require('./sendEmail');
const {
    otpTemplate,
    welcomeTemplate,
    rejectionTemplate,
    usernameRecoveryTemplate,
    adminNotificationTemplate
} = require('./emailTemplates');

// Send OTP email (Generic - used for 2FA, Security)
const sendOTPEmail = async (email, otp, purpose = 'Verification') => {
    const subject = `OTP for ${purpose} - Shree Veerabhadreshwara Pharma`;
    const html = otpTemplate({ otp, purpose });
    return sendEmail({ email, subject, html });
};

// Send Username Recovery Email
const sendUsernameEmail = async (email, username) => {
    const subject = 'Username Recovery - Shree Veerabhadreshwara Pharma';
    const html = usernameRecoveryTemplate({ username });
    return sendEmail({ email, subject, html });
};

// Send Password Reset OTP
const sendPasswordResetOTP = async (email, otp) => {
    const subject = 'Password Reset OTP - Shree Veerabhadreshwara Pharma';
    const html = otpTemplate({ otp, purpose: 'Password Reset' });
    return sendEmail({ email, subject, html });
};

// Send UPI Change OTP
const sendUpiChangeOTP = async (email, otp) => {
    const subject = 'UPI ID Change Request - Shree Veerabhadreshwara Pharma';
    const html = otpTemplate({ otp, purpose: 'UPI ID Change' });
    return sendEmail({ email, subject, html });
};

// Send Welcome Email
const sendWelcomeEmail = async (email, username, password, role) => {
    const subject = 'Your New Account - Shree Veerabhadreshwara Pharma';
    const html = welcomeTemplate({ name: username, username, password, role }); // Passing username as name if real name isn't separately provided in this sig, but controller usually has name.
    // Wait, the signature in authController might be different. 
    // Let's check usages. 
    // adminController uses: sendEmail({ ... html: getWelcomeEmailTemplate(...) })
    // authController doesn't call sendWelcomeEmail directly usually, admin does. 
    // We will update adminController to call this.
    // Update: I should align arg names.
    return sendEmail({ email, subject, html });
};

// Overload for when name is separate (Better)
const sendWelcomeEmailDetailed = async (email, name, username, password, role) => {
    const subject = 'Welcome to Shree Veerabhadreshwara Pharma';
    const html = welcomeTemplate({ name, username, password, role });
    return sendEmail({ email, subject, html });
};

// Send Rejection Email
const sendRejectionEmail = async (email, name, reason) => {
    const subject = 'Account Application Status - Shree Veerabhadreshwara Pharma';
    const html = rejectionTemplate({ name, reason });
    return sendEmail({ email, subject, html });
};

// Send Admin Notification
const sendAdminNotification = async (email, title, message, details) => {
    const subject = `${title} - System Notification`;
    const html = adminNotificationTemplate({ title, message, details });
    return sendEmail({ email, subject, html });
};

module.exports = {
    sendOTPEmail,
    sendUsernameEmail,
    sendPasswordResetOTP,
    sendUpiChangeOTP,
    sendWelcomeEmail,
    sendWelcomeEmailDetailed,
    sendRejectionEmail,
    sendAdminNotification
};

