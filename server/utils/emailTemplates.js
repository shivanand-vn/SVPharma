const getLink = () => {
    if (process.env.WEBSITE_LINK && process.env.WEBSITE_LINK.trim() !== '') {
        return process.env.WEBSITE_LINK;
    }
    return null;
};

// Base Template (Shell)
const baseTemplate = (content, title = 'Notification') => {
    const websiteLink = getLink();
    const logoUrl = process.env.LOGO_URL || 'https://svpharma.in/logo.png';
    const year = new Date().getFullYear();

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; margin-top: 20px; }
            .brand-header { padding: 25px 30px; background: #ffffff; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 15px; }
            .logo { height: 35px; width: auto; }
            .brand-text { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2; }
            .hero-header { background: #0d9488; padding: 35px 30px; text-align: center; color: white; }
            .hero-title { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
            .content { padding: 40px 30px; }
            .footer { background-color: #f1f5f9; padding: 25px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .highlight-box { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }
            
            /* Typography Utils */
            p { margin-top: 0; margin-bottom: 15px; font-size: 15px; }
            strong { font-weight: 700; color: #0f172a; }
            .text-center { text-align: center; }
            .text-sm { font-size: 13px; }
            .text-muted { color: #64748b; }
            
            /* Buttons */
            .btn { display: inline-block; background: #0d9488; color: white !important; padding: 12px 28px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 15px; margin-top: 20px; }
            
            /* Responsive */
            @media (max-width: 600px) {
                .container { width: 100% !important; border-radius: 0; margin-top: 0; border: none; }
                .content { padding: 30px 20px; }
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <!-- Brand Header -->
                <div style="padding: 25px 30px; background: #ffffff; border-bottom: 1px solid #f1f5f9; text-align: left;">
                    <img src="${logoUrl}" alt="SV Pharma" style="height: 35px; vertical-align: middle; margin-right: 10px;">
                    <span style="font-size: 18px; font-weight: 700; color: #0f172a; vertical-align: middle;">Shree Veerabhadreshwara Pharma</span>
                </div>

                <!-- Hero Header -->
                <div class="hero-header">
                    <h1 class="hero-title">${title}</h1>
                </div>

                <!-- Main Content -->
                <div class="content">
                    ${content}
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p style="margin-bottom: 10px;">&copy; ${year} Shree Veerabhadreshwara Pharma. All rights reserved.</p>
                    <p style="margin-bottom: 0;">This is a system-generated email. Please do not reply to this email.</p>
                    
                    ${websiteLink ? `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #cbd5e1;">
                            <a href="${websiteLink}" style="color: #0d9488; text-decoration: none; font-weight: 600;">Visit Our Website</a>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const otpTemplate = ({ otp, purpose }) => {
    const content = `
        <p>Hello,</p>
        <p>You requested a One-Time Password (OTP) for <strong>${purpose}</strong>.</p>
        <p>Please use the code below to complete your verification:</p>
        
        <div class="highlight-box">
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #0d9488; font-family: monospace;">${otp}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 10px;">Valid for 10 minutes</div>
        </div>

        <p class="text-sm text-muted">If you did not request this, please ignore this email or contact support immediately if you believe your account is compromised.</p>
    `;
    return baseTemplate(content, 'Authentication Required');
};

const welcomeTemplate = ({ name, username, password, role }) => {
    const appLink = process.env.APP_LINK;
    const websiteLink = process.env.WEBSITE_LINK;

    // Determine the primary action link
    let actionLink = websiteLink;
    let actionText = "Access Dashboard";

    if (!websiteLink && appLink) {
        actionLink = appLink;
        actionText = "Download App";
    }

    const content = `
        <p>Hello <strong>${name}</strong>,</p>
        <p>Welcome to <strong>Shree Veerabhadreshwara Pharma</strong>! Your <strong>${role}</strong> account has been successfully created and approved.</p>
        <p>You can now log in using the following temporary credentials:</p>
        
        <div class="highlight-box" style="text-align: left; padding: 25px;">
            <div style="margin-bottom: 15px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Username</span><br>
                <span style="font-size: 18px; font-weight: 700; color: #0f172a; font-family: monospace;">${username}</span>
            </div>
            <div>
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Password</span><br>
                <span style="font-size: 18px; font-weight: 700; color: #0f172a; font-family: monospace;">${password}</span>
            </div>
        </div>

        <p class="text-sm" style="color: #ef4444;"><strong>Important:</strong> Please log in and change your password immediately for security.</p>
        
        ${actionLink ? `
            <div class="text-center">
                <a href="${actionLink}" class="btn">${actionText}</a>
            </div>
        ` : ''}
    `;
    return baseTemplate(content, 'Welcome to the Family! 🎉');
};

const rejectionTemplate = ({ name, reason }) => {
    // Override base template style slightly via content injection if needed, 
    // but consistent branding is better. We'll stick to the teal theme generally, 
    // or we could pass a visual hint to baseTemplate, but kept simple for now.

    const content = `
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for your interest in joining Shree Veerabhadreshwara Pharma.</p>
        <p>After carefully reviewing your application, we regret to inform you that we cannot approve your account at this time.</p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase; margin-bottom: 5px;">Reason for Rejection</p>
            <p style="margin: 0; color: #7f1d1d; font-weight: 500;">${reason}</p>
        </div>

        <p>If you have addressed the issues mentioned above or believe this is an error, feel free to submit a new application or contact our support team.</p>
    `;
    return baseTemplate(content, 'Account Application Update');
};

const usernameRecoveryTemplate = ({ username }) => {
    const content = `
        <p>Hello,</p>
        <p>We received a request to recover your username.</p>
        
        <div class="highlight-box">
            <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Your Username</span><br>
            <div style="font-size: 24px; font-weight: 700; color: #0f172a; font-family: monospace; margin-top: 5px;">${username}</div>
        </div>

        <p class="text-sm">You can now use this username to log in to your account.</p>
    `;
    return baseTemplate(content, 'Username Recovery');
};

const adminNotificationTemplate = ({ title, message, details }) => {
    let detailsHtml = '';
    if (details && typeof details === 'object') {
        detailsHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">`;
        for (const [key, value] of Object.entries(details)) {
            detailsHtml += `
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; width: 120px;">${key}</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 500;">${value}</td>
                </tr>
            `;
        }
        detailsHtml += `</table>`;
    }

    const content = `
        <p>Hello Admin,</p>
        <p>${message}</p>
        ${detailsHtml}
        <p style="margin-top: 20px;" class="text-sm text-muted">Please check the admin dashboard for more details.</p>
    `;
    return baseTemplate(content, title || 'System Notification');
};

module.exports = {
    otpTemplate,
    welcomeTemplate,
    rejectionTemplate,
    usernameRecoveryTemplate,
    adminNotificationTemplate
};
