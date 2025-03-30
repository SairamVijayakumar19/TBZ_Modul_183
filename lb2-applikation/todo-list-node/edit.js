const db = require('./fw/db');

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
    let html = '';
    const taskId = req.query.id;

    if (taskId) {
        const conn = await db.connectDB();
        const [result] = await conn.execute('SELECT ID, title, state FROM tasks WHERE ID = ?', [taskId]);

        if (result.length > 0) {
            const row = result[0];

            html += `
            <h2>Edit Task</h2>
            <form action="/savetask" method="get">
                <input type="hidden" name="id" value="${row.ID}">
                <label for="title">Title:</label>
                <input type="text" name="title" value="${escapeHTML(row.title)}"><br>
                <label for="state">State:</label>
                <input type="text" name="state" value="${escapeHTML(row.state)}"><br>
                <input type="submit" value="Save">
            </form>`;
        } else {
            html += `<p>Task not found.</p>`;
        }
    } else {
        // New Task (ohne Daten)
        html += `
        <h2>New Task</h2>
        <form action="/savetask" method="get">
            <label for="title">Title:</label>
            <input type="text" name="title"><br>
            <label for="state">State:</label>
            <input type="text" name="state"><br>
            <input type="submit" value="Save">
        </form>`;
    }

    return html;
}

module.exports = { html: getHtml };
