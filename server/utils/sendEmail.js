const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;

    // Prefer App Password for stability
    if (process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            },
        });
    } else {
        throw new Error('No email credentials found in environment variables (EMAIL_PASS or OAuth2)');
    }

    const mailOptions = {
        from: `Shree Veerabhadreshwara Pharma <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Now supporting HTML
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
