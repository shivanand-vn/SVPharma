require('dotenv').config();
const { sendOTPEmail } = require('./utils/emailService');

const testBrevo = async () => {
    console.log('--- Brevo API Test ---');
    console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Loaded' : 'MISSING');
    console.log('MAIL_FROM:', process.env.MAIL_FROM || 'MISSING');

    if (!process.env.BREVO_API_KEY || !process.env.MAIL_FROM) {
        console.error('ERROR: Missing environment variables.');
        return;
    }

    try {
        console.log('Attempting to send test email...');
        const response = await sendOTPEmail(process.env.MAIL_FROM, '123456', 'Test Purpose');
        console.log('SUCCESS: Email sent!', response);
    } catch (error) {
        console.error('FAILED: Email sending error');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Body:', JSON.stringify(error.response.body, null, 2));
        } else {
            console.error(error);
        }
    }
};

testBrevo();
