const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create transporter with Gmail OAuth2 or App Password
const createTransporter = () => {
    console.log('Creating mail transporter for:', process.env.EMAIL_USER);

    // Check if App Password is provided
    if (process.env.EMAIL_PASS) {
        console.log('Using standard SMTP with App Password');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Fallback to OAuth2
    console.log('Using OAuth2 for authentication');
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN
        }
    });
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose = 'Customer Deletion') => {
    try {
        console.log(`Attempting to send OTP email to ${email}`);
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Shree Veerabhadreshwar Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `OTP for ${purpose} - Shree Veerabhadreshwar Pharma`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 3px solid #0d9488; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 36px; font-weight: bold; color: #0d9488; letter-spacing: 8px; }
                        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
                        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 OTP Verification</h1>
                        </div>
                        <div class="content">
                            <h2>Hello Admin,</h2>
                            <p>You have requested to perform a <strong>${purpose}</strong> action. Please use the OTP below to verify this action:</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">Your OTP Code</p>
                                <div class="otp-code">${otp}</div>
                                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Valid for 5 minutes</p>
                            </div>

                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <p style="margin: 5px 0 0 0;">If you did not request this OTP, please ignore this email. Do not share this code with anyone.</p>
                            </div>

                            <p>This OTP will expire in <strong>5 minutes</strong>.</p>
                            
                            <p style="margin-top: 30px;">Best regards,<br><strong>Shree Veerabhadreshwar Pharma Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>&copy; 2025 Shree Veerabhadreshwar Pharma. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        const errorLog = `${new Date().toISOString()} - CRITICAL: Error sending OTP email: ${error.message}\n${error.stack}\n${error.response ? 'Response: ' + JSON.stringify(error.response) : ''}\n\n`;
        fs.appendFileSync(path.join(__dirname, '..', 'debug_email.log'), errorLog);
        console.error('CRITICAL: Error sending OTP email:', error);
        if (error.response) console.error('Error Response:', error.response);
        throw error;
    }
};

// Send username recovery email
const sendUsernameEmail = async (email, username) => {
    try {
        console.log(`Attempting to send username recovery email to ${email}`);
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Shree Veerabhadreshwar Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Username Recovery - Shree Veerabhadreshwar Pharma',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .username-box { background: white; border-left: 4px solid #0d9488; padding: 20px; margin: 20px 0; border-radius: 5px; }
                        .username { font-size: 24px; font-weight: bold; color: #0d9488; }
                        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
                        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">🔑 Username Recovery</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>You requested to recover your username for Shree Veerabhadreshwar Pharma.</p>
                            
                            <div class="username-box">
                                <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Username</p>
                                <p class="username">${username}</p>
                            </div>

                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <p style="margin: 5px 0 0 0;">If you did not request this, please ignore this email. Never share your username or password with anyone.</p>
                            </div>

                            <p>You can now use this username to log in to your account.</p>
                            
                            <p style="margin-top: 30px;">Best regards,<br><strong>Shree Veerabhadreshwar Pharma Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>&copy; 2025 Shree Veerabhadreshwar Pharma. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Username recovery email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        const errorLog = `${new Date().toISOString()} - CRITICAL: Error sending username recovery email: ${error.message}\n${error.stack}\n${error.response ? 'Response: ' + JSON.stringify(error.response) : ''}\n\n`;
        fs.appendFileSync(path.join(__dirname, '..', 'debug_email.log'), errorLog);
        console.error('CRITICAL: Error sending username recovery email:', error);
        if (error.response) console.error('Error Response:', error.response);
        throw error;
    }
};

// Send password reset OTP email
const sendPasswordResetOTP = async (email, otp) => {
    try {
        console.log(`Attempting to send password reset OTP to ${email}`);
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Shree Veerabhadreshwar Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - Shree Veerabhadreshwar Pharma',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 3px solid #0d9488; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 36px; font-weight: bold; color: #0d9488; letter-spacing: 8px; }
                        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
                        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">🔐 Password Reset</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>You requested to reset your password for Shree Veerabhadreshwar Pharma.</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">Your OTP Code</p>
                                <div class="otp-code">${otp}</div>
                                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Valid for 5 minutes</p>
                            </div>

                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <p style="margin: 5px 0 0 0;">If you did not request this password reset, please ignore this email. Do not share this OTP with anyone.</p>
                            </div>

                            <p>This OTP will expire in <strong>5 minutes</strong>.</p>
                            
                            <p style="margin-top: 30px;">Best regards,<br><strong>Shree Veerabhadreshwar Pharma Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>&copy; 2025 Shree Veerabhadreshwar Pharma. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        const errorLog = `${new Date().toISOString()} - CRITICAL: Error sending password reset OTP: ${error.message}\n${error.stack}\n${error.response ? 'Response: ' + JSON.stringify(error.response) : ''}\n\n`;
        fs.appendFileSync(path.join(__dirname, '..', 'debug_email.log'), errorLog);
        console.error('CRITICAL: Error sending password reset OTP:', error);
        if (error.response) console.error('Error Response:', error.response);
        throw error;
    }
};

// Send UPI Change OTP
const sendUpiChangeOTP = async (email, otp) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Shree Veerabhadreshwar Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify UPI ID Change - SVPharma Admin',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { padding: 30px; background: #f9f9f9; border: 1px solid #ddd; }
                        .otp-box { background: #fff; border: 2px dashed #000; padding: 15px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px; }
                        .warning { color: #d9534f; margin-top: 20px; font-size: 13px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Admin Security Verification</h2>
                        </div>
                        <div class="content">
                            <p>Hello Admin,</p>
                            <p>You requested to change the UPI ID for receiving payments.</p>
                            <p>Please use the following OTP to verify this action:</p>
                            
                            <div class="otp-box">${otp}</div>
                            
                            <p class="warning">If you did not request this change, please check your admin account security immediately.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('UPI Change OTP sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending UPI Change OTP:', error);
        throw error;
    }
};



// Send Payment Status Email
const sendPaymentStatusEmail = async (email, amount, status, reason = '') => {
    try {
        const transporter = createTransporter();
        const isApproved = status === 'approved';
        const color = isApproved ? '#0d9488' : '#ef4444';
        const title = isApproved ? 'Payment Approved' : 'Payment Rejected';

        const mailOptions = {
            from: `"Shree Veerabhadreshwar Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `${title} - SVPharma`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: ${color}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { padding: 30px; background: #f9f9f9; border: 1px solid #ddd; }
                        .amount { font-size: 24px; font-weight: bold; margin: 10px 0; color: ${color}; }
                        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>${title}</h2>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>Your payment request of <span class="amount">₹${amount}</span> has been <strong>${status}</strong>.</p>
                            
                            ${!isApproved ? `<p><strong>Reason:</strong> ${reason}</p>` : '<p>Your due amount has been updated.</p>'}
                            
                            <p>Thank you for your business!</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 Shree Veerabhadreshwar Pharma</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Payment ${status} email sent to ${email}:`, info.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending payment status email:', error);
        // Don't throw, just log error so main flow continues
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTPEmail, sendUsernameEmail, sendPasswordResetOTP, sendUpiChangeOTP, sendPaymentStatusEmail };
