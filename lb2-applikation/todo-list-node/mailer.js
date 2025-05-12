require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendResetEmail(to, resetLink) {
    await transporter.sendMail({
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Password Reset",
        html: `
            <p>You requested a password reset.</p>
            <p><a href="${resetLink}">Click to reset your password</a></p>
            <p>This link will expire in 15 minutes.</p>
        `
    });
}

module.exports = { sendResetEmail };
