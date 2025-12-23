const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Convert to boolean
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendPasswordResetEmail = async (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code',
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">Account Verification</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thank you for signing up! Use the following verification code to activate your account:
        </p>
        <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #28a745; background-color: #f1f1f1; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                ${code}
            </span>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
            This code is valid for <strong>24 hours</strong>. Please verify your account within this time to start using our services.
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
            If you did not sign up for this account, you can safely ignore this email.
        </p>
        <p style="color: #555; font-size: 14px; text-align: center; margin-top: 30px;">
            <em>Thank you,<br>Your Application Team</em>
        </p>
    </div>
`,
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
};

module.exports = {
    sendPasswordResetEmail,
};