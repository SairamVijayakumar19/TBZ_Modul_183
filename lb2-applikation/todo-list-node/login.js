const db = require('./fw/db');
const bcrypt = require('bcrypt');

async function handleLogin(req, res) {
    let msg = '';
    let user = { username: '', userid: 0 };

    const { username, password } = req.body;

    if (username && password) {
        const result = await validateLogin(username, password);

        if (result.valid) {
            user.username = username;
            user.userid = result.userId;
            msg = result.msg;
        } else {
            msg = result.msg;
        }
    } else {
        msg = '<span class="info info-error">Bitte Benutzername und Passwort eingeben</span>';
    }

    return { html: msg + getHtml(), user };
}

function startUserSession(req, res, user) {
    req.session.userid = user.userid;
    req.session.username = user.username;
    res.redirect('/');
}

async function validateLogin(username, password) {
    let result = { valid: false, msg: '', userId: 0 };

    try {
        const dbConnection = await db.connectDB();

        const [rows] = await dbConnection.execute(
            "SELECT id, password FROM users WHERE username = ?",
            [username]
        );

        if (rows.length > 0) {
            const db_id = rows[0].id;
            const db_password = rows[0].password;

            const match = await bcrypt.compare(password, db_password);

            if (match) {
                result.userId = db_id;
                result.valid = true;
                result.msg = '<span class="info info-success">Login erfolgreich</span>';
            } else {
                result.msg = '<span class="info info-error">Falsches Passwort oder Benutzername</span>';
            }
        } else {
            result.msg = '<span class="info info-error">Benutzername existiert nicht</span>';
        }
    } catch (err) {
        console.error('[ERROR] Login fehlgeschlagen:', err);
        result.msg = '<span class="info info-error">Login fehlgeschlagen</span>';
    }

    return result;
}

function getHtml() {
    return `
    <h2>Login</h2>
    <form id="form" method="post" action="/login">
        <div class="form-group">
            <label for="username">Benutzername</label>
            <input type="text" class="form-control size-medium" name="username" id="username" required>
        </div>
        <div class="form-group">
            <label for="password">Passwort</label>
            <input type="password" class="form-control size-medium" name="password" id="password" required>
        </div>
        <div class="form-group">
            <label for="submit"></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
        <p><a href="/reset">Forgot your password?</a></p>
    </form>`;
}

module.exports = {
    handleLogin,
    startUserSession
};