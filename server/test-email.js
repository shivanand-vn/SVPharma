require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Testing Email Transport...');
    console.log('User:', process.env.EMAIL_USER);
    console.log('App Password:', process.env.EMAIL_PASS ? 'Present' : 'Missing');
    console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
    console.log('Refresh Token:', process.env.GOOGLE_REFRESH_TOKEN ? 'Present' : 'Missing');

    let transporter;
    if (process.env.EMAIL_PASS) {
        console.log('--- Using App Password Method ---');
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        console.log('--- Using OAuth2 Method ---');
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN
            }
        });
    }

    try {
        await transporter.verify();
        console.log('SUCCESS: Transporter holds a valid connection!');

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Email from Pharma App',
            text: 'This is a test email to verify credentials.'
        });
        console.log('SUCCESS: Email sent!', info.messageId);
    } catch (error) {
        console.error('FAILED: Email test failed.');
        console.error('Error Message:', error.message);
        if (error.response) console.error('Error Response:', error.response);
    }
};

testEmail();
