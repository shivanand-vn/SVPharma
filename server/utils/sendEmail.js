const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendEmail = async (options) => {
    // Check credentials at runtime
    if (!process.env.BREVO_API_KEY) {
        console.error('BREVO_API_KEY is missing');
        throw new Error('Email configuration error: API Key missing');
    }
    if (!process.env.MAIL_FROM) {
        console.error('MAIL_FROM is missing');
        throw new Error('Email configuration error: Sender email missing');
    }

    // Configure API key
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

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
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            &copy; ${new Date().getFullYear()} Shree Veerabhadreshwara Pharma. All rights reserved.<br>
            This is a system-generated email. Please do not reply to this message.<br>
            ${link ? `<div style="margin-top: 10px; font-weight: 600;">${link}</div>` : ''}
        </div>
    `;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: options.email }];
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.subject = options.subject;

    // Handle HTML and/or Text content
    let finalHtml = '';
    if (options.html) {
        finalHtml = options.html + footerHtml;
    } else if (options.message) {
        finalHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <p>${options.message.replace(/\n/g, '<br>')}</p>
                ${footerHtml}
            </div>
        `;
        sendSmtpEmail.textContent = options.message;
    } else {
        throw new Error('Email must have message or html content');
    }

    sendSmtpEmail.htmlContent = finalHtml;

    try {
        console.log(`Sending email to ${options.email} with subject: ${options.subject}`);
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully. Message ID:', data.messageId);
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response && error.response.body) {
            console.error('Brevo API Error:', JSON.stringify(error.response.body, null, 2));
        }
        throw new Error('Email sending failed');
    }
};

module.exports = sendEmail;
