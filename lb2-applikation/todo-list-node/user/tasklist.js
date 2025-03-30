const db = require('../fw/db')

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function getHtml(req) {
    let html = `
    <h2>My Tasks</h2>
    <a href="/edit">New Task</a>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>State</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>`;

    if (req.cookies.userid !== undefined) {
        const conn = await db.connectDB();
        const [result] = await conn.execute(
            'SELECT ID, title, state FROM tasks WHERE UserID = ?',
            [req.cookies.userid]
        );

        result.forEach(row => {
            html += `
            <tr>
                <td>${row.ID}</td>
                <td>${escapeHTML(row.title)}</td>
                <td>${escapeHTML(row.state)}</td>
                <td>
                    <a href="/edit?id=${row.ID}">Edit</a>
                </td>
            </tr>`;
        });
    }

    html += `
        </tbody>
    </table>`;

    return html;
}

module.exports = { html: getHtml };
