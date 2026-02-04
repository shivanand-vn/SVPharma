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

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: options.email }];
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.subject = options.subject;

    // Handle HTML and/or Text content
    if (options.html) {
        sendSmtpEmail.htmlContent = options.html;
    } else if (options.message) {
        // Wrap plain text in simple HTML if no HTML provided
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <p>${options.message.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        // Also provide text content as fallback
        sendSmtpEmail.textContent = options.message;
    } else {
        throw new Error('Email must have message or html content');
    }

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
