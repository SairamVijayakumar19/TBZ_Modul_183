const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('./fw/db');
const { sendResetEmail } = require('./mailer');
const header = require('./fw/header');
const footer = require('./fw/footer');

const resetTokens = {};

// Passwort-Richtlinienprüfung
function isStrongPassword(password) {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

router.get('/', async (req, res) => {
    const content = `
        <h2>Passwort zurücksetzen</h2>
        <form method="POST" action="/reset">
            <div class="form-group">
                <label for="username">Benutzername (E-Mail):</label>
                <input type="text" name="username" class="form-control size-medium" required />
            </div>
            <div class="form-group">
                <label></label>
                <input type="submit" class="btn size-auto" value="Reset-Link senden" />
            </div>
        </form>
    `;

    const html = await header(req) + content + footer;
    res.send(html);
});

router.post('/', async (req, res) => {
    const { username } = req.body;
    const conn = await db.connectDB();

    const [result] = await conn.query('SELECT ID FROM users WHERE username = ?', [username]);

    if (result.length === 0) {
        const html = await header(req) + `<span class="info info-error">Benutzer nicht gefunden.</span>` + footer;
        return res.send(html);
    }

    const userId = result[0].ID;
    const token = crypto.randomBytes(32).toString('hex');
    resetTokens[token] = { userId, expires: Date.now() + 15 * 60 * 1000 }; // 15 Minuten

    const resetLink = `http://localhost/reset/${token}`;
    await sendResetEmail(username, resetLink);

    const html = await header(req) + `<span class="info info-success">Ein Link wurde per E-Mail versendet.</span>` + footer;
    res.send(html);
});

router.get('/:token', async (req, res) => {
    const { token } = req.params;

    if (!resetTokens[token] || resetTokens[token].expires < Date.now()) {
        const html = await header(req) + `<span class="info info-error">Link ungültig oder abgelaufen.</span>` + footer;
        return res.send(html);
    }

    const content = `
        <h2>Neues Passwort setzen</h2>
        <form method="POST" action="/reset/${token}">
            <div class="form-group">
                <label for="password">Neues Passwort:</label>
                <input type="password" name="password" class="form-control size-medium" required />
            </div>
            <div class="form-group">
                <label></label>
                <input type="submit" class="btn size-auto" value="Passwort speichern" />
            </div>
        </form>
    `;

    const html = await header(req) + content + footer;
    res.send(html);
});

router.post('/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!resetTokens[token] || resetTokens[token].expires < Date.now()) {
        const html = await header(req) + `<span class="info info-error">Link ungültig oder abgelaufen.</span>` + footer;
        return res.send(html);
    }

    if (!isStrongPassword(password)) {
        const html = await header(req) + `
            <span class="info info-error">
                Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.
            </span>
        ` + footer;
        return res.send(html);
    }

    const userId = resetTokens[token].userId;
    delete resetTokens[token];

    const conn = await db.connectDB();
    const hashedPassword = await bcrypt.hash(password, 10);
    await conn.query('UPDATE users SET password = ? WHERE ID = ?', [hashedPassword, userId]);

    const html = await header(req) + `<span class="info info-success">Passwort erfolgreich geändert.</span><p><a href="/login">Jetzt einloggen</a></p>` + footer;
    res.send(html);
});

module.exports = router;
