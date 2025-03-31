const express = require('express');
const router = express.Router();
const db = require('../fw/db');
const header = require('../fw/header');
const footer = require('../fw/footer');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
    const conn = await db.connectDB();
    if (!conn) return res.status(500).send("Database connection failed");

    try {
        const [users] = await conn.query(`
            SELECT users.ID, users.username, roles.title
            FROM users
            INNER JOIN permissions ON users.ID = permissions.userID
            INNER JOIN roles ON permissions.roleID = roles.ID
            ORDER BY username
        `);

        const [tasks] = await conn.query(`
            SELECT ID, title, state, userID
            FROM tasks
            ORDER BY userID
        `);

        const taskMap = {};
        tasks.forEach(task => {
            if (!taskMap[task.userID]) taskMap[task.userID] = [];
            taskMap[task.userID].push(task);
        });

        let html = `
        <h2>User Management</h2>
        <p><a href="/admin/users/new">Create New User</a></p>
        <table>
            <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
            </tr>`;

        users.forEach(user => {
            const userTasks = taskMap[user.ID] || [];

            html += `
            <tr onclick="toggleTasks(${user.ID})" style="cursor:pointer;">
                <td>${user.username}</td>
                <td>${user.title}</td>
                <td>
                    ${user.title !== 'Admin' ? `<a href="/admin/users/delete/${user.ID}" onclick="return confirm('Delete this user?')">Delete</a>` : ''}
                </td>
            </tr>
            <tr id="tasks-${user.ID}" class="hidden">
                <td colspan="3">
                    <strong>Assigned Tasks:</strong><br />
                    ${userTasks.length > 0 ? `
                        <ul>
                            ${userTasks.map(task => `<li>${task.title} (${task.state})</li>`).join('')}
                        </ul>` : `<em>No tasks assigned</em>`}
                </td>
            </tr>`;
        });

        html += `</table>
        <script>
            function toggleTasks(id) {
                const row = document.getElementById('tasks-' + id);
                row.classList.toggle('hidden');
            }
        </script>`;

        const page = await header(req) + html + footer;
        res.send(page);
    } catch (err) {
        console.error('Error loading users/tasks:', err);
        res.status(500).send("Something went wrong.");
    }
});

router.get('/tasks', async (req, res) => {
    const conn = await db.connectDB();
    if (!conn) return res.status(500).send("DB connection failed");

    try {
        const [tasks] = await conn.query(`
            SELECT tasks.ID, tasks.title, tasks.state, users.username
            FROM tasks
            INNER JOIN users ON tasks.userID = users.ID
            ORDER BY users.username, tasks.title
        `);

        let html = `
        <h2>All Tasks Overview</h2>
        <table>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>State</th>
                <th>Assigned To</th>
            </tr>`;

        tasks.forEach(task => {
            html += `
            <tr>
                <td>${task.ID}</td>
                <td>${task.title}</td>
                <td>${task.state}</td>
                <td>${task.username}</td>
            </tr>`;
        });

        html += `</table>`;

        const page = await header(req) + html + footer;
        res.send(page);
    } catch (err) {
        console.error('Error loading tasks:', err);
        res.status(500).send("Could not load tasks.");
    }
});

router.get('/delete/:id', async (req, res) => {
    const userId = req.params.id;
    const conn = await db.connectDB();
    if (!conn) return res.status(500).send("Database connection failed.");

    try {
        const [check] = await conn.query(`
            SELECT roles.title FROM roles
            INNER JOIN permissions ON roles.ID = permissions.roleID
            WHERE permissions.userID = ?
        `, [userId]);

        if (check.length && check[0].title === 'Admin') {
            return res.send("Admin users cannot be deleted.");
        }

        await conn.beginTransaction();
        await conn.query('DELETE FROM tasks WHERE userID = ?', [userId]);
        await conn.query('DELETE FROM permissions WHERE userID = ?', [userId]);
        await conn.query('DELETE FROM users WHERE ID = ?', [userId]);
        await conn.commit();

        res.redirect('/admin/users');
    } catch (err) {
        await conn.rollback();
        console.error('Error during user deletion:', err);
        res.status(500).send('Error deleting user.');
    }
});

router.get('/new', async (req, res) => {
    const conn = await db.connectDB();
    if (!conn) return res.status(500).send("DB connection failed");

    const [roles] = await conn.query('SELECT ID, title FROM roles');

    let html = `
    <h2>Create New User</h2>
    <form method="POST" action="/admin/users/new">
        <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" name="username" required />
        </div>
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="text" name="password" required />
        </div>
        <div class="form-group">
            <label for="role">Role:</label>
            <select name="roleID">`;

    roles.forEach(role => {
        html += `<option value="${role.ID}">${role.title}</option>`;
    });

    html += `
            </select>
        </div>
        <input type="submit" class="btn size-auto" value="Create User" />
    </form>`;

    const page = await header(req) + html + footer;
    res.send(page);
});

router.post('/new', async (req, res) => {
    const { username, password, roleID } = req.body;

    const conn = await db.connectDB();
    if (!conn) return res.status(500).send("DB connection failed");

    try {
        await conn.beginTransaction();

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [insertResult] = await conn.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        const userID = insertResult.insertId;

        await conn.query(
            'INSERT INTO permissions (userID, roleID) VALUES (?, ?)',
            [userID, roleID]
        );

        await conn.commit();
        res.redirect('/admin/users');
    } catch (err) {
        await conn.rollback();
        console.error('Error creating user:', err);
        res.status(500).send("Failed to create user");
    }
});

module.exports = router;
