const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./fw/db');
const header = require('./fw/header');
const footer = require('./fw/footer');
const login = require('./login');
const index = require('./index');
const adminUser = require('./admin/users');
const editTask = require('./edit');
const saveTask = require('./savetask');
const search = require('./search');
const searchProvider = require('./search/v2/index');
const userAdminRoute = require('./admin/useradmin'); 
const resetRoute = require('./reset');

const app = express();
const PORT = 3000;

// Middleware für Session-Handling
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'strict', 
        maxAge: 1000 * 60 * 60 // 1 Stunde
      }
    }));

// Middleware für Body-Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use('/admin/users', userAdminRoute);
app.use('/reset', resetRoute);

app.get('/', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await index.html(req), req)
        res.send(html);
    } else {
        res.redirect('login');
    }
});

app.post('/', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await index.html(req), req)
        res.send(html);
    } else {
        res.redirect('login');
    }
})

app.get('/admin/users', async (req, res) => {
    if(activeUserSession(req)) {
        let html = await wrapContent(await adminUser.html, req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

app.get('/edit', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await editTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

app.get('/login', async (req, res) => {
    let content = await login.handleLogin(req, res);
    if (content.user.userid !== 0) {
        login.startUserSession(req, res, content.user);
    } else {
        let html = await wrapContent(content.html, req);
        res.send(html);
    }
});

app.post('/login', async (req, res) => {
    let content = await login.handleLogin(req, res);
    if (content.user.userid !== 0) {
        login.startUserSession(req, res, content.user);
    } else {
        let html = await wrapContent(content.html, req);
        res.send(html);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.cookie('username','');
    res.cookie('userid','');
    res.redirect('/login');
});

app.get('/profile', (req, res) => {
    if (req.session.loggedin) {
        res.send(`Welcome, ${req.session.username}! <a href="/logout">Logout</a>`);
    } else {
        res.send('Please login to view this page');
    }
});

app.post('/savetask', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await saveTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

app.post('/search', async (req, res) => {
    let html = await search.html(req);
    res.send(html);
});

app.get('/search/v2/', async (req, res) => {
    let result = await searchProvider.search(req);
    res.send(result);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function wrapContent(content, req) {
    let headerHtml = await header(req);
    return headerHtml+content+footer;
}

function activeUserSession(req) {
    console.log('in activeUserSession');
    console.log(req.cookies);
    return req.session && req.session.userid;
}