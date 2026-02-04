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
            from: `"Shree Veerabhadreshwara Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `OTP for ${purpose} - Shree Veerabhadreshwara Pharma`,
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
                        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
                        .content { padding: 40px; }
                        .otp-box { background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
                        .otp-code { font-size: 42px; font-weight: 800; color: #334155; letter-spacing: 12px; font-family: monospace; }
                        .notice { background: #fff7ed; border-left: 4px solid #f97316; padding: 20px; margin: 30px 0; border-radius: 8px; font-size: 14px; }
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
                                <h1>🔐 OTP Verification</h1>
                            </div>
                            <div class="content">
                                <p style="font-size: 16px; margin-top: 0;">Hello,</p>
                                <p>You have requested an OTP for <strong>${purpose}</strong>. Please use the verification code below:</p>
                                
                                <div class="otp-box">
                                    <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Secure Code</p>
                                    <div class="otp-code">${otp}</div>
                                    <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 12px;">This code will expire in 5 minutes.</p>
                                </div>

                                <div class="notice">
                                    <strong>⚠️ Security Notice:</strong>
                                    <p style="margin: 5px 0 0 0; color: #7c2d12;">If you did not request this OTP, please ignore this email and secure your account.</p>
                                </div>

                                <p style="margin-bottom: 0;">Best regards,<br><strong>SV Pharma Team</strong></p>
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
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('CRITICAL: Error sending OTP email:', error);
        throw error;
    }
};

// Send username recovery email
const sendUsernameEmail = async (email, username) => {
    try {
        console.log(`Attempting to send username recovery email to ${email}`);
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Shree Veerabhadreshwara Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Username Recovery - Shree Veerabhadreshwara Pharma',
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
                        .brand-name { font-size: 20px; font-weight: 800; color: #14b8a6; margin: 0; display: inline-block; vertical-align: middle; }
                        .logo { height: 40px; vertical-align: middle; margin-right: 12px; }
                        .header { background: #64748b; color: white; padding: 40px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
                        .content { padding: 40px; }
                        .value-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid #64748b; border-radius: 8px; padding: 25px; margin: 30px 0; }
                        .value { font-size: 24px; font-weight: 800; color: #334155; }
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
                                <h1>🔑 Username Recovery</h1>
                            </div>
                            <div class="content">
                                <p style="font-size: 16px; margin-top: 0;">Hello,</p>
                                <p>We received a request to recover your username for your account at Shree Veerabhadreshwara Pharma.</p>
                                
                                <div class="value-box">
                                    <p style="margin: 0 0 5px 0; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase;">Your Registered Username</p>
                                    <div class="value">${username}</div>
                                </div>

                                <p>You can now use this username to log in to our portal. If you did not request this, please ignore this email.</p>
                                
                                <p style="margin-bottom: 0;">Best regards,<br><strong>SV Pharma Team</strong></p>
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
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Username recovery email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('CRITICAL: Error sending username recovery email:', error);
        throw error;
    }
};

// Send password reset OTP email
const sendPasswordResetOTP = async (email, otp) => {
    try {
        console.log(`Attempting to send password reset OTP to ${email}`);
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Shree Veerabhadreshwara Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - Shree Veerabhadreshwara Pharma',
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
                        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
                        .content { padding: 40px; }
                        .otp-box { background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
                        .otp-code { font-size: 42px; font-weight: 800; color: #334155; letter-spacing: 12px; font-family: monospace; }
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
                                <h1>🔐 Password Reset</h1>
                            </div>
                            <div class="content">
                                <p style="font-size: 16px; margin-top: 0;">Hello,</p>
                                <p>You requested a password reset for your Shree Veerabhadreshwara Pharma account. Please use the following code:</p>
                                
                                <div class="otp-box">
                                    <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Password Reset OTP</p>
                                    <div class="otp-code">${otp}</div>
                                    <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 12px;">Valid for 5 minutes.</p>
                                </div>

                                <p>If you did not request this, please secure your account. Do not share this OTP with anyone.</p>
                                
                                <p style="margin-bottom: 0;">Best regards,<br><strong>SV Pharma Team</strong></p>
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
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('CRITICAL: Error sending password reset OTP:', error);
        throw error;
    }
};

// Send UPI Change OTP
const sendUpiChangeOTP = async (email, otp) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Shree Veerabhadreshwara Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify UPI ID Change - SVPharma Admin',
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
                        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
                        .content { padding: 40px; }
                        .otp-box { background: #fff5f5; border: 2px dashed #ef4444; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
                        .otp-code { font-size: 42px; font-weight: 800; color: #b91c1c; letter-spacing: 12px; font-family: monospace; }
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
                                <h1>🛠️ Security Verification</h1>
                            </div>
                            <div class="content">
                                <p style="font-size: 16px; margin-top: 0;">Hello Admin,</p>
                                <p>A request was made to update the <strong>Payment UPI ID</strong>. For security reasons, please verify this action using the code below:</p>
                                
                                <div class="otp-box">
                                    <p style="margin: 0 0 10px 0; color: #b91c1c; font-size: 13px; font-weight: 700; text-transform: uppercase;">Action Authorization Code</p>
                                    <div class="otp-code">${otp}</div>
                                </div>

                                <p style="color: #ef4444; font-weight: 600;">⚠️ Important: If you did not initiate this change, access your Admin Dashboard immediately to secure your account.</p>
                                
                                <p style="margin-bottom: 0;">Best regards,<br><strong>System Security</strong></p>
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
        const brandColor = isApproved ? '#10b981' : '#ef4444';
        const title = isApproved ? '✅ Payment Approved' : '❌ Payment Rejected';

        const mailOptions = {
            from: `"Shree Veerabhadreshwara Pharma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `${isApproved ? 'Approved' : 'Rejected'}: Payment Status - SV Pharma`,
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
                        .brand-name { font-size: 20px; font-weight: 800; color: #14b8a6; margin: 0; display: inline-block; vertical-align: middle; }
                        .logo { height: 40px; vertical-align: middle; margin-right: 12px; }
                        .header { background: ${brandColor}; color: white; padding: 40px; text-align: center; }
                        .header h2 { margin: 0; font-size: 24px; font-weight: 700; }
                        .content { padding: 40px; }
                        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 99px; font-weight: 800; font-size: 14px; text-transform: uppercase; margin-bottom: 20px; ${isApproved ? 'background: #dcfce7; color: #15803d;' : 'background: #fee2e2; color: #b91c1c;'} }
                        .amount-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; }
                        .amount { font-size: 32px; font-weight: 800; color: ${brandColor}; }
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
                                <h2>${title}</h2>
                            </div>
                            <div class="content">
                                <p style="font-size: 16px; margin-top: 0;">Hello,</p>
                                <div class="status-badge">${status}</div>
                                <p>We have processed your payment request. Here are the details:</p>
                                
                                <div class="amount-card">
                                    <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Payment Amount</p>
                                    <div class="amount">₹${amount}</div>
                                </div>

                                ${!isApproved ? `
                                <div style="background: #fff5f5; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #991b1b; font-weight: 600;">Rejection Reason:</p>
                                    <p style="margin: 5px 0 0 0; color: #b91c1c;">${reason || 'The proof provided was invalid or incomplete.'}</p>
                                </div>` : '<p style="font-weight: 600; color: #0d9488;">Success! Your due balance has been updated instantly.</p>'}
                                
                                <p>Thank you for your continued trust in our services.</p>
                                
                                <p style="margin-bottom: 0;">Best regards,<br><strong>Accounts Team</strong></p>
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
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Payment ${status} email sent to ${email}:`, info.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending payment status email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTPEmail, sendUsernameEmail, sendPasswordResetOTP, sendUpiChangeOTP, sendPaymentStatusEmail };
