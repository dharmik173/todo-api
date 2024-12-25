const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // Convert to boolean
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const forgotPasswordEmail = async (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Forgot Password Code',
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
            You have requested to reset your password. Use the following code to proceed:
        </p>
        <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #dc3545; background-color: #f1f1f1; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                ${code}
            </span>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
            This code is valid for <strong>30 minutes</strong>. Please reset your password within this time to secure your account.
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
            If you did not request a password reset, please ignore this email or contact our support team.
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
    forgotPasswordEmail,
};