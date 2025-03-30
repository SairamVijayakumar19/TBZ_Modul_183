const db = require('./fw/db');
const bcrypt = require('bcrypt');

async function handleLogin(req, res) {
    let msg = '';
    let user = { 'username': '', 'userid': 0 };

    if(typeof req.query.username !== 'undefined' && typeof req.query.password !== 'undefined') {
        // Get username and password from the form and call the validateLogin
        let result = await validateLogin(req.query.username, req.query.password);

        if(result.valid) {
            // Login is correct. Store user information to be returned.
            user.username = req.query.username;
            user.userid = result.userId;
            msg = result.msg;
        } else {
            msg = result.msg;
        }
    }

    return { 'html': msg + getHtml(), 'user': user };
}

function startUserSession(res, user) {
    console.log('login valid... start user session now for userid '+user.userid);
    res.cookie('username', user.username);
    res.cookie('userid', user.userid);
    res.redirect('/');
}

async function validateLogin(username, password) {
    let result = { valid: false, msg: '', userId: 0 };

    const dbConnection = await db.connectDB();
    const [rows] = await dbConnection.execute(
        "SELECT id, username, password FROM users WHERE username = ?",
        [username]
    );

    if (rows.length > 0) {
        const db_id = rows[0].id;
        const db_password = rows[0].password;

        const match = await bcrypt.compare(password, db_password);
        if (match) {
            result.userId = db_id;
            result.valid = true;
            result.msg = 'Login correct';
        } else {
            result.msg = 'Incorrect password';
        }
    } else {
        result.msg = 'Username does not exist';
    }

    return result;
}

function getHtml() {
    return `
    <h2>Login</h2>

    <form id="form" method="get" action="/login">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username">
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password">
        </div>
        <div class="form-group">
            <label for="submit" ></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
    </form>`;
}

module.exports = {
    handleLogin: handleLogin,
    startUserSession: startUserSession
};