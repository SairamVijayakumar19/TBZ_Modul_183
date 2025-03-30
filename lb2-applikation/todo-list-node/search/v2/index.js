const db = require('../../fw/db');

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
    <h2>Task Search</h2>
    <form method="get" action="/">
        <input type="text" name="q" placeholder="Search title">
        <input type="submit" value="Search">
    </form>`;

    const userid = req.cookies.userid;

    if (req.query.q && userid) {
        const searchTerm = req.query.q;
        const conn = await db.connectDB();

        const [result] = await conn.execute(
            'SELECT ID, title, state FROM tasks WHERE userID = ? AND title LIKE ?',
            [userid, `%${searchTerm}%`]
        );

        html += `<h3>Search results for: <em>${escapeHTML(searchTerm)}</em></h3>`;
        html += `<ul>`;

        result.forEach(task => {
            html += `<li>[${escapeHTML(task.state)}] ${escapeHTML(task.title)}</li>`;
        });

        html += `</ul>`;
    }

    return html;
}

module.exports = { html: getHtml };
