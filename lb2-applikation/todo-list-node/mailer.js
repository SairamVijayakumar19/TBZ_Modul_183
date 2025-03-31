const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '<euregmail>',
        pass: '<euresgmailpassword>'
    }
});

async function sendResetEmail(to, resetLink) {
    await transporter.sendMail({
        from: '"Support" tbzm183doheu@gmail.com',
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
