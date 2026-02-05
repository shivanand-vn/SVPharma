const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Generic send email function
const sendEmail = async (toEmail, subject, htmlContent) => {
    // Check credentials at runtime to ensure env vars are loaded
    if (!process.env.BREVO_API_KEY) {
        console.error('BREVO_API_KEY is missing in environment variables');
        throw new Error('Email configuration error: API Key missing');
    }
    if (!process.env.MAIL_FROM) {
        console.error('MAIL_FROM is missing in environment variables');
        throw new Error('Email configuration error: Sender email missing');
    }

    // Configure API key authorization at runtime
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // Define sender at runtime
    const sender = {
        email: process.env.MAIL_FROM,
        name: 'Shree Veerabhadreshwara Pharma',
    };

    // Helper to get strict link logic
    const getLink = () => {
        if (process.env.APP_LINK && process.env.APP_LINK.trim() !== '') {
            return process.env.APP_LINK;
        }
        if (process.env.WEBSITE_LINK && process.env.WEBSITE_LINK.trim() !== '') {
            return process.env.WEBSITE_LINK;
        }
        return null;
    };

    const link = getLink();
    const footerHtml = `
        <div class="footer">
            &copy; ${new Date().getFullYear()} Shree Veerabhadreshwara Pharma. All rights reserved.<br>
            This is a system-generated email. Please do not reply to this message.<br>
            ${link ? `<div style="margin-top: 10px; font-weight: 600;">${link}</div>` : ''}
        </div>
    `;

    // Inject footer if htmlContent has a footer placeholder
    const finalHtml = htmlContent.includes('<div class="footer">')
        ? htmlContent.replace(/<div class="footer">[\s\S]*?<\/div>/, footerHtml)
        : htmlContent + footerHtml;

    try {
        console.log(`Sending email to ${toEmail} with subject: ${subject}`);
        console.log(`Using Sender: ${sender.email} (${sender.name})`);

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: toEmail }];
        sendSmtpEmail.sender = sender;
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = finalHtml;

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully. Message ID:', data.messageId);
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        // Log detailed error from Brevo if available
        if (error.response && error.response.body) {
            console.error('Brevo API Error:', JSON.stringify(error.response.body, null, 2));
        }
        throw new Error('Email sending failed');
    }
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose = 'Customer Deletion') => {
    const subject = `OTP for ${purpose} - Shree Veerabhadreshwara Pharma`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e2e8f0; }
                .header { background-color: #334155; padding: 30px; text-align: center; }
                .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px 30px; text-align: center; color: #334155; }
                .otp-box { background-color: #f1f5f9; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #334155; margin: 30px 0; display: inline-block; border: 2px dashed #cbd5e1; }
                .warning { color: #64748b; font-size: 14px; margin-top: 20px; line-height: 1.5; }
                .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="logo-text">Shree Veerabhadreshwara Pharma</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top: 0; color: #1e293b;">OTP Verification</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">Use the One-Time Password (OTP) below to complete your request for <strong>${purpose}</strong>.</p>
                    <div class="otp-box">${otp}</div>
                    <p class="warning">This OTP is valid for <strong>10 minutes</strong>.<br>If you did not request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Shree Veerabhadreshwara Pharma. All rights reserved.<br>
                    This is a system-generated email. Please do not reply.
                </div>
            </div>
        </body>
        </html>
    `;
    return sendEmail(email, subject, html);
};

// Send Username Recovery Email
const sendUsernameEmail = async (email, username) => {
    const subject = 'Username Recovery - Shree Veerabhadreshwara Pharma';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e2e8f0; }
                .header { background-color: #64748b; padding: 30px; text-align: center; } /* Neutral Header */
                .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px 30px; text-align: center; color: #334155; }
                .username-box { background-color: #f1f5f9; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: 600; color: #0f172a; margin: 25px 0; display: inline-block; border: 2px solid #cbd5e1; }
                .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="logo-text">Shree Veerabhadreshwara Pharma</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top: 0; color: #1e293b;">Username Recovery</h2>
                    <p style="font-size: 16px;">Hello,</p>
                    <p style="font-size: 16px;">You requested to recover your username. Here it is:</p>
                    <div class="username-box">${username}</div>
                    <p style="font-size: 14px; color: #64748b;">You can now log in using this username.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Shree Veerabhadreshwara Pharma. All rights reserved.<br>
                    This is a system-generated email. Please do not reply.
                </div>
            </div>
        </body>
        </html>
    `;
    return sendEmail(email, subject, html);
};

// Send Password Reset OTP
const sendPasswordResetOTP = async (email, otp) => {
    const subject = 'Password Reset OTP - Shree Veerabhadreshwara Pharma';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e2e8f0; }
                .header { background-color: #334155; padding: 30px; text-align: center; } /* Dark/Neutral Header */
                .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px 30px; text-align: center; color: #334155; }
                .otp-box { background-color: #f1f5f9; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #334155; margin: 30px 0; display: inline-block; border: 2px dashed #cbd5e1; }
                .warning { color: #64748b; font-size: 14px; margin-top: 20px; line-height: 1.5; }
                .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="logo-text">Shree Veerabhadreshwara Pharma</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top: 0; color: #1e293b;">Password Reset Request</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password. Use the OTP below to proceed.</p>
                    <div class="otp-box">${otp}</div>
                    <p class="warning">This OTP is valid for <strong>10 minutes</strong>.<br>If you did not request a password reset, please ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Shree Veerabhadreshwara Pharma. All rights reserved.<br>
                    This is a system-generated email. Please do not reply.
                </div>
            </div>
        </body>
        </html>
    `;
    return sendEmail(email, subject, html);
};

// Send UPI Change OTP
const sendUpiChangeOTP = async (email, otp) => {
    const subject = 'UPI ID Change Request - Shree Veerabhadreshwara Pharma';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e2e8f0; }
                .header { background-color: #334155; padding: 30px; text-align: center; } /* Dark/Neutral Header */
                .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px 30px; text-align: center; color: #334155; }
                .otp-box { background-color: #f1f5f9; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #334155; margin: 30px 0; display: inline-block; border: 2px dashed #cbd5e1; }
                .warning { color: #64748b; font-size: 14px; margin-top: 20px; line-height: 1.5; }
                .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="logo-text">Shree Veerabhadreshwara Pharma</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top: 0; color: #1e293b;">UPI ID Change Authorization</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">A request has been made to change the Payment UPI ID. Use the OTP below to authorize this change.</p>
                    <div class="otp-box">${otp}</div>
                    <p class="warning">This OTP is valid for <strong>10 minutes</strong>.<br>If you did not initiate this change, assume your account is compromised and contact support.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Shree Veerabhadreshwara Pharma. All rights reserved.<br>
                    This is a system-generated email. Please do not reply.
                </div>
            </div>
        </body>
        </html>
    `;
    return sendEmail(email, subject, html);
};

// sendPaymentStatusEmail removed as per strict email control rules

// Send Welcome Email
const sendWelcomeEmail = async (email, username, password, role) => {
    const subject = 'Your New Account - Shree Veerabhadreshwara Pharma';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e2e8f0; }
                .header { background-color: #0d9488; padding: 30px; text-align: center; } /* Brand Teal Header */
                .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px 30px; color: #334155; }
                .credentials-box { background-color: #f0fdfa; padding: 20px; border-radius: 8px; border: 1px solid #ccfbf1; margin: 25px 0; }
                .credential-item { margin: 10px 0; font-size: 16px; }
                .label { font-weight: 600; color: #0f766e; width: 100px; display: inline-block; }
                .value { font-family: monospace; font-size: 18px; color: #334155; background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; }
                .btn { display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 10px; }
                .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="logo-text">Shree Veerabhadreshwara Pharma</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top: 0; color: #1e293b;">Welcome Aboard!</h2>
                    <p style="font-size: 16px;">Hello,</p>
                    <p style="font-size: 16px;">Your <strong>${role}</strong> account has been successfully created. You can now access the portal using the following credentials:</p>
                    
                    <div class="credentials-box">
                        <div class="credential-item">
                            <span class="label">Username:</span>
                            <span class="value">${username}</span>
                        </div>
                        <div class="credential-item">
                            <span class="label">Password:</span>
                            <span class="value">${password}</span>
                        </div>
                    </div>

                    <p style="color: #ef4444; font-size: 14px;"><strong>Important:</strong> Please log in and change your password immediately for security purposes.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <!-- Link will be provided in footer strictly as per env rules -->
                    </div>
                </div>
                <div class="footer"></div>
            </div>
        </body>
        </html>
    `;
    return sendEmail(email, subject, html);
};

// Send Rejection Email
const sendRejectionEmail = async (email, username, reason) => {
    const subject = 'Account Application Status - Shree Veerabhadreshwara Pharma';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e2e8f0; }
                .header { background-color: #ef4444; padding: 30px; text-align: center; } /* Red Header for Rejection */
                .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px 30px; color: #334155; }
                .reason-box { background-color: #fef2f2; color: #b91c1c; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #fecaca; font-size: 16px; line-height: 1.6; }
                .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="logo-text">Shree Veerabhadreshwara Pharma</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top: 0; color: #1e293b;">Application Status Update</h2>
                    <p style="font-size: 16px;">Hello,</p>
                    <p style="font-size: 16px;">We appreciate your interest in joining Shree Veerabhadreshwara Pharma. After reviewing your application for username <strong>${username}</strong>, we regret to inform you that we cannot approve your account at this time.</p>
                    
                    <div class="reason-box">
                        <strong>Reason:</strong><br>
                        ${reason}
                    </div>

                    <p style="font-size: 16px;">If you believe this is an error or if you have rectified the issues mentioned above, please feel free to submit a new application.</p>
                </div>
                <div class="footer"></div>
            </div>
        </body>
        </html>
    `;
    return sendEmail(email, subject, html);
};

module.exports = {
    sendOTPEmail,
    sendUsernameEmail,
    sendPasswordResetOTP,
    sendUpiChangeOTP,
    sendWelcomeEmail,
    sendRejectionEmail
};
